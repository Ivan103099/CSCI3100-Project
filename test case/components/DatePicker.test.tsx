import React from 'react';
import { render, screen } from '@testing-library/react';
import { CalendarDate } from '@internationalized/date';
import DatePicker from '@/components/DatePicker';

describe('DatePicker', () => {
    it('renders the DatePicker component', () => {
        const onChangeMock = jest.fn();
        render(<DatePicker
            data-testid="datepicker"
            label="Test DatePicker"
            value={new CalendarDate(2023, 10, 1)}
            minValue={new CalendarDate(2023, 1, 1)}
            onChange={onChangeMock}
        />);
        

        expect(screen.getByText('Test DatePicker')).toBeInTheDocument();
        expect(screen.getByText('2023')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        const calendarButton = screen.getByRole('button', { name: /calendar/i });
        expect(calendarButton).toBeInTheDocument();
    });
});