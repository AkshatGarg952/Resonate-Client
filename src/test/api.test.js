import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getWithCookie,
    postWithCookie,
    putWithCookie,
    patchWithCookie,
    uploadPdfWithCookie,
    analyzeFoodImage,
} from '../api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Module', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getWithCookie', () => {
        it('should make GET request with credentials', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ data: 'test' }),
            });

            const result = await getWithCookie('/test-endpoint');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test-endpoint'),
                expect.objectContaining({
                    credentials: 'include',
                })
            );
            expect(result).toEqual({ data: 'test' });
        });

        it('should throw error on failed request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ message: 'Not found' }),
            });

            await expect(getWithCookie('/test-endpoint')).rejects.toThrow('Not found');
        });
    });

    describe('postWithCookie', () => {
        it('should make POST request with JSON body and credentials', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            });

            const body = { name: 'test' };
            const result = await postWithCookie('/test-endpoint', body);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test-endpoint'),
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(body),
                })
            );
            expect(result).toEqual({ success: true });
        });

        it('should throw error on failed POST request', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ message: 'Server error' }),
            });

            await expect(postWithCookie('/test-endpoint', {})).rejects.toThrow('Server error');
        });
    });

    describe('putWithCookie', () => {
        it('should make PUT request with JSON body', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ updated: true }),
            });

            const body = { id: 1, name: 'updated' };
            const result = await putWithCookie('/test-endpoint', body);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test-endpoint'),
                expect.objectContaining({
                    method: 'PUT',
                    credentials: 'include',
                })
            );
            expect(result).toEqual({ updated: true });
        });
    });

    describe('patchWithCookie', () => {
        it('should make PATCH request with JSON body', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ patched: true }),
            });

            const body = { status: 'active' };
            const result = await patchWithCookie('/test-endpoint', body);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/test-endpoint'),
                expect.objectContaining({
                    method: 'PATCH',
                    credentials: 'include',
                })
            );
            expect(result).toEqual({ patched: true });
        });
    });

    describe('uploadPdfWithCookie', () => {
        it('should make POST request with FormData', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ uploaded: true }),
            });

            const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
            const result = await uploadPdfWithCookie('/upload', file);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/upload'),
                expect.objectContaining({
                    method: 'POST',
                    credentials: 'include',
                    body: expect.any(FormData),
                })
            );
            expect(result).toEqual({ uploaded: true });
        });
    });

    describe('analyzeFoodImage', () => {
        it('should make POST request with image and cuisine', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ food: 'pizza', calories: 500 }),
            });

            const file = new File(['test'], 'food.jpg', { type: 'image/jpeg' });
            const result = await analyzeFoodImage(file, 'Italian');

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/food/analyze'),
                expect.objectContaining({
                    method: 'POST',
                    credentials: 'include',
                    body: expect.any(FormData),
                })
            );
            expect(result).toEqual({ food: 'pizza', calories: 500 });
        });

        it('should work without cuisine parameter', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ food: 'unknown' }),
            });

            const file = new File(['test'], 'food.jpg', { type: 'image/jpeg' });
            await analyzeFoodImage(file);

            expect(mockFetch).toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should use default error message when none provided', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({}),
            });

            await expect(getWithCookie('/test')).rejects.toThrow('Request failed');
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(getWithCookie('/test')).rejects.toThrow('Network error');
        });
    });
});
