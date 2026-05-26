import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import WizardPage from '@/app/nda/new/page';
import { validateStep } from '@/app/nda/new/page';
import { NdaFormValues } from '@/types/nda';

const VALID_BASE: NdaFormValues = {
  purpose: 'Evaluating a potential partnership with the other party.',
  effectiveDate: '2025-01-01',
  mndaTerm: { type: 'fixed', years: 1 },
  termOfConfidentiality: { type: 'fixed', years: 1 },
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
  sessionStorage.clear();
});

describe('validateStep (unit)', () => {
  it('returns error when purpose is too short', () => {
    const v = { ...VALID_BASE, purpose: 'short' };
    expect(validateStep(1, v)).toHaveProperty('purpose');
  });

  it('returns error when purpose is empty', () => {
    const v = { ...VALID_BASE, purpose: '' };
    expect(validateStep(1, v)).toHaveProperty('purpose');
  });

  it('returns no error for valid step 1', () => {
    expect(validateStep(1, VALID_BASE)).toEqual({});
  });

  it('returns no errors for step 2 (always valid)', () => {
    expect(validateStep(2, VALID_BASE)).toEqual({});
  });

  it('returns error when governingLaw is empty', () => {
    const v = { ...VALID_BASE, governingLaw: '' };
    expect(validateStep(3, v)).toHaveProperty('governingLaw');
  });

  it('returns error when jurisdiction is empty', () => {
    const v = { ...VALID_BASE, jurisdiction: '' };
    expect(validateStep(3, v)).toHaveProperty('jurisdiction');
  });

  it('returns no error for valid step 3', () => {
    expect(validateStep(3, VALID_BASE)).toEqual({});
  });

  it('returns party1 company error when empty', () => {
    const v = { ...VALID_BASE, party1: { ...VALID_BASE.party1, company: '' } };
    const errors = validateStep(4, v);
    expect(Object.keys(errors)).toContain('party1.company');
  });

  it('returns party2 company error when empty', () => {
    const v = { ...VALID_BASE, party2: { ...VALID_BASE.party2, company: '' } };
    const errors = validateStep(4, v);
    expect(Object.keys(errors)).toContain('party2.company');
  });

  it('returns no errors for valid step 4', () => {
    expect(validateStep(4, VALID_BASE)).toEqual({});
  });

  it('returns error when effectiveDate is empty', () => {
    const v = { ...VALID_BASE, effectiveDate: '' };
    expect(validateStep(1, v)).toHaveProperty('effectiveDate');
  });

  it('returns no errors for unknown step', () => {
    expect(validateStep(99, VALID_BASE)).toEqual({});
  });
});

