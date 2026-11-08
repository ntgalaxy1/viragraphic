import React, { useState } from 'react';
import { 
  ShieldCheck, Clock, CheckCircle2, Send, Phone, Globe, Upload, 
  FileCheck, AlertCircle, ArrowUpRight, Search, Filter, Eye, RefreshCw,
  LogOut, Lock, Github, UploadCloud, FolderArchive
} from 'lucide-react';
import { ContactMethod, Project, ProjectStatus, UserProfile } from '../types';
import { formatToman, getCurrentShamsiDateTime, getStatusLabel } from '../utils/formatters';
import { AdminChartsSection } from './AdminChartsSection';
import { SOCIAL_NETWORK_OPTIONS } from '../data/initialData';

interface AdminPanelProps {
  projects: Project[];
  currentUser: UserProfile;
  onUpdateProjectProposal: (
    projectId: string,
    costToman: number,
    estimatedDays: number,
    executionPlan: string,
    contactMethod: ContactMethod,
    phoneNotes?: string
  ) => void;
  onUploadDraft: (projectId: string, title: string, previewUrl: string, notes: string) => void;
  onDeliverFinalFiles: (projectId: string) => void;
  onSelectProject: (project: Project) => void;
  onLogout?: () => void;
  onOpenGitHubModal?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  projects,
  currentUser,
  onUpdateProjectProposal,
  onUploadDraft,
  onDeliverFinalFiles,
  onSelectProject,
  onLogout,
  onOpenGitHubModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Proposal modal state
  const [proposalTargetProject, setProposalTargetProject] = useState<Project | null>(null);
  const [proposalCost, setProposalCost] = useState<string>('5500000');
  const [proposalDays, setProposalDays] = useState<string>('4');
  const [proposalPlan, setProposalPlan] = useState('');
  const [proposalContactMethod, setProposalContactMethod] = useState<ContactMethod>('telegram');
  const [phoneNotes, setPhoneNotes] = useState('');

