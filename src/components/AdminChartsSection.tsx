import React, { useState } from 'react';
import { 
  TrendingUp, CheckCircle2, Clock, DollarSign, PieChart as PieIcon, 
  BarChart3, Layers, Sparkles, ArrowUpRight, ShieldCheck, Wallet
} from 'lucide-react';
import { Project } from '../types';
import { formatToman } from '../utils/formatters';

interface AdminChartsSectionProps {
  projects: Project[];
}

export const AdminChartsSection: React.FC<AdminChartsSectionProps> = ({ projects }) => {
  const [activeMetricTab, setActiveMetricTab] = useState<'overview' | 'categories'>('overview');

  // Core calculations
  const totalOrders = projects.length;
  
  // In-progress: status is 'in_progress', 'draft_ready', or 'revision_requested'
  const inProgressProjects = projects.filter(
    (p) => p.status === 'in_progress' || p.status === 'draft_ready' || p.status === 'revision_requested'
  );
  const inProgressCount = inProgressProjects.length;

  // Completed: status is 'completed' or 'approved_final'
  const completedProjects = projects.filter(
    (p) => p.status === 'completed' || p.status === 'approved_final'
  );
  const completedCount = completedProjects.length;

  // Pending: status is 'submitted', 'under_review', 'proposal_ready', 'payment_pending'
  const pendingProjects = projects.filter(
    (p) => p.status === 'submitted' || p.status === 'under_review' || p.status === 'proposal_ready' || p.status === 'payment_pending'
  );
  const pendingCount = pendingProjects.length;

  // Total collected revenue
  const totalRevenue = projects
    .filter((p) => p.payment)
    .reduce((sum, p) => sum + (p.payment?.amountToman || 0), 0);

  // Expected pipeline revenue (from projects with proposals)
  const pendingRevenue = projects
    .filter((p) => !p.payment && p.proposal?.costToman)
    .reduce((sum, p) => sum + (p.proposal?.costToman || 0), 0);

  // Average order value
  const paidCount = projects.filter((p) => p.payment).length;
  const avgOrderValue = paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0;

  // Percentages for status distribution
  const inProgressPct = totalOrders > 0 ? Math.round((inProgressCount / totalOrders) * 100) : 0;
  const completedPct = totalOrders > 0 ? Math.round((completedCount / totalOrders) * 100) : 0;
  const pendingPct = totalOrders > 0 ? Math.max(0, 100 - inProgressPct - completedPct) : 0;

  // Category breakdown
  const categoryStats: Record<string, { title: string; count: number; revenue: number; color: string }> = {
    logo_identity: { title: 'طراحی لوگو و هویت', count: 0, revenue: 0, color: '#8B5CF6' },
    print_packaging: { title: 'بسته‌بندی و چاپ', count: 0, revenue: 0, color: '#A855F7' },
    poster_banner: { title: 'پوستر و تبلیغات', count: 0, revenue: 0, color: '#6366F1' },
    social_media: { title: 'پست و استوری اینستاگرام', count: 0, revenue: 0, color: '#EC4899' },
  };

  projects.forEach((p) => {
    const cat = categoryStats[p.category] || categoryStats.logo_identity;
    cat.count += 1;
    if (p.payment) {
      cat.revenue += p.payment.amountToman || 0;
    } else if (p.proposal?.costToman) {
      // half-weight for pending revenue
      cat.revenue += Math.round((p.proposal.costToman * 0.5));
    }
  });

  const categoriesList = Object.entries(categoryStats)
    .map(([key, val]) => ({ key, ...val }))
    .sort((a, b) => b.revenue - a.revenue);

  // SVG Donut calculations
  // Circumference of radius 40 is 2 * PI * 40 = 251.327
  const circumference = 251.327;
  const completedStroke = (completedPct / 100) * circumference;
  const inProgressStroke = (inProgressPct / 100) * circumference;
  const pendingStroke = (pendingPct / 100) * circumference;

  const completedOffset = 0;
  const inProgressOffset = -completedStroke;
  const pendingOffset = -(completedStroke + inProgressStroke);

  return (
    <div className="bg-[#110c24] border border-violet-900/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header of Visual Analytics Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-violet-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-violet-600/30">
            <div className="w-full h-full bg-[#110c24] rounded-[14px] flex items-center justify-center text-violet-400">
              <BarChart3 className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                داشبورد تحلیل دیداری و آمارهای مالی ویراگرافیک
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-semibold border border-violet-500/30">
                گزارش زنده
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              نمایش لحظه‌ای وضعیت پروژه‌های جاری، پروژه‌های نهایی شده و جریان درآمد استودیو
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0c081c] border border-violet-900/40 rounded-xl text-xs">
          <button
            onClick={() => setActiveMetricTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
              activeMetricTab === 'overview'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            نمودارهای وضعیت و درآمد
          </button>
          <button
            onClick={() => setActiveMetricTab('categories')}
            className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
              activeMetricTab === 'categories'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            تفکیک دسته‌بندی‌های طراحی
          </button>
        </div>
      </div>

      {/* 3 Main Highlighted KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: In-Progress Orders */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#181136] to-[#120d2a] border border-violet-600/40 rounded-2xl p-5 shadow-lg group hover:border-violet-500 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-violet-300">سفارش‌های در حال انجام</span>
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Clock className="w-4 h-4 animate-spin-slow" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {inProgressCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">سفارش فعال</span>
          </div>
          <div className="mt-3 pt-3 border-t border-violet-900/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">سهم از کل پروژه‌ها:</span>
            <span className="text-violet-300 font-bold font-mono">{inProgressPct}٪</span>
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="w-full bg-[#0c081c] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(8, inProgressPct))}%` }}
            />
          </div>
        </div>

        {/* Card 2: Completed Orders */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0e1d24] to-[#0c161d] border border-emerald-500/40 rounded-2xl p-5 shadow-lg group hover:border-emerald-400 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-emerald-300">سفارش‌های تکمیل شده</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {completedCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">تحویل نهایی شده</span>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-950/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">نرخ تکمیل موفق:</span>
            <span className="text-emerald-300 font-bold font-mono">{completedPct}٪</span>
          </div>
          {/* Visual Mini Progress Bar */}
          <div className="w-full bg-[#0c081c] h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(8, completedPct))}%` }}
            />
          </div>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1a133a] to-[#140e2b] border border-amber-500/40 rounded-2xl p-5 shadow-lg group hover:border-amber-400 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-amber-300">میزان درآمد کل استودیو</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
              {formatToman(totalRevenue)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-950/40 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">میانگین ارزش فاکتور:</span>
            <span className="text-amber-200 font-bold font-mono">{formatToman(avgOrderValue)}</span>
          </div>
          {/* Pending revenue note */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1">
            <span>در انتظار وصول (پیشنهادها):</span>
            <span className="text-slate-300 font-mono">{formatToman(pendingRevenue)}</span>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      {activeMetricTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut Chart: Orders Status Distribution */}
          <div className="lg:col-span-5 bg-[#0d091e] border border-violet-900/40 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">نمودار توزیع وضعیت سفارش‌ها</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">مجموع: {totalOrders}</span>
            </div>

            {/* Circular SVG Donut */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#191136"
                    strokeWidth="12"
                  />
                  {/* Completed arc */}
                  {completedStroke > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="12"
                      strokeDasharray={`${completedStroke} ${circumference}`}
                      strokeDashoffset={completedOffset}
                      strokeLinecap="round"
                    />
                  )}
                  {/* In-progress arc */}
                  {inProgressStroke > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#8B5CF6"
                      strokeWidth="12"
                      strokeDasharray={`${inProgressStroke} ${circumference}`}
                      strokeDashoffset={inProgressOffset}
                      strokeLinecap="round"
                    />
                  )}
                  {/* Pending arc */}
                  {pendingStroke > 0 && (
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#F59E0B"
                      strokeWidth="12"
                      strokeDasharray={`${pendingStroke} ${circumference}`}
                      strokeDashoffset={pendingOffset}
                      strokeLinecap="round"
                    />
                  )}
                </svg>

                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white font-mono">{totalOrders}</span>
                  <span className="text-[10px] text-slate-400">سفارش ثبت شده</span>
                </div>
              </div>

              {/* Legends with Live Stats */}
              <div className="space-y-2.5 text-xs w-full sm:w-auto">
                <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-[#140e2b] border border-violet-900/30">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-violet-500 shrink-0" />
                    <span className="text-slate-200">در حال انجام و اتود</span>
                  </div>
                  <span className="font-mono font-bold text-violet-400">
                    {inProgressCount} <span className="text-[10px] text-slate-400">({inProgressPct}٪)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-[#0c181d] border border-emerald-900/30">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
                    <span className="text-slate-200">تکمیل و تحویل شده</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">
                    {completedCount} <span className="text-[10px] text-slate-400">({completedPct}٪)</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 p-2 rounded-xl bg-[#1d1610] border border-amber-900/30">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0" />
                    <span className="text-slate-200">در انتظار بررسی / فاکتور</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">
                    {pendingCount} <span className="text-[10px] text-slate-400">({pendingPct}٪)</span>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center border-t border-violet-900/30 pt-2.5">
              💡 تمام تغییر وضعیت‌ها بلافاصله به تلگرام مشتریان و سامانه وب سینک می‌گردد.
            </p>
          </div>

          {/* Bar Chart: Revenue Inflow & Lifecycle Comparison */}
          <div className="lg:col-span-7 bg-[#0d091e] border border-violet-900/40 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">نمودار ستونی درآمد و سفارش‌ها</h3>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                  درآمد واریزی
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded bg-violet-500 inline-block" />
                  سفارش‌ها
                </span>
              </div>
            </div>

            {/* Visual Bars for Categories / Pipeline */}
            <div className="space-y-3.5 pt-2">
              {categoriesList.slice(0, 4).map((cat) => {
                const maxRevenue = Math.max(...categoriesList.map((c) => c.revenue), 10000000);
                const revenuePercent = Math.max(12, Math.round((cat.revenue / maxRevenue) * 100));

                return (
                  <div key={cat.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-slate-200 font-medium">{cat.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({cat.count} پروژه)</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold">
                        {formatToman(cat.revenue)}
                      </span>
                    </div>

                    <div className="w-full bg-[#181136] h-3 rounded-full overflow-hidden flex items-center p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-700 relative"
                        style={{
                          width: `${revenuePercent}%`,
                          backgroundColor: cat.color,
                          boxShadow: `0 0 10px ${cat.color}60`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Metrics Bar below chart */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-violet-900/30 text-center">
              <div className="bg-[#120d2a] p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">درآمد کل نهایی:</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {formatToman(totalRevenue)}
                </span>
              </div>
              <div className="bg-[#120d2a] p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">پروژه‌های تحویلی:</span>
                <span className="text-xs font-bold text-violet-300 font-mono">
                  {completedCount} مورد
                </span>
              </div>
              <div className="bg-[#120d2a] p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">پروژه‌های در صف طراحی:</span>
                <span className="text-xs font-bold text-amber-300 font-mono">
                  {inProgressCount} مورد
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Category Breakdown View */
        <div className="bg-[#0d091e] border border-violet-900/40 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>تحلیل بازدهی و سهم هر یک از خدمات استودیو ویراگرافیک</span>
            </h3>
            <span className="text-xs text-violet-300 font-mono">مجموع درآمد: {formatToman(totalRevenue)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {categoriesList.map((cat) => {
              const maxCatRev = Math.max(...categoriesList.map((c) => c.revenue), 1);
              const pct = Math.max(8, Math.round((cat.revenue / maxCatRev) * 100));

              return (
                <div
                  key={cat.key}
                  className="bg-[#130d2b] border border-violet-900/30 rounded-xl p-3.5 space-y-2 hover:border-violet-500/40 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md" style={{ backgroundColor: cat.color }} />
                      <span className="text-white font-bold">{cat.title}</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold">{formatToman(cat.revenue)}</span>
                  </div>

                  <div className="w-full bg-[#0a0714] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>تعداد سفارش‌های ثبت شده: {cat.count} پروژه</span>
                    <span>سهم نسبی: {pct}٪</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
