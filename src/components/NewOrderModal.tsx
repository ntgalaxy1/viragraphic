import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Check, Send, Phone, Globe, Image as ImageIcon, Sparkles, FileText, ArrowRight, ArrowLeft, MapPin, Share2, Lock, UserPlus } from 'lucide-react';
import { CATEGORIES, SOCIAL_NETWORK_OPTIONS } from '../data/initialData';
import { CategoryId, ContactMethod, Project, ReferenceFile, SocialNetworkId, UserProfile } from '../types';
import { getCurrentShamsiDateTime } from '../utils/formatters';
import { isCustomerRegistrationComplete } from '../utils/storage';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  activeCustomer?: UserProfile | null;
  onRequireRegistration?: () => void;
  onSubmitOrder: (project: Project) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeCustomer,
  onRequireRegistration,
  onSubmitOrder,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formError, setFormError] = useState('');

  const targetCustomer = activeCustomer || currentUser;
  const isRegistrationComplete = isCustomerRegistrationComplete(targetCustomer);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('logo_identity');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('قطع استاندارد (A4 / 1080x1080 / وکتور نامحدود)');
  const [preferredStyle, setPreferredStyle] = useState('مینیمال و مدرن');
  const [colorPreferences, setColorPreferences] = useState('');
  const [budgetExpectation, setBudgetExpectation] = useState('طبق برآورد فنی ویراگرافیک');
  const [preferredDeadline, setPreferredDeadline] = useState('۵ روز کاری');

  // Contact info synced from registered customer
  const [contactMethod, setContactMethod] = useState<ContactMethod>('telegram');
  const [customerName, setCustomerName] = useState(targetCustomer.name);
  const [customerPhone, setCustomerPhone] = useState(targetCustomer.phone);
  const [customerTelegram, setCustomerTelegram] = useState(targetCustomer.telegramHandle || '@Ntgalaxy1');
  const [customerAddress, setCustomerAddress] = useState(targetCustomer.deliveryAddress || '');
  const [customerSocials, setCustomerSocials] = useState<SocialNetworkId[]>(
    targetCustomer.activeSocialNetworks || ['telegram']
  );

  // Uploaded references
  const [uploadedFiles, setUploadedFiles] = useState<ReferenceFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCustomerName(targetCustomer.name || '');
      setCustomerPhone(targetCustomer.phone || '');
      setCustomerTelegram(targetCustomer.telegramHandle || '@Ntgalaxy1');
      setCustomerAddress(targetCustomer.deliveryAddress || '');
      setCustomerSocials(targetCustomer.activeSocialNetworks || ['telegram']);
      setFormError('');
    }
  }, [isOpen, targetCustomer]);

  if (!isOpen) return null;

  // Hard Guard: Do not allow order placement until customer registration is complete
  if (!isRegistrationComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md text-right">
        <div className="w-full max-w-lg bg-[#110c24] border border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                ثبت سفارش قفل است (نیازمند تکمیل ثبت‌نام مشتری)
              </h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                ثبت سفارش انجام نمی‌گیرد تا زمانی که ثبت‌نام مشتری کامل شود.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            لطفاً ابتدا فرم ثبت‌نام مشتری شامل <strong>نام و نام خانوادگی</strong>، <strong>شماره تلفن همراه</strong>، <strong>شبکه‌های اجتماعی فعال به ترتیب اولویت</strong>، <strong>آدرس دقیق ارسال سفارش</strong> و <strong>یوزرنیم و پسورد مراجعات بعدی</strong> را تکمیل فرمایید.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition cursor-pointer"
            >
              بستن
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequireRegistration?.();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 flex items-center gap-2 transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>تکمیل ثبت‌نام مشتری و ادامه</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const fileUrl = (loadEvent.target?.result as string) || '';
        const newRef: ReferenceFile = {
          id: 'ref_' + Date.now() + '_' + i,
          name: file.name,
          url: fileUrl,
          sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
          type: file.type.startsWith('image/') ? 'image' : 'pdf',
          uploadedAt: getCurrentShamsiDateTime(),
          uploadedBy: 'customer',
        };
        setUploadedFiles((prev) => [...prev, newRef]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleFinalSubmit = () => {
    if (!isCustomerRegistrationComplete(targetCustomer)) {
      onClose();
      onRequireRegistration?.();
      return;
    }

    if (!title.trim() || !description.trim()) {
      setFormError('لطفاً عنوان طرح و توضیحات کامل آن را وارد فرمایید.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `VRA-${randomSuffix}`;
    const now = getCurrentShamsiDateTime();

    const newProject: Project = {
      id: 'prj_' + Date.now(),
      orderCode,
      userId: targetCustomer.id,
      customerName: customerName || targetCustomer.name,
      customerPhone: customerPhone || targetCustomer.phone,
      customerTelegram: customerTelegram.startsWith('@') ? customerTelegram : `@${customerTelegram || 'Ntgalaxy1'}`,
      customerUsername: targetCustomer.username,
      customerSocialNetworks: customerSocials,
      customerAddress: customerAddress || targetCustomer.deliveryAddress,
      title,
      category: selectedCategory,
      description,
      dimensions,
      preferredStyle,
      colorPreferences: colorPreferences || 'طبق صلاحدید طراح ویراگرافیک',
      budgetExpectation,
      preferredDeadline,
      contactPreference: contactMethod,
      referenceFiles: uploadedFiles,
      status: 'submitted',
      draftFiles: [],
      finalDeliverables: [],
      revisionCount: 0,
      timeline: [
        {
          id: 'tl_' + Date.now(),
          title: 'ثبت سفارش در سامانه ویراگرافیک',
          description: `سفارش با کد ${orderCode} ثبت شد و جهت بررسی فنی به مدیر ارسال گردید. روش ارتباطی انتخابی: ${
            contactMethod === 'telegram' ? 'ربات تلگرام' : contactMethod === 'phone' ? 'تماس تلفنی' : 'پیام در سایت'
          }`,
          timestamp: now,
          actor: 'customer',
          channel: contactMethod,
        },
      ],
      messages: [],
      createdAt: now.split(' - ')[0],
      updatedAt: now.split(' - ')[0],
    };

    onSubmitOrder(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#110c24] border border-violet-900/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 border-b border-violet-900/30 bg-[#0c081c] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">ثبت سفارش جدید در ویراگرافیک (Viragraphy)</h2>
              <p className="text-[10px] sm:text-xs text-violet-300/70 mt-0.5 leading-snug">پذیرش، بریف اختصاصی، پیوست نمونه و هماهنگی تلگرام</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-violet-950/40 transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Indicator */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 bg-[#0e0921] border-b border-violet-900/20 flex items-center justify-between text-[11px] sm:text-xs shrink-0 overflow-x-auto no-scrollbar">
          <div className={`flex items-center gap-1.5 sm:gap-2 shrink-0 ${step >= 1 ? 'text-violet-400 font-medium' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${step >= 1 ? 'bg-violet-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>
              ۱
            </span>
            <span className="whitespace-nowrap">انتخاب خدمت و سبک</span>
          </div>
          <span className="text-violet-900 px-1">←</span>
          <div className={`flex items-center gap-1.5 sm:gap-2 shrink-0 ${step >= 2 ? 'text-violet-400 font-medium' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${step >= 2 ? 'bg-violet-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>
              ۲
            </span>
            <span className="whitespace-nowrap">بریف و پیوست نمونه</span>
          </div>
          <span className="text-violet-900 px-1">←</span>
          <div className={`flex items-center gap-1.5 sm:gap-2 shrink-0 ${step >= 3 ? 'text-violet-400 font-medium' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${step >= 3 ? 'bg-violet-600 text-white font-bold' : 'bg-slate-800 text-slate-400'}`}>
              ۳
            </span>
            <span className="whitespace-nowrap">شیوه اطلاع‌رسانی</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
              {formError}
            </div>
          )}
          {/* STEP 1: Service category and style */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  دسته‌بندی طراحی مورد نظر خود را انتخاب کنید:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`text-right p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                          isSelected
                            ? 'bg-violet-600/15 border-violet-500/70 shadow-xs'
                            : 'bg-[#161030]/60 border-violet-950/40 hover:border-violet-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className={`font-semibold ${isSelected ? 'text-violet-300' : 'text-white'}`}>
                            {cat.titleFa}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-violet-400 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                          {cat.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    عنوان پروژه یا نام برند / محصول *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: طراحی هویت بصری استارتاپ فن‌آوران"
                    className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ابعاد یا فرمت درخواستی
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="مثال: قطع A4 چاپی، 1080x1080 یا وکتور"
                    className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    سبک و حس بصری مورد نظر
                  </label>
                  <input
                    type="text"
                    value={preferredStyle}
                    onChange={(e) => setPreferredStyle(e.target.value)}
                    placeholder="مثال: مینیمال مدرن، لوکس بافت‌دار، سوئیسی، کلاسیک"
                    className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    رنگ‌های سازمانی یا پالت پیشنهادی
                  </label>
                  <input
                    type="text"
                    value={colorPreferences}
                    onChange={(e) => setColorPreferences(e.target.value)}
                    placeholder="مثال: بنفش ویراگرافیک، سرمه‌ای، طلایی، طوسی روشن"
                    className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Brief & References */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  توضیحات کامل درخواست، بریف و جزئیات طرح *
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="لطفاً زمینه فعالیت، هدف از طراحی، مخاطبان هدف، متن‌هایی که باید درج شود و هر نکته مهمی که طراح باید رعایت کند را دقیق بنویسید..."
                  className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500 leading-relaxed"
                />
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  آپلود نمونه، طرح قبلی یا تصاویر رفرنس
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-violet-900/50 hover:border-violet-500 bg-[#0c081c]/60 rounded-xl p-5 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-7 h-7 text-violet-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-200">
                    برای آپلود عکس یا فایل نمونه کلیک کنید (یا فایل را اینجا بکشید)
                  </p>
                  <p className="text-[11px] text-violet-300/60 mt-1">
                    پشتیبانی از JPG, PNG, PDF, AI, PSD تا حجم ۲۰ مگابایت
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*,application/pdf"
                    className="hidden"
                  />
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <span className="text-[11px] text-slate-400">فایل‌های پیوست شده ({uploadedFiles.length}):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#161030] border border-violet-900/40 text-xs"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            {file.type === 'image' ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-8 h-8 rounded object-cover border border-violet-800"
                              />
                            ) : (
                              <FileText className="w-8 h-8 text-violet-400 p-1 bg-[#0c081c] rounded" />
                            )}
                            <div className="truncate">
                              <p className="text-white truncate text-[11px]">{file.name}</p>
                              <span className="text-[10px] text-slate-400">{file.sizeMb} MB</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="p-1 text-slate-400 hover:text-rose-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Deadline & Budget expectation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    مهلت زمانی ترجیحی شما
                  </label>
                  <input
                    type="text"
                    value={preferredDeadline}
                    onChange={(e) => setPreferredDeadline(e.target.value)}
                    placeholder="مثال: ۳ روز، تا پایان هفته"
                    className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    بودجه تقریبی مد نظر (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={budgetExpectation}
                    onChange={(e) => setBudgetExpectation(e.target.value)}
                    placeholder="مثال: ۵ میلیون تومان"
                    className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Notification preference (Telegram, Website, Phone) */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  پس از بررسی مدیر، نحوه اعلام هزینه، زمان و شیوه انجام چگونه باشد؟
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setContactMethod('telegram')}
                    className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      contactMethod === 'telegram'
                        ? 'bg-violet-600/20 border-violet-500/80 shadow-xs'
                        : 'bg-[#161030]/60 border-violet-950/40 hover:border-violet-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Send className="w-4 h-4 text-violet-400" />
                      {contactMethod === 'telegram' && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </div>
                    <span className="font-semibold text-white text-xs">ارسال در ربات تلگرام</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      دریافت آنی پیش‌فاکتور، زمان تحویل و نمونه‌ها در پی‌وی تلگرام
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactMethod('website')}
                    className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      contactMethod === 'website'
                        ? 'bg-violet-600/20 border-violet-500/80 shadow-xs'
                        : 'bg-[#161030]/60 border-violet-950/40 hover:border-violet-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Globe className="w-4 h-4 text-violet-400" />
                      {contactMethod === 'website' && <Check className="w-3.5 h-3.5 text-violet-400" />}
                    </div>
                    <span className="font-semibold text-white text-xs">پنل کاربری سایت</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      اعلان در داشبورد وب و ایمیل بدون نیاز به مسنجر خارجی
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactMethod('phone')}
                    className={`p-3.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                      contactMethod === 'phone'
                        ? 'bg-violet-600/20 border-violet-500/80 shadow-xs'
                        : 'bg-[#161030]/60 border-violet-950/40 hover:border-violet-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      {contactMethod === 'phone' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <span className="font-semibold text-white text-xs">تماس تلفنی مدیر</span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      گفتگوی مستقیم با مدیر طراحی جهت هماهنگی ابعاد و نکات خاص
                    </p>
                  </button>
                </div>
              </div>

              {/* Contact Inputs */}
              <div className="p-4 rounded-xl bg-[#0c081c] border border-violet-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-violet-300">
                    مشخصات ثبت‌نام شده شما جهت هماهنگی و ارسال سفارش:
                  </h4>
                  {currentUser.username && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-600/40 px-2 py-0.5 rounded-md">
                      نام کاربری: {currentUser.username}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">نام و نام خانوادگی</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#161030] border border-violet-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">شماره تلفن همراه</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      dir="ltr"
                      className="w-full bg-[#161030] border border-violet-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-violet-500 font-mono text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">آیدی تلگرام (برای ربات)</label>
                    <input
                      type="text"
                      value={customerTelegram}
                      onChange={(e) => setCustomerTelegram(e.target.value)}
                      dir="ltr"
                      placeholder="@Ntgalaxy1"
                      className="w-full bg-[#161030] border border-violet-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-violet-500 font-mono text-left"
                    />
                  </div>
                </div>

                {/* Active Social Networks Display */}
                {customerSocials && customerSocials.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Share2 className="w-3 h-3 text-violet-400" />
                      <span>شبکه‌های اجتماعی فعال به ترتیب اولویت:</span>
                    </span>
                    {customerSocials.map((sId, idx) => {
                      const info = SOCIAL_NETWORK_OPTIONS.find((o) => o.id === sId);
                      return (
                        <span
                          key={sId}
                          className="px-2 py-0.5 rounded-md bg-violet-950/70 border border-violet-600/40 text-violet-200 font-medium"
                        >
                          {idx + 1}. {info?.label.split(' ')[0] || sId}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Delivery Address */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" />
                    <span>آدرس دقیق جهت ارسال سفارش:</span>
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="آدرس دقیق پستی..."
                    className="w-full bg-[#161030] border border-violet-900/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-violet-500"
                  />
                </div>

                <p className="text-[11px] text-violet-300/80 mt-1 leading-relaxed">
                  💡 پس از ثبت، ربات تلگرام ویراگرافیک (@Viragraphicbot) پیام تاییدیه را به اکانت تلگرام {customerTelegram} و مدیریت ارسال می‌کند.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-violet-900/30 bg-[#0c081c]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-violet-800 text-xs font-medium text-slate-300 hover:bg-[#161030] transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>مرحله قبلی</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              انصراف
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (!title.trim()) {
                  setFormError('لطفاً ابتدا عنوان طرح را وارد نمایید.');
                  return;
                }
                setFormError('');
                setStep((s) => (s + 1) as any);
              }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-600/20 transition"
            >
              <span>ادامه به مرحله بعد</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>ثبت نهایی سفارش در ویراگرافیک</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
