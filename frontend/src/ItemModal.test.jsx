import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ItemModal from './ItemModal';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from './api';

vi.mock('./api');

const renderModal = (props) => {
    return render(
        <ChakraProvider>
            <ItemModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} {...props} />
        </ChakraProvider>
    );
};

describe('ItemModal Component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly in Create mode', () => {
        renderModal({ mode: 'create', item: null });

        expect(screen.getByText(/Create New Item/i)).toBeInTheDocument();

        expect(screen.getByLabelText(/Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Group/i)).toHaveValue('Primary');

        expect(screen.getByRole('button', { name: /^Create$/i })).toBeInTheDocument();
    });

    it('submits data correctly in Create mode', async () => {
        api.createItem.mockResolvedValue({});
        const onSuccessMock = vi.fn();

        renderModal({ mode: 'create', item: null, onSuccess: onSuccessMock });

        fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Item' } });
        fireEvent.change(screen.getByLabelText(/Group/i), { target: { value: 'Secondary' } });

        fireEvent.click(screen.getByRole('button', { name: /^Create$/i }));

        await waitFor(() => {
            expect(api.createItem).toHaveBeenCalledWith({ name: 'New Item', group: 'Secondary' });
            expect(onSuccessMock).toHaveBeenCalled();
        });
    });

    it('fetches and displays data in Edit mode', async () => {
        api.getItem.mockResolvedValue({
            data: {
                id: '123',
                name: 'Existing Item',
                group: 'Secondary',
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-02T00:00:00Z'
            }
        });

        renderModal({ mode: 'edit', item: { id: '123' } });

        await waitFor(() => {
            expect(screen.getByDisplayValue('Existing Item')).toBeInTheDocument();
        });

        expect(screen.getByLabelText(/Name/i)).toHaveValue('Existing Item');
        expect(screen.getByLabelText(/Group/i)).toHaveValue('Secondary');

        expect(screen.getByText('System Details (Read Only)')).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('calls updateItem when saving in Edit mode', async () => {
        api.getItem.mockResolvedValue({
            data: { id: '123', name: 'Old Name', group: 'Primary' }
        });
        api.updateItem.mockResolvedValue({});

        const onSuccessMock = vi.fn();

        renderModal({ mode: 'edit', item: { id: '123' }, onSuccess: onSuccessMock });

        await waitFor(() => expect(screen.getByDisplayValue('Old Name')).toBeInTheDocument());

        fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Updated Name' } });

        fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

        await waitFor(() => {
            expect(api.updateItem).toHaveBeenCalledWith('123', { name: 'Updated Name', group: 'Primary' });
            expect(onSuccessMock).toHaveBeenCalled();
        });
    });

    it('displays validation errors from the backend', async () => {
        api.createItem.mockRejectedValue({
            response: {
                data: {
                    non_field_errors: ['Name already exists in this group.']
                }
            }
        });

        renderModal({ mode: 'create', item: null });

        fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Duplicate' } });
        fireEvent.click(screen.getByRole('button', { name: /^Create$/i }));

        await waitFor(() => {
            expect(screen.getByText('Name already exists in this group.')).toBeInTheDocument();
        });
    });

    it('shows an error message if the item cannot be found (404)', async () => {
        api.getItem.mockRejectedValue({
            response: { status: 404 }
        });

        renderModal({ mode: 'edit', item: { id: 'missing-id' } });

        await waitFor(() => {
            expect(screen.getByText('Failed to load item details.')).toBeInTheDocument();
        });

        expect(screen.getByLabelText(/Name/i)).toHaveValue('');
    });
});