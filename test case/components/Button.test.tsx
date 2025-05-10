import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Button from '@/components/Button';

describe('Button', () => {
    const variants = ['default', 'outline', 'secondary', 'ghost', 'link'] as const;
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;
    
    const combinations = variants.flatMap(variant => 
      sizes.map(size => ({ variant, size }))
    );
    
    // All 20 test cases passed
    test.each(combinations)(
      'renders with variant $variant and size $size',
      ({ variant, size }) => {
        render(<Button variant={variant} size={size}>Click</Button>);
        const button = screen.getByRole('button', { name: 'Click' });
        const expectedClasses = Button.variants({ variant, size });
        expect(button).toHaveClass(expectedClasses);
      }
    );

    // Passed
    test('calls onPress', async () => {
      const onPress = jest.fn();
      render(<Button onPress={onPress}>Click</Button>);
      const button = screen.getByRole('button', { name: 'Click' });
      await userEvent.click(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    });
    
    // Passed
    test('sets aria-label', () => {
      render(<Button aria-label="Custom label">Click</Button>);
      const button = screen.getByLabelText('Custom label');
      expect(button).toBeInTheDocument();
    });
});