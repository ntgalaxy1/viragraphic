import React, { useState, useEffect } from 'react';
import { 
  Send, Bot, Settings, CheckCircle, RefreshCw,
  Terminal, Smartphone, ExternalLink, AlertCircle, UserCheck, Activity, Sparkles
} from 'lucide-react';
import { TelegramConfig, Project } from '../types';
import { formatToman, getStatusLabel } from '../utils/formatters';
import { VIRAGRAPHY_LOGO } from '../data/initialData';
import { fetchBotInfo, fetchBotUpdates } from '../utils/telegramService';

interface TelegramBotModalProps {
  config: TelegramConfig;
  onUpdateConfig: (newConfig: TelegramConfig) => void;
  onTestSend: (targetChat: string, text: string) => Promise<{ success: boolean; error?: string; needsStart?: boolean }>;
  latestProject?: Project;
}

interface SimulatedCustomerMsg {
  id: string;
  sender: 'customer' | 'bot_card';
  text: string;
  timestamp: string;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({
  config,
  onUpdateConfig,
  onTestSend,
  latestProject,
}) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'miniapp_guide' | 'settings' | 'logs'>('simulator');
  const [testChatId, setTestChatId] = useState(config.adminChatId || '@Ntgalaxy1');
  const [testText, setTestText] = useState('سلام مدیریت محترم! این یک پیام آزمایشی از سامانه سفارشات ویراگرافیک است.');
  const [isSending, setIsSending] = useState(false);
  const [isSendingStatusCard, setIsSendingStatusCard] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Interactive simulator chat state (shows how customer message triggers Mini Status Card)
  const [simCustomerInput, setSimCustomerInput] = useState('');
  const [simulatedConversation, setSimulatedConversation] = useState<SimulatedCustomerMsg[]>([
    {
      id: 'sim_1',
      sender: 'customer',
      text: 'سلام وقت بخیر، وضعیت آخرین سفارش من در چه مرحله‌ای هست؟',
      timestamp: '۱۴:۲۰',
    },
    {
      id: 'sim_2',
      sender: 'bot_card',
      text: 'کارت وضعیت خودکار آخرین سفارش',
      timestamp: '۱۴:۲۰',
    },
  ]);

