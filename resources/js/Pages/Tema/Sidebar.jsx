import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
  ChevronDoubleLeftIcon, ChevronDoubleRightIcon, MoonIcon, SunIcon,
  Cog6ToothIcon, ClipboardDocumentListIcon, BellIcon, ClockIcon, AdjustmentsHorizontalIcon,
  ArrowRightOnRectangleIcon, HomeIcon, TvIcon, ChartBarIcon, DocumentTextIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';
import { ArrowLeftCircleIcon, ArrowRightCircleIcon } from '@heroicons/react/24/solid';

const SidebarItem = ({ icon: Icon, label, href, isOpen, active, isSpecial = false }) => {
  return (
    <Link
      href={href}
      className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative overflow-hidden ${
        isOpen ? '' : 'justify-center'
      } ${
        active 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
          : isSpecial
          ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900 dark:hover:to-blue-800 hover:shadow-md hover:transform hover:scale-105 border border-blue-200 dark:border-blue-700'
          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md hover:transform hover:scale-105'
      }`}
      title={label}
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-white/20' 
          : isSpecial
          ? 'bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200 dark:group-hover:bg-blue-800'
          : 'group-hover:bg-blue-100 dark:group-hover:bg-gray-600'
      }`}>
        {Icon && <Icon className={`w-5 h-5 transition-transform duration-200 ${
          active 
            ? 'text-white' 
            : isSpecial 
            ? 'text-blue-600 dark:text-blue-400'
            : ''
        } group-hover:scale-110`} />}
      </div>
      {isOpen && (
        <span className="ml-3 text-sm font-medium tracking-wide transition-all duration-200">
          {label}
        </span>
      )}
      {active && isOpen && (
        <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
      )}
    </Link>
  );
};

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const { ziggy } = usePage().props;
  const currentUrl = ziggy?.location || window.location.pathname;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    if (window.innerWidth < 768 && isOpen) {
      setIsOpen(false);
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  const handleLogout = () => {
    router.post('/logout');
  };

  return (
    <div className={`transition-all duration-300 h-screen flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700 ${isOpen ? 'w-72' : 'w-20'}`}>
      {/* Header dengan tombol toggle */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        {isOpen && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <TvIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
              MoniGrid
            </h1>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
          aria-label={isOpen ? 'Minimize Sidebar' : 'Expand Sidebar'}
        >
          {isOpen ? <ArrowLeftCircleIcon className="w-6 h-6" /> : <ArrowRightCircleIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Logo ketika collapsed */}
      {!isOpen && (
        <div className="flex items-center justify-center py-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <TvIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      )}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {/* Main Navigation - Core Features */}
        <SidebarItem icon={HomeIcon} label="Dashboard" href="/dashboard" isOpen={isOpen} active={currentUrl === '/dashboard'} />
        <SidebarItem icon={ChartBarIcon} label="Grafik" href="/grafik" isOpen={isOpen} active={currentUrl === '/grafik'} />
        
        {/* Divider - Monitoring & Data */}
        <div className="py-2">
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        
        <SidebarItem icon={DocumentTextIcon} label="Log" href="/log" isOpen={isOpen} active={currentUrl === '/log'} />
        <SidebarItem icon={TvIcon} label="Status" href="/status" isOpen={isOpen} active={currentUrl === '/status'} />
        <SidebarItem icon={ClockIcon} label="Riwayat Aktivitas" href="/riwayat-aktivitas" isOpen={isOpen} active={currentUrl === '/riwayat-aktivitas'} />
        
        {/* Divider - User Settings */}
        <div className="py-2">
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        
        <SidebarItem icon={AdjustmentsHorizontalIcon} label="Preferensi" href="/preferensi" isOpen={isOpen} active={currentUrl === '/preferensi'} />
        <SidebarItem icon={Cog6ToothIcon} label="Settings" href="/settings" isOpen={isOpen} active={currentUrl === '/settings'} />
        
        {/* Divider - Documentation */}
        <div className="py-2">
          <div className="border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        
        <SidebarItem icon={InformationCircleIcon} label="Informasi Sistem" href="/info" isOpen={isOpen} active={currentUrl === '/info'} isSpecial={true} />
      </nav>
      <div className="px-2 py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleDarkMode}
          className="flex items-center w-full text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 rounded-lg px-2 py-2 transition-colors group"
          title={darkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
        >
          {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          {isOpen && <span className="ml-2">{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 rounded-lg px-2 py-2 transition-colors group"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          {isOpen && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;