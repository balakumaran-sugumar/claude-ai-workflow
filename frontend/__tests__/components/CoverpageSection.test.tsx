import { render, screen } from '@testing-library/react';
import CoverpageSection from '@/components/CoverpageSection';

describe('CoverpageSection', () => {
  it('renders with data-testid="coverpage-section"', () => {
    render(<CoverpageSection markdown="# Hello" />);
    expect(screen.getByTestId('coverpage-section')).toBeInTheDocument();
  });

  it('passes the markdown string to ReactMarkdown', () => {
    render(<CoverpageSection markdown="# Mutual NDA Cover Page" />);
    expect(screen.getByText('# Mutual NDA Cover Page')).toBeInTheDocument();
  });

  it('renders different markdown content correctly', () => {
    render(<CoverpageSection markdown="Purpose: Evaluating a partnership." />);
    expect(screen.getByText('Purpose: Evaluating a partnership.')).toBeInTheDocument();
  });
});
