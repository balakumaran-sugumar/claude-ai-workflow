'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NdaFormValues } from '@/types/nda';
import {
  assembleCoverPage,
  assembleStandardTerms,
  assembleFullDocument,
} from '@/lib/assembleDocument';
import { downloadMarkdown, buildDownloadFilename } from '@/lib/downloadMarkdown';
import CoverpageSection from '@/components/CoverpageSection';
import StandardTerms from '@/components/StandardTerms';
import ActionBar from '@/components/ActionBar';
import { SESSION_KEY } from '@/lib/constants';

function isValidNdaShape(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') return false;
  const v = obj as Record<string, unknown>;
  return (
    typeof v.purpose === 'string' &&
    typeof v.effectiveDate === 'string' &&
    typeof v.governingLaw === 'string' &&
    typeof v.jurisdiction === 'string' &&
    v.mndaTerm != null && typeof v.mndaTerm === 'object' &&
    v.termOfConfidentiality != null && typeof v.termOfConfidentiality === 'object' &&
    v.party1 != null && typeof v.party1 === 'object' &&
    v.party2 != null && typeof v.party2 === 'object'
  );
}

export default function PreviewPage() {
  const router = useRouter();
  const [formValues, setFormValues] = useState<NdaFormValues | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isValidNdaShape(parsed)) {
          setFormValues(parsed as NdaFormValues);
        }
      }
    } catch {
      // malformed JSON — leave formValues null
    }
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!formValues) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-gray-600">No form data found. Please start a new NDA.</p>
        <button
          onClick={() => router.push('/nda/new')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Start NDA
        </button>
      </div>
    );
  }

  const coverpageMarkdown = assembleCoverPage(formValues);
  const standardTermsMarkdown = assembleStandardTerms(formValues, true);

  const handleEdit = () => router.push('/nda/new');

  const handleDownload = () => {
    const content = assembleFullDocument(formValues);
    const filename = buildDownloadFilename(formValues.party1.company, formValues.party2.company);
    downloadMarkdown(content, filename);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ActionBar onEdit={handleEdit} onDownload={handleDownload} />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">NDA Preview</h1>

        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Section 1 — Cover Page
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <CoverpageSection markdown={coverpageMarkdown} />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Section 2 — Standard Terms
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <StandardTerms markdown={standardTermsMarkdown} />
          </div>
        </section>
      </div>
    </div>
  );
}
