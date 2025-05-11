import React from 'react';
import { render, screen } from '@testing-library/react';
import { ColorPicker } from '@/components/ColorPicker';

describe('ColorPicker', () => {
    it('renders the ColorPicker component', () => {
        render(<ColorPicker value="#ff0000" onChange={() => {}} />);
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();

        const hexText = screen.getByText('#ff0000');
        expect(hexText).toBeInTheDocument();
    });
});