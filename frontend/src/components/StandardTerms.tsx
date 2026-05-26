'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface Props {
  markdown: string;
}

export default function StandardTerms({ markdown }: Props) {
  return (
    <div data-testid="standard-terms" className="prose prose-sm max-w-none">
      <style>{`
        mark.nda-chip {
          background-color: #fef9c3;
          color: #854d0e;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 500;
          font-style: normal;
        }
      `}</style>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