describe('WizardPage - Step 1', () => {
  it('renders step 1 heading', () => {
    render(<WizardPage />);
    expect(screen.getByText(/Purpose & Effective Date/i)).toBeInTheDocument();
  });

  it('renders Purpose textarea with default value', () => {
    render(<WizardPage />);
    const textarea = screen.getByLabelText(/purpose/i);
    expect(textarea).toBeInTheDocument();
    expect((textarea as HTMLTextAreaElement).value).toContain('Evaluating whether');
  });

  it('renders Effective Date input', () => {
    render(<WizardPage />);
    expect(screen.getByLabelText(/effective date/i)).toBeInTheDocument();
  });

  it('shows a validation error when purpose is too short and Continue is clicked', () => {
    render(<WizardPage />);
    const textarea = screen.getByLabelText(/purpose/i);
    fireEvent.change(textarea, { target: { value: 'too short' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not show Back button on step 1', () => {
    render(<WizardPage />);
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
  });

  it('shows Continue button on step 1', () => {
    render(<WizardPage />);
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });
});

describe('WizardPage - Navigation', () => {
  it('advances to step 2 when Continue is clicked with valid step 1 data', () => {
    render(<WizardPage />);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByRole('heading', { name: /Agreement Terms/i })).toBeInTheDocument();
  });

  it('goes back to step 1 when Back is clicked from step 2', () => {
    render(<WizardPage />);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText(/Purpose & Effective Date/i)).toBeInTheDocument();
  });

  it('clears errors when navigating back', () => {
    render(<WizardPage />);
    // Trigger error on step 1
    const textarea = screen.getByLabelText(/purpose/i);
    fireEvent.change(textarea, { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Fix and advance to step 2, then go back
    fireEvent.change(textarea, { target: { value: 'Evaluating a long enough purpose text here.' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('WizardPage - Step 2', () => {
  const goToStep2 = () => {
    render(<WizardPage />);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  };

  it('renders MNDA Term radio options', () => {
    goToStep2();
    expect(screen.getByRole('radio', { name: /expires/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /continues until terminated/i })).toBeInTheDocument();
  });

  it('renders Confidentiality radio options', () => {
    goToStep2();
    expect(screen.getByRole('radio', { name: /fixed/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /in perpetuity/i })).toBeInTheDocument();
  });

  it('shows MNDA term year spinner when fixed is selected', () => {
    goToStep2();
    expect(screen.getByLabelText(/mnda term years/i)).toBeInTheDocument();
  });

  it('switches MNDA term to at-will when radio is changed', () => {
    goToStep2();
    const atWillRadio = screen.getByRole('radio', { name: /continues until terminated/i });
    fireEvent.click(atWillRadio);
    expect(screen.queryByLabelText(/mnda term years/i)).not.toBeInTheDocument();
  });

  it('shows confidentiality year spinner when fixed is selected', () => {
    goToStep2();
    expect(screen.getByLabelText(/confidentiality term years/i)).toBeInTheDocument();
  });

  it('switches confidentiality to perpetual when radio is changed', () => {
    goToStep2();
    const perpetualRadio = screen.getByRole('radio', { name: /in perpetuity/i });
    fireEvent.click(perpetualRadio);
    expect(screen.queryByLabelText(/confidentiality term years/i)).not.toBeInTheDocument();
  });

  it('updates MNDA term year count when spinner changes', () => {
    goToStep2();
    const yearInput = screen.getByLabelText(/mnda term years/i);
    fireEvent.change(yearInput, { target: { value: '3' } });
    expect((yearInput as HTMLInputElement).value).toBe('3');
  });

  it('updates confidentiality year count when spinner changes', () => {
    goToStep2();
    const yearInput = screen.getByLabelText(/confidentiality term years/i);
    fireEvent.change(yearInput, { target: { value: '5' } });
    expect((yearInput as HTMLInputElement).value).toBe('5');
  });
});

describe('WizardPage - Step 3', () => {
  const goToStep3 = () => {
    render(<WizardPage />);
    // Step 1 → 2
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    // Step 2 → 3
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  };

  it('renders Governing Law and Jurisdiction fields', () => {
    goToStep3();
    expect(screen.getByLabelText(/governing law/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/jurisdiction/i)).toBeInTheDocument();
  });

  it('shows validation error for empty governing law', () => {
    goToStep3();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
  });

  it('renders Modifications field', () => {
    goToStep3();
    expect(screen.getByLabelText(/mnda modifications/i)).toBeInTheDocument();
  });
});

describe('WizardPage - Step 4 and submission', () => {
  const goToStep4 = () => {
    render(<WizardPage />);
    fireEvent.click(screen.getByRole('button', { name: /continue/i })); // 1→2
    fireEvent.click(screen.getByRole('button', { name: /continue/i })); // 2→3
    // Fill step 3
    fireEvent.change(screen.getByLabelText(/governing law/i), {
      target: { value: 'Delaware' },
    });
    fireEvent.change(screen.getByLabelText(/jurisdiction/i), {
      target: { value: 'Wilmington, DE' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i })); // 3→4
  };

  it('renders Party 1 and Party 2 headings', () => {
    goToStep4();
    expect(screen.getByText('Party 1')).toBeInTheDocument();
    expect(screen.getByText('Party 2')).toBeInTheDocument();
  });

  it('shows Preview Document button on last step', () => {
    goToStep4();
    expect(screen.getByRole('button', { name: /preview document/i })).toBeInTheDocument();
  });

  it('shows validation errors when party fields are empty', () => {
    goToStep4();
    fireEvent.click(screen.getByRole('button', { name: /preview document/i }));
    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('saves to sessionStorage and navigates to /nda/preview on valid submission', async () => {
    goToStep4();
    // Fill Party 1
    const companyInputs = screen.getAllByLabelText(/company/i);
    fireEvent.change(companyInputs[0], { target: { value: 'Acme Corp' } });
    const signatoryInputs = screen.getAllByLabelText(/signatory name/i);
    fireEvent.change(signatoryInputs[0], { target: { value: 'Alice Smith' } });
    const titleInputs = screen.getAllByLabelText(/title/i);
    fireEvent.change(titleInputs[0], { target: { value: 'CEO' } });
    const noticeInputs = screen.getAllByLabelText(/notice address/i);
    fireEvent.change(noticeInputs[0], { target: { value: 'alice@acme.com' } });
    const dateInputs = screen.getAllByLabelText(/signature date/i);
    fireEvent.change(dateInputs[0], { target: { value: '2025-01-01' } });

    // Fill Party 2
    fireEvent.change(companyInputs[1], { target: { value: 'Beta LLC' } });
    fireEvent.change(signatoryInputs[1], { target: { value: 'Bob Jones' } });
    fireEvent.change(titleInputs[1], { target: { value: 'CTO' } });
    fireEvent.change(noticeInputs[1], { target: { value: 'bob@beta.io' } });
    fireEvent.change(dateInputs[1], { target: { value: '2025-01-02' } });

    fireEvent.click(screen.getByRole('button', { name: /preview document/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/nda/preview');
    });
    const stored = JSON.parse(sessionStorage.getItem('ndaFormValues') || '{}');
    expect(stored.party1.company).toBe('Acme Corp');
    expect(stored.party2.company).toBe('Beta LLC');
  });
});
