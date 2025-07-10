import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Welcome" />
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <img
                    className="mx-auto h-16 w-auto"
                    src="/logo.png" // Ganti dengan path logo Anda
                    alt="Company Logo"
                />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Selamat Datang di Sistem Monitoring
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Solusi lengkap untuk monitoring data sensor secara real-time
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Silahkan login untuk mengakses dashboard monitoring
                            </p>
                        </div>

                        <div>
                            <Link
                                href="/login"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Login ke Sistem
                            </Link>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Belum punya akun?{' '}
                                <Link
                                    href="/register"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Daftar disini
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                    &copy; {new Date().getFullYear()} Monitoring App. All rights reserved.
                </p>
            </footer>
        </div>
    );
}