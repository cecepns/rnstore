import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../public/PublicNavbar';
import PublicFooter from '../public/PublicFooter';
import { useAOS } from '../../hooks/useAOS';

const PublicLayout = () => {
  // Initialize AOS for public pages only
  useAOS();

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;