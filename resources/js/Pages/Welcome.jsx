import { Head, Link } from '@inertiajs/react';
import { ArrowRightIcon, UserPlusIcon } from '@heroicons/react/24/outline'; // Contoh ikon

export default function Welcome() {
    return (
        <>
            <Head title="Selamat Datang" />
            <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-600 via-indigo-700 to-purple-800 selection:bg-indigo-500 selection:text-white overflow-hidden">
                {/* Efek latar belakang geometris (opsional, bisa dikomplekskan atau dihilangkan) */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="polka-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle fill="#FFF" cx="20" cy="20" r="2" />
                            </pattern>
                        </defs>
                        <rect x="0" y="0" width="100%" height="100%" fill="url(#polka-dots)" />
                    </svg>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-3xl px-6 py-12 text-center text-white">
                    <h1 className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl drop-shadow-lg">
                        Sistem Monitoring Cerdas
                    </h1>
                    <p className="mb-10 text-lg sm:text-xl md:text-2xl text-indigo-100 max-w-xl drop-shadow-md">
                        Pantau semua data sensor Anda secara real-time dengan antarmuka yang intuitif dan analitik canggih.
                    </p>

                    <div className="w-full max-w-md p-8 space-y-6 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl">
                        <div>
                            <p className="mb-6 text-indigo-50">
                                Siap untuk memulai? Akses dashboard Anda sekarang.
                            </p>
                            <Link
                                href={route('login')} // Pastikan route 'login' sudah terdefinisi
                                className="group relative flex items-center justify-center w-full px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105"
                            >
                                Login ke Sistem
                                <ArrowRightIcon className="w-5 h-5 ml-3 transition-transform duration-300 group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-indigo-300/30" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 text-indigo-100 bg-transparent">
                                    Atau
                                </span>
                            </div>
                        </div>

                        <div>
                            <Link
                                href={route('register')} // Pastikan route 'register' sudah terdefinisi
                                className="group relative flex items-center justify-center w-full px-8 py-3 text-md font-medium text-indigo-600 bg-white rounded-lg shadow-md hover:bg-indigo-50 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105"
                            >
                                <UserPlusIcon className="w-5 h-5 mr-3 text-indigo-500" />
                                Belum Punya Akun? Daftar
                            </Link>
                        </div>
                    </div>
                </div>

                <footer className="absolute bottom-0 w-full py-6 text-center z-10">
                    <p className="text-sm text-indigo-200/70">
                        &copy; {new Date().getFullYear()} Monitoring App Pro. All rights reserved.
                    </p>
                </footer>
            </div>
        </>
    );
}