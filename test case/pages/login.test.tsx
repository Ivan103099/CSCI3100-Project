import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router';
import { useLoginRequest } from '@/lib/client';
import { toasts } from '@/components/Toast';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AuthLoginPage from '@/pages/auth/login';

jest.mock('react-router', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('@/lib/client', () => ({
    useLoginRequest: jest.fn(),
  }));

jest.mock('@/components/Toast', () => ({
    toasts: {
      add: jest.fn(),
    },
}));

describe('AuthLoginPage', () => {
    const mockLoginRequest = jest.fn();
    const mockNavigate = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
        (useLoginRequest as jest.Mock).mockReturnValue(mockLoginRequest);
    });

    it('renders the login page', () => {
        render(<AuthLoginPage />);  

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('entering email and password', async () => {
        render(<AuthLoginPage />);
        
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'password123');
        
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    it('login with correct credentials', async () => {
        mockLoginRequest.mockResolvedValue({ id: '1', email: 'test@example.com' });

        render(<AuthLoginPage />);
    
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /login/i });
    
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'password123');
        await userEvent.click(loginButton);
    
        await waitFor(() => {
            expect(mockLoginRequest).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('login failed', async () => {
        const errorMessage = 'Invalid credentials';
        mockLoginRequest.mockRejectedValueOnce(new Error(errorMessage));
        
        render(<AuthLoginPage />);
        
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const loginButton = screen.getByRole('button', { name: /login/i });
        
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'password123');
        await userEvent.click(loginButton);
        
        await waitFor(() => {
            expect(mockLoginRequest).toHaveBeenCalledWith({
              email: 'test@example.com',
              password: 'password123',
            });
            expect(toasts.add).toHaveBeenCalledWith(
              {
                title: 'Login Failed',
                description: errorMessage,
                variant: 'destructive',
              },
              { timeout: 5000 }
            );
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    it('navigates to register page', () => {
        render(<AuthLoginPage />);
    
        const registerButton = screen.getByRole('button', { name: /register/i });
        fireEvent.click(registerButton);
    
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });
});