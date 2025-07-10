import React, { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import UserLayout from './UserLayout';
import HeaderGlobal from '../../Components/HeaderGlobal';
import FooterGlobal from '../../Components/FooterGlobal';
import { usePreferences } from '../../Contexts/PreferencesContext';
import { 
  KeyIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function Settings() {
  const { flash } = usePage().props;
  const { getText } = usePreferences();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { data, setData, post, processing, errors, reset } = useForm({
    oldPassword: '',
    newPassword: '',
    newPassword_confirmation: '',
  });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    post('/user/settings/password', {
      onSuccess: () => {
        reset();
      },
      preserveScroll: true
    });
  };

  return (
    <UserLayout>
      <div className="mb-8">
        <HeaderGlobal
          title={getText('settings.title')}
          subtitle={getText('settings.subtitle')}
          online={true}
        />
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Password Change Card */}
        <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getText('settings.password_security')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getText('settings.password_description')}
              </p>
            </div>
          </div>

          {/* Security Requirements */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                  {getText('settings.password_requirements')}
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                  <li>• {getText('settings.password_req_1')}</li>
                  <li>• {getText('settings.password_req_2')}</li>
                  <li>• {getText('settings.password_req_3')}</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {getText('settings.old_password')}
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={data.oldPassword}
                  onChange={e => setData('oldPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showOldPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.oldPassword && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  {errors.oldPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {getText('settings.new_password')}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={data.newPassword}
                  onChange={e => setData('newPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {getText('settings.confirm_password')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={data.newPassword_confirmation}
                  onChange={e => setData('newPassword_confirmation', e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword_confirmation && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  {errors.newPassword_confirmation}
                </p>
              )}
            </div>

            {/* Success/Error Messages */}
            {flash?.success && (
              <div className="p-4 rounded-xl flex items-center space-x-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  {flash.success}
                </p>
              </div>
            )}

            {flash?.error && (
              <div className="p-4 rounded-xl flex items-center space-x-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  {flash.error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={processing}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  processing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
                } text-white`}
              >
                <KeyIcon className="w-5 h-5" />
                <span>{processing ? getText('settings.saving') : getText('settings.save_changes')}</span>
              </button>
            </div>
          </form>
        </div>
        
        <FooterGlobal />
      </div>
    </UserLayout>
  );
}
