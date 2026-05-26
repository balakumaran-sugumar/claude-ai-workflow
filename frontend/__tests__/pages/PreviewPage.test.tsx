import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/downloadMarkdown', () => ({
  downloadMarkdown: jest.fn(),
  buildDownloadFilename: jest.fn(
    (c1: string, c2: string) =>
      `mutual-nda-${c1.toLowerCase().replace(/\s+/g, '-')}-${c2.toLowerCase().replace(/\s+/g, '-')}.md`
  ),
}));

import PreviewPage from '@/app/nda/preview/page';
import { downloadMarkdown } from '@/lib/downloadMarkdown';

const SESSION_KEY = 'ndaFormValues';

const MOCK_VALUES = {
  purpose: 'Evaluating a potential partnership.',
  effectiveDate: '2025-01-01',
  mndaTerm: { type: 'fixed', years: 2 },
  termOfConfidentiality: { type: 'fixed', years: 3 },
  governingLaw: 'Delaware',
  jurisdiction: 'courts located in Wilmington, DE',
  modifications: '',
  party1: {
    company: 'Acme Corp',
    signatoryName: 'Alice Smith',
    title: 'CEO',
    noticeAddress: 'alice@acme.com',
    signatureDate: '2025-01-01',
  },
  party2: {
    company: 'Beta LLC',
    signatoryName: 'Bob Jones',
    title: 'CTO',
    noticeAddress: 'bob@beta.io',
    signatureDate: '2025-01-02',
  },
};

beforeEach(() => {
  mockPush.mockClear();
  (downloadMarkdown as jest.Mock).mockClear();
  sessionStorage.clear();
});

describe('PreviewPage - no data', () => {
  it('shows no-data message when sessionStorage is empty', async () => {
    render(<PreviewPage />);
    await waitFor(() => {
      expect(screen.getByText(/no form data found/i)).toBeInTheDocument();
    });
  });

  it('shows Start NDA button when no data', async () => {
    render(<PreviewPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /start nda/i })).toBeInTheDocument();
    });
  });

  it('navigates to /nda/new when Start NDA is clicked', async () => {
    render(<PreviewPage />);
    await waitFor(() => screen.getByRole('button', { name: /start nda/i }));
    fireEvent.click(screen.getByRole('button', { name: /start nda/i }));
    expect(mockPush).toHaveBeenCalledWith('/nda/new');
  });

  it('shows no-data state when sessionStorage has invalid JSON', async () => {
    sessionStorage.setItem(SESSION_KEY, '{{invalid json}}');
    render(<PreviewPage />);
    await waitFor(() => {
      expect(screen.getByText(/no form data found/i)).toBeInTheDocument();
    });
  });
});

describe('PreviewPage - with data', () => {
  beforeEach(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(MOCK_VALUES));
  });

  it('renders NDA Preview heading', async () => {
    render(<PreviewPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /nda preview/i })).toBeInTheDocument();
    });
  });

  it('renders Section 1 label', async () => {
    render(<PreviewPage />);
    await waitFor(() => {
      expect(screen.getByText(/section 1/i)).toBeInTheDocument();
    });
  });

  it('renders Section 2 label', async () => {
    render(<PreviewPage />);
    await waitFor(() => {
      expect(screen.getByText(/section 2/i)).toBeInTheDocument();
    });
  });

  it('renders coverpage-section component', async () => {
    render(<PreviewPage />);
    await waitFor(() => {
      expect(screen.getByTestId('coverpage-section')).toBeInTheDocument();
    });
  });

  it('renders standard-terms component', async () => {
    render(<PreviewPage />);
    await waitFor(() => {
      expect(screen.getByTestId('standard-terms')).toBeInTheDocument();
    });
  });

  it('renders the Edit button', async () => {
    render(<PreviewPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });
  });

  it('renders the Download button', async () => {
    render(<PreviewPage />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });
  });

  it('navigates to /nda/new when Edit is clicked', async () => {
    render(<PreviewPage />);
    await waitFor(() => screen.getByRole('button', { name: /edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(mockPush).toHaveBeenCalledWith('/nda/new');
  });

  it('calls downloadMarkdown when Download is clicked', async () => {
    render(<PreviewPage />);
    await waitFor(() => screen.getByRole('button', { name: /download/i }));
    fireEvent.click(screen.getByRole('button', { name: /download/i }));
    expect(downloadMarkdown).toHaveBeenCalledTimes(1);
  });

  it('passes the correct filename to downloadMarkdown', async () => {
    render(<PreviewPage />);
    await waitFor(() => screen.getByRole('button', { name: /download/i }));
    fireEvent.click(screen.getByRole('button', { name: /download/i }));
    const [, filename] = (downloadMarkdown as jest.Mock).mock.calls[0];
    expect(filename).toContain('acme-corp');
    expect(filename).toContain('beta-llc');
    expect(filename).toMatch(/\.md$/);
  });

  it('passes content containing both sections to downloadMarkdown', async () => {
    render(<PreviewPage />);
    await waitFor(() => screen.getByRole('button', { name: /download/i }));
    fireEvent.click(screen.getByRole('button', { name: /download/i }));
    const [content] = (downloadMarkdown as jest.Mock).mock.calls[0];
    expect(content).toContain('# Mutual Non-Disclosure Agreement');
    expect(content).toContain('# Standard Terms');
  });
});
