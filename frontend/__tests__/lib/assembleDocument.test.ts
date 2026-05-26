import {
  assembleCoverPage,
  assembleStandardTerms,
  assembleFullDocument,
  getMndaTermText,
  getConfidentialityText,
  getFieldValues,
  STANDARD_TERMS_RAW,
} from '@/lib/assembleDocument';
import { NdaFormValues } from '@/types/nda';

const BASE: NdaFormValues = {
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

describe('getMndaTermText', () => {
  it('returns year text for fixed term', () => {
    expect(getMndaTermText(BASE)).toBe('2 year(s) from Effective Date');
  });

  it('returns termination text for at-will', () => {
    const v = { ...BASE, mndaTerm: { type: 'atWill' as const } };
    expect(getMndaTermText(v)).toBe('termination by either party in writing');
  });
});

describe('getConfidentialityText', () => {
  it('returns year text for fixed term', () => {
    expect(getConfidentialityText(BASE)).toBe('3 year(s) from Effective Date');
  });

  it('returns perpetual text', () => {
    const v = { ...BASE, termOfConfidentiality: { type: 'perpetual' as const } };
    expect(getConfidentialityText(v)).toBe('in perpetuity');
  });
});

describe('getFieldValues', () => {
  it('returns all six field values', () => {
    const result = getFieldValues(BASE);
    expect(result['Purpose']).toBe(BASE.purpose);
    expect(result['Effective Date']).toBe('2025-01-01');
    expect(result['MNDA Term']).toBe('2 year(s) from Effective Date');
    expect(result['Term of Confidentiality']).toBe('3 year(s) from Effective Date');
    expect(result['Governing Law']).toBe('Delaware');
    expect(result['Jurisdiction']).toBe('courts located in Wilmington, DE');
  });
});

describe('assembleCoverPage', () => {
  it('includes the purpose text', () => {
    expect(assembleCoverPage(BASE)).toContain('Evaluating a potential partnership.');
  });

  it('includes the effective date', () => {
    expect(assembleCoverPage(BASE)).toContain('2025-01-01');
  });

  it('marks fixed MNDA term with [x]', () => {
    expect(assembleCoverPage(BASE)).toContain('[x] Expires 2 year(s)');
  });

  it('marks at-will MNDA term with [x]', () => {
    const v = { ...BASE, mndaTerm: { type: 'atWill' as const } };
    const result = assembleCoverPage(v);
    expect(result).toContain('[x] Continues until terminated');
    expect(result).toContain('[ ] Expires');
  });

  it('marks fixed confidentiality term with [x]', () => {
    expect(assembleCoverPage(BASE)).toContain('[x] 3 year(s) from Effective Date');
  });

  it('marks perpetual confidentiality with [x]', () => {
    const v = { ...BASE, termOfConfidentiality: { type: 'perpetual' as const } };
    const result = assembleCoverPage(v);
    expect(result).toContain('[x] In perpetuity');
    expect(result).toContain('[ ] [N] year(s)');
  });

  it('includes governing law', () => {
    expect(assembleCoverPage(BASE)).toContain('Governing Law: Delaware');
  });

  it('includes jurisdiction', () => {
    expect(assembleCoverPage(BASE)).toContain('courts located in Wilmington, DE');
  });

  it('shows None when modifications is empty', () => {
    expect(assembleCoverPage(BASE)).toContain('\nNone\n');
  });

  it('shows provided modifications text', () => {
    const v = { ...BASE, modifications: 'Clause 3 amended.' };
    expect(assembleCoverPage(v)).toContain('Clause 3 amended.');
  });

  it('includes party 1 company name', () => {
    expect(assembleCoverPage(BASE)).toContain('Acme Corp');
  });

  it('includes party 2 signatory name', () => {
    expect(assembleCoverPage(BASE)).toContain('Bob Jones');
  });

  it('includes party signature dates', () => {
    expect(assembleCoverPage(BASE)).toContain('2025-01-02');
  });
});

describe('assembleStandardTerms - preview mode', () => {
  it('replaces Purpose span with a mark chip', () => {
    const result = assembleStandardTerms(BASE, true);
    expect(result).toContain('<mark class="nda-chip">Evaluating a potential partnership.</mark>');
    expect(result).not.toContain('<span class="coverpage_link">Purpose</span>');
  });

  it('replaces Effective Date span with a mark chip', () => {
    const result = assembleStandardTerms(BASE, true);
    expect(result).toContain('<mark class="nda-chip">2025-01-01</mark>');
  });

  it('replaces MNDA Term span', () => {
    const result = assembleStandardTerms(BASE, true);
    expect(result).toContain('<mark class="nda-chip">2 year(s) from Effective Date</mark>');
  });

  it('replaces Term of Confidentiality span', () => {
    const result = assembleStandardTerms(BASE, true);
    expect(result).toContain('<mark class="nda-chip">3 year(s) from Effective Date</mark>');
  });

  it('replaces Governing Law span', () => {
    const result = assembleStandardTerms(BASE, true);
    expect(result).toContain('<mark class="nda-chip">Delaware</mark>');
  });

  it('replaces Jurisdiction span', () => {
    const result = assembleStandardTerms(BASE, true);
    expect(result).toContain('<mark class="nda-chip">courts located in Wilmington, DE</mark>');
  });
});

describe('assembleStandardTerms - download mode', () => {
  it('replaces spans with plain text values (no mark tags)', () => {
    const result = assembleStandardTerms(BASE, false);
    expect(result).not.toContain('<mark');
    expect(result).not.toContain('<span class="coverpage_link">');
    expect(result).toContain('Evaluating a potential partnership.');
    expect(result).toContain('Delaware');
  });
});

describe('assembleFullDocument', () => {
  it('contains both Cover Page and Standard Terms headings', () => {
    const result = assembleFullDocument(BASE);
    expect(result).toContain('# Mutual Non-Disclosure Agreement');
    expect(result).toContain('# Standard Terms');
  });

  it('separates sections with a divider', () => {
    const result = assembleFullDocument(BASE);
    expect(result).toContain('---');
  });

  it('does not contain any coverpage_link spans in the download output', () => {
    const result = assembleFullDocument(BASE);
    expect(result).not.toContain('<span class="coverpage_link">');
  });
});

describe('STANDARD_TERMS_RAW', () => {
  it('contains all 11 clause headings', () => {
    expect(STANDARD_TERMS_RAW).toContain('1. **Introduction**');
    expect(STANDARD_TERMS_RAW).toContain('11. **General**');
  });

  it('contains coverpage_link spans for all 6 fields', () => {
    expect(STANDARD_TERMS_RAW).toContain('<span class="coverpage_link">Purpose</span>');
    expect(STANDARD_TERMS_RAW).toContain('<span class="coverpage_link">Effective Date</span>');
    expect(STANDARD_TERMS_RAW).toContain('<span class="coverpage_link">MNDA Term</span>');
    expect(STANDARD_TERMS_RAW).toContain('<span class="coverpage_link">Term of Confidentiality</span>');
    expect(STANDARD_TERMS_RAW).toContain('<span class="coverpage_link">Governing Law</span>');
    expect(STANDARD_TERMS_RAW).toContain('<span class="coverpage_link">Jurisdiction</span>');
  });
});
