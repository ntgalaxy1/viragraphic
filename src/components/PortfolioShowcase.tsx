import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Wand2,
  Palette,
  History,
  Star,
  SlidersHorizontal,
} from 'lucide-react';
import { CATEGORIES, VIRAGRAPHY_LOGO } from '../data/initialData';
import { CategoryId, Project, UserProfile } from '../types';
import { formatToman } from '../utils/formatters';

interface PortfolioShowcaseProps {
  onStartOrderWithCategory: (catId: CategoryId) => void;
  projects?: Project[];
  currentUser?: UserProfile;
}

interface PortfolioWorkItem {
  id: string;
  title: string;
  category: CategoryId;
  categoryName: string;
  image: string;
  tags: string[];
  styleKeywords: string[];
  colorPalette: string;
  estimatedPrice: number;
  description: string;
  complementsCategory?: CategoryId[];
}

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  onStartOrderWithCategory,
  projects = [],
  currentUser,
}) => {
  const [selectedCat, setSelectedCat] = useState<CategoryId | 'all'>('all');
  const [selectedTasteTag, setSelectedTasteTag] = useState<string>('auto');

  const showcaseItems: PortfolioWorkItem[] = [
    {
      id: 'show_1',
      title: 'هویت بصری و بسته‌بندی لوکس جواهرات Aurelia',
      category: 'print_packaging',
      categoryName: 'بسته‌بندی و چاپ لوکس',
      image: '/src/assets/images/sample_brand_identity_1794031596586.jpg',
      tags: ['سربرگ و کارت ویزیت', 'جعبه هاردباکس', 'امباس طلاکوب'],
      styleKeywords: ['مینیمال لوکس', 'بافت‌دار', 'طلاکوب', 'کلاسیک مدرن'],
      colorPalette: 'کرم نود، بنفش تیره ویراگرافیک، طلایی بژ',
      estimatedPrice: 5400000,
      description:
        'طراحی جامع نشان تجاری، ست اداری بافت‌دار و جعبه‌های بسته‌بندی هاردباکس جواهرات به همراه دفترچه استاندارد هویت برند.',
      complementsCategory: ['logo_identity', 'social_media'],
    },
    {
      id: 'show_3',
      title: 'پوستر نمایشگاه بین‌المللی تایپوگرافی و فرم‌های مدرن',
      category: 'poster_banner',
      categoryName: 'پوستر و تبلیغات محیطی',
      image: '/src/assets/images/sample_poster_art_1794031597495.jpg',
      tags: ['تایپوگرافی سوئیسی', 'تفکیک رنگ افست', 'فرمت قطع بزرگ'],
      styleKeywords: ['مینیمال مدرن', 'تایپوگرافی سوئیسی', 'هندسی', 'تضاد رنگی'],
      colorPalette: 'بنفش عمیق و نارنجی زنده',
      estimatedPrice: 3500000,
      description:
        'طراحی پوستر مفهومی با تکنیک ساختار هندسی و تضاد رنگی بالا جهت چاپ در گالری‌های هنری و رویدادهای فرهنگی.',
      complementsCategory: ['logo_identity', 'print_packaging'],
    },
    {
      id: 'show_4',
      title: 'آتلیه دیزاین و خلق هویت بصری استودیو ویراگرافیک',
      category: 'logo_identity',
      categoryName: 'نشان تجاری و برندینگ',
      image: '/src/assets/images/hero_graphic_studio_1794031596363.jpg',
      tags: ['طراحی لوگوتایپ', 'رنگ‌شناسی سازمانی', 'وکتور نامحدود'],
      styleKeywords: ['مونوگرام مینیمال', 'خطوط پیوسته', 'لوگوتایپ اختصاصی', 'مدرن'],
      colorPalette: 'بنفش ویراگرافیک (#7C3AED) و سفید یخی',
      estimatedPrice: 6500000,
      description:
        'فرآیند صفر تا صد خلق مونوگرام و تایپوگرافی اختصاصی با خطوط منظم ریاضی و نسبت‌های طلایی.',
      complementsCategory: ['print_packaging', 'social_media'],
    },
    {
      id: 'show_5',
      title: 'پکیج قالب‌های اینستاگرام و کمپین سوشال مدیا برند لوکس',
      category: 'social_media',
      categoryName: 'پست، استوری و هویت اینستاگرام',
      image: '/src/assets/images/sample_brand_identity_1794031596586.jpg',
      tags: ['قالب لایه‌باز PSD', 'کاور ریلز و هایلایت', 'پالت سازمانی'],
      styleKeywords: ['مینیمال لوکس', 'شبکه منظم', 'تایپوگرافی مدرن'],
      colorPalette: 'بنفش، یاسی روشن و طلایی ملایم',
      estimatedPrice: 2800000,
      description:
        'طراحی ۱۲ قالب پست و استوری هماهنگ با لوگوتایپ و بسته‌بندی برند جهت افزایش نرخ تعامل و زیبایی ویترین پیج.',
      complementsCategory: ['logo_identity', 'print_packaging', 'poster_banner'],
    },
    {
      id: 'show_6',
      title: 'طراحی لیبل و جعبه اختصاصی قهوه تخصصی و کافه آتلیه',
      category: 'print_packaging',
      categoryName: 'بسته‌بندی، لیبل و چاپ',
      image: '/src/assets/images/hero_graphic_studio_1794031596363.jpg',
      tags: ['خط تیغ اختصاصی', 'چاپ سیلک و طلاکوب', 'موکاپ سه‌بعدی'],
      styleKeywords: ['مونوگرام مینیمال', 'هنری', 'بافت کرافت و مات'],
      colorPalette: 'بنفش ویراگرافیک، قهوه سوخته و سبز زیتونی',
      estimatedPrice: 5200000,
      description:
        'طراحی بسته‌بندی پاکت‌های قهوه، لیوان بیرون‌بر و بگ خرید اختصاصی هماهنگ با نشان تجاری کافه.',
      complementsCategory: ['logo_identity'],
    },
  ];

  // Analyze customer's past orders and taste
  const customerHistory = useMemo(() => {
    const userOrders =
      projects.filter(
        (p) =>
          !currentUser ||
          currentUser.role === 'admin' ||
          p.userId === currentUser.id ||
          p.customerName === currentUser.name ||
          p.customerTelegram?.toLowerCase() === currentUser.telegramHandle?.toLowerCase()
      ) || projects;

    const activeOrders = userOrders.length > 0 ? userOrders : projects;

    const orderedCategories = Array.from(new Set(activeOrders.map((p) => p.category)));
    const preferredStyles = Array.from(
      new Set(
        activeOrders
          .map((p) => p.preferredStyle)
          .filter(Boolean)
          .map((s) => s!.split('/')[0].trim())
      )
    );
    const preferredColors = Array.from(
      new Set(
        activeOrders
          .map((p) => p.colorPreferences)
          .filter(Boolean)
          .map((c) => c!.split('،')[0].trim())
      )
    );

    return {
      orders: activeOrders,
      orderedCategories,
      preferredStyles,
      preferredColors,
      latestOrder: activeOrders[0] || null,
    };
  }, [projects, currentUser]);

  // Compute personalized designer recommendations with explanations
  const designerRecommendations = useMemo(() => {
    return showcaseItems
      .map((item) => {
        let score = 78;
        let reason = 'پیشنهاد ویژه طراح ارشد ویراگرافیک بر اساس استانداردهای هویت بصری مدرن';

        const matchingDirectOrder = customerHistory.orders.find(
          (o) => o.category === item.category
        );
        const matchingComplementOrder = customerHistory.orders.find((o) =>
          item.complementsCategory?.includes(o.category)
        );

        if (selectedTasteTag !== 'auto') {
          if (
            item.styleKeywords.some((k) => k.includes(selectedTasteTag)) ||
            item.tags.some((t) => t.includes(selectedTasteTag)) ||
            item.categoryName.includes(selectedTasteTag)
          ) {
            score += 19;
            reason = `هماهنگ با فیلتر سلیقه انتخابی شما («${selectedTasteTag}») و پالت رنگی اختصاصی`;
          }
        } else if (matchingDirectOrder) {
          score += 18;
          reason = `بر اساس سفارش قبلی شما «${matchingDirectOrder.title}» (${matchingDirectOrder.orderCode}) و علاقه شما به سبک «${matchingDirectOrder.preferredStyle || 'مینیمال مدرن'}»`;
        } else if (matchingComplementOrder) {
          score += 15;
          reason = `مکمل عالی برای سفارش قبلی شما «${matchingCompactTitle(
            matchingComplementOrder.title
          )}» جهت تکمیل یکپارچه هویت بصری برندتان`;
        }

        return {
          ...item,
          matchScore: Math.min(99, score),
          recommendationReason: reason,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  }, [customerHistory, selectedTasteTag]);

  const filtered =
    selectedCat === 'all'
      ? showcaseItems.slice(0, 4)
      : showcaseItems.filter((item) => item.category === selectedCat);

  return (
    <div className="space-y-8 text-right">
      {/* Hero Showcase Intro with Viragraphy Logo & Fluid Waves */}
      <div className="relative rounded-3xl overflow-hidden border border-violet-900/40 bg-gradient-to-br from-[#120c29] via-[#0d091e] to-[#170e34] shadow-2xl">
        {/* Subtle decorative purple wave background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch relative z-10">
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-violet-500/50 shadow-lg shadow-violet-500/30 bg-white p-1">
                  <img
                    src={VIRAGRAPHY_LOGO}
                    alt="ویراگرافیک"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-violet-400 font-mono tracking-widest block">
                    VIRAGRAPHY
                  </span>
                  <span className="text-base font-extrabold text-white">
                    استودیو طراحی ویراگرافیک
                  </span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                پذیرش و ثبت طراحی‌های گرافیکی، متصل به ربات تلگرام
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                در ویراگرافیک طرح درخواستی خود را همراه با فایل‌های رفرنس ثبت کنید، شیوه و هزینه انجام را از طریق ربات تلگرام یا سایت تحویل بگیرید، پرداخت آنلاین انجام دهید و پس از تایید اتودهای اولیه، فایل‌های نهایی را تحویل بگیرید.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-4 border-t border-violet-900/40 text-xs">
              <div>
                <span className="text-violet-300/70 block text-[11px]">ضمانت کیفیت:</span>
                <span className="font-semibold text-white">اصلاحیه تا تایید کامل</span>
              </div>
              <div>
                <span className="text-violet-300/70 block text-[11px]">فرمت تحویل:</span>
                <span className="font-semibold text-white">AI / PSD / PDF برداری</span>
              </div>
              <div>
                <span className="text-violet-300/70 block text-[11px]">پشتیبانی لحظه‌ای:</span>
                <span className="font-semibold text-violet-400">ربات تلگرام ۲۴/۷</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full">
            <img
              src="/src/assets/images/hero_graphic_studio_1794031596363.jpg"
              alt="Viragraphy Design Studio Workspace"
              className="w-full h-full object-cover lg:absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#0d091e] via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* NEW SECTION: Designer Recommendations ("پیشنهادهای طراح") based on customer taste & past orders */}
      <div className="bg-gradient-to-br from-[#160f30] via-[#110c24] to-[#0e0a1f] border border-violet-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header & Taste Analysis Summary */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-violet-900/40 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    پیشنهادهای طراح ویژه شما
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/40 text-violet-300 text-[10px] font-bold">
                    هوشمند بر اساس سلیقه و سفارش‌های قبلی
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  این نمونه‌کارها با تحلیل سبک، پالت رنگی و تاریخچه سفارش‌های قبلی شما در ویراگرافیک گلچین شده‌اند
                </p>
              </div>
            </div>
          </div>

          {/* Taste Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
              <span>تنظیم سلیقه:</span>
            </span>
            {[
              { id: 'auto', label: 'تحلیل خودکار سفارش‌های من' },
              { id: 'مینیمال', label: 'مینیمال و لوکس' },
              { id: 'طلاکوب', label: 'چاپ و بسته‌بندی طلاکوب' },
              { id: 'مونوگرام', label: 'لوگوتایپ و مونوگرام' },
              { id: 'تایپوگرافی', label: 'پوستر و تایپوگرافی' },
            ].map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedTasteTag(chip.id)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] transition cursor-pointer ${
                  selectedTasteTag === chip.id
                    ? 'bg-violet-600 border-violet-400 text-white font-bold shadow-sm'
                    : 'bg-[#0c081c] border-violet-900/50 text-slate-300 hover:border-violet-600'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Taste Profile Bar */}
        <div className="bg-[#0c081c]/90 border border-violet-900/50 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs relative z-10">
          <div className="flex items-start gap-2.5">
            <History className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-slate-400 block">بر اساس آخرین سفارش‌های شما:</span>
              <span className="text-white font-bold mt-0.5 block">
                {customerHistory.latestOrder
                  ? `${customerHistory.latestOrder.title} (${customerHistory.latestOrder.orderCode})`
                  : 'سفارش‌های برندینگ و بسته‌بندی'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-slate-400 block">سبک‌های مورد علاقه شناسایی‌شده:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(customerHistory.preferredStyles.length > 0
                  ? customerHistory.preferredStyles
                  : ['مینیمال لوکس', 'مونوگرام هنری']
                ).map((st, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-violet-950/80 border border-violet-700/40 text-violet-200 text-[10px]"
                  >
                    {st}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Palette className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-slate-400 block">پالت رنگی پیشنهادی هماهنگ:</span>
              <span className="text-emerald-300 font-medium mt-0.5 block">
                {customerHistory.preferredColors.join(' ، ') ||
                  'بنفش ویراگرافیک، کرم نود و طلاکوب'}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Recommended Portfolio Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
          {designerRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-[#0d091e] border border-violet-800/50 hover:border-violet-500 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all"
            >
              <div>
                {/* Image & Match Score Badge */}
                <div className="relative aspect-16/10 overflow-hidden">
                  <img
                    src={rec.image}
                    alt={rec.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d091e] via-transparent to-black/30" />

                  <div className="absolute top-3 right-3 bg-violet-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-bold flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>{rec.matchScore}٪ تطابق با سلیقه شما</span>
                  </div>

                  <div className="absolute bottom-2.5 right-3 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] text-violet-300 border border-violet-500/30">
                    {rec.categoryName}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-white text-sm group-hover:text-violet-400 transition-colors">
                    {rec.title}
                  </h3>

                  {/* Why Designer Recommended This */}
                  <div className="p-2.5 rounded-xl bg-violet-950/40 border border-violet-700/40 text-[11px] text-violet-200 leading-relaxed">
                    <span className="font-bold text-violet-400 block mb-0.5">
                      💡 علت پیشنهاد طراح به شما:
                    </span>
                    {rec.recommendationReason}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {rec.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {rec.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#161030] text-slate-300 px-2 py-0.5 rounded border border-violet-900/40"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Action */}
              <div className="px-4 pb-4 pt-2 border-t border-violet-900/30 flex items-center justify-between gap-2">
                <div className="text-xs">
                  <span className="text-[10px] text-slate-400 block">برآورد پایه:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatToman(rec.estimatedPrice)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onStartOrderWithCategory(rec.category)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <span>سفارش با این سبک</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Category Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">خدمات و نرخ‌های پایه ویراگرافیک</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              برای شروع هر خدمت روی دکمه ثبت سفارش کلیک کنید
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="bg-[#110c24] border border-violet-900/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-violet-700/60 transition space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{cat.titleFa}</h3>
                  <span className="text-[10px] text-violet-300 font-mono">
                    {cat.typicalDeliveryDays} روز کاری
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div className="space-y-2.5 pt-3 border-t border-violet-900/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">شروع هزینه پایه:</span>
                  <span className="font-bold text-violet-400 font-mono">
                    {formatToman(cat.basePriceToman)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {cat.popularFormats.slice(0, 2).map((fmt, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-violet-300/80 bg-[#0c081c] px-2 py-0.5 rounded border border-violet-900/40"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onStartOrderWithCategory(cat.id)}
                  className="w-full py-2 rounded-xl bg-[#1a1238] hover:bg-violet-600 hover:text-white text-violet-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-violet-800/60 cursor-pointer"
                >
                  <span>ثبت سفارش {cat.titleFa}</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Portfolio Gallery */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white">نمونه پروژه‌های اجرا شده استودیو</h2>

          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                selectedCat === 'all'
                  ? 'bg-violet-600 text-white border-violet-500 font-semibold'
                  : 'bg-[#110c24] text-slate-400 border-violet-900/40 hover:text-white'
              }`}
            >
              همه نمونه‌کارها
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                  selectedCat === c.id
                    ? 'bg-violet-600 text-white border-violet-500 font-semibold'
                    : 'bg-[#110c24] text-slate-400 border-violet-900/40 hover:text-white'
                }`}
              >
                {c.titleFa}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#110c24] border border-violet-900/40 rounded-2xl overflow-hidden shadow-xl group hover:border-violet-700/60 transition"
            >
              <div className="relative overflow-hidden aspect-4/3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-violet-300 font-medium border border-violet-500/30">
                  {item.categoryName}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-bold text-white text-sm group-hover:text-violet-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-violet-300/80 bg-[#0c081c] px-2.5 py-1 rounded-md border border-violet-900/40"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onStartOrderWithCategory(item.category)}
                    className="w-full py-2.5 rounded-xl bg-[#1a1238] hover:bg-violet-600 hover:text-white text-white font-medium text-xs transition border border-violet-800/60 cursor-pointer"
                  >
                    سفارش مشابه این پروژه
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function matchingCompactTitle(title: string): string {
  return title.length > 38 ? title.slice(0, 38) + '...' : title;
}
