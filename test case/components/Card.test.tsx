import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Card from '@/components/Card';

describe('Card', () => {
    it('passes additional props to the div', () => {
        render(<Card data-testid="card" aria-label="test-card" id="test-id" />);
        const card = screen.getByTestId('card');
        expect(card).toHaveAttribute('aria-label', 'test-card');
        expect(card).toHaveAttribute('id', 'test-id');
    });

    it('renders all card components', () => {
        render(
          <Card data-testid="card">
            <Card.Header data-testid="header">
              <Card.Title data-testid="title">Title</Card.Title>
              <Card.Description data-testid="desc">Description</Card.Description>
            </Card.Header>
            <Card.Content data-testid="content">Main content here</Card.Content>
            <Card.Footer data-testid="footer">Footer</Card.Footer>
          </Card>
        );
    
        expect(screen.getByTestId('card')).toBeInTheDocument();
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('title')).toHaveTextContent('Title');
        expect(screen.getByTestId('desc')).toHaveTextContent('Description');
        expect(screen.getByTestId('content')).toHaveTextContent('Main content here');
        expect(screen.getByTestId('footer')).toHaveTextContent('Footer');
    });
});