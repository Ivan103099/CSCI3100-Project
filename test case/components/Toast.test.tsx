import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast, { toasts } from '@/components/Toast';

// Setup user event
const user = userEvent.setup();

describe('Toast Component', () => {
    test('renders toast with title and description when added to queue', async () => {
        render(<Toast />);
        toasts.add({ title: 'Test Title', description: 'Test Description' });
        const title = await screen.findByText('Test Title');
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass('font-semibold');
        const description = screen.getByText('Test Description');
        expect(description).toBeInTheDocument();
        expect(description).toHaveClass('text-sm');
    });

    test('applies success variant classes', async () => {
        render(<Toast />);
        toasts.add({
          title: 'Success',
          description: 'Operation completed',
          variant: 'success',
        });
        const title = await screen.findByText('Success');
        const toast = title.closest('.relative');
        expect(toast).toHaveClass('border-0 border-t-4 border-t-emerald-500');
    });

    test('applies destructive variant classes', async () => {
        render(<Toast />);
        toasts.add({
          title: 'Error',
          description: 'Something went wrong',
          variant: 'destructive',
        });
        const title = await screen.findByText('Error');
        const toast = title.closest('.relative');
        expect(toast).toHaveClass('border-0 border-t-4 border-t-destructive');
    });

    test('closes toast when close button is clicked', async () => {
        const mockClose = jest.fn();
        toasts.close = mockClose;
        jest.clearAllMocks();
        render(<Toast />);
        const toastId = toasts.add({ title: 'Test', description: 'Test desc' });
        await screen.findByText('Test');
        const closeButton = screen.getByRole('button', { name: /close/i });
        await userEvent.click(closeButton);
        expect(mockClose).toHaveBeenCalledWith(toastId);
    });

    test('shows only one toast at a time', async () => {
        render(<Toast />);
        toasts.add({ title: 'First', description: 'First desc' });
        const firstTitle = await screen.findByText('First');
        expect(firstTitle).toBeInTheDocument();
        toasts.add({ title: 'Second', description: 'Second desc' });
        expect(screen.queryByText('Second')).not.toBeInTheDocument();
        const closeButton = screen.getByLabelText('Close');
        await user.click(closeButton);
        await waitFor(() => {
          expect(screen.queryByText('First')).not.toBeInTheDocument();
          expect(screen.getByText('Second')).toBeInTheDocument();
        });
    });
});