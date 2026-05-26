'use client';

interface Props {
  onEdit: () => void;
  onDownload: () => void;
}

export default function ActionBar({ onEdit, onDownload }: Props) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Edit
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Download .md
        </button>
      </div>
    </div>
  );
}
