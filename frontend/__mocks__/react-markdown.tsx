import React from 'react';

interface Props {
  children: string;
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
  components?: Record<string, unknown>;
}

const ReactMarkdown: React.FC<Props> = ({ children }) => (
  <div data-testid="react-markdown">{children}</div>
);

export default ReactMarkdown;
