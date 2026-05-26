import { render, screen, fireEvent } from '@testing-library/react';
import RadioOption from '@/components/RadioOption';

describe('RadioOption', () => {
  it('renders the label text', () => {
    render(
      <RadioOption name="term" value="fixed" checked={false} onChange={jest.fn()} label="Fixed term" />
    );
    expect(screen.getByText('Fixed term')).toBeInTheDocument();
  });

  it('renders a radio input with the correct name and value', () => {
    render(
      <RadioOption name="term" value="fixed" checked={false} onChange={jest.fn()} label="Fixed term" />
    );
    const radio = screen.getByRole('radio');
    expect(radio).toHaveAttribute('name', 'term');
    expect(radio).toHaveAttribute('value', 'fixed');
  });

  it('reflects checked state', () => {
    render(
      <RadioOption name="term" value="fixed" checked={true} onChange={jest.fn()} label="Fixed term" />
    );
    expect(screen.getByRole('radio')).toBeChecked();
  });

  it('reflects unchecked state', () => {
    render(
      <RadioOption name="term" value="fixed" checked={false} onChange={jest.fn()} label="Fixed term" />
    );
    expect(screen.getByRole('radio')).not.toBeChecked();
  });

  it('calls onChange with the value when clicked', () => {
    const onChange = jest.fn();
    render(
      <RadioOption name="term" value="atWill" checked={false} onChange={onChange} label="At will" />
    );
    fireEvent.click(screen.getByRole('radio'));
    expect(onChange).toHaveBeenCalledWith('atWill');
  });

  it('renders children when provided', () => {
    render(
      <RadioOption name="term" value="fixed" checked={true} onChange={jest.fn()} label="Fixed">
        <span data-testid="child-spinner">spinner</span>
      </RadioOption>
    );
    expect(screen.getByTestId('child-spinner')).toBeInTheDocument();
  });

  it('renders without children when not provided', () => {
    const { container } = render(
      <RadioOption name="term" value="fixed" checked={false} onChange={jest.fn()} label="Fixed" />
    );
    expect(container.querySelector('[data-testid="child-spinner"]')).toBeNull();
  });
});
