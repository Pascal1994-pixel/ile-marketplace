import './globals.css';

export const metadata = {
  title: 'TrustLand Nigeria | Verified Land & Property Listings Nationwide',
  description: "Nigeria's document-first property marketplace. Browse verified land, homes and commercial listings by state — see exactly what paperwork every seller has before you pay a kobo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
