'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NdaFormValues, PartyDetails } from '@/types/nda';
import ProgressBar from '@/components/ProgressBar';
import FormField from '@/components/FormField';
import RadioOption from '@/components/RadioOption';
import { SESSION_KEY } from '@/lib/constants';

const TOTAL_STEPS = 4;

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_PARTY: PartyDetails = {
  company: '',
  signatoryName: '',
  title: '',
  noticeAddress: '',
  signatureDate: todayStr(),
};

const DEFAULT_VALUES: NdaFormValues = {
  purpose: 'Evaluating whether to enter into a business relationship with the other party.',
  effectiveDate: todayStr(),
  mndaTerm: { type: 'fixed', years: 1 },
  termOfConfidentiality: { type: 'fixed', years: 1 },
  governingLaw: '',
  jurisdiction: '',
  modifications: '',
  party1: { ...DEFAULT_PARTY },
  party2: { ...DEFAULT_PARTY },
};

type Errors = Record<string, string>;

export function validateStep(step: number, values: NdaFormValues): Errors {
  const errors: Errors = {};

  if (step === 1) {
    if (!values.purpose.trim() || values.purpose.trim().length < 10) {
      errors.purpose = 'Purpose is required and must be at least 10 characters.';
    }
    if (!values.effectiveDate) {
      errors.effectiveDate = 'Effective Date is required.';
    }
  }

  if (step === 2) {
    if (values.mndaTerm.type === 'fixed' && values.mndaTerm.years < 1) {
      errors.mndaYears = 'MNDA term must be at least 1 year.';
    }
    if (values.termOfConfidentiality.type === 'fixed' && values.termOfConfidentiality.years < 1) {
      errors.confidYears = 'Confidentiality term must be at least 1 year.';
    }
  }

  if (step === 3) {
    if (!values.governingLaw.trim()) {
      errors.governingLaw = 'Governing Law is required.';
    }
    if (!values.jurisdiction.trim()) {
      errors.jurisdiction = 'Jurisdiction is required.';
    }
  }

  if (step === 4) {
    const fields: (keyof PartyDetails)[] = [
      'company',
      'signatoryName',
      'title',
      'noticeAddress',
      'signatureDate',
    ];
    const labels: Record<keyof PartyDetails, string> = {
      company: 'Company',
      signatoryName: 'Signatory Name',
      title: 'Title',
      noticeAddress: 'Notice Address',
      signatureDate: 'Signature Date',
    };
    fields.forEach((field) => {
      if (!values.party1[field].trim()) {
        errors[`party1.${field}`] = `Party 1 ${labels[field]} is required.`;
      }
      if (!values.party2[field].trim()) {
        errors[`party2.${field}`] = `Party 2 ${labels[field]} is required.`;
      }
    });
  }

  return errors;
}

