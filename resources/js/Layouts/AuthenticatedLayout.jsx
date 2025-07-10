import { Head, Link } from '@inertiajs/react';

export default function AuthenticatedLayout({ user, header, children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Sidebar */}
                        <div className="flex items-center space-x-4">
                            <Link 
                                href={route(user.roles.includes('admin') ? 'admin.dashboard' : 'user.dashboard')} 
                                className="text-gray-700 hover:text-gray-900"
                            >
                                Dashboard
                            </Link>
                        </div>

                        {/* Logout Button */}
                        <div className="flex items-center">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-gray-700 hover:text-red-600 flex items-center space-x-2"
                            >
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-5 w-5" 
                                    viewBox="0 0 20 20" 
                                    fill="currentColor"
                                >
                                    <path 
                                        fillRule="evenodd" 
                                        d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" 
                                        clipRule="evenodd" 
                                    />
                                </svg>
                                <span>Logout</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-6 px-4 sm:px-6 lg:px-8">
                {header && (
                    <div className="mb-4">
                        {header}
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
