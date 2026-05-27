import { render, screen } from '@testing-library/react';

jest.mock('next/link', () => {
  const MockLink = ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  );
  MockLink.displayName = 'Link';
  return MockLink;
});

import LandingPage from '@/app/page';

describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(<LandingPage />);
    expect(screen.getByRole('heading', { name: /mutual nda generator/i })).toBeInTheDocument();
  });

  it('renders the Create NDA link', () => {
    render(<LandingPage />);
    expect(screen.getByRole('link', { name: /create nda/i })).toBeInTheDocument();
  });

  it('Create NDA link points to /nda/new', () => {
    render(<LandingPage />);
    expect(screen.getByRole('link', { name: /create nda/i })).toHaveAttribute('href', '/nda/new');
  });

  it('renders the description paragraph', () => {
    render(<LandingPage />);
    expect(screen.getByText(/generate a ready-to-sign/i)).toBeInTheDocument();
  });

  it('renders the no-account tagline', () => {
    render(<LandingPage />);
    expect(screen.getByText(/no account required/i)).toBeInTheDocument();
  });
});
