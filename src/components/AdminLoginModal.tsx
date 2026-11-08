import React, { useState } from 'react';
import { 
  Lock, KeyRound, Eye, EyeOff, ShieldCheck, CheckCircle2, 
  AlertCircle, ArrowRight, Sparkles, Key
} from 'lucide-react';
import { VIRAGRAPHY_LOGO } from '../data/initialData';

interface AdminLoginModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ADMIN_DEFAULT_PASSWORDS = ['vira1403', 'admin123', 'admin'];

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberLogin, setRememberLogin] = useState(true);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passChangedNotice, setPassChangedNotice] = useState(false);

  if (!isOpen) return null;

  const getCustomPassword = () => {
    return localStorage.getItem('viragraphy_admin_custom_password');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const inputPass = password.trim();
    const customPass = getCustomPassword();

    const isValid =
      (customPass && inputPass === customPass) ||
      ADMIN_DEFAULT_PASSWORDS.includes(inputPass);

    if (isValid) {
      if (rememberLogin) {
        localStorage.setItem('viragraphy_admin_auth', 'true');
      } else {
        sessionStorage.setItem('viragraphy_admin_auth', 'true');
      }
      setPassword('');
      onSuccess();
    } else {
      setErrorMessage('رمز عبور وارد شده اشتباه است. لطفاً مجدداً بررسی فرمایید.');
    }
  };

  const handleQuickFill = (pass: string) => {
    setPassword(pass);
    setErrorMessage('');
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setErrorMessage('رمز عبور جدید باید حداقل ۴ کاراکتر باشد.');
      return;
    }
    localStorage.setItem('viragraphy_admin_custom_password', newPassword.trim());
    setPassChangedNotice(true);
    setPassword(newPassword.trim());
    setIsChangingPass(false);
    setTimeout(() => setPassChangedNotice(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-right">
      <div 
        className="relative w-full max-w-md bg-[#110c24] border border-violet-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-violet-950/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand & Security Header */}
        <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-violet-900/30">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white p-1 border-2 border-violet-500 shadow-xl shadow-violet-600/30">
              <img
                src={VIRAGRAPHY_LOGO}
                alt="Viragraphy"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="absolute -bottom-2 -left-2 w-7 h-7 rounded-xl bg-violet-600 border border-white flex items-center justify-center text-white shadow-md">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
              <span>ورود به پنل مدیریت ویراگرافیک</span>
            </h2>
            <p className="text-xs text-violet-200/80 mt-1 max-w-xs leading-relaxed">
              جهت دسترسی به بررسی سفارش‌ها، تایید صورتحساب‌ها و آمارهای درآمد، لطفاً رمز عبور مدیریت را وارد فرمایید.
            </p>
          </div>
        </div>

        {/* Form Body */}
        {!isChangingPass ? (
          <form onSubmit={handleLogin} className="space-y-4 pt-5 text-xs">
            {passChangedNotice && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>رمز عبور مدیریت با موفقیت تغییر کرد.</span>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span>رمز عبور مدیریت:</span>
                <button
                  type="button"
                  onClick={() => setIsChangingPass(true)}
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-normal underline"
                >
                  تغییر رمز عبور
                </button>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  autoFocus
                  dir="ltr"
                  placeholder="رمز عبور ادمین..."
                  className="w-full bg-[#0c081c] border border-violet-800/50 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder-slate-500 focus:outline-hidden focus:border-violet-500 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3.5 text-slate-400 hover:text-white transition"
                  title={showPassword ? 'مخفی کردن' : 'نمایش رمز'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-1.5 text-rose-400 text-[11px] mt-2 font-medium bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Quick Fill Helper for easy testing */}
            <div className="bg-[#181136]/60 border border-violet-900/40 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-violet-400" />
                  <span>رمزهای عبور پیش‌فرض فعال:</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('vira1403')}
                  className="flex-1 py-1.5 px-2 bg-[#0c081c] hover:bg-violet-900/40 text-violet-300 font-mono rounded-lg border border-violet-700/40 text-center transition text-xs"
                >
                  vira1403
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin123')}
                  className="flex-1 py-1.5 px-2 bg-[#0c081c] hover:bg-violet-900/40 text-violet-300 font-mono rounded-lg border border-violet-700/40 text-center transition text-xs"
                >
                  admin123
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberLogin}
                  onChange={(e) => setRememberLogin(e.target.checked)}
                  className="w-4 h-4 accent-violet-600 rounded"
                />
                <span>به خاطر سپردن ورود در این مرورگر</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ورود به پنل مدیریت</span>
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="py-3 px-4 rounded-xl bg-[#1a1435] hover:bg-[#231b46] text-slate-300 hover:text-white font-medium text-xs transition cursor-pointer"
              >
                انصراف
              </button>
            </div>
          </form>
        ) : (
          /* Change Password Screen */
          <form onSubmit={handleSaveNewPassword} className="space-y-4 pt-5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-violet-900/40">
              <span className="font-bold text-white text-sm">تغییر رمز عبور مدیریت:</span>
              <button
                type="button"
                onClick={() => setIsChangingPass(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                بازگشت به ورود
              </button>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                رمز عبور جدید را وارد فرمایید:
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                dir="ltr"
                placeholder="حداقل ۴ کاراکتر..."
                className="w-full bg-[#0c081c] border border-violet-800/50 rounded-xl px-4 py-2.5 text-white font-mono text-xs placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition"
              >
                ذخیره رمز عبور جدید
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPass(false)}
                className="py-2.5 px-4 rounded-xl bg-[#1a1435] text-slate-300 text-xs"
              >
                انصراف
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
