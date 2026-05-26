'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-6">
          <span className="inline-block text-5xl">📄</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Mutual NDA Generator</h1>
        <p className="text-lg text-gray-600 mb-8">
          Generate a ready-to-sign Mutual Non-Disclosure Agreement in minutes. Fill in your deal
          details, preview the assembled document, and download a completed markdown file — powered
          by the CommonPaper standard template under CC BY 4.0.
        </p>
        <button
          onClick={() => router.push('/nda/new')}
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
        >
          Create NDA →
        </button>
        <p className="mt-6 text-sm text-gray-400">
          No account required · 4 simple steps · Free to use
        </p>
      </div>
    </main>
  );
}
