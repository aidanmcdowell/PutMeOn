
import { ReactNode } from 'react';
import MainNav from './MainNav';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-brand-black">
      <MainNav />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;
