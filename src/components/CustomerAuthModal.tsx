import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  LogIn,
  Phone,
  MapPin,
  Lock,
  User,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Send,
  Share2,
  X,
  CheckCircle2,
} from 'lucide-react';
import { SOCIAL_NETWORK_OPTIONS, VIRAGRAPHY_LOGO } from '../data/initialData';
import { SocialNetworkId, UserProfile } from '../types';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredCustomers: UserProfile[];
  currentCustomer: UserProfile | null;
  onRegisterSuccess: (newCustomer: UserProfile) => void;
  onLoginSuccess: (customer: UserProfile) => void;
  pendingOrderIntent?: boolean;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  registeredCustomers,
  currentCustomer,
  onRegisterSuccess,
  onLoginSuccess,
  pendingOrderIntent = false,
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Registration fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegramHandle, setTelegramHandle] = useState('@Ntgalaxy1');
  // Ordered array of selected social networks (in the exact order ticked by the customer)
  const [selectedSocials, setSelectedSocials] = useState<SocialNetworkId[]>(['telegram']);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login fields for returning visits
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && currentCustomer && currentCustomer.isRegistered) {
      setFullName(currentCustomer.name || '');
      setPhone(currentCustomer.phone || '');
      setTelegramHandle(currentCustomer.telegramHandle || '@Ntgalaxy1');
      setSelectedSocials(currentCustomer.activeSocialNetworks || ['telegram']);
      setDeliveryAddress(currentCustomer.deliveryAddress || '');
      setUsername(currentCustomer.username || '');
      setPassword(currentCustomer.password || '');
    }
    setErrorMsg('');
  }, [isOpen, currentCustomer]);

  if (!isOpen) return null;

  // Toggle social network in exact order clicked
  const handleToggleSocial = (socialId: SocialNetworkId) => {
    setErrorMsg('');
    setSelectedSocials((prev) => {
      if (prev.includes(socialId)) {
        return prev.filter((id) => id !== socialId);
      } else {
        return [...prev, socialId];
      }
    });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMsg('لطفاً نام و نام خانوادگی خود را کامل وارد فرمایید.');
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg('لطفاً شماره تلفن همراه معتبر برای تماس وارد فرمایید (مثال: 09121234567).');
      return;
    }

    if (selectedSocials.length === 0) {
      setErrorMsg('لطفاً حداقل یکی از شبکه‌های اجتماعی فعال خود را تیک بزنید.');
      return;
    }

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 8) {
      setErrorMsg('لطفاً آدرس دقیق جهت ارسال سفارش را وارد فرمایید.');
      return;
    }

    if (!username.trim() || username.trim().length < 3) {
      setErrorMsg('لطفاً یک نام کاربری (حداقل ۳ کاراکتر) جهت مراجعات بعدی انتخاب کنید.');
      return;
    }

    if (!password.trim() || password.trim().length < 4) {
      setErrorMsg('لطفاً یک رمز عبور (حداقل ۴ کاراکتر) جهت مراجعات بعدی وارد کنید.');
      return;
    }

    // Check duplicate username if registering a new account
    const existing = registeredCustomers.find(
      (u) =>
        u.username?.toLowerCase() === username.trim().toLowerCase() &&
        u.id !== currentCustomer?.id
    );
    if (existing) {
      setErrorMsg('این نام کاربری قبلاً ثبت شده است. می‌توانید از تب «ورود مشتریان قبلی» وارد شوید یا نام کاربری دیگری انتخاب کنید.');
      return;
    }

    const formattedTg = telegramHandle.trim()
      ? telegramHandle.trim().startsWith('@')
        ? telegramHandle.trim()
        : `@${telegramHandle.trim()}`
      : '@Ntgalaxy1';

    const newCustomer: UserProfile = {
      id: currentCustomer?.isRegistered ? currentCustomer.id : 'usr_cust_' + Date.now(),
      name: fullName.trim(),
      phone: phone.trim(),
      telegramHandle: formattedTg,
      activeSocialNetworks: selectedSocials,
      deliveryAddress: deliveryAddress.trim(),
      username: username.trim(),
      password: password.trim(),
      isRegistered: true,
      role: 'customer',
    };

    onRegisterSuccess(newCustomer);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setErrorMsg('لطفاً نام کاربری و رمز عبور خود را وارد فرمایید.');
      return;
    }

    const matched = registeredCustomers.find(
      (u) =>
        u.username?.toLowerCase() === loginUsername.trim().toLowerCase() &&
        u.password === loginPassword.trim()
    );

    if (!matched) {
      setErrorMsg('نام کاربری یا رمز عبور اشتباه است. اگر قبلاً ثبت‌نام نکرده‌اید از تب «ثبت‌نام مشتری جدید» اقدام نمایید.');
      return;
    }

    onLoginSuccess(matched);
  };

  const isStep1NameOk = fullName.trim().length >= 3 && !fullName.includes('کاربر مهمان');
  const isStep2PhoneOk = phone.trim().length >= 10;
  const isStep3SocialsOk = selectedSocials.length > 0;
  const isStep4AddressOk = deliveryAddress.trim().length >= 8;
  const isStep5CredentialsOk = username.trim().length >= 3 && password.trim().length >= 4;

  const completedStepsCount = [
    isStep1NameOk,
    isStep2PhoneOk,
    isStep3SocialsOk,
    isStep4AddressOk,
    isStep5CredentialsOk,
  ].filter(Boolean).length;
  const isAllRegistrationComplete = completedStepsCount === 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md text-right overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[#110c24] border border-violet-700/50 rounded-2xl sm:rounded-3xl shadow-2xl shadow-violet-950/90 overflow-hidden max-h-[92vh] flex flex-col mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#181034] to-[#120c26] border-b border-violet-900/40 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden bg-white p-0.5 border border-violet-500/50 shadow-md shrink-0">
              <img
                src={VIRAGRAPHY_LOGO}
                alt="ویراگرافیک"
                className="w-full h-full object-cover rounded-lg sm:rounded-[14px]"
              />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-extrabold text-white tracking-tight leading-tight">
                {pendingOrderIntent
                  ? '⛔ تکمیل ثبت‌نام الزامی مشتری پیش از ثبت سفارش'
                  : 'حساب کاربری و ثبت‌نام مشتریان ویراگرافیک'}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-violet-300/80 mt-0.5 leading-snug">
                {pendingOrderIntent
                  ? 'ثبت سفارش انجام نمی‌گیرد تا زمانی که ثبت‌نام مشتری (هر ۵ مورد زیر) به طور کامل تکمیل شود.'
                  : 'ثبت مشخصات کامل مشتری جهت امکان ثبت سفارش و مراجعات بعدی'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-violet-900/30 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 pt-2 sm:pt-3 bg-[#0e0a1f] border-b border-violet-900/30 text-xs overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
              mode === 'register'
                ? 'border-violet-500 text-violet-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 shrink-0" />
            <span>
              {currentCustomer?.isRegistered ? 'ویرایش اطلاعات من' : 'ثبت‌نام مشتری جدید (الزامی)'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-[11px] sm:text-xs ${
              mode === 'login'
                ? 'border-violet-500 text-violet-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 shrink-0" />
            <span>ورود با یوزرنیم و پسورد</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs">
          {/* Live 5-Step Registration Completion Checklist */}
          {mode === 'register' && (
            <div
              className={`p-3.5 rounded-2xl border space-y-2.5 transition-all ${
                isAllRegistrationComplete
                  ? 'bg-emerald-950/40 border-emerald-500/50'
                  : 'bg-amber-950/30 border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-bold flex items-center gap-1.5 ${
                    isAllRegistrationComplete ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {isAllRegistrationComplete ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>تمامی ۵ مورد ثبت‌نام کامل شد · آماده ثبت سفارش</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>تا تکمیل هر ۵ مورد زیر، ثبت سفارش قفل است:</span>
                    </>
                  )}
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-[#0c081c] border border-violet-800/40 text-violet-300">
                  {completedStepsCount} از ۵ تکمیل شده
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px]">
                {[
                  { label: '۱. نام و فامیل', ok: isStep1NameOk },
                  { label: '۲. شماره همراه', ok: isStep2PhoneOk },
                  { label: '۳. شبکه اجتماعی', ok: isStep3SocialsOk },
                  { label: '۴. آدرس دقیق', ok: isStep4AddressOk },
                  { label: '۵. یوزرنیم و رمز', ok: isStep5CredentialsOk },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`px-2 py-1.5 rounded-lg border flex items-center gap-1 font-medium ${
                      item.ok
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#0c081c]/80 border-slate-800 text-slate-400'
                    }`}
                  >
                    {item.ok ? (
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-500/60 shrink-0" />
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'register' ? (
            <form id="customer-register-form" onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* 1. Full Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-200 font-bold mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-violet-400" />
                    <span>نام و نام خانوادگی (اسم و فامیل) *</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: ناصر توکلی"
                    className="w-full bg-[#0c081c] border border-violet-800/50 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>شماره تلفن همراه برای تماس *</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    placeholder="09121234567"
                    className="w-full bg-[#0c081c] border border-violet-800/50 rounded-xl px-3.5 py-2.5 text-white font-mono text-left placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
                  />
                </div>
              </div>

              {/* 2. Social Networks Checkboxes in Order */}
              <div className="bg-[#0c081c] border border-violet-900/50 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-slate-200 font-bold flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-violet-400" />
                    <span>در کدام شبکه‌های اجتماعی فعال هستید؟ (به ترتیب اولویت تیک بزنید) *</span>
                  </label>
                  <span className="text-[10px] text-violet-300/80">
                    هر گزینه‌ای که زودتر تیک بزنید اولویت بالاتری دارد
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SOCIAL_NETWORK_OPTIONS.map((net) => {
                    const orderIndex = selectedSocials.indexOf(net.id);
                    const isChecked = orderIndex !== -1;

                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => handleToggleSocial(net.id)}
                        className={`p-2.5 rounded-xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-violet-600/20 border-violet-500 text-white shadow-sm'
                            : 'bg-[#140e2b]/60 border-violet-950/60 text-slate-400 hover:border-violet-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                              isChecked
                                ? 'bg-violet-600 border-violet-400 text-white'
                                : 'bg-[#0c081c] border-slate-600'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span className="font-semibold text-[11px]">{net.label}</span>
                        </div>

                        {isChecked && (
                          <span className="px-1.5 py-0.5 rounded-md bg-violet-500 text-white font-mono font-bold text-[10px]">
                            اولویت {orderIndex + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Display ordered selection */}
                {selectedSocials.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-violet-900/30 text-[11px]">
                    <span className="text-slate-400">ترتیب انتخابی شما:</span>
                    {selectedSocials.map((id, index) => {
                      const info = SOCIAL_NETWORK_OPTIONS.find((s) => s.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-violet-950/80 border border-violet-600/40 text-violet-200 font-medium"
                        >
                          <span className="text-violet-400 font-bold">{index + 1}.</span>
                          <span>{info?.label.split(' ')[0]}</span>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Telegram Handle Input */}
                <div className="pt-2 border-t border-violet-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[11px] text-slate-300 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-violet-400" />
                    <span>آیدی تلگرام جهت اتصال به ربات @Viragraphicbot:</span>
                  </label>
                  <input
                    type="text"
                    value={telegramHandle}
                    onChange={(e) => setTelegramHandle(e.target.value)}
                    dir="ltr"
                    placeholder="@Ntgalaxy1"
                    className="sm:w-56 bg-[#140e2b] border border-violet-800/50 rounded-lg px-3 py-1.5 text-white font-mono text-left text-xs focus:outline-hidden focus:border-violet-500"
                  />
                </div>
              </div>

              {/* 3. Exact Delivery Address */}
              <div>
                <label className="block text-slate-200 font-bold mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>آدرس جهت ارسال سفارش (دقیق) *</span>
                </label>
                <textarea
                  rows={2}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="استان، شهر، خیابان اصلی، خیابان فرعی یا کوچه، پلاک، طبقه، واحد و کد پستی..."
                  className="w-full bg-[#0c081c] border border-violet-800/50 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500 leading-relaxed"
                />
              </div>

              {/* 4. Username & Password for future visits */}
              <div className="bg-[#150f2e] border border-violet-700/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-violet-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-violet-400" />
                    <span>یوزرنیم و پسورد جهت مراجعه برای دفعات بعدی *</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    در مراجعات بعدی با این مشخصات وارد شوید
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      نام کاربری (Username):
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      dir="ltr"
                      placeholder="e.g. naser_t"
                      className="w-full bg-[#0c081c] border border-violet-800/50 rounded-xl px-3.5 py-2 text-white font-mono text-left placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
                      رمز عبور (Password):
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        dir="ltr"
                        placeholder="حداقل ۴ کاراکتر"
                        className="w-full bg-[#0c081c] border border-violet-800/50 rounded-xl px-3.5 py-2 pl-9 text-white font-mono text-left placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-2.5 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Returning Customer Login Form */
            <form id="customer-login-form" onSubmit={handleLoginSubmit} className="space-y-4 py-2">
              <div className="bg-[#0c081c] border border-violet-900/40 rounded-2xl p-5 space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  اگر قبلاً در سامانه ویراگرافیک ثبت‌نام کرده‌اید، نام کاربری و رمز عبور خود را وارد کنید تا مشخصات و آدرس شما به صورت خودکار بارگذاری شود:
                </p>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    نام کاربری (Username):
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    dir="ltr"
                    placeholder="نام کاربری خود را وارد کنید..."
                    className="w-full bg-[#140e2b] border border-violet-800/50 rounded-xl px-4 py-2.5 text-white font-mono text-left placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    رمز عبور (Password):
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPass ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      dir="ltr"
                      placeholder="رمز عبور..."
                      className="w-full bg-[#140e2b] border border-violet-800/50 rounded-xl px-4 py-2.5 pl-10 text-white font-mono text-left placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      className="absolute left-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {registeredCustomers.length > 0 && (
                  <div className="pt-2 border-t border-violet-900/30">
                    <span className="text-[11px] text-slate-400 block mb-1.5">
                      حساب‌های ثبت‌نام شده در این مرورگر (کلیک جهت جایگذاری سریع):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {registeredCustomers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            setLoginUsername(u.username || '');
                            setLoginPassword(u.password || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#191136] hover:bg-violet-900/50 border border-violet-700/40 text-violet-200 text-[11px] flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <User className="w-3 h-3 text-violet-400" />
                          <span>{u.name}</span>
                          <span className="font-mono text-violet-400">({u.username})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0c081c] border-t border-violet-900/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition cursor-pointer"
          >
            انصراف
          </button>

          {mode === 'register' ? (
            <button
              type="submit"
              form="customer-register-form"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {pendingOrderIntent
                  ? 'تکمیل ثبت‌نام و ادامه به فرم سفارش طرح'
                  : 'ذخیره اطلاعات و تکمیل ثبت‌نام'}
              </span>
            </button>
          ) : (
            <button
              type="submit"
              form="customer-login-form"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {pendingOrderIntent ? 'ورود به حساب و ادامه ثبت سفارش' : 'ورود به حساب کاربری'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
