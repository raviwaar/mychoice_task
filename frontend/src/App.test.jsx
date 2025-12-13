import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from './api';

vi.mock('./api');

const getLastCallParams = () => {
    const calls = api.getItems.mock.calls;
    return calls[calls.length - 1][0];
};

describe('App Component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        window.history.replaceState(null, '', '/');
    });

    it('renders initial items and handles Next button cursor pagination', async () => {
        api.getItems.mockResolvedValueOnce({
            data: {
                results: [{ id: '1', name: 'Item 1', group: 'Primary' }],
                next: 'http://api.com/items/?cursor=cursor-for-page-2',
                previous: null
            }
        });

        api.getItems.mockResolvedValueOnce({
            data: {
                results: [{ id: '2', name: 'Item 2', group: 'Secondary' }],
                next: null,
                previous: 'http://api.com/items/?cursor=cursor-for-page-1'
            }
        });

        render(<ChakraProvider><App /></ChakraProvider>);

        await waitFor(() => expect(screen.getByText('Item 1')).toBeInTheDocument());

        const nextBtn = screen.getByRole('button', { name: /Next/i });
        fireEvent.click(nextBtn);

        await waitFor(() => {
            const params = getLastCallParams();
            expect(params).toHaveProperty('cursor', 'cursor-for-page-2');
        });
    });

    it('resets cursor and pagination when searching', async () => {
        api.getItems.mockResolvedValue({
            data: { results: [], next: null, previous: null }
        });

        render(<ChakraProvider><App /></ChakraProvider>);

        const searchInput = screen.getByPlaceholderText(/Search by name/i);

        await waitFor(() => expect(api.getItems).toHaveBeenCalled());
        api.getItems.mockClear();

        fireEvent.change(searchInput, { target: { value: 'Rock' } });

        await waitFor(() => {
            expect(api.getItems).toHaveBeenCalledWith(
                expect.objectContaining({ search: 'Rock' }),
                expect.anything()
            );
        });

        const params = getLastCallParams();
        expect(params.cursor).toBeFalsy();
    });

    it('handles Delete and triggers a refresh', async () => {
        api.getItems.mockResolvedValue({
            data: {
                results: [{ id: '99', name: 'Delete Me', group: 'Primary' }],
                next: null, previous: null
            }
        });
        api.deleteItem.mockResolvedValue({});
        vi.spyOn(window, 'confirm').mockImplementation(() => true);

        render(<ChakraProvider><App /></ChakraProvider>);

        await waitFor(() => expect(screen.getByText('Delete Me')).toBeInTheDocument());

        const deleteBtns = screen.getAllByLabelText(/Delete/i);
        fireEvent.click(deleteBtns[0]);

        await waitFor(() => {
            expect(api.deleteItem).toHaveBeenCalledWith('99');
        });

        await waitFor(() => {
            expect(api.getItems).toHaveBeenCalledTimes(2);
        });
    });

    it('resets to Home (clears filters/cursors) when clicking Dashboard heading', async () => {
        api.getItems.mockResolvedValue({
            data: { results: [], next: null, previous: null }
        });

        render(<ChakraProvider><App /></ChakraProvider>);

        const searchInput = screen.getByPlaceholderText(/Search by name/i);
        fireEvent.change(searchInput, { target: { value: 'Filter' } });

        await waitFor(() => expect(api.getItems).toHaveBeenCalledWith(
            expect.objectContaining({ search: 'Filter' }),
            expect.anything()
        ));

        api.getItems.mockClear();

        const heading = screen.getByTitle('Go to First Page');
        fireEvent.click(heading);

        expect(searchInput).toHaveValue('');

        await waitFor(() => {
            const params = getLastCallParams();
            expect(params.search).toBeFalsy();
            expect(params.cursor).toBeFalsy();
        });
    });
});