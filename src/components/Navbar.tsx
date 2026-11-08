import React from 'react';
import { 
  Plus, User, ShieldCheck, Send, Smartphone, Lock, UserPlus, 
  Layers, Palette, ClipboardList, Github, Download
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { UserProfile } from '../types';
import { VIRAGRAPHY_LOGO } from '../data/initialData';

interface NavbarProps {
  currentTab: 'orders' | 'portfolio' | 'admin' | 'telegram';
  onSelectTab: (tab: 'orders' | 'portfolio' | 'admin' | 'telegram') => void;
  onOpenNewOrder: () => void;
  currentUser: UserProfile;
  isCustomerRegistered?: boolean;
  onSwitchUser: () => void;
  onOpenCustomerAuth: () => void;
  viewMode: 'desktop' | 'mobile_pwa' | 'telegram_app';
  onToggleViewMode: (mode: 'desktop' | 'mobile_pwa' | 'telegram_app') => void;
  ordersCount: number;
  isAdminAuthenticated?: boolean;
  onOpenGitHubModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewOrder,
  currentUser,
  isCustomerRegistered = false,
  onOpenCustomerAuth,
  viewMode,
  onToggleViewMode,
  ordersCount,
  isAdminAuthenticated = false,
  onOpenGitHubModal,
}) => {
  return (
    <>
      {/* Top Mobile/Desktop Header */}
      <header className="sticky top-0 z-40 w-full bg-[#0d091e]/95 backdrop-blur-md border-b border-violet-900/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-6">
            {/* Zone 1: Brand wordmark & Logo */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => onSelectTab('orders')}
                className="flex items-center gap-2 sm:gap-2.5 text-right cursor-pointer group"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-violet-500/40 shadow-sm shadow-violet-500/20 bg-white p-0.5 group-hover:border-violet-400 transition-colors shrink-0">
                  <img
                    src={VIRAGRAPHY_LOGO}
                    alt="ویراگرافیک"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex flex-col text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">
                      ویراگرافیک
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-violet-400 font-mono">
                      Viragraphy
                    </span>
                  </div>
                  <span className="hidden sm:block text-[10px] text-violet-300/70 font-normal leading-none mt-0.5">
                    سامانه طراحی گرافیک و ربات تلگرام
                  </span>
                </div>
              </button>
            </div>

            {/* Zone 2: Desktop Navigation Links (hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <button
                onClick={() => onSelectTab('orders')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 ${
                  currentTab === 'orders' ? 'text-violet-400 border-b-2 border-violet-500 font-semibold' : ''
                }`}
              >
                پیگیری سفارش‌ها
                {ordersCount > 0 && (
                  <span className="mr-1.5 text-xs text-violet-300 font-mono">({ordersCount})</span>
                )}
              </button>

              <button
                onClick={() => onSelectTab('portfolio')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 ${
                  currentTab === 'portfolio' ? 'text-violet-400 border-b-2 border-violet-500 font-semibold' : ''
                }`}
              >
                کاتالوگ و نمونه‌کار
              </button>

              <button
                onClick={() => onSelectTab('telegram')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 flex items-center gap-1.5 ${
                  currentTab === 'telegram' ? 'text-violet-400 border-b-2 border-violet-500 font-semibold' : ''
                }`}
              >
                <Send className="w-3.5 h-3.5 text-violet-400" />
                <span>ربات تلگرام</span>
              </button>

              <button
                onClick={() => onSelectTab('admin')}
                className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 flex items-center gap-1.5 ${
                  currentTab === 'admin' ? 'text-violet-400 border-b-2 border-violet-500 font-semibold' : ''
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>پنل مدیریت</span>
                {!isAdminAuthenticated && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-500/40 px-1 py-0.5 rounded-md flex items-center gap-0.5" title="نیازمند رمز عبور مدیریت">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </button>
            </nav>

            {/* Zone 3: Actions (Auth + CTA) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* View Mode Simulator (desktop only) */}
              <div className="hidden lg:flex items-center bg-[#140e2b] border border-violet-900/40 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => onToggleViewMode('desktop')}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                    viewMode === 'desktop' ? 'bg-violet-600 text-white font-medium shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="نمای کامل وب‌سایت دسکتاپ"
                >
                  وب‌سایت
                </button>
                <button
                  onClick={() => onToggleViewMode('telegram_app')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap ${
                    viewMode === 'telegram_app' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="شبیه‌ساز مینی‌اپلیکیشن تلگرام (Telegram WebApp)"
                >
                  <Send className="w-3 h-3 text-violet-300" />
                  <span>مینی‌اپ تلگرام</span>
                </button>
                <button
                  onClick={() => onToggleViewMode('mobile_pwa')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap ${
                    viewMode === 'mobile_pwa' ? 'bg-violet-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="نمای وب‌اپ موبایل"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>موبایل</span>
                </button>
              </div>

              {/* PWA Install Button (desktop / tablet) */}
              <div className="hidden sm:block">
                <PWAInstallButton />
              </div>

              {/* GitHub & APK Modal Button */}
              {onOpenGitHubModal && (
                <button
                  type="button"
                  onClick={onOpenGitHubModal}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-violet-700/60 bg-[#160f33] hover:bg-violet-900/40 text-violet-200 text-xs font-semibold transition cursor-pointer shrink-0 shadow-xs active:scale-95"
                  title="اتصال به گیت‌هاب و خروجی APK برای گوگل پلی و بازار"
                >
                  <Github className="w-3.5 h-3.5 text-violet-400" />
                  <span className="hidden sm:inline">گیت‌هاب و APK</span>
                  <span className="sm:hidden text-[10px]">APK</span>
                </button>
              )}

              {/* Customer Registration / Profile Button */}
              <button
                onClick={onOpenCustomerAuth}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition cursor-pointer shrink-0 ${
                  isCustomerRegistered
                    ? 'border-emerald-600/40 bg-emerald-950/40 text-emerald-300 hover:border-emerald-500'
                    : 'border-amber-500/50 bg-amber-950/30 text-amber-300 hover:border-amber-400'
                }`}
                title={isCustomerRegistered ? `حساب: ${currentUser.name}` : 'ثبت‌نام الزامی مشتری پیش از ثبت سفارش'}
              >
                {isCustomerRegistered ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline font-medium">{currentUser.name}</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline font-medium">ثبت‌نام مشتری</span>
                  </>
                )}
              </button>

              {/* Primary Action Button: New Order */}
              <button
                onClick={onOpenNewOrder}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all whitespace-nowrap shrink-0 active:scale-95 cursor-pointer ${
                  isCustomerRegistered
                    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 shadow-violet-600/30'
                    : 'bg-gradient-to-r from-amber-600 to-violet-700 hover:from-amber-500 shadow-amber-600/20'
                }`}
                title={
                  isCustomerRegistered
                    ? 'ثبت سفارش جدید'
                    : 'ثبت سفارش انجام نمی‌گیرد تا زمانی که ثبت‌نام مشتری کامل شود'
                }
              >
                {isCustomerRegistered ? (
                  <>
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>ثبت سفارش</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ثبت‌نام و سفارش</span>
                    <span className="sm:hidden">سفارش</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Standard Mobile Fixed Bottom Navigation Bar (iOS/Android Native Ergonomics) */}
      <nav 
        aria-label="منوی ناوبری موبایل"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0c081c]/95 backdrop-blur-xl border-t border-violet-900/50 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.6)]"
      >
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-1">
          {/* Tab 1: Orders */}
          <button
            onClick={() => onSelectTab('orders')}
            className={`flex flex-col items-center justify-center h-full relative transition-colors cursor-pointer select-none ${
              currentTab === 'orders'
                ? 'text-violet-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <ClipboardList className={`w-5 h-5 ${currentTab === 'orders' ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {ordersCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-violet-600 text-white font-mono text-[9px] flex items-center justify-center font-bold shadow-xs">
                  {ordersCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">سفارش‌ها</span>
            {currentTab === 'orders' && (
              <span className="absolute bottom-1 w-4 h-1 rounded-full bg-violet-500 shadow-xs shadow-violet-500/50" />
            )}
          </button>

          {/* Tab 2: Portfolio */}
          <button
            onClick={() => onSelectTab('portfolio')}
            className={`flex flex-col items-center justify-center h-full relative transition-colors cursor-pointer select-none ${
              currentTab === 'portfolio'
                ? 'text-violet-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className={`w-5 h-5 ${currentTab === 'portfolio' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-1 tracking-tight">نمونه‌کارها</span>
            {currentTab === 'portfolio' && (
              <span className="absolute bottom-1 w-4 h-1 rounded-full bg-violet-500 shadow-xs shadow-violet-500/50" />
            )}
          </button>

          {/* Tab 3: Telegram Bot */}
          <button
            onClick={() => onSelectTab('telegram')}
            className={`flex flex-col items-center justify-center h-full relative transition-colors cursor-pointer select-none ${
              currentTab === 'telegram'
                ? 'text-violet-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className={`w-5 h-5 ${currentTab === 'telegram' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] mt-1 tracking-tight">ربات تلگرام</span>
            {currentTab === 'telegram' && (
              <span className="absolute bottom-1 w-4 h-1 rounded-full bg-violet-500 shadow-xs shadow-violet-500/50" />
            )}
          </button>

          {/* Tab 4: Admin Panel */}
          <button
            onClick={() => onSelectTab('admin')}
            className={`flex flex-col items-center justify-center h-full relative transition-colors cursor-pointer select-none ${
              currentTab === 'admin'
                ? 'text-violet-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <ShieldCheck className={`w-5 h-5 ${currentTab === 'admin' ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {!isAdminAuthenticated && (
                <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-0.5 -right-1" />
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">مدیریت</span>
            {currentTab === 'admin' && (
              <span className="absolute bottom-1 w-4 h-1 rounded-full bg-violet-500 shadow-xs shadow-violet-500/50" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
