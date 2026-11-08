import React, { useState, useEffect } from 'react';
import {
  Github,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Smartphone,
  Play,
  ShoppingBag,
  Terminal,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  FolderArchive,
  Layers,
  Key,
  FileCode,
  X,
  Check,
} from 'lucide-react';
import { VIRAGRAPHY_LOGO } from '../data/initialData';

interface GitHubAndApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubAndApkModal: React.FC<GitHubAndApkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'github' | 'bazaar' | 'google_play' | 'actions'>(
    'github'
  );

  // GitHub Form state
  const [repoUrl, setRepoUrl] = useState('https://github.com/nasertavakkoliii/viragraphy.git');
  const [githubToken, setGithubToken] = useState('');
  const [commitMessage, setCommitMessage] = useState(
    'Initial upload: Viragraphy Graphic Platform, Telegram Bot & Android TWA'
  );
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message?: string;
    commitSha?: string;
    error?: string;
    details?: string;
  } | null>(null);

  // Live Git Status
  const [gitStatus, setGitStatus] = useState<{
    initialized: boolean;
    currentBranch?: string;
    latestCommit?: string;
    remoteUrl?: string;
  } | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/github/status');
      const data = await res.json();
      if (data.ok) {
        setGitStatus(data);
        if (data.remoteUrl) {
          setRepoUrl(data.remoteUrl);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setPushResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePushToGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setPushResult({
        success: false,
        error: 'لطفاً آدرس ریپازیتوری گیت‌هاب را وارد فرمایید.',
      });
      return;
    }

    setIsPushing(true);
    setPushResult(null);

    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          token: githubToken.trim(),
          branch: 'main',
          commitMessage: commitMessage.trim(),
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setPushResult({
          success: true,
          message: data.message,
          commitSha: data.commitSha,
        });
        fetchStatus();
      } else {
        setPushResult({
          success: false,
          error: data.error || 'خطا در برقراری ارتباط با گیت‌هاب',
          details: data.details,
        });
      }
    } catch (err: any) {
      setPushResult({
        success: false,
        error: 'خطای شبکه در ارتباط با سرور: ' + err.message,
      });
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-md text-right overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#110c24] border border-violet-700/60 rounded-2xl sm:rounded-3xl shadow-2xl shadow-violet-950/90 overflow-hidden max-h-[92vh] flex flex-col mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-[#181034] via-[#140e2c] to-[#110c24] border-b border-violet-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/50 flex items-center justify-center text-violet-300 shadow-md shrink-0">
              <Github className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  اتصال به گیت‌هاب و خروجی APK (گوگل پلی و کافه بازار)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                  آماده انتشار
                </span>
              </div>
              <p className="text-[11px] text-violet-300/80 mt-0.5">
                آپلود ۰ تا ۱۰۰ به GitHub و آماده‌سازی فایل‌های اندروید با شناسه ir.viragraphy.app
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 pt-2.5 sm:pt-3 bg-[#0d091e] border-b border-violet-900/30 text-xs overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs font-medium ${
              activeTab === 'github'
                ? 'border-violet-500 text-violet-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>آپلود مستقیم به GitHub (۰ تا ۱۰۰)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bazaar')}
            className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs font-medium ${
              activeTab === 'bazaar'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>انتشار در کافه بازار (APK)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google_play')}
            className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs font-medium ${
              activeTab === 'google_play'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4 text-indigo-400" />
            <span>انتشار در گوگل پلی (Google Play)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('actions')}
            className={`px-3.5 py-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-xs font-medium ${
              activeTab === 'actions'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>بیلد خودکار APK با GitHub Actions</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* TAB 1: GITHUB CONNECT & PUSH */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              {/* Git Status Card */}
              <div className="bg-[#0c081c] border border-violet-900/40 rounded-2xl p-3.5 sm:p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>مخزن محلی Git آماده و ایندکس‌شده است</span>
                  </span>
                  <button
                    onClick={fetchStatus}
                    disabled={isLoadingStatus}
                    className="text-violet-400 hover:text-violet-300 flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                    <span>بروزرسانی وضعیت</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                  <div className="bg-[#140e2b] p-2 rounded-xl border border-violet-900/30">
                    <span className="text-slate-400 block text-[10px]">شاخه پیش‌فرض:</span>
                    <span className="text-violet-300 font-bold">{gitStatus?.currentBranch || 'main'}</span>
                  </div>
                  <div className="bg-[#140e2b] p-2 rounded-xl border border-violet-900/30">
                    <span className="text-slate-400 block text-[10px]">آخرین کامیت آماده:</span>
                    <span className="text-emerald-400 truncate block" title={gitStatus?.latestCommit}>
                      {gitStatus?.latestCommit || 'Initial commit ready'}
                    </span>
                  </div>
                  <div className="bg-[#140e2b] p-2 rounded-xl border border-violet-900/30">
                    <span className="text-slate-400 block text-[10px]">ایمیل ثبت‌شده گیت:</span>
                    <span className="text-violet-200">nasertavakkoliii@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* Push Form */}
              <form onSubmit={handlePushToGithub} className="bg-[#140e2b] border border-violet-700/50 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-violet-400" />
                    <span>آپلود مستقیم و فوری به ریپازیتوری گیت‌هاب</span>
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    با وارد کردن آدرس مخزن و Personal Access Token، سرور به طور مستقیم تمام ۳۸ فایل پروژه (سورس React، سرور Express، بات تلگرام و پروژه Android) را به گیت‌هاب شما پوش (Push) می‌کند.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-xs">
                      آدرس ریپازیتوری در گیت‌هاب (Repository URL) *
                    </label>
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/viragraphy.git"
                      className="w-full bg-[#0c081c] border border-violet-900/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-hidden focus:border-violet-500 text-left"
                      dir="ltr"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-300 font-semibold text-xs flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>توکن دسترسی گیت‌هاب (GitHub Personal Access Token) *</span>
                      </label>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo&description=Viragraphy+Deploy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 text-[11px] flex items-center gap-1 underline"
                      >
                        <span>ساخت توکن در ۱ دقیقه (کلیک کنید)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-[#0c081c] border border-violet-900/50 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-hidden focus:border-violet-500 text-left"
                      dir="ltr"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      💡 راهنما: در گیت‌هاب به مسیر Settings &gt; Developer settings &gt; Personal access tokens &gt; Tokens (classic) رفته، گزینه Generate new token را زده و تیک <strong>repo</strong> را فعال کنید.
                    </p>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1 text-xs">
                      پیام کامیت (Commit Message)
                    </label>
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      className="w-full bg-[#0c081c] border border-violet-900/50 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* Submit Push Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <button
                    type="submit"
                    disabled={isPushing}
                    className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isPushing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>در حال آپلود ۰ تا ۱۰۰ به گیت‌هاب... لطفاً منتظر بمانید</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>🚀 آپلود ۰ تا ۱۰۰ تمام فایل‌ها به گیت‌هاب</span>
                      </>
                    )}
                  </button>

                  <a
                    href="/api/export/project-zip"
                    download="viragraphy-source-code.zip"
                    className="py-3 px-4 rounded-xl bg-[#0c081c] hover:bg-[#181136] border border-violet-700/50 text-violet-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <FolderArchive className="w-4 h-4 text-emerald-400" />
                    <span>دانلود مستقیم ZIP سورس‌کد</span>
                  </a>
                </div>
              </form>

              {/* Push Feedback Result */}
              {pushResult && (
                <div
                  className={`p-4 rounded-2xl border space-y-2 animate-fadeIn ${
                    pushResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {pushResult.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{pushResult.message}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{pushResult.error}</span>
                      </>
                    )}
                  </div>

                  {pushResult.success && repoUrl && (
                    <div className="pt-1 flex items-center gap-2">
                      <a
                        href={repoUrl.replace('.git', '')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition"
                      >
                        <span>مشاهده ریپازیتوری در گیت‌هاب</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {pushResult.details && (
                    <pre className="text-[10px] font-mono bg-black/60 p-2.5 rounded-xl overflow-x-auto text-slate-300 mt-2 max-h-32 text-left" dir="ltr">
                      {pushResult.details}
                    </pre>
                  )}
                </div>
              )}

              {/* Terminal Instructions */}
              <div className="bg-[#0c081c] border border-violet-900/30 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                    <Terminal className="w-3.5 h-3.5 text-violet-400" />
                    <span>دستورات خط فرمان (در صورت تمایل به اجرای دستی در ترمینال):</span>
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `git remote add origin ${repoUrl}\ngit branch -M main\ngit push -u origin main --force`,
                        'cmd_git'
                      )
                    }
                    className="text-violet-400 hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedId === 'cmd_git' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">کپی شد!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی دستورات</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#130d29] p-3 rounded-xl text-[11px] font-mono text-violet-300 overflow-x-auto text-left" dir="ltr">
{`git remote add origin ${repoUrl}
git branch -M main
git push -u origin main --force`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: CAFE BAZAAR APK EXPORT */}
          {activeTab === 'bazaar' && (
            <div className="space-y-4">
              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <span>راهنمای انتشار برنامه در کافه بازار (Cafe Bazaar)</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  کافه بازار بزرگترین استور اپلیکیشن‌های اندرویدی در ایران است. کلیه تنظیمات استاندارد، نام بسته و گواهینامه‌های لازم در پروژه اعمال شده‌اند.
                </p>
              </div>

              {/* Package Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#0c081c] border border-violet-900/40 p-3.5 rounded-2xl space-y-1">
                  <span className="text-slate-400 text-[11px] block">نام پکیج اندروید (Application ID):</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-white font-bold text-xs" dir="ltr">ir.viragraphy.app</span>
                    <button
                      onClick={() => handleCopy('ir.viragraphy.app', 'pkg_name')}
                      className="text-violet-400 hover:text-white p-1"
                      title="کپی نام بسته"
                    >
                      {copiedId === 'pkg_name' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="bg-[#0c081c] border border-violet-900/40 p-3.5 rounded-2xl space-y-1">
                  <span className="text-slate-400 text-[11px] block">شماره نسخه و کد نسخه (Version):</span>
                  <span className="font-mono text-white font-bold text-xs">Version 1.0.0 (Code 1)</span>
                </div>

                <div className="bg-[#0c081c] border border-violet-900/40 p-3.5 rounded-2xl space-y-1">
                  <span className="text-slate-400 text-[11px] block">حداقل و حداکثر نسخه اندروید:</span>
                  <span className="font-mono text-emerald-300 text-xs">Min SDK: 21 (Android 5.0) | Target SDK: 34</span>
                </div>

                <div className="bg-[#0c081c] border border-violet-900/40 p-3.5 rounded-2xl space-y-1">
                  <span className="text-slate-400 text-[11px] block">دسترسی‌های امنیتی مورد نیاز در منیفست:</span>
                  <span className="font-mono text-slate-300 text-[11px]">INTERNET, ACCESS_NETWORK_STATE</span>
                </div>
              </div>

              {/* Step by Step in Cafe Bazaar */}
              <div className="bg-[#140e2b] border border-violet-800/40 rounded-2xl p-4 sm:p-5 space-y-3">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>مراحل انتشار در پنل توسعه‌دهندگان کافه بازار (developers.cafebazaar.ir):</span>
                </h4>

                <ol className="list-decimal list-inside space-y-2 text-slate-300 text-xs leading-relaxed">
                  <li>
                    وارد پنل توسعه‌دهندگان بازار شده و دکمه <strong>«برنامه جدید»</strong> را بزنید.
                  </li>
                  <li>
                    فایل <strong>viragraphy-release.apk</strong> بیلد شده از تب GitHub Actions یا خروجی اندروید استودیو را بارگذاری کنید.
                  </li>
                  <li>
                    عنوان فارسی را <strong>استودیو طراحی گرافیک ویراگرافیک</strong> و دسته‌بندی را <strong>ابزارها / گرافیک</strong> انتخاب کنید.
                  </li>
                  <li>
                    آیکون با وضوح ۵۱۲×۵۱۲ (همان لوگوی ویراگرافیک در پوشه assets) و اسکرین‌شات‌های موبایل را آپلود کنید.
                  </li>
                  <li>
                    متن معرفی: <em>«سامانه سفارش آنلاین طراحی گرافیک، هویت بصری، پوستر و بنر، هماهنگ با ربات تلگرام ویراگرافیک»</em>.
                  </li>
                  <li>
                    روی گزینه <strong>«ارسال برای بررسی و انتشار»</strong> کلیک نمایید تا ظرف چند ساعت در استور منتشر شود.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE PLAY CONSOLE */}
          {activeTab === 'google_play' && (
            <div className="space-y-4">
              <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Play className="w-5 h-5 text-indigo-400" />
                  <span>شرایط انتشار در گوگل پلی (Google Play Console)</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  گوگل پلی از سال ۲۰۲۱ انتشار برنامه‌های جدید را منوط به فرمت <strong>AAB (Android App Bundle)</strong> و رعایت <strong>Target SDK 34+</strong> کرده است. هر دو مورد در پروژه پیاده‌سازی شده‌اند.
                </p>
              </div>

              <div className="bg-[#140e2b] border border-violet-800/40 rounded-2xl p-4 sm:p-5 space-y-3 text-xs leading-relaxed">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>فایل Digital Asset Links (تأییدیه رسمی دامنه):</span>
                </h4>
                <p className="text-slate-300">
                  برای اینکه گوگل پلی برنامه را به عنوان یک TWA (Trusted Web Activity) رسمی و بدون نوار آدرس مرورگر اجرا کند، فایل <code className="bg-[#0c081c] px-1.5 py-0.5 rounded text-violet-300 font-mono">public/.well-known/assetlinks.json</code> در ریشه وب‌سایت ایجاد و فعال شده است.
                </p>

                <div className="pt-2">
                  <span className="text-slate-400 text-[11px] block mb-1">مسیر دسترسی استاندارد گوگل به فایل شما:</span>
                  <div className="flex items-center justify-between bg-[#0c081c] p-2.5 rounded-xl border border-violet-900/40 font-mono text-violet-300 text-[11px]" dir="ltr">
                    <span>/.well-known/assetlinks.json</span>
                    <a
                      href="/.well-known/assetlinks.json"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-white flex items-center gap-1 text-[10px]"
                    >
                      <span>تست فایل</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GITHUB ACTIONS CI/CD */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div className="bg-purple-950/30 border border-purple-500/40 rounded-2xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>بیلد اتوماتیک و ابری APK در گیت‌هاب (GitHub Actions CI/CD)</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  فایل گردش‌کار خودکار <strong>.github/workflows/build-apk.yml</strong> با موفقیت در سورس پروژه ساخته شده است. این سیستم به شما امکان می‌دهد بدون نیاز به نصب اندروید استودیو یا نرم‌افزارهای سنگین، فایل‌های آماده نصب را مستقیماً از گیت‌هاب دانلود کنید.
                </p>
              </div>

              <div className="bg-[#140e2b] border border-violet-800/40 rounded-2xl p-4 sm:p-5 space-y-3 text-xs leading-relaxed">
                <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>چگونه با هر بار پوش، خروجی APK را از گیت‌هاب تحویل بگیریم؟</span>
                </h4>

                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>
                    در تب اول همین پنجره، دکمه <strong>«🚀 آپلود ۰ تا ۱۰۰ تمام فایل‌ها به گیت‌هاب»</strong> را بزنید.
                  </li>
                  <li>
                    به مخزن گیت‌هاب خود مراجعه نموده و روی تب <strong>Actions</strong> کلیک کنید.
                  </li>
                  <li>
                    گردش‌کار <strong>Build Viragraphy Android APK &amp; AAB</strong> را به صورت زنده و در حال اجرا مشاهده خواهید کرد.
                  </li>
                  <li>
                    پس از ۲ دقیقه، در بخش <strong>Artifacts</strong> دو فایل زیر برای دانلود مستقیم قرار می‌گیرند:
                    <ul className="list-disc list-inside mr-4 mt-1 text-violet-300 font-mono text-[11px] space-y-0.5">
                      <li>viragraphy-release-apk (فایل نصبی مستقیم برای گوشی و کافه بازار)</li>
                      <li>viragraphy-release-aab (بسته رسمی برای کنسول گوگل پلی)</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-[#0d091e] border-t border-violet-900/40 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>پروژه آماده استقرار روی GitHub و انتشار در مارکت‌ها</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-violet-950/60 hover:bg-violet-900/50 border border-violet-800/50 text-violet-200 transition cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
