import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mutual NDA Generator | Prelegal',
  description: 'Generate a Mutual Non-Disclosure Agreement using the CommonPaper standard template.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
