import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dog Help Map | แผนที่ช่วยหมา',
  description: 'Crowdsourced stray dog help map — report and track stray dogs in your area',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
