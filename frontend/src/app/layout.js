import "./globals.css";
import SiteShell from "@/components/SiteShell";

export const metadata = {
  title: "Bhavya Fabrics",
  description: "Bhavya Fabrics is a leading textile company specializing in high-quality fabrics and textiles for fashion, home decor, and industrial applications. Our commitment to excellence and innovation has made us a trusted name in the industry.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}