  // Bot Token state
  const [botToken, setBotToken] = useState(config.botToken);
  const [adminChatId, setAdminChatId] = useState(config.adminChatId);
  const [botUsername, setBotUsername] = useState(config.botUsername);
  const [isSimulated, setIsSimulated] = useState(config.isSimulated);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live status
  const [, setBotLiveInfo] = useState<{ isConnected: boolean; name?: string; username?: string }>({
    isConnected: true,
    name: 'ویراگرافیک',
    username: 'Viragraphicbot',
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  useEffect(() => {
    if (botToken) {
      fetchBotInfo(botToken).then((data) => {
        if (data.ok) {
          setBotLiveInfo({
            isConnected: true,
            name: data.result?.first_name,
            username: data.result?.username,
          });
        }
      });
    }
  }, [botToken]);

  // Helper to build the compact status card text for real Telegram send
  const buildLiveMiniCardMessage = (proj?: Project) => {
    if (!proj) {
      return `📊 کارت وضعیت آخرین سفارش شما\nدر حال حاضر سفارش فعالی ثبت نشده است.`;
    }
    const statusMeta = getStatusLabel(proj.status);
    const progressMap: Record<string, { bar: string; pct: number }> = {
      submitted: { bar: '🟣⚪⚪⚪⚪⚪', pct: 15 },
      proposal_ready: { bar: '🟣🟣⚪⚪⚪⚪', pct: 35 },
      in_progress: { bar: '🟣🟣🟣⚪⚪⚪', pct: 50 },
      draft_ready: { bar: '🟣🟣🟣🟣⚪⚪', pct: 70 },
      revision_requested: { bar: '🟣🟣🟣🟣⚪⚪', pct: 75 },
      approved_final: { bar: '🟣🟣🟣🟣🟣⚪', pct: 90 },
      completed: { bar: '🟣🟣🟣🟣🟣🟣', pct: 100 },
    };
    const prog = progressMap[proj.status] || { bar: '🟣🟣⚪⚪⚪⚪', pct: 30 };
    const costStr = proj.proposal?.costToman
      ? formatToman(proj.proposal.costToman)
      : 'در انتظار برآورد';
    const deliveryStr = proj.proposal?.estimatedDays
      ? `${proj.proposal.estimatedDays} روز کاری`
      : proj.preferredDeadline || 'طبق توافق';

    return `┌──────────────────────────
📊 <b>کارت وضعیت آخرین سفارش شما</b>
├──────────────────────────
🔖 <b>کد سفارش:</b> <code>${proj.orderCode}</code>
🎨 <b>عنوان:</b> ${proj.title}
🟢 <b>وضعیت فعلی:</b> <b>${statusMeta.label}</b>
📈 <b>پیشرفت:</b> ${prog.bar} (${prog.pct}٪)
📍 <b>گام اجرایی:</b> مرحله ${statusMeta.stepNumber} از ۷
💳 <b>برآورد هزینه:</b> ${costStr}
📅 <b>موعد تحویل:</b> ${deliveryStr}
└──────────────────────────`;
  };

  const handleSendRealMiniStatusCard = async () => {
    setIsSendingStatusCard(true);
    setSendFeedback(null);
    const cardText = buildLiveMiniCardMessage(latestProject);
    const result = await onTestSend(testChatId.trim(), cardText);
    setIsSendingStatusCard(false);

    if (result.success) {
      setSendFeedback({
        text: `📊 کارت وضعیت کوچک سفارش (${latestProject?.orderCode || 'VRA'}) با موفقیت به تلگرام ${testChatId} ارسال شد!`,
        type: 'success',
      });
    } else {
      setSendFeedback({
        text: `خطا در ارسال کارت وضعیت: ${result.error || 'ارسال ناموفق بود'}`,
        type: 'error',
      });
    }
  };

  const handleSimulatedCustomerSend = (customMessage?: string) => {
    const msgToSend = (customMessage ?? simCustomerInput).trim();
    if (!msgToSend) return;

    const nowTime = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: SimulatedCustomerMsg = {
      id: 'sim_u_' + Date.now(),
      sender: 'customer',
      text: msgToSend,
      timestamp: nowTime,
    };
    const botReplyCard: SimulatedCustomerMsg = {
      id: 'sim_b_' + (Date.now() + 1),
      sender: 'bot_card',
      text: 'کارت وضعیت خودکار آخرین سفارش',
      timestamp: nowTime,
    };

    setSimulatedConversation((prev) => [...prev, userMsg, botReplyCard]);
    if (!customMessage) {
      setSimCustomerInput('');
    }
  };

  const handleSyncUpdates = async () => {
    setIsCheckingUpdates(true);
    const data = await fetchBotUpdates(botToken);
    setIsCheckingUpdates(false);

    if (data.ok && Array.isArray(data.result)) {
      const usersMap = new Map();
      data.result.forEach((u: any) => {
        const from = u.message?.from || u.callback_query?.from;
        if (from) {
          usersMap.set(from.id, {
            id: from.id,
            username: from.username ? `@${from.username}` : 'بدون نام کاربری',
            name: [from.first_name, from.last_name].filter(Boolean).join(' '),
            date: u.message?.date ? new Date(u.message.date * 1000).toLocaleTimeString('fa-IR') : '',
          });
        }
      });
      const unique = Array.from(usersMap.values());
      setRecentUsers(unique);

      const adminMatch = unique.find(
        (u) => u.username?.toLowerCase() === adminChatId.toLowerCase()
      );
      if (adminMatch) {
        setTestChatId(String(adminMatch.id));
        setSendFeedback({
          text: `چت‌آیدی عددی ${adminChatId} شناسایی شد: ${adminMatch.id}`,
          type: 'success',
        });
      } else {
        setSendFeedback({
          text: `تعداد ${unique.length} کاربر در تاریخچه ربات یافت شد.`,
          type: 'success',
        });
      }
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      ...config,
      botToken: botToken.trim(),
      adminChatId: adminChatId.trim(),
      botUsername: botUsername.trim() || '@Viragraphicbot',
      isSimulated,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTriggerTest = async () => {
    if (!testText.trim()) return;
    setIsSending(true);
    setSendFeedback(null);
    const result = await onTestSend(testChatId.trim(), testText.trim());
    setIsSending(false);

    if (result.success) {
      setSendFeedback({
        text: `پیام با موفقیت به تلگرام ${testChatId} ارسال شد!`,
        type: 'success',
      });
    } else if (result.needsStart) {
      setSendFeedback({
        text: `⚠️ کاربر ${testChatId} هنوز ربات را در تلگرام استارت نکرده است. لطفاً ابتدا در تلگرام دکمه Start را در @${botUsername.replace('@', '')} بزنید.`,
        type: 'warning',
      });
    } else {
      setSendFeedback({
        text: `خطا در ارسال: ${result.error || 'ارسال ناموفق بود'}`,
        type: 'error',
      });
    }
  };

  const latestStatusMeta = latestProject ? getStatusLabel(latestProject.status) : null;
  const latestProgressPct = latestProject
    ? latestProject.status === 'submitted'
      ? 15
      : latestProject.status === 'proposal_ready'
      ? 35
      : latestProject.status === 'in_progress'
      ? 50
      : latestProject.status === 'draft_ready'
      ? 70
      : latestProject.status === 'revision_requested'
      ? 75
      : latestProject.status === 'approved_final'
      ? 90
      : 100
    : 70;

  return (
    <div className="space-y-6 text-right">
      {/* Header & Connection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-violet-900/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                ربات تلگرام ویراگرافیک (Viragraphicbot)
              </h1>
              <p className="text-xs text-violet-300/70 mt-0.5">
                مجهز به پاسخگوی خودکار «کارت وضعیت کوچک آخرین سفارش» به محض دریافت پیام از مشتری
              </p>
            </div>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-2">
          <a
            href={`https://t.me/${(config.botUsername || 'Viragraphicbot').replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ربات فعال: {config.botUsername || '@Viragraphicbot'}</span>
            <ExternalLink className="w-3 h-3 text-emerald-400 mr-1" />
          </a>
        </div>
      </div>

      {/* Connection Quick Guide Banner */}
      <div className="bg-gradient-to-r from-violet-950/70 via-[#140e2b] to-[#120c27] border border-violet-500/40 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-0.5 shrink-0 border border-violet-400/50">
            <img src={VIRAGRAPHY_LOGO} alt="" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>پاسخگوی هوشمند کارت وضعیت سفارش در @Viragraphicbot فعال است</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px]">
                جدید
              </span>
            </h3>
            <p className="text-xs text-violet-200/80 mt-1 leading-relaxed max-w-2xl">
              هر زمان مشتری یا مدیر (<strong>{config.adminChatId || '@Ntgalaxy1'}</strong>) در تلگرام به ربات پیام بدهد، ربات به صورت خودکار <strong>کارت وضعیت کوچک آخرین سفارش</strong> شامل نوار پیشرفت، مرحله فعلی، هزینه و زمان تحویل را نمایش می‌دهد.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          <a
            href={`https://t.me/${(config.botUsername || 'Viragraphicbot').replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-600/30 transition whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>باز کردن @Viragraphicbot در تلگرام</span>
          </a>

          <button
            onClick={handleSyncUpdates}
            disabled={isCheckingUpdates}
            className="px-3.5 py-2 rounded-xl border border-violet-700 bg-[#191136] hover:bg-[#211747] text-xs text-violet-200 font-medium transition flex items-center gap-1 whitespace-nowrap"
            title="بررسی کاربران استارت زده"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin text-violet-400' : ''}`} />
            <span>همگام‌سازی چت‌آیدی</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-violet-900/30 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'simulator'
              ? 'text-violet-400 border-violet-500 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-violet-400" />
          <span>شبیه‌ساز کارت وضعیت و تست ارسال زنده</span>
        </button>

        <button
          onClick={() => setActiveTab('miniapp_guide')}
          className={`px-4 py-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'miniapp_guide'
              ? 'text-amber-400 border-amber-500 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>راهنمای مینی‌اپ و رفع خطای ۴۰۳</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'logs'
              ? 'text-violet-400 border-violet-500 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>لاگ پیام‌های تلگرام ({config.logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 transition-colors border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'settings'
              ? 'text-violet-400 border-violet-500 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>تنظیمات توکن و شناسه مدیریت</span>
        </button>
      </div>

      {/* TAB 1: Test & Simulator */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Test Dispatch Form */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Mini Status Card Dispatcher */}
            <div className="bg-gradient-to-br from-[#191136] via-[#120c26] to-[#0d081d] border border-violet-500/40 rounded-2xl p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>کارت وضعیت کوچک آخرین سفارش در تلگرام</span>
                </h3>
                <span className="text-[10px] font-mono text-violet-300 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-700/50">
                  {latestProject?.orderCode || 'VRA-8492'}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                وقتی مشتری در تلگرام به ربات پیام می‌دهد، این کارت وضعیت کوچک به صورت خودکار برای او ارسال می‌شود. همچنین می‌توانید همین الان آن را به تلگرام واقعی ارسال کنید:
              </p>

              {latestProject && latestStatusMeta && (
                <div className="p-3.5 rounded-xl bg-[#0b0718] border border-violet-800/50 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-violet-300">📊 کارت وضعیت آخرین سفارش شما</span>
                    <span className="font-mono text-[10px] text-emerald-400">{latestProject.orderCode}</span>
                  </div>
                  <div className="text-white font-semibold truncate">{latestProject.title}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span>وضعیت: <strong className="text-emerald-300">{latestStatusMeta.label}</strong></span>
                    <span className="font-mono">{latestProgressPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-violet-500 to-emerald-400 rounded-full"
                      style={{ width: `${latestProgressPct}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isSendingStatusCard}
                onClick={handleSendRealMiniStatusCard}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isSendingStatusCard
                    ? 'در حال ارسال کارت وضعیت به تلگرام...'
                    : `ارسال واقعی کارت وضعیت به تلگرام (${testChatId})`}
                </span>
              </button>
            </div>

            {/* Custom Text Test Dispatch */}
            <div className="bg-[#110c24] border border-violet-900/40 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-violet-400" />
                <span>ارسال پیام دلخواه به مدیریت (@Ntgalaxy1)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1">گیرنده (آیدی یا چت‌آیدی تلگرام):</label>
                  <input
                    type="text"
                    value={testChatId}
                    onChange={(e) => setTestChatId(e.target.value)}
                    dir="ltr"
                    className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-violet-500"
                    placeholder="@Ntgalaxy1"
                  />
                  <p className="text-[10px] text-violet-300/70 mt-1">
                    پیش‌فرض: مدیر سیستم (<strong>{config.adminChatId || '@Ntgalaxy1'}</strong>)
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">متن پیام ارسالی از بات:</label>
                  <textarea
                    rows={2}
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl p-3 text-white focus:outline-hidden focus:border-violet-500 leading-relaxed"
                  />
                </div>

                {sendFeedback && (
                  <div
                    className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                      sendFeedback.type === 'success'
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : sendFeedback.type === 'warning'
                        ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                        : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {sendFeedback.text}
                  </div>
                )}

                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleTriggerTest}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSending ? (
                    <span>در حال ارسال از سرور به تلگرام...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>ارسال پیام واقعی به تلگرام</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List of detected active users who started the bot */}
            {recentUsers.length > 0 && (
              <div className="bg-[#110c24] border border-violet-900/40 rounded-2xl p-4 shadow-lg space-y-2 text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  کاربران فعال در ربات:
                </span>
                <div className="space-y-1.5 pt-1">
                  {recentUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setTestChatId(String(u.id))}
                      className="w-full p-2 rounded-xl bg-[#0c081c] hover:bg-[#161030] border border-violet-900/30 flex items-center justify-between text-[11px] transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-violet-400">{u.username}</span>
                        <span className="text-slate-300">({u.name})</span>
                      </div>
                      <span className="font-mono text-slate-500 text-[10px]">ID: {u.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Telegram Phone Simulator Frame */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-md rounded-[32px] border-4 border-violet-950 bg-[#0e1621] shadow-2xl overflow-hidden flex flex-col h-[640px]">
              {/* Telegram App Header with real Viragraphy logo */}
              <div className="bg-[#17212b] px-4 py-3 border-b border-slate-800 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-violet-500/50 bg-white p-0.5 shrink-0">
                    <img
                      src={VIRAGRAPHY_LOGO}
                      alt="Viragraphicbot"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-xs block">ویراگرافیک (Viragraphy)</span>
                    <span className="text-[10px] text-violet-400 block font-mono">@Viragraphicbot · پاسخگوی خودکار وضعیت</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">⋮</div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#0e1621] text-xs">
                <div className="text-center my-1">
                  <span className="bg-[#182533] text-slate-400 text-[10px] px-3 py-1 rounded-full">
                    هر پیامی بفرستید، کارت وضعیت آخرین سفارش نمایش داده می‌شود
                  </span>
                </div>

                {/* Simulated Interactive Conversation with Mini Status Card */}
                {simulatedConversation.map((item) => {
                  if (item.sender === 'customer') {
                    return (
                      <div key={item.id} className="flex justify-end">
                        <div className="bg-violet-700 text-white px-3.5 py-2 rounded-2xl rounded-tr-xs max-w-[82%] text-[11px] leading-relaxed shadow">
                          <p>{item.text}</p>
                          <span className="block text-[9px] text-violet-200/80 text-left mt-1 font-mono">
                            {item.timestamp} ✓✓
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Compact Order Status Card in Telegram
                  return (
                    <div key={item.id} className="flex justify-start">
                      <div className="bg-[#182533] text-slate-100 p-3 rounded-2xl rounded-tl-xs w-[92%] space-y-2.5 border border-violet-500/40 text-[11px] shadow-lg">
                        {/* Mini Card Header */}
                        <div className="flex items-center justify-between border-b border-slate-700/70 pb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-bold text-violet-300 text-xs">
                              📊 کارت وضعیت آخرین سفارش شما
                            </span>
                          </div>
                          <span className="font-mono text-[10px] bg-[#0e1621] text-violet-300 px-2 py-0.5 rounded border border-violet-800/50">
                            {latestProject?.orderCode || 'VRA-8492'}
                          </span>
                        </div>

                        {/* Order Title & Customer */}
                        <div className="space-y-1">
                          <div className="font-bold text-white text-xs leading-snug">
                            🎨 {latestProject?.title || 'طراحی لوگو و هویت بصری برند عطر «نارسیس»'}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-300 pt-0.5">
                            <span>وضعیت فعلی:</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                              {latestStatusMeta?.label || 'اتود آماده بررسی'}
                            </span>
                          </div>
                        </div>

                        {/* Visual Step Progress Bar */}
                        <div className="bg-[#0e1621] p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400">
                              📍 مرحله {latestStatusMeta?.stepNumber || 5} از ۷
                            </span>
                            <span className="font-mono text-violet-300 font-bold">
                              {latestProgressPct}٪ پیشرفت
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-l from-violet-500 via-fuchsia-500 to-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: `${latestProgressPct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>
                              💳 مبلغ:{' '}
                              <strong className="text-slate-200 font-mono">
                                {latestProject?.proposal
                                  ? formatToman(latestProject.proposal.costToman)
                                  : '۹,۸۰۰,۰۰۰ تومان'}
                              </strong>
                            </span>
                            <span>
                              📅 تحویل:{' '}
                              <strong className="text-slate-200">
                                {latestProject?.proposal?.estimatedDays
                                  ? `${latestProject.proposal.estimatedDays} روز کاری`
                                  : latestProject?.preferredDeadline || '۶ روز کاری'}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Inline Buttons inside Telegram Card */}
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => handleSimulatedCustomerSend('📊 بروزرسانی کارت وضعیت')}
                            className="py-1.5 px-2 rounded-lg bg-[#242f3d] hover:bg-[#2c394b] text-violet-300 font-medium text-center border border-violet-500/20 transition cursor-pointer"
                          >
                            🔄 بروزرسانی وضعیت
                          </button>
                          <button
                            type="button"
                            onClick={handleSendRealMiniStatusCard}
                            className="py-1.5 px-2 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 text-white font-medium text-center border border-violet-500/40 transition cursor-pointer"
                          >
                            📲 ارسال به تلگرام واقعی
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Message Input + Quick Buttons */}
              <div className="bg-[#17212b] p-2.5 border-t border-slate-800 space-y-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSimulatedCustomerSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={simCustomerInput}
                    onChange={(e) => setSimCustomerInput(e.target.value)}
                    placeholder="پیام مشتری را بنویسید (مثلاً: سفارشم کجاست؟)..."
                    className="flex-1 bg-[#0e1621] border border-slate-700/80 rounded-xl px-3 py-2 text-[11px] text-white placeholder:text-slate-500 focus:outline-hidden focus:border-violet-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ارسال</span>
                  </button>
                </form>

                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSimulatedCustomerSend('📊 کارت وضعیت آخرین سفارش')}
                    className="p-1.5 rounded-xl bg-[#242f3d] hover:bg-[#2b3a4c] text-violet-300 text-[10px] text-center font-medium transition cursor-pointer"
                  >
                    📊 کارت وضعیت آخرین سفارش
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulatedCustomerSend('سلام، اتود سفارش من آماده شده؟')}
                    className="p-1.5 rounded-xl bg-[#242f3d] hover:bg-[#2b3a4c] text-slate-200 text-[10px] text-center font-medium transition cursor-pointer"
                  >
                    💬 تست پیام مشتری به ربات
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Mini App & 403 Explanation */}
      {activeTab === 'miniapp_guide' && (
        <div className="space-y-4 text-xs">
          {/* Main Error Explanation Card */}
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>چرا هنگام باز کردن مینی‌اپلیکیشن در تلگرام خطای «Google 403» نمایش داده شد؟</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-xs">
              پیغام <strong>Google 403. That's an error. We're sorry, but you do not have access to this page</strong> به دلیل پروتکل امنیتی <strong>Google IAP (سد امنیتی سرور پیش‌نمایش گوگل استودیو)</strong> است. سرور توسعه‌ای که در حال حاضر برنامه روی آن اجرا می‌شود دارای سرفصل‌های امنیتی و بررسی کوکی گوگل است؛ لذا وب‌ویوی داخلی نرم‌افزار تلگرام به دلیل نداشتن کوکی‌های امنیتی گوگل توسط فایروال گوگل مسدود می‌شود.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Solution 1: Native Bot in Chat */}
            <div className="bg-[#110c24] border border-violet-500/40 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-violet-400 font-bold text-xs">
                <span className="w-6 h-6 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs">۱</span>
                <span>راهکار اصلی: ثبت و پیگیری مستقیم در چت تلگرام (بدون نیاز به وب‌اپ)</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                ربات <strong>@Viragraphicbot</strong> به صورت هوشمند در خود محیط چت تلگرام پیاده‌سازی شده است. هر زمان مشتری پیام بدهد، <strong>کارت وضعیت کوچک آخرین سفارش</strong> نمایش داده می‌شود و با دکمه <strong>«✏️ ثبت سفارش طراحی»</strong> می‌تواند سفارش جدید ثبت کند.
              </p>
              <div className="pt-1">
                <a
                  href={`https://t.me/${(config.botUsername || 'Viragraphicbot').replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>تست کارت وضعیت در @Viragraphicbot</span>
                </a>
              </div>
            </div>

            {/* Solution 2: Browser Access */}
            <div className="bg-[#110c24] border border-violet-900/40 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <span className="w-6 h-6 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-xs">۲</span>
                <span>راهکار دوم: باز کردن وب‌سایت در مرورگر کروم موبایل</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                اگر مایلید پنل کاربری، مشاهده گرافیکی اتودها و درگاه پرداخت را ببینید، کافیست لینک سایت را در مرورگر استاندارد گوشی (Google Chrome یا Safari) باز کنید. در مرورگر گوشی هیچ خطای 403 وجود ندارد.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-[#110c24] border border-violet-900/40 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-[#0c081c] border-b border-violet-900/30 flex items-center justify-between text-xs">
            <span className="font-bold text-white">تاریخچه کامل دیسپچ پیام‌های تلگرام @Viragraphicbot</span>
            <span className="text-slate-400 font-mono">تعداد: {config.logs.length}</span>
          </div>

          <div className="divide-y divide-violet-900/20 text-xs">
            {config.logs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">هنوز پیامی ارسال نشده است.</div>
            ) : (
              config.logs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-[#161030]/60 transition space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-violet-400 font-semibold">{log.chatId}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed text-xs whitespace-pre-line">{log.messageText}</p>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                    <span className="bg-[#0c081c] px-2 py-0.5 rounded border border-violet-900/40">
                      رویداد: {log.type}
                    </span>
                    <span className={log.status === 'sent' ? 'text-emerald-400 font-medium' : log.status === 'failed' ? 'text-rose-400 font-medium' : 'text-violet-400'}>
                      وضعیت: {log.status === 'sent' ? '✓ ارسال واقعی به تلگرام' : log.status === 'failed' ? 'خطا در ارسال' : 'ثبت در شبیه‌ساز'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="max-w-2xl bg-[#110c24] border border-violet-900/40 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <div>
            <h3 className="text-base font-bold text-white mb-1">پیکربندی توکن بات تلگرام ویراگرافیک</h3>
            <p className="text-slate-400 text-[11px]">
              اطلاعات ربات رسمی @Viragraphicbot و مدیر سیستم @Ntgalaxy1
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">توکن بات تلگرام (Bot Token):</label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              dir="ltr"
              className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-hidden focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">نام کاربری بات (Bot Username):</label>
              <input
                type="text"
                value={botUsername}
                onChange={(e) => setBotUsername(e.target.value)}
                dir="ltr"
                className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-hidden focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">آیدی مدیر جهت دریافت سفارشات:</label>
              <input
                type="text"
                value={adminChatId}
                onChange={(e) => setAdminChatId(e.target.value)}
                dir="ltr"
                className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-hidden focus:border-violet-500"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0c081c] border border-violet-900/40 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">حالت شبیه‌سازی هوشمند</span>
              <span className="text-[10px] text-slate-400">
                در صورت غیرفعال بودن (توصیه شده)، پیام‌ها به صورت زنده از طریق سرور به تلگرام کاربر ارسال می‌شوند.
              </span>
            </div>
            <input
              type="checkbox"
              checked={isSimulated}
              onChange={(e) => setIsSimulated(e.target.checked)}
              className="w-4 h-4 accent-violet-600 rounded"
            />
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>تنظیمات ربات تلگرام با موفقیت ذخیره شد.</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition"
            >
              ذخیره تنظیمات تلگرام
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
