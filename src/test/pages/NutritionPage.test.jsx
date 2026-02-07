import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NutritionPage from '../../pages/NutritionPage';
import * as api from '../../api';

// Mock the api module
vi.mock('../../api', () => ({
    getWithCookie: vi.fn(),
    postWithCookie: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('NutritionPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Loading State', () => {
        it('should show loading spinner initially', () => {
            api.getWithCookie.mockImplementation(() => new Promise(() => { })); // Never resolves
            renderWithRouter(<NutritionPage />);

            expect(screen.getByText(/Chef AI is preparing/i)).toBeInTheDocument();
        });
    });

    describe('No Plan State', () => {
        it('should show generate button when no plan exists', async () => {
            api.getWithCookie.mockResolvedValue({ status: 'no_plan' });

            renderWithRouter(<NutritionPage />);

            await waitFor(() => {
                expect(screen.getByText(/No Meal Plan for Today/i)).toBeInTheDocument();
            });

            expect(screen.getByRole('button', { name: /Generate Daily Plan/i })).toBeInTheDocument();
        });

        it('should call generate API when button is clicked', async () => {
            api.getWithCookie.mockResolvedValue({ status: 'no_plan' });
            api.postWithCookie.mockResolvedValue({
                status: 'success',
                plan: {
                    breakfast: { name: 'Oatmeal', calories: 300, protein: '10g' },
                    lunch: { name: 'Salad', calories: 400, protein: '15g' },
                    dinner: { name: 'Grilled Chicken', calories: 500, protein: '35g' },
                    total_calories: 1200,
                    total_protein: '60g',
                },
            });

            renderWithRouter(<NutritionPage />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Generate Daily Plan/i })).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole('button', { name: /Generate Daily Plan/i }));

            await waitFor(() => {
                expect(api.postWithCookie).toHaveBeenCalledWith('/nutrition/daily-suggestions', {});
            });
        });
    });

    describe('With Plan State', () => {
        const mockPlan = {
            status: 'success',
            plan: {
                breakfast: { name: 'Poha', description: 'Flattened rice with peanuts', calories: 300, protein: '8g', carbs: '45g', fats: '10g' },
                lunch: { name: 'Dal Rice', description: 'Lentils with rice', calories: 450, protein: '15g', carbs: '60g', fats: '12g' },
                dinner: { name: 'Roti Sabzi', description: 'Wheat bread with vegetables', calories: 400, protein: '12g', carbs: '50g', fats: '15g' },
                snacks: [
                    { name: 'Fruit Bowl', description: 'Mixed fruits', calories: 150, protein: '2g' },
                ],
                total_calories: 1300,
                total_protein: '37g',
                total_carbs: '155g',
                total_fats: '37g',
            },
        };

        it('should display meal plan correctly', async () => {
            api.getWithCookie.mockResolvedValue(mockPlan);

            renderWithRouter(<NutritionPage />);

            await waitFor(() => {
                expect(screen.getByText('Poha')).toBeInTheDocument();
            });

            expect(screen.getByText('Dal Rice')).toBeInTheDocument();
            expect(screen.getByText('Roti Sabzi')).toBeInTheDocument();
            expect(screen.getByText('Fruit Bowl')).toBeInTheDocument();
        });

        it('should display macro totals', async () => {
            api.getWithCookie.mockResolvedValue(mockPlan);

            renderWithRouter(<NutritionPage />);

            await waitFor(() => {
                expect(screen.getByText('1300')).toBeInTheDocument();
            });

            expect(screen.getByText('37g')).toBeInTheDocument();
        });

        it('should show regenerate button when plan exists', async () => {
            api.getWithCookie.mockResolvedValue(mockPlan);

            renderWithRouter(<NutritionPage />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Regenerate/i })).toBeInTheDocument();
            });
        });

        it('should navigate to history page when History button is clicked', async () => {
            api.getWithCookie.mockResolvedValue(mockPlan);

            renderWithRouter(<NutritionPage />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /History/i })).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole('button', { name: /History/i }));

            expect(mockNavigate).toHaveBeenCalledWith('/meal-history');
        });
    });

    describe('Error Handling', () => {
        it('should display error message when API fails', async () => {
            api.getWithCookie.mockRejectedValue(new Error('Network error'));

            renderWithRouter(<NutritionPage />);

            await waitFor(() => {
                expect(screen.getByText(/Failed to fetch suggestions/i)).toBeInTheDocument();
            });
        });

        it('should show retry button on error', async () => {
            api.getWithCookie.mockRejectedValue(new Error('Network error'));

            renderWithRouter(<NutritionPage />);

            await waitFor(() => {
                expect(screen.getByText(/Retry/i)).toBeInTheDocument();
            });
        });
    });
});
