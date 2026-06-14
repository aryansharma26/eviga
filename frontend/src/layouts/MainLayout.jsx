import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isAuth = ['/login', '/register', '/forgot-password', '/reset-password'].some((p) => location.pathname.startsWith(p));

  if (isAdmin || isAuth) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-[72px] lg:pt-[120px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
