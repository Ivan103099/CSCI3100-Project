import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router';
import { useLoginRequest } from '@/lib/client';
import { toasts } from '@/components/Toast';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AuthRegisterPage from '@/pages/auth/register';
import { useCreateAccountMutation } from '@/lib/graphql';

jest.mock('react-router', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('@/lib/graphql', () => ({
    useCreateAccountMutation: jest.fn(),
}));

jest.mock('@/components/Toast', () => ({
    toasts: {
      add: jest.fn(),
    },
}));

describe('AuthRegisterPage', () => {
    const mockCreateAccount = jest.fn();
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useCreateAccountMutation as jest.Mock).mockReturnValue([{}, mockCreateAccount]);
    });

    it('renders the register page', () => {
        render(<AuthRegisterPage />);  

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/License Key/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Back to Login/i })).toBeInTheDocument();
    });

    it('input registration details', async () => {
        render(<AuthRegisterPage />);
        
        await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
        await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');
        await userEvent.type(screen.getByLabelText(/Full Name/i), 'Test User');
        await userEvent.type(screen.getByLabelText(/License Key/i), '1234');
        
        expect(screen.getByLabelText(/Email/i)).toHaveValue('test@example.com');
        expect(screen.getByLabelText(/^Password$/i)).toHaveValue('password123');
        expect(screen.getByLabelText(/Confirm Password/i)).toHaveValue('password123');
        expect(screen.getByLabelText(/Full Name/i)).toHaveValue('Test User');
        expect(screen.getByLabelText(/License Key/i)).toHaveValue('1234');
    });

    it('register successful', async () => {
        mockCreateAccount.mockResolvedValue({ error: null });
        render(<AuthRegisterPage />);

        await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
        await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');
        await userEvent.type(screen.getByLabelText(/Full Name/i), 'Test User');
        await userEvent.type(screen.getByLabelText(/License Key/i), '1234');

        await userEvent.click(screen.getByRole('button', { name: /Register/i }));
        await waitFor(() => {
            expect(mockCreateAccount).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
                fullname: 'Test User',
            });
        });

        expect(toasts.add).toHaveBeenCalledWith(
            {
              title: 'Register Success',
              description: 'Welcome to Finawise!',
              variant: 'success',
            },
            { timeout: 5000 }
        );

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('register failed', async () => {
        const errorMessage = 'Registration failed';
        mockCreateAccount.mockResolvedValue({ error: { message: errorMessage } });
        render(<AuthRegisterPage />);

        await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
        await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
        await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password123');
        await userEvent.type(screen.getByLabelText(/Full Name/i), 'Test User');
        await userEvent.type(screen.getByLabelText(/License Key/i), '1234');

        await userEvent.click(screen.getByRole('button', { name: /Register/i }));
        await waitFor(() => {
            expect(toasts.add).toHaveBeenCalledWith(
                {
                  title: 'Register Failed',
                  description: errorMessage,
                  variant: 'destructive',
                },
                { timeout: 5000 }
            );
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates back to login page', () => {
        render(<AuthRegisterPage />);
        
        const backButton = screen.getByRole('button', { name: /Back to Login/i });
        fireEvent.click(backButton);
        
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('validates password', async () => {
        render(<AuthRegisterPage />);
        
        await userEvent.type(screen.getByLabelText(/^Password$/i), 'password123');
        await userEvent.type(screen.getByLabelText(/Confirm Password/i), 'password1234');

        await userEvent.tab();
        expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    });
});