  // Draft upload modal state
  const [draftTargetProject, setDraftTargetProject] = useState<Project | null>(null);
  const [draftTitle, setDraftTitle] = useState('اتود اولیه شماره ۱');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftImageUrl, setDraftImageUrl] = useState('/src/assets/images/sample_brand_identity_1794031596586.jpg');

  // Metrics
  const totalOrders = projects.length;
  const pendingReview = projects.filter((p) => p.status === 'submitted' || p.status === 'under_review').length;
  const awaitingPayment = projects.filter((p) => p.status === 'proposal_ready' || p.status === 'payment_pending').length;
  const inDesign = projects.filter((p) => p.status === 'in_progress' || p.status === 'draft_ready').length;
  const completed = projects.filter((p) => p.status === 'completed' || p.status === 'approved_final').length;
  const totalRevenue = projects
    .filter((p) => p.payment)
    .reduce((sum, p) => sum + (p.payment?.amountToman || 0), 0);

  // Filtered list
  const filteredProjects = projects.filter((p) => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerTelegram.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenProposal = (project: Project) => {
    setProposalTargetProject(project);
    setProposalCost(String(project.proposal?.costToman || 4800000));
    setProposalDays(String(project.proposal?.estimatedDays || 4));
    setProposalPlan(
      project.proposal?.executionPlan ||
      'طراحی در محیط Illustrator و Photoshop با ۲ اتود مجزا، تفکیک رنگ پنتون، آماده‌سازی فایل وکتور و تست موکاپ انجام می‌پذیرد.'
    );
    setProposalContactMethod(project.contactPreference || 'telegram');
    setPhoneNotes('');
  };

  const handleSaveProposal = () => {
    if (!proposalTargetProject) return;
    const costNum = Number(proposalCost);
    const daysNum = Number(proposalDays);

    if (isNaN(costNum) || costNum <= 0) {
      alert('لطفاً مبلغ معتبر به تومان وارد نمایید.');
      return;
    }

    onUpdateProjectProposal(
      proposalTargetProject.id,
      costNum,
      daysNum,
      proposalPlan.trim(),
      proposalContactMethod,
      phoneNotes.trim()
    );

    setProposalTargetProject(null);
  };

  const handleOpenDraftUpload = (project: Project) => {
    setDraftTargetProject(project);
    setDraftTitle(`اتود اولیه طرح ${project.title}`);
    setDraftNotes('نمونه اولیه طبق بریف و رفرنس‌های ارسالی آماده شد. لطفا رنگ‌ها و تایپوگرافی را بررسی فرمایید.');
    if (project.category === 'poster_banner') {
      setDraftImageUrl('/src/assets/images/sample_poster_art_1794031597495.jpg');
    } else {
      setDraftImageUrl('/src/assets/images/sample_brand_identity_1794031596586.jpg');
    }
  };

  const handleSaveDraft = () => {
    if (!draftTargetProject) return;
    onUploadDraft(draftTargetProject.id, draftTitle, draftImageUrl, draftNotes);
    setDraftTargetProject(null);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-violet-900/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              میز کار مدیریت استودیو ویراگرافیک
            </h1>
          </div>
          <p className="text-xs text-violet-300/70 mt-1">
            بررسی فنی بریف، تعیین هزینه و زمان‌بندی، ارسال پیش‌نمایش به مشتری در تلگرام و سایت
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300 bg-[#0c081c] px-3 py-1.5 rounded-xl border border-violet-900/40">
            مدیر سیستم: <strong className="text-violet-300">{currentUser.name}</strong>
          </span>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/40 hover:border-rose-500/60 text-rose-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="قفل کردن پنل مدیریت و خروج"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>قفل کردن پنل مدیریت</span>
            </button>
          )}
        </div>
      </div>

      {/* GitHub 0-100 & APK Build Banner */}
      <div className="bg-gradient-to-r from-violet-950/60 via-[#160f33] to-[#120a27] border border-violet-500/40 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/25 border border-violet-500/50 flex items-center justify-center text-violet-300 shrink-0">
            <Github className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-xs sm:text-sm">
                اتصال مخزن گیت‌هاب و انتشار فایل‌های APK (کافه بازار و گوگل پلی)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                فعال
              </span>
            </div>
            <p className="text-[11px] text-violet-300/80 mt-0.5 leading-relaxed">
              آپلود ۰ تا ۱۰۰ تمام فایل‌های پروژه به GitHub، بیلد خودکار با اکشن‌های گیت‌هاب و بسته استاندارد ir.viragraphy.app
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenGitHubModal && (
            <button
              onClick={onOpenGitHubModal}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>مدیریت گیت‌هاب و APK</span>
            </button>
          )}
          <a
            href="/api/export/project-zip"
            download="viragraphy-source-code.zip"
            className="px-3.5 py-2.5 rounded-xl bg-[#0c081c] hover:bg-violet-950/50 border border-violet-700/50 text-violet-200 text-xs font-medium transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
            title="دانلود سورس‌کد کامل پروژه به صورت ZIP"
          >
            <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
            <span>دانلود ZIP سورس</span>
          </a>
        </div>
      </div>

      {/* Visual Analytics & Charts Section */}
      <AdminChartsSection projects={projects} />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#110c24]/80 p-3 rounded-2xl border border-violet-900/30">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی کد سفارش، نام مشتری، آیدی تلگرام..."
            className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-violet-500 pr-9"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'همه سفارش‌ها' },
            { id: 'submitted', label: 'بررسی نشده' },
            { id: 'proposal_ready', label: 'پیشنهاد داده شده' },
            { id: 'in_progress', label: 'در حال طراحی' },
            { id: 'draft_ready', label: 'اتود آماده' },
            { id: 'completed', label: 'تکمیل شده' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? 'bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List: Mobile Cards + Desktop Table */}
      <div className="bg-[#110c24] border border-violet-900/40 rounded-2xl overflow-hidden shadow-xl">
        {/* Mobile View: Clean Card Stack (< 640px) */}
        <div className="block sm:hidden divide-y divide-violet-900/30">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs px-4">
              هیچ سفارشی مطابق فیلتر انتخابی یافت نشد.
            </div>
          ) : (
            filteredProjects.map((project) => {
              const statusInfo = getStatusLabel(project.status);

              return (
                <div key={project.id} className="p-3.5 space-y-3 bg-[#110c24]">
                  {/* Row 1: Code + Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-violet-300 font-bold bg-[#0c081c] px-2 py-0.5 rounded border border-violet-900/40 text-xs">
                      {project.orderCode}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Row 2: Title & Brief */}
                  <div>
                    <h3 className="font-bold text-white text-xs leading-snug line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Row 3: Customer Details */}
                  <div className="bg-[#0c081c] rounded-xl p-2.5 border border-violet-950/60 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">مشتری:</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        {project.customerName}
                        {project.customerUsername && (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-700/40">
                            {project.customerUsername}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400">تلگرام / تماس:</span>
                      <span className="text-violet-400">{project.customerTelegram || project.customerPhone}</span>
                    </div>

                    {project.customerAddress && (
                      <div className="text-[10px] text-amber-300/80 pt-0.5 border-t border-violet-900/20 break-words">
                        📍 {project.customerAddress}
                      </div>
                    )}
                  </div>

                  {/* Row 4: Pricing & Channel */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400 text-[11px]">مبلغ:</span>
                      <span className="font-mono font-bold text-white text-xs">
                        {project.proposal ? formatToman(project.proposal.costToman) : 'تعیین‌نشده'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-300">
                      {project.contactPreference === 'telegram' ? (
                        <>
                          <Send className="w-3 h-3 text-violet-400" />
                          <span>تلگرام</span>
                        </>
                      ) : project.contactPreference === 'phone' ? (
                        <>
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>تماس تلفنی</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3 text-violet-400" />
                          <span>سایت</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Row 5: Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-violet-900/30">
                    {(project.status === 'submitted' || project.status === 'under_review') && (
                      <button
                        onClick={() => handleOpenProposal(project)}
                        className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition shadow-xs text-center cursor-pointer"
                      >
                        تعیین قیمت و زمان
                      </button>
                    )}

                    {project.status === 'in_progress' && (
                      <button
                        onClick={() => handleOpenDraftUpload(project)}
                        className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition text-center cursor-pointer"
                      >
                        ارسال اتود اولیه
                      </button>
                    )}

                    {project.status === 'approved_final' && (
                      <button
                        onClick={() => onDeliverFinalFiles(project.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition text-center cursor-pointer"
                      >
                        تحویل فایل نهایی
                      </button>
                    )}

                    <button
                      onClick={() => onSelectProject(project)}
                      className="px-3 py-2 rounded-xl border border-violet-800 bg-[#161030] hover:bg-[#1f1644] text-slate-300 transition text-xs flex items-center justify-center gap-1 cursor-pointer shrink-0"
                      title="مشاهده پرونده سفارش"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>مشاهده</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Table (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#0c081c] text-slate-400 border-b border-violet-900/30 font-semibold">
              <tr>
                <th className="p-3.5">کد و عنوان سفارش</th>
                <th className="p-3.5">مشتری و تلگرام</th>
                <th className="p-3.5">وضعیت پروژه</th>
                <th className="p-3.5">مبلغ برآورد</th>
                <th className="p-3.5">کانال تماس</th>
                <th className="p-3.5 text-center">عملیات مدیریت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-900/20 text-slate-300">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    هیچ سفارشی مطابق فیلتر انتخابی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const statusInfo = getStatusLabel(project.status);

                  return (
                    <tr key={project.id} className="hover:bg-[#161030]/60 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-violet-300 font-bold bg-[#0c081c] px-2 py-0.5 rounded border border-violet-900/40">
                            {project.orderCode}
                          </span>
                          <span className="font-semibold text-white truncate max-w-[200px]" title={project.title}>
                            {project.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          ثبت: {project.createdAt} · ابعاد: {project.dimensions}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="text-white font-medium flex items-center gap-1.5">
                          <span>{project.customerName}</span>
                          {project.customerUsername && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-700/40">
                              {project.customerUsername}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-violet-400 font-mono">{project.customerTelegram}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{project.customerPhone}</div>
                        {project.customerSocialNetworks && project.customerSocialNetworks.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.customerSocialNetworks.map((sId, idx) => {
                              const info = SOCIAL_NETWORK_OPTIONS.find((o) => o.id === sId);
                              return (
                                <span
                                  key={sId}
                                  className="text-[9px] bg-[#0c081c] border border-violet-800/50 text-violet-300 px-1.5 py-0.5 rounded"
                                >
                                  {idx + 1}.{info?.label.split(' ')[0] || sId}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {project.customerAddress && (
                          <div
                            className="text-[10px] text-amber-300/80 mt-1 max-w-[200px] truncate"
                            title={project.customerAddress}
                          >
                            📍 {project.customerAddress}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-md border text-[11px] font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono">
                        {project.proposal ? (
                          <span className="text-white font-bold">{formatToman(project.proposal.costToman)}</span>
                        ) : (
                          <span className="text-slate-500">تعیین نشده</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                          {project.contactPreference === 'telegram' ? (
                            <>
                              <Send className="w-3 h-3 text-violet-400" />
                              <span>تلگرام</span>
                            </>
                          ) : project.contactPreference === 'phone' ? (
                            <>
                              <Phone className="w-3 h-3 text-emerald-400" />
                              <span>تماس تلفنی</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3 h-3 text-violet-400" />
                              <span>سایت</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Button 1: Set Proposal */}
                          {(project.status === 'submitted' || project.status === 'under_review') && (
                            <button
                              onClick={() => handleOpenProposal(project)}
                              className="px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[11px] transition shadow-xs whitespace-nowrap"
                            >
                              تعیین قیمت و شیوه انجام
                            </button>
                          )}

                          {/* Button 2: Upload Draft */}
                          {project.status === 'in_progress' && (
                            <button
                              onClick={() => handleOpenDraftUpload(project)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] transition whitespace-nowrap"
                            >
                              ارسال اتود اولیه
                            </button>
                          )}

                          {/* Button 3: Deliver Final */}
                          {project.status === 'approved_final' && (
                            <button
                              onClick={() => onDeliverFinalFiles(project.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition whitespace-nowrap"
                            >
                              تحویل فایل نهایی
                            </button>
                          )}

                          {/* Detail View */}
                          <button
                            onClick={() => onSelectProject(project)}
                            className="p-1.5 rounded-lg border border-violet-800 bg-[#161030] hover:bg-[#1f1644] text-slate-300 transition"
                            title="مشاهده پرونده سفارش و پیگیری"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Review & Declare Proposal */}
      {proposalTargetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-[#110c24] border border-violet-900/50 rounded-2xl shadow-2xl p-6 text-right space-y-4">
            <div className="border-b border-violet-900/30 pb-3">
              <span className="text-xs font-mono text-violet-400 font-bold">{proposalTargetProject.orderCode}</span>
              <h3 className="text-base font-bold text-white mt-0.5">
                بررسی فنی بریف و اعلام قیمت/زمان به مشتری
              </h3>
              <p className="text-xs text-violet-300/70 mt-1">
                سفارش: {proposalTargetProject.title} ({proposalTargetProject.customerName})
              </p>
            </div>

            {/* Customer brief review */}
            <div className="bg-[#0c081c] rounded-xl p-3 border border-violet-900/30 text-xs text-slate-300">
              <strong className="text-slate-400 block mb-1">بریف ارسالی مشتری:</strong>
              <p className="line-clamp-3 text-slate-200">{proposalTargetProject.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">مبلغ اعلامی به تومان *</label>
                <input
                  type="number"
                  value={proposalCost}
                  onChange={(e) => setProposalCost(e.target.value)}
                  className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-violet-500"
                />
                <span className="text-[10px] text-violet-400 font-mono mt-1 block">
                  {formatToman(Number(proposalCost))}
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">مدت زمان انجام (روز کاری) *</label>
                <input
                  type="number"
                  value={proposalDays}
                  onChange={(e) => setProposalDays(e.target.value)}
                  className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-violet-500"
                />
              </div>
            </div>

            {/* Technical Execution Plan */}
            <div>
              <label className="block text-xs text-slate-300 mb-1">
                توضیحات نحوه و شیوه انجام کار (به مشتری اعلام می‌شود) *
              </label>
              <textarea
                rows={3}
                value={proposalPlan}
                onChange={(e) => setProposalPlan(e.target.value)}
                placeholder="چگونه طرح اجرا خواهد شد؟ چند اتود ارائه می‌شود؟ چه نرم‌افزارهایی استفاده می‌شود؟"
                className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-violet-500 leading-relaxed"
              />
            </div>

            {/* Communication Channel for this Proposal */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                نحوه اعلام این نتیجه به مشتری:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setProposalContactMethod('telegram')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    proposalContactMethod === 'telegram'
                      ? 'bg-violet-600/25 border-violet-500 text-violet-300'
                      : 'bg-[#0c081c] border-violet-900/40 text-slate-400'
                  }`}
                >
                  <Send className="w-4 h-4 text-violet-400" />
                  <span>ربات تلگرام</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProposalContactMethod('website')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    proposalContactMethod === 'website'
                      ? 'bg-violet-600/25 border-violet-500 text-violet-300'
                      : 'bg-[#0c081c] border-violet-900/40 text-slate-400'
                  }`}
                >
                  <Globe className="w-4 h-4 text-violet-400" />
                  <span>پیام در سایت</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProposalContactMethod('phone')}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                    proposalContactMethod === 'phone'
                      ? 'bg-emerald-500/20 border-emerald-500/80 text-emerald-300'
                      : 'bg-[#0c081c] border-violet-900/40 text-slate-400'
                  }`}
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>تماس تلفنی</span>
                </button>
              </div>

              {proposalContactMethod === 'phone' && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={phoneNotes}
                    onChange={(e) => setPhoneNotes(e.target.value)}
                    placeholder="ثبت یادداشت تماس تلفنی (مثال: ساعت ۱۱ تماس گرفته شد و بریف تایید شد)"
                    className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-violet-900/30">
              <button
                type="button"
                onClick={() => setProposalTargetProject(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSaveProposal}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition"
              >
                ثبت و ارسال پیشنهاد به مشتری
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Upload Draft Preview Files */}
      {draftTargetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-[#110c24] border border-violet-900/50 rounded-2xl shadow-2xl p-6 text-right space-y-4">
            <div className="border-b border-violet-900/30 pb-3">
              <h3 className="text-base font-bold text-white">
                ارسال نمونه اولیه (اتود) برای تایید مشتری
              </h3>
              <p className="text-xs text-violet-300/70 mt-0.5">
                طرح برای پروژه: {draftTargetProject.title} ({draftTargetProject.orderCode})
              </p>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">عنوان اتود یا شماره نسخه</label>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">تصویر پیش‌نمایش اتود</label>
              <div className="flex items-center gap-3">
                <img
                  src={draftImageUrl}
                  alt="Draft"
                  className="w-24 h-20 object-cover rounded-xl border border-violet-800"
                />
                <div className="space-y-1 text-xs">
                  <span className="text-slate-300 font-medium">کیفیت پیش‌نمایش رندر شده استودیو</span>
                  <p className="text-[11px] text-slate-500">
                    تصویر با وضوح بالا در سایت و همزمان در بات تلگرام برای مشتری ارسال می‌گردد.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">یادداشت طراح برای مشتری</label>
              <textarea
                rows={3}
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-violet-500"
              />
            </div>

            <p className="text-[11px] text-violet-300">
              💡 با کلیک بر روی ارسال، این اتود در پنل مشتری قرار گرفته و اعلان آن به تلگرام ارسال می‌شود.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-violet-900/30">
              <button
                type="button"
                onClick={() => setDraftTargetProject(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 transition"
              >
                ارسال اتود به سایت و تلگرام
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
