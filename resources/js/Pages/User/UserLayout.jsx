import React from 'react';
import Sidebar from '../Tema/Sidebar';

export default function UserLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-gray-50 text-lg selection:bg-blue-500 selection:text-white">
      <Sidebar className="bg-white dark:bg-slate-800 shadow-md" />
      <main className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
