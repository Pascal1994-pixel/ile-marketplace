import './globals.css';

export const metadata = {
  title: 'Ilẹ̀ — Find and list land across Nigeria',
  description: 'Buy and sell land and property across Nigeria with clear, seller-declared documentation.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
