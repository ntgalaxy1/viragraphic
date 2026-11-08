import React, { useState } from 'react';
import { 
  Clock, CheckCircle, CreditCard, Send, Phone, Globe, Download, 
  FileCheck, MessageSquare, AlertCircle, Eye, RefreshCw, ChevronLeft,
  Calendar, Layers, Check, FileText, MapPin, Share2, User
} from 'lucide-react';
import { Project, UserProfile } from '../types';
import { formatToman, getCurrentShamsiDateTime, getStatusLabel } from '../utils/formatters';
import { SOCIAL_NETWORK_OPTIONS } from '../data/initialData';

interface ProjectTrackerProps {
  project: Project;
  currentUser: UserProfile;
  onOpenPayment: (project: Project) => void;
  onApproveDraft: (project: Project, draftId: string) => void;
  onRequestRevision: (project: Project, notes: string) => void;
  onSendMessage: (project: Project, text: string) => void;
  onBackToList?: () => void;
}

export const ProjectTracker: React.FC<ProjectTrackerProps> = ({
  project,
  currentUser,
  onOpenPayment,
  onApproveDraft,
  onRequestRevision,
  onSendMessage,
  onBackToList,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'drafts' | 'deliverables' | 'chat'>('overview');
  const [revisionNote, setRevisionNote] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const statusMeta = getStatusLabel(project.status);

  // Stepper definition
  const steps = [
    { id: 'submitted', label: 'ثبت سفارش', num: 1 },
    { id: 'under_review', label: 'بررسی فنی مدیر', num: 2 },
    { id: 'proposal_ready', label: 'اعلام هزینه و زمان', num: 3 },
    { id: 'in_progress', label: 'پرداخت و شروع طراحی', num: 4 },
    { id: 'draft_ready', label: 'بررسی نمونه اولیه', num: 5 },
    { id: 'approved_final', label: 'تایید و تحویل نهایی', num: 6 },
  ];

  const getCurrentStepIndex = () => {
    switch (project.status) {
      case 'submitted':
        return 0;
      case 'under_review':
        return 1;
      case 'proposal_ready':
      case 'payment_pending':
        return 2;
      case 'in_progress':
        return 3;
      case 'draft_ready':
      case 'revision_requested':
        return 4;
      case 'approved_final':
      case 'completed':
        return 5;
      default:
        return 0;
    }
  };

  const currentStepIdx = getCurrentStepIndex();

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(project, chatInput.trim());
    setChatInput('');
  };

  const submitRevision = () => {
    if (!revisionNote.trim()) {
      alert('لطفاً نکات و تغییرات مورد نظر برای اصلاحیه را بنویسید.');
      return;
    }
    onRequestRevision(project, revisionNote.trim());
    setShowRevisionForm(false);
    setRevisionNote('');
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-violet-900/30">
        <div>
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-violet-400 mb-2 transition"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span>بازگشت به همه سفارش‌ها</span>
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {project.title}
            </h1>
            <span className="font-mono text-xs text-violet-300 bg-[#161030] px-2.5 py-0.5 rounded-md border border-violet-800/60 font-semibold">
              {project.orderCode}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
            <span>ثبت: {project.createdAt}</span>
            <span>·</span>
            <span>مشتری: {project.customerName}</span>
            <span>·</span>
            <span className="text-violet-400 font-mono">{project.customerTelegram}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${statusMeta.color}`}>
            {statusMeta.label}
          </span>
        </div>
      </div>

      {/* Visual Stepper */}
      <div className="bg-[#110c24] border border-violet-900/40 rounded-2xl p-4 sm:p-6 shadow-xl">
        <h3 className="text-xs font-semibold text-violet-300 mb-4">مراحل پیشرفت لحظه‌ای پروژه:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {steps.map((st, idx) => {
            const isCompleted = idx < currentStepIdx || project.status === 'completed';
            const isCurrent = idx === currentStepIdx && project.status !== 'completed';

            return (
              <div
                key={st.id}
                className={`p-3 rounded-xl border text-xs transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-violet-600/15 border-violet-500 shadow-xs'
                    : isCompleted
                    ? 'bg-[#0c081c]/80 border-violet-950 text-slate-300'
                    : 'bg-[#0c081c]/30 border-violet-950/40 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isCurrent
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓' : st.num}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] text-violet-400 font-medium">مرحله جاری</span>
                  )}
                </div>
                <span className={`font-medium ${isCurrent ? 'text-white font-semibold' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Banners depending on project state */}
      {/* 1. Proposal Ready & Awaiting Payment */}
      {(project.status === 'proposal_ready' || project.status === 'payment_pending') && project.proposal && (
        <div className="bg-gradient-to-r from-violet-950/60 via-[#130d2a] to-[#130d2a] border border-violet-500/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-violet-400">پیشنهاد و قیمت‌گذاری مدیریت ویراگرافیک</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                برآورد فنی انجام شد: هزینه {formatToman(project.proposal.costToman)} و تحویل {project.proposal.estimatedDays} روز کاری
              </h3>
            </div>
            <button
              onClick={() => onOpenPayment(project)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition whitespace-nowrap active:scale-98"
            >
              <CreditCard className="w-4 h-4" />
              <span>پرداخت آنلاین و شروع مراحل طراحی</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#0c081c] rounded-xl p-3.5 border border-violet-900/40">
            <div>
              <span className="text-slate-400 block mb-0.5">توضیحات شیوه انجام کار:</span>
              <p className="text-slate-200 leading-relaxed">{project.proposal.executionPlan}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">تاریخ تحویل اولیه پیش‌بینی‌شده:</span>
              <p className="text-violet-400 font-mono font-medium">{project.proposal.deliveryDateShamsi} ({project.proposal.estimatedDays} روز کاری)</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">کانال اطلاع‌رسانی:</span>
              <span className="inline-flex items-center gap-1 text-slate-200">
                {project.proposal.contactMethodUsed === 'telegram' ? (
                  <>
                    <Send className="w-3.5 h-3.5 text-violet-400" />
                    <span>ارسال شده در بات تلگرام</span>
                  </>
                ) : project.proposal.contactMethodUsed === 'phone' ? (
                  <>
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>هماهنگی تلفنی مدیر: {project.proposal.phoneCallNotes || 'ثبت شد'}</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-violet-400" />
                    <span>اطلاع‌رسانی در پنل سایت</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Draft Ready for Client Review */}
      {project.status === 'draft_ready' && project.draftFiles.length > 0 && (
        <div className="bg-[#110c24] border border-violet-500/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-violet-400">پیش‌نمایش طرح آماده بررسی شماست</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                طراح ویراگرافیک نمونه اولیه را بارگذاری کرده است. لطفاً مشاهده نمایید و نتیجه را اعلام کنید.
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                onClick={() => onApproveDraft(project, project.draftFiles[0].id)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>تایید نهایی طرح و تحویل فایل‌ها</span>
              </button>
              <button
                onClick={() => setShowRevisionForm(!showRevisionForm)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-violet-800 bg-[#161030] hover:bg-[#1d1640] text-xs font-medium text-slate-200 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-violet-400" />
                <span>درخواست اصلاحیه</span>
              </button>
            </div>
          </div>

          {showRevisionForm && (
            <div className="p-4 rounded-xl bg-[#0c081c] border border-violet-900/40 space-y-3">
              <label className="block text-xs font-semibold text-violet-300">
                توضیحات و موارد مورد نیاز جهت ویرایش یا اصلاحیه:
              </label>
              <textarea
                rows={3}
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="تغییر رنگ، اندازه فونت، تغییر چیدمان و..."
                className="w-full bg-[#161030] border border-violet-900/40 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-violet-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRevisionForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  onClick={submitRevision}
                  className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition cursor-pointer"
                >
                  ثبت درخواست اصلاحیه برای طراح
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Approved & Deliverables Ready */}
      {(project.status === 'approved_final' || project.status === 'completed') && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">طرح با موفقیت تایید و پکیج نهایی تحویل گردید</h3>
          </div>
          <p className="text-xs text-slate-300">
            فایل‌های لایه باز برداری (AI)، چاپی (PDF)، لایه‌باز فتوشاپ (PSD) و پکیج کامل فونت‌ها در تب «فایل‌های نهایی» آماده دانلود مستقیم می‌باشند. همچنین لینک دانلود به تلگرام شما ارسال شده است.
          </p>
        </div>
      )}

      {/* Secondary Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-violet-900/30 text-xs font-medium overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'text-violet-400 border-violet-500 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          جزئیات و زمان‌بندی
        </button>

        <button
          onClick={() => setActiveTab('drafts')}
          className={`px-4 py-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'drafts'
              ? 'text-violet-400 border-violet-500 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>نمونه‌ها و اتودها ({project.draftFiles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deliverables')}
          className={`px-4 py-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'deliverables'
              ? 'text-violet-400 border-violet-500 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>فایل‌های نهایی ({project.finalDeliverables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'chat'
              ? 'text-violet-400 border-violet-500 font-semibold'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>گفتگو با طراح ({project.messages.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Brief Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-[#110c24] border border-violet-900/40 rounded-2xl p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-violet-900/30 pb-2">
                بریف و مشخصات سفارش
              </h3>

              <div className="text-xs space-y-3 leading-relaxed text-slate-300">
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">شرح درخواست مشتری:</span>
                  <p className="bg-[#0c081c] p-3.5 rounded-xl border border-violet-900/30 whitespace-pre-line text-slate-200">
                    {project.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-[#0c081c]/80 p-3 rounded-xl border border-violet-900/30">
                    <span className="text-slate-400 block text-[11px]">ابعاد و قطع چاپی:</span>
                    <span className="text-white font-medium">{project.dimensions}</span>
                  </div>

                  <div className="bg-[#0c081c]/80 p-3 rounded-xl border border-violet-900/30">
                    <span className="text-slate-400 block text-[11px]">سبک مد نظر:</span>
                    <span className="text-white font-medium">{project.preferredStyle || 'مینیمال مدرن'}</span>
                  </div>

                  <div className="bg-[#0c081c]/80 p-3 rounded-xl border border-violet-900/30">
                    <span className="text-slate-400 block text-[11px]">رنگ‌بندی سازمانی:</span>
                    <span className="text-white font-medium">{project.colorPreferences || 'بنفش ویراگرافیک و پالت اختصاصی'}</span>
                  </div>

                  <div className="bg-[#0c081c]/80 p-3 rounded-xl border border-violet-900/30">
                    <span className="text-slate-400 block text-[11px]">مهلت تحویل مورد نظر:</span>
                    <span className="text-violet-400 font-medium">{project.preferredDeadline || 'عادی'}</span>
                  </div>
                </div>

                {/* Customer Registration Details Card */}
                <div className="bg-[#0c081c] p-4 rounded-xl border border-violet-800/40 space-y-2.5 mt-3">
                  <div className="flex items-center justify-between border-b border-violet-900/40 pb-2">
                    <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-violet-400" />
                      <span>مشخصات ثبت‌نامی مشتری و آدرس ارسال سفارش</span>
                    </span>
                    {project.customerUsername && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-700/40 px-2 py-0.5 rounded">
                        نام کاربری: {project.customerUsername}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">نام و نام خانوادگی:</span>
                      <span className="text-white font-semibold">{project.customerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">شماره همراه تماس:</span>
                      <span className="text-white font-mono">{project.customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">آیدی تلگرام:</span>
                      <span className="text-violet-400 font-mono">{project.customerTelegram}</span>
                    </div>
                  </div>

                  {project.customerSocialNetworks && project.customerSocialNetworks.length > 0 && (
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Share2 className="w-3 h-3 text-violet-400" />
                        <span>شبکه‌های اجتماعی فعال (به ترتیب انتخاب):</span>
                      </span>
                      {project.customerSocialNetworks.map((sId, idx) => {
                        const info = SOCIAL_NETWORK_OPTIONS.find((o) => o.id === sId);
                        return (
                          <span
                            key={sId}
                            className="px-2 py-0.5 rounded-md bg-violet-950/80 border border-violet-600/40 text-violet-200 text-[11px]"
                          >
                            {idx + 1}. {info?.label.split(' ')[0] || sId}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {project.customerAddress && (
                    <div className="pt-1 border-t border-violet-900/30">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-0.5">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>آدرس دقیق جهت ارسال سفارش:</span>
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed">{project.customerAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Reference Files */}
            <div className="bg-[#110c24] border border-violet-900/40 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-white">
                تصاویر و فایل‌های پیوست مشتری ({project.referenceFiles.length})
              </h3>
              {project.referenceFiles.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">فایل نمونه یا رفرنسی از طرف مشتری ارسال نشده است.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.referenceFiles.map((rf) => (
                    <div
                      key={rf.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#0c081c] border border-violet-900/30"
                    >
                      {rf.type === 'image' || rf.url.startsWith('data:image') || rf.url.endsWith('.jpg') || rf.url.endsWith('.png') ? (
                        <img
                          src={rf.url}
                          alt={rf.name}
                          className="w-12 h-12 rounded-lg object-cover border border-violet-800 cursor-pointer"
                          onClick={() => setPreviewImage(rf.url)}
                        />
                      ) : (
                        <FileText className="w-10 h-10 text-violet-400 p-2 bg-[#161030] rounded-lg" />
                      )}
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium text-white truncate">{rf.name}</p>
                        <span className="text-[10px] text-slate-400">{rf.sizeMb} MB · {rf.uploadedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Timeline & Payment summary */}
          <div className="space-y-5">
            {/* Payment Record Card (if paid) */}
            {project.payment && (
              <div className="bg-[#110c24] border border-violet-900/40 rounded-2xl p-4 shadow-lg space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-violet-900/30">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    صورتحساب تسویه شده
                  </span>
                  <span className="font-mono text-violet-400 font-bold">{formatToman(project.payment.amountToman)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>درگاه:</span>
                  <span className="text-slate-200">{project.payment.gateway}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>کد پیگیری:</span>
                  <span className="font-mono text-white">{project.payment.trackingCode}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>تاریخ پرداخت:</span>
                  <span className="font-mono text-slate-200">{project.payment.paidAt}</span>
                </div>
              </div>
            )}

            {/* Timeline Stream */}
            <div className="bg-[#110c24] border border-violet-900/40 rounded-2xl p-4 shadow-lg space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-violet-400" />
                <span>گزارش اقدامات و تاریخچه</span>
              </h3>

              <div className="space-y-3 pt-1">
                {project.timeline.map((event, idx) => (
                  <div key={event.id || idx} className="relative pr-5 pb-3 border-r border-violet-900/40 last:border-0 last:pb-0 text-xs">
                    <div className="absolute -right-1.5 top-1 w-3 h-3 rounded-full bg-violet-500 border-2 border-[#0a0714]" />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-[11px]">{event.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{event.timestamp.split(' - ')[1] || event.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{event.description}</p>
                    {event.channel && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-violet-400 mt-1">
                        {event.channel === 'telegram' ? 'ارسال شده در تلگرام' : event.channel === 'phone' ? 'هماهنگی تلفنی' : 'وب‌سایت'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Drafts */}
      {activeTab === 'drafts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">اتودها و نمونه‌های اولیه ارسالی استودیو ویراگرافیک</h3>
            <span className="text-xs text-slate-400">تعداد اتودها: {project.draftFiles.length}</span>
          </div>

          {project.draftFiles.length === 0 ? (
            <div className="bg-[#110c24]/60 border border-violet-900/40 rounded-2xl p-8 text-center text-slate-400 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-violet-500/40 mb-2" />
              <p className="text-xs">طراح در حال کار بر روی اتودهای اولیه است.</p>
              <p className="text-[11px] text-slate-500">
                به محض آماده شدن نمونه‌ها، تصویر با کیفیت در اینجا بارگذاری شده و پیام به ربات تلگرام شما ارسال می‌شود.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {project.draftFiles.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-[#110c24] border border-violet-900/40 rounded-2xl overflow-hidden shadow-xl"
                >
                  <div className="relative group">
                    <img
                      src={draft.previewUrl}
                      alt={draft.title}
                      className="w-full h-64 object-cover cursor-pointer hover:scale-102 transition-transform duration-300"
                      onClick={() => setPreviewImage(draft.previewUrl)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        بزرگنمایی تصویر
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{draft.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{draft.uploadedAt}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-[#0c081c] p-3 rounded-xl border border-violet-900/30">
                      {draft.designerNotes}
                    </p>

                    {project.status === 'draft_ready' && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => onApproveDraft(project, draft.id)}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>تایید این طرح</span>
                        </button>
                        <button
                          onClick={() => setShowRevisionForm(true)}
                          className="py-2 px-3 rounded-xl border border-violet-800 bg-[#161030] hover:bg-[#1d1640] text-xs text-slate-200 transition"
                        >
                          درخواست ویرایش
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Deliverables */}
      {activeTab === 'deliverables' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">فایل‌های نهایی پروژه آماده دانلود</h3>
            <span className="text-xs text-slate-400">فرمت‌های وکتور، لایه‌باز و چاپی</span>
          </div>

          {project.finalDeliverables.length === 0 ? (
            <div className="bg-[#110c24]/60 border border-violet-900/40 rounded-2xl p-8 text-center text-slate-400 space-y-2">
              <Download className="w-8 h-8 mx-auto text-violet-500/40 mb-2" />
              <p className="text-xs">فایل‌های نهایی پس از تایید اتود اولیه توسط مشتری در اینجا قرار می‌گیرند.</p>
              <p className="text-[11px] text-slate-500">
                پکیج شامل فایل برداری ایلوستریتور، لایه‌باز فتوشاپ، پی‌دی‌اف تفکیک رنگ چاپی و پکیج کامل فونت‌ها خواهد بود.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {project.finalDeliverables.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#110c24] border border-violet-900/40 rounded-2xl p-4 shadow-lg flex flex-col justify-between text-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[10px] text-violet-300 bg-[#0c081c] px-2 py-0.5 rounded border border-violet-900/40">
                      {item.fileSize}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs">{item.title}</h4>
                    <span className="text-[11px] text-violet-400 font-medium mt-0.5 block">{item.format}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">تحویل: {item.deliveredAt}</span>
                  </div>

                  <a
                    href={item.downloadUrl}
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`دانلود فایل ${item.title} آغاز شد.`);
                    }}
                    className="w-full py-2 rounded-xl bg-[#1a1238] hover:bg-violet-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition border border-violet-800/60"
                  >
                    <Download className="w-3.5 h-3.5 text-violet-400" />
                    <span>دانلود مستقیم فایل</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Chat */}
      {activeTab === 'chat' && (
        <div className="bg-[#110c24] border border-violet-900/40 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[460px]">
          <div className="px-5 py-3 border-b border-violet-900/30 bg-[#0c081c] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold text-white">کانال اختصاصی گفتگو و هماهنگی تلگرام</span>
            </div>
            <span className="text-[10px] text-violet-300 flex items-center gap-1">
              <Send className="w-3 h-3" />
              <span>همگام‌سازی لحظه‌ای با بات تلگرام</span>
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0c081c]/60">
            {project.messages.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                هنوز پیامی رد و بدل نشده است. می‌توانید سوالات یا یادداشت‌های خود را در اینجا بنویسید.
              </div>
            ) : (
              project.messages.map((msg) => {
                const isMe =
                  (currentUser.role === 'customer' && msg.sender === 'customer') ||
                  (currentUser.role === 'admin' && msg.sender === 'admin');

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${isMe ? 'mr-auto items-end' : 'ml-auto items-start'}`}
                  >
                    <span className="text-[10px] text-slate-500 mb-1 px-1">{msg.senderName}</span>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-violet-600 text-white font-medium rounded-bl-xs'
                          : 'bg-[#161030] text-white border border-violet-900/40 rounded-br-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-1 px-1">
                      <span>{msg.timestamp}</span>
                      {msg.sentViaTelegram && <span className="text-violet-400">· تلگرام</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendChatMessage} className="p-3 border-t border-violet-900/30 bg-[#0c081c] flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="ارسال پیام یا سوال در مورد سفارش..."
              className="flex-1 bg-[#161030] border border-violet-900/40 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ارسال</span>
            </button>
          </form>
        </div>
      )}

      {/* Image Zoom Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out"
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
