import './globals.css';
import Navbar from '@/components/Navbar';
import { UserProvider } from '@/components/UserContext';

export const metadata = {
  title: "Stan Wang's Website",
  description: 'Personal website of Stan Wang - NTU EE Master Student',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen">
        <UserProvider>
          <Navbar />
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
