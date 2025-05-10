import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TextField from '@/components/TextField';

describe('TextField', () => {
    test('renders with label and placeholder', () => {
        render(<TextField label="Email" placeholder="Enter your email" />);
        const input = screen.getByPlaceholderText('Enter your email');
        const label = screen.getByText('Email');
        expect(input).toBeInTheDocument();
        expect(label).toBeInTheDocument();
    });

    test('renders with error message', () => {
        render(<TextField error="Username is required" isInvalid />);
        const error = screen.getByText('Username is required');
        expect(error).toBeInTheDocument();
    });

    test('handles user input correctly', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        
        render(<TextField onChange={onChange} />);
        const input = screen.getByRole('textbox');
        await user.type(input, 'test-user');
        expect(onChange).toHaveBeenCalled();
        expect(input).toHaveValue('test-user');
    });

    test('sets aria-label', () => {
        render(<TextField aria-label="Custom label" />);
        const input = screen.getByLabelText('Custom label');
        expect(input).toBeInTheDocument();
    });
});