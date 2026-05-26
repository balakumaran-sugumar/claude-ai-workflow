import { render, screen, fireEvent } from '@testing-library/react';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import LandingPage from '@/app/page';

describe('LandingPage', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the main heading', () => {
    render(<LandingPage />);
    expect(screen.getByRole('heading', { name: /mutual nda generator/i })).toBeInTheDocument();
  });

  it('renders the Create NDA button', () => {
    render(<LandingPage />);
    expect(screen.getByRole('button', { name: /create nda/i })).toBeInTheDocument();
  });

  it('navigates to /nda/new when Create NDA is clicked', () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByRole('button', { name: /create nda/i }));
    expect(mockPush).toHaveBeenCalledWith('/nda/new');
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
