import { render, screen } from '@testing-library/react';
import StandardTerms from '@/components/StandardTerms';

describe('StandardTerms', () => {
  it('renders with data-testid="standard-terms"', () => {
    render(<StandardTerms markdown="# Standard Terms" />);
    expect(screen.getByTestId('standard-terms')).toBeInTheDocument();
  });

  it('passes markdown content to ReactMarkdown', () => {
    render(<StandardTerms markdown="1. Introduction clause" />);
    expect(screen.getByText('1. Introduction clause')).toBeInTheDocument();
  });

  it('renders chip-annotated markdown', () => {
    const md =
      'Confidential information for the <mark class="nda-chip">Evaluating a partnership.</mark>';
    render(<StandardTerms markdown={md} />);
    expect(screen.getByText(md)).toBeInTheDocument();
  });
});
