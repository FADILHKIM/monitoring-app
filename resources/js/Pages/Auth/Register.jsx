import { useState } from 'react';
import { router } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link } from '@inertiajs/react';
import { UserIcon, EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

export default function Register() {
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({}); // Clear previous errors

        router.post('/register', data, {
            onFinish: () => setProcessing(false),
            onError: (errors) => {
                setErrors(errors);
                console.error('Registration errors:', errors);
            },
            onSuccess: () => {
                console.log('Registration successful');
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Daftar Akun Baru" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                        <span className="text-3xl">⚡</span>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Buat Akun Baru
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Bergabung dengan sistem monitoring kami
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl rounded-2xl border border-gray-200 dark:border-slate-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <InputLabel 
                                htmlFor="name" 
                                value="Nama Lengkap" 
                                className="text-gray-700 dark:text-gray-300 font-medium" 
                            />
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-lg transition duration-200"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                            </div>
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel 
                                htmlFor="email" 
                                value="Alamat Email" 
                                className="text-gray-700 dark:text-gray-300 font-medium" 
                            />
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-lg transition duration-200"
                                    autoComplete="username"
                                    onChange={(e) => setData({ ...data, email: e.target.value })}
                                    placeholder="masukkan@email.anda"
                                    required
                                />
                            </div>
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel 
                                htmlFor="password" 
                                value="Password" 
                                className="text-gray-700 dark:text-gray-300 font-medium" 
                            />
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-lg transition duration-200"
                                    autoComplete="new-password"
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    placeholder="minimal 8 karakter"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Konfirmasi Password"
                                className="text-gray-700 dark:text-gray-300 font-medium"
                            />
                            <div className="mt-2 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <TextInput
                                    id="password_confirmation"
                                    type={showPasswordConfirmation ? 'text' : 'password'}
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-lg transition duration-200"
                                    autoComplete="new-password"
                                    onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                                    placeholder="ulangi password anda"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                >
                                    {showPasswordConfirmation ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        <div>
                            <PrimaryButton 
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                                disabled={processing}
                            >
                                {processing ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </div>
                                ) : (
                                    'Daftar Sekarang'
                                )}
                            </PrimaryButton>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-slate-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                                    Sudah punya akun?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link 
                                href={route('login')} 
                                className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm bg-white dark:bg-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                            >
                                Masuk ke Akun Anda
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            
            <footer className="text-center py-6 mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} Monitoring System Pro. Semua hak cipta dilindungi.
                </p>
            </footer>
        </div>
    );
}
