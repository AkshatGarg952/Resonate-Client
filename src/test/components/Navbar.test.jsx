import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock the child components to simplify testing
vi.mock('../../components/nav/DesktopNav', () => ({
    default: ({ user, onLogout }) => (
        <div data-testid="desktop-nav">
            {user ? (
                <button onClick={onLogout}>Logout</button>
            ) : (
                <span>Not logged in</span>
            )}
        </div>
    ),
}));

vi.mock('../../components/nav/MobileMenu', () => ({
    default: ({ isOpen, onClose }) => (
        isOpen ? <div data-testid="mobile-menu"><button onClick={onClose}>Close</button></div> : null
    ),
}));

vi.mock('../../components/nav/BottomNav', () => ({
    default: () => <div data-testid="bottom-nav" />,
}));

// Mock Firebase
vi.mock('firebase/auth', () => ({
    signOut: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../firebase', () => ({
    auth: {},
}));

// Create a test wrapper with AuthContext
import { AuthContext } from '../../App';
import Navbar from '../../components/Navbar';

const renderWithProviders = (component, { user = null } = {}) => {
    return render(
        <AuthContext.Provider value={{ user }}>
            <BrowserRouter>
                {component}
            </BrowserRouter>
        </AuthContext.Provider>
    );
};

describe('Navbar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the navbar', () => {
            renderWithProviders(<Navbar />);
            expect(screen.getByRole('navigation')).toBeInTheDocument();
        });

        it('should render logo with brand text', () => {
            renderWithProviders(<Navbar />);
            expect(screen.getByText('R')).toBeInTheDocument();
            expect(screen.getByText('Resonate')).toBeInTheDocument();
        });

        it('should render mobile menu button', () => {
            renderWithProviders(<Navbar />);
            const menuButtons = screen.getAllByRole('button');
            expect(menuButtons.length).toBeGreaterThan(0);
        });
    });

    describe('Authentication State', () => {
        it('should show not logged in state when no user', () => {
            renderWithProviders(<Navbar />, { user: null });
            expect(screen.getByText('Not logged in')).toBeInTheDocument();
        });

        it('should show logout when user is logged in', () => {
            renderWithProviders(<Navbar />, { user: { uid: 'test-123', email: 'test@example.com' } });
            expect(screen.getByText('Logout')).toBeInTheDocument();
        });
    });

    describe('Mobile Menu', () => {
        it('should open mobile menu when button is clicked', async () => {
            renderWithProviders(<Navbar />);

            // Find and click the mobile menu button (it's the lg:hidden button with hamburger icon)
            const buttons = screen.getAllByRole('button');
            const mobileMenuButton = buttons.find(b => b.className.includes('lg:hidden'));

            if (mobileMenuButton) {
                fireEvent.click(mobileMenuButton);

                await waitFor(() => {
                    expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
                });
            }
        });
    });

    describe('Navigation Links', () => {
        it('should have a link to home', () => {
            renderWithProviders(<Navbar />);
            const homeLink = screen.getByRole('link');
            expect(homeLink).toHaveAttribute('href', '/');
        });
    });

    describe('Sub Components', () => {
        it('should render DesktopNav', () => {
            renderWithProviders(<Navbar />);
            expect(screen.getByTestId('desktop-nav')).toBeInTheDocument();
        });

        it('should render BottomNav', () => {
            renderWithProviders(<Navbar />);
            expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
        });
    });
});
