import { render, screen } from '@testing-library/react';
import FormField from '@/components/FormField';

describe('FormField', () => {
  it('renders the label', () => {
    render(
      <FormField label="Purpose" htmlFor="purpose">
        <input id="purpose" />
      </FormField>
    );
    expect(screen.getByText('Purpose')).toBeInTheDocument();
  });

  it('associates label with the input via htmlFor', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <input id="email" />
      </FormField>
    );
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email');
  });

  it('renders children', () => {
    render(
      <FormField label="Name" htmlFor="name">
        <input id="name" data-testid="child-input" />
      </FormField>
    );
    expect(screen.getByTestId('child-input')).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    render(
      <FormField label="Name" htmlFor="name" error="Name is required">
        <input id="name" />
      </FormField>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
  });

  it('does not show error element when no error', () => {
    render(
      <FormField label="Name" htmlFor="name">
        <input id="name" />
      </FormField>
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows helper text when provided', () => {
    render(
      <FormField label="Name" htmlFor="name" helperText="Enter your full name">
        <input id="name" />
      </FormField>
    );
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('does not show helper text element when not provided', () => {
    render(
      <FormField label="Name" htmlFor="name">
        <input id="name" />
      </FormField>
    );
    expect(screen.queryByText(/Enter your/)).not.toBeInTheDocument();
  });
});