export default function WizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState<NdaFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<Errors>({});

  const handleContinue = () => {
    const stepErrors = validateStep(currentStep, formValues);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    if (currentStep === TOTAL_STEPS) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(formValues));
      router.push('/nda/preview');
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => s - 1);
  };

  const update = <K extends keyof NdaFormValues>(field: K, value: NdaFormValues[K]) =>
    setFormValues((prev) => ({ ...prev, [field]: value }));

  const updateParty = (party: 'party1' | 'party2', field: keyof PartyDetails, value: string) =>
    setFormValues((prev) => ({ ...prev, [party]: { ...prev[party], [field]: value } }));

  const mndaYears = formValues.mndaTerm.type === 'fixed' ? formValues.mndaTerm.years : 1;

  const confidYears =
    formValues.termOfConfidentiality.type === 'fixed' ? formValues.termOfConfidentiality.years : 1;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Mutual NDA</h1>
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Step 1: Purpose & Effective Date */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Purpose &amp; Effective Date</h2>
              <FormField
                label="Purpose"
                htmlFor="purpose"
                error={errors.purpose}
                helperText="Describe how both parties are allowed to use each other's confidential information."
              >
                <textarea
                  id="purpose"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  value={formValues.purpose}
                  onChange={(e) => update('purpose', e.target.value)}
                  aria-invalid={!!errors.purpose}
                />
              </FormField>
              <FormField label="Effective Date" htmlFor="effectiveDate" error={errors.effectiveDate}>
                <input
                  id="effectiveDate"
                  type="date"
                  className="border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formValues.effectiveDate}
                  onChange={(e) => update('effectiveDate', e.target.value)}
                  aria-invalid={!!errors.effectiveDate}
                />
              </FormField>
            </div>
          )}

          {/* Step 2: Terms */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Agreement Terms</h2>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">MNDA Term</p>
                <RadioOption
                  name="mndaTerm"
                  value="fixed"
                  checked={formValues.mndaTerm.type === 'fixed'}
                  onChange={() => update('mndaTerm', { type: 'fixed', years: mndaYears })}
                  label="Expires"
                >
                  {formValues.mndaTerm.type === 'fixed' && (
                    <span className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        className="w-16 border border-gray-300 rounded p-1 text-sm"
                        value={mndaYears}
                        onChange={(e) => {
                          const parsed = parseInt(e.target.value, 10);
                          if (!isNaN(parsed) && parsed > 0)
                            update('mndaTerm', { type: 'fixed', years: parsed });
                        }}
                        aria-label="MNDA term years"
                      />
                      <span>year(s) from Effective Date</span>
                    </span>
                  )}
                </RadioOption>
                <RadioOption
                  name="mndaTerm"
                  value="atWill"
                  checked={formValues.mndaTerm.type === 'atWill'}
                  onChange={() => update('mndaTerm', { type: 'atWill' })}
                  label="Continues until terminated by either party in writing"
                />
              </div>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Term of Confidentiality</p>
                <RadioOption
                  name="confidentiality"
                  value="fixed"
                  checked={formValues.termOfConfidentiality.type === 'fixed'}
                  onChange={() =>
                    update('termOfConfidentiality', { type: 'fixed', years: confidYears })
                  }
                  label="Fixed:"
                >
                  {formValues.termOfConfidentiality.type === 'fixed' && (
                    <span className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={99}
                        className="w-16 border border-gray-300 rounded p-1 text-sm"
                        value={confidYears}
                        onChange={(e) => {
                          const parsed = parseInt(e.target.value, 10);
                          if (!isNaN(parsed) && parsed > 0)
                            update('termOfConfidentiality', { type: 'fixed', years: parsed });
                        }}
                        aria-label="Confidentiality term years"
                      />
                      <span>year(s) from Effective Date</span>
                    </span>
                  )}
                </RadioOption>
                <RadioOption
                  name="confidentiality"
                  value="perpetual"
                  checked={formValues.termOfConfidentiality.type === 'perpetual'}
                  onChange={() => update('termOfConfidentiality', { type: 'perpetual' })}
                  label="In perpetuity"
                />
              </div>

              <p className="text-xs text-gray-500">
                The MNDA Term controls how long the agreement stays active. The Term of Confidentiality
                controls how long each party must keep information secret after the agreement ends.
              </p>
            </div>
          )}

          {/* Step 3: Governing Law */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Governing Law &amp; Jurisdiction</h2>
              <FormField
                label="Governing Law (State)"
                htmlFor="governingLaw"
                error={errors.governingLaw}
              >
                <input
                  id="governingLaw"
                  type="text"
                  placeholder="e.g. Delaware"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formValues.governingLaw}
                  onChange={(e) => update('governingLaw', e.target.value)}
                  aria-invalid={!!errors.governingLaw}
                />
              </FormField>
              <FormField label="Jurisdiction" htmlFor="jurisdiction" error={errors.jurisdiction}>
                <input
                  id="jurisdiction"
                  type="text"
                  placeholder="e.g. courts located in Wilmington, DE"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formValues.jurisdiction}
                  onChange={(e) => update('jurisdiction', e.target.value)}
                  aria-invalid={!!errors.jurisdiction}
                />
              </FormField>
              <FormField label="MNDA Modifications" htmlFor="modifications">
                <textarea
                  id="modifications"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="List any modifications to the standard terms, or leave blank if none."
                  value={formValues.modifications}
                  onChange={(e) => update('modifications', e.target.value)}
                />
              </FormField>
            </div>
          )}

          {/* Step 4: Party Details */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Party Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(['party1', 'party2'] as const).map((party, idx) => (
                  <div key={party}>
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Party {idx + 1}</h3>
                    {([
                        { field: 'company', label: 'Company', type: 'text' },
                        { field: 'signatoryName', label: 'Signatory Name', type: 'text' },
                        { field: 'title', label: 'Title', type: 'text' },
                        { field: 'noticeAddress', label: 'Notice Address', type: 'textarea' },
                        { field: 'signatureDate', label: 'Signature Date', type: 'date' },
                      ] satisfies { field: keyof PartyDetails; label: string; type: string }[]).map(({ field, label, type }) => (
                      <FormField
                        key={field}
                        label={label}
                        htmlFor={`${party}-${field}`}
                        error={errors[`${party}.${field}`]}
                      >
                        {type === 'textarea' ? (
                          <textarea
                            id={`${party}-${field}`}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={2}
                            value={formValues[party][field]}
                            onChange={(e) => updateParty(party, field, e.target.value)}
                            aria-invalid={!!errors[`${party}.${field}`]}
                          />
                        ) : (
                          <input
                            id={`${party}-${field}`}
                            type={type}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={formValues[party][field]}
                            onChange={(e) => updateParty(party, field, e.target.value)}
                            aria-invalid={!!errors[`${party}.${field}`]}
                          />
                        )}
                      </FormField>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentStep === TOTAL_STEPS ? 'Preview Document' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
