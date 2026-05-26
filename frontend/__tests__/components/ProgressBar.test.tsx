import { render, screen } from '@testing-library/react';
import ProgressBar from '@/components/ProgressBar';

describe('ProgressBar', () => {
  it('renders the correct number of step indicators', () => {
    render(<ProgressBar currentStep={1} totalSteps={4} />);
    // Steps 1-4 should be visible as numbered or checkmark
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('marks the current step with aria-current="step"', () => {
    render(<ProgressBar currentStep={2} totalSteps={4} />);
    const current = screen.getByRole('generic', { current: 'step' });
    expect(current).toBeInTheDocument();
  });

  it('shows checkmark for completed steps', () => {
    render(<ProgressBar currentStep={3} totalSteps={4} />);
    // Steps 1 and 2 should be completed (show ✓)
    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks).toHaveLength(2);
  });

  it('shows step number for future steps', () => {
    render(<ProgressBar currentStep={1} totalSteps={4} />);
    // Steps 2, 3, 4 are future — shown as numbers
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('has a nav landmark for accessibility', () => {
    render(<ProgressBar currentStep={1} totalSteps={4} />);
    expect(screen.getByRole('navigation', { name: /form progress/i })).toBeInTheDocument();
  });

  it('renders step labels on sm+ screens', () => {
    render(<ProgressBar currentStep={1} totalSteps={4} />);
    expect(screen.getByText('Purpose & Date')).toBeInTheDocument();
    expect(screen.getByText('Agreement Terms')).toBeInTheDocument();
    expect(screen.getByText('Governing Law')).toBeInTheDocument();
    expect(screen.getByText('Party Details')).toBeInTheDocument();
  });

  it('works when on the last step', () => {
    render(<ProgressBar currentStep={4} totalSteps={4} />);
    const checkmarks = screen.getAllByText('✓');
    expect(checkmarks).toHaveLength(3);
    expect(screen.getByRole('generic', { current: 'step' })).toBeInTheDocument();
  });
});
