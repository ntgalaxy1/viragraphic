import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NewOrderModal } from './components/NewOrderModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { ProjectTracker } from './components/ProjectTracker';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { TelegramBotModal } from './components/TelegramBotModal';
import { PortfolioShowcase } from './components/PortfolioShowcase';
import { GitHubAndApkModal } from './components/GitHubAndApkModal';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import { INITIAL_USERS, SOCIAL_NETWORK_OPTIONS, VIRAGRAPHY_LOGO } from './data/initialData';
import { CategoryId, ContactMethod, Project, TelegramConfig, UserProfile } from './types';
import { formatToman, getCurrentShamsiDateTime, getStatusLabel } from './utils/formatters';
import {
  isCustomerRegistrationComplete,
  loadActiveCustomer,
  loadCurrentUserId,
  loadProjects,
  loadRegisteredCustomers,
  loadTelegramConfig,
  saveActiveCustomer,
  saveCurrentUserId,
  saveProjects,
  saveRegisteredCustomers,
  saveTelegramConfig,
} from './utils/storage';
import { sendTelegramNotification } from './utils/telegramService';
import { Plus, Eye, Send, Phone, Globe, Clock, Sparkles, Smartphone, CheckCircle, ChevronLeft, UserPlus, User, MapPin, Share2, LogOut, Lock } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(loadTelegramConfig);
  const [currentUserId, setCurrentUserId] = useState<string>(loadCurrentUserId);
  const [currentTab, setCurrentTab] = useState<'orders' | 'portfolio' | 'admin' | 'telegram'>('orders');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Customer registration & authentication state
  const [registeredCustomers, setRegisteredCustomers] = useState<UserProfile[]>(loadRegisteredCustomers);
  const [activeCustomer, setActiveCustomer] = useState<UserProfile | null>(loadActiveCustomer);
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [pendingOrderAfterAuth, setPendingOrderAfterAuth] = useState(false);

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('viragraphy_admin_auth') === 'true' ||
           sessionStorage.getItem('viragraphy_admin_auth') === 'true';
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Modals
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [paymentProject, setPaymentProject] = useState<Project | null>(null);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  // View Mode: 'desktop' | 'mobile_pwa' | 'telegram_app'
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile_pwa' | 'telegram_app'>('desktop');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description: string, type: 'success' | 'info' | 'telegram' | 'warning' = 'info') => {
    const newToast: ToastMessage = {
      id: 'toast_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      title,
      description,
      type,
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load from backend for any orders created via Telegram
  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newOnes = data.projects.filter((p: Project) => !existingIds.has(p.id));
            if (newOnes.length > 0) {
              return [...newOnes, ...prev];
            }
            return prev;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Sync to storage
  useEffect(() => {
    saveProjects(projects);
    // Sync to backend for Telegram Bot
    fetch('/api/projects/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projects }),
    }).catch(() => {});
  }, [projects]);

  useEffect(() => {
    saveTelegramConfig(telegramConfig);
  }, [telegramConfig]);

  useEffect(() => {
    saveCurrentUserId(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    saveRegisteredCustomers(registeredCustomers);
    fetch('/api/customers/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customers: registeredCustomers }),
    }).catch(() => {});
  }, [registeredCustomers]);

  useEffect(() => {
    saveActiveCustomer(activeCustomer);
  }, [activeCustomer]);

  const isCustomerRegistered = isCustomerRegistrationComplete(activeCustomer);

  const currentUser: UserProfile =
    currentUserId === 'usr_admin'
      ? INITIAL_USERS[1]
      : isCustomerRegistered && activeCustomer
      ? activeCustomer
      : INITIAL_USERS[0];

  // Initiate order: strictly block order placement until customer registration is complete!
  const handleInitiateNewOrder = () => {
    if (!isCustomerRegistrationComplete(activeCustomer)) {
      setIsNewOrderOpen(false);
      setPendingOrderAfterAuth(true);
      setIsCustomerAuthOpen(true);
      addToast(
        '⛔ ثبت سفارش نیازمند تکمیل ثبت‌نام است',
        'ثبت سفارش انجام نمی‌گیرد تا زمانی که ثبت‌نام مشتری (نام و فامیل، شماره همراه، شبکه‌های اجتماعی فعال، آدرس دقیق ارسال و یوزرنیم و پسورد) کامل شود.',
        'warning'
      );
      return;
    }
    setIsNewOrderOpen(true);
  };

  const handleCustomerRegisterSuccess = async (newCustomer: UserProfile) => {
    setRegisteredCustomers((prev) => {
      const exists = prev.some((c) => c.id === newCustomer.id);
      if (exists) {
        return prev.map((c) => (c.id === newCustomer.id ? newCustomer : c));
      }
      return [newCustomer, ...prev];
    });
    setActiveCustomer(newCustomer);
    setCurrentUserId(newCustomer.id);
    setIsCustomerAuthOpen(false);

    addToast(
      'ثبت‌نام مشتری تکمیل شد',
      `خوش آمدید ${newCustomer.name} عزیز! نام کاربری شما (${newCustomer.username}) جهت مراجعات بعدی فعال گردید.`,
      'success'
    );

    // Send registration notification to @Ntgalaxy1 on Telegram
    const socialsText = (newCustomer.activeSocialNetworks || [])
      .map((sId, idx) => {
        const info = SOCIAL_NETWORK_OPTIONS.find((o) => o.id === sId);
        return `${idx + 1}.${info?.label.split(' ')[0] || sId}`;
      })
      .join(' ، ');

    const regMsg = `👤 <b>ثبت‌نام مشتری جدید در ویراگرافیک:</b>\nنام و نام خانوادگی: ${newCustomer.name}\nشماره تماس: ${newCustomer.phone}\nشبکه‌های اجتماعی فعال: ${socialsText}\nآدرس دقیق ارسال: ${newCustomer.deliveryAddress}\nنام کاربری: ${newCustomer.username}`;
    const { updatedConfig } = await sendTelegramNotification(
      telegramConfig,
      '@Ntgalaxy1',
      regMsg,
      'order_created'
    );
    setTelegramConfig(updatedConfig);

    if (pendingOrderAfterAuth) {
      setPendingOrderAfterAuth(false);
      setIsNewOrderOpen(true);
    }
  };

  const handleCustomerLoginSuccess = (customer: UserProfile) => {
    setActiveCustomer(customer);
    setCurrentUserId(customer.id);
    setIsCustomerAuthOpen(false);

    addToast(
      'ورود موفق مشتری',
      `خوش آمدید ${customer.name} عزیز! اطلاعات و آدرس شما بارگذاری گردید.`,
      'success'
    );

    if (pendingOrderAfterAuth) {
      setPendingOrderAfterAuth(false);
      setIsNewOrderOpen(true);
    }
  };

  const handleCustomerLogout = () => {
    setActiveCustomer(null);
    setCurrentUserId('usr_client_1');
    addToast('خروج از حساب مشتری', 'از حساب کاربری خود خارج شدید.', 'info');
  };

  const handleSelectTab = (tab: 'orders' | 'portfolio' | 'admin' | 'telegram') => {
    if (tab === 'admin' && !isAdminAuthenticated) {
      setIsAdminLoginModalOpen(true);
      return;
    }
    setCurrentTab(tab);
    setSelectedProjectId(null);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminLoginModalOpen(false);
    setCurrentTab('admin');
    setCurrentUserId('usr_admin');
    addToast('احراز هویت مدیریت', 'خوش آمدید. دسترسی به پنل مدیریت ویراگرافیک فعال شد.', 'success');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('viragraphy_admin_auth');
    sessionStorage.removeItem('viragraphy_admin_auth');
    setCurrentTab('orders');
    setCurrentUserId(activeCustomer?.id || 'usr_client_1');
    addToast('خروج و قفل پنل', 'پنل مدیریت با موفقیت قفل گردید و به صفحه مشتری بازگشتید.', 'info');
  };

  const handleSwitchUser = () => {
    if (currentUser.role === 'customer') {
      if (!isAdminAuthenticated) {
        setIsAdminLoginModalOpen(true);
        return;
      }
      setCurrentUserId('usr_admin');
      setCurrentTab('admin');
      addToast('حساب مدیریت', 'ورود به حساب کاربری مدیریت استودیو ویراگرافیک انجام شد.', 'info');
    } else {
      setCurrentUserId(activeCustomer?.id || 'usr_client_1');
      setCurrentTab('orders');
      addToast('حساب مشتری', 'تغییر به حساب کاربری مشتری انجام شد.', 'info');
    }
  };

  // 1. Submit New Order (strictly guarded by customer registration completeness)
  const handleCreateOrder = async (newProject: Project) => {
    if (!isCustomerRegistrationComplete(activeCustomer)) {
      setIsNewOrderOpen(false);
      setPendingOrderAfterAuth(true);
      setIsCustomerAuthOpen(true);
      addToast(
        '⛔ ثبت سفارش مسدود شد',
        'تا زمانی که ثبت‌نام مشتری کامل نشود، امکان ثبت سفارش وجود ندارد.',
        'warning'
      );
      return;
    }
    const updated = [newProject, ...projects];
    setProjects(updated);
    setSelectedProjectId(newProject.id);
    setCurrentTab('orders');

    addToast(
      'ثبت موفقیت‌آمیز سفارش در ویراگرافیک',
      `سفارش شما با کد ${newProject.orderCode} ثبت و جهت بررسی فنی به مدیریت ارسال شد.`,
      'success'
    );

    // Telegram Bot dispatch to @Ntgalaxy1 / customer
    const targetTelegram = newProject.customerTelegram || '@Ntgalaxy1';
    const socialsText = (newProject.customerSocialNetworks || [])
      .map((sId, idx) => {
        const info = SOCIAL_NETWORK_OPTIONS.find((o) => o.id === sId);
        return `${idx + 1}.${info?.label.split(' ')[0] || sId}`;
      })
      .join(' ، ');

    const msg = `🎉 سفارش جدید با عنوان «${newProject.title}» و کد پیگیری ${newProject.orderCode} در ویراگرافیک ثبت شد.\n👤 مشتری: ${newProject.customerName} (${newProject.customerPhone})\n📱 شبکه‌های اجتماعی فعال: ${socialsText || 'تلگرام'}\n📍 آدرس ارسال: ${newProject.customerAddress || 'ثبت شده در سامانه'}`;
    const { updatedConfig } = await sendTelegramNotification(
      telegramConfig,
      targetTelegram,
      msg,
      'order_created'
    );
    setTelegramConfig(updatedConfig);
    addToast(
      'ارسال اعلان به تلگرام',
      `تاییدیه ثبت سفارش به اکانت تلگرام ${targetTelegram} ارسال شد.`,
      'telegram'
    );
  };

  // 2. Admin declares proposal (Cost, Delivery, Technical Plan, Contact Channel)
  const handleUpdateProposal = async (
    projectId: string,
    costToman: number,
    estimatedDays: number,
    executionPlan: string,
    contactMethod: ContactMethod,
    phoneNotes?: string
  ) => {
    const now = getCurrentShamsiDateTime();
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;

    const deliveryDate = `۱۴۰۳/۰۸/${Math.min(30, 16 + estimatedDays)}`;

    const proposal = {
      costToman,
      estimatedDays,
      deliveryDateShamsi: deliveryDate,
      executionPlan,
      contactMethodUsed: contactMethod,
      phoneCallNotes: phoneNotes,
      telegramMessageSent: contactMethod === 'telegram',
      sentAt: now,
    };

    const newTimelineEvent = {
      id: 'tl_' + Date.now(),
      title: 'اعلام هزینه و برآورد زمان توسط مدیر ویراگرافیک',
      description: `مبلغ ${formatToman(costToman)} و مهلت ${estimatedDays} روز کاری ثبت شد. شیوه اعلام: ${
        contactMethod === 'telegram'
          ? 'ربات تلگرام'
          : contactMethod === 'phone'
          ? `تماس تلفنی (${phoneNotes || 'هماهنگ شد'})`
          : 'پنل سایت'
      }`,
      timestamp: now,
      actor: 'admin' as const,
      channel: contactMethod,
    };

    const updated = projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            status: 'proposal_ready' as const,
            proposal,
            timeline: [newTimelineEvent, ...p.timeline],
            updatedAt: now.split(' - ')[0],
          }
        : p
    );

    setProjects(updated);

    addToast(
      'پیشنهاد ثبت و ارسال شد',
      `مبلغ ${formatToman(costToman)} برای پروژه ${target.orderCode} تعیین و ارسال گردید.`,
      'success'
    );

    if (contactMethod === 'telegram' && target.customerTelegram) {
      const msg = `پیشنهاد استودیو ویراگرافیک برای سفارش «${target.title}» (${target.orderCode}):\nمبلغ: ${formatToman(
        costToman
      )}\nزمان تحویل: ${estimatedDays} روز کاری\nشیوه انجام: ${executionPlan}\nجهت پرداخت و شروع طراحی وارد مینی‌اپ شوید.`;
      const { updatedConfig } = await sendTelegramNotification(
        telegramConfig,
        target.customerTelegram,
        msg,
        'proposal_sent'
      );
      setTelegramConfig(updatedConfig);
      addToast('ارسال به ربات تلگرام', `پیشنهاد و فاکتور به ${target.customerTelegram} مخابره شد.`, 'telegram');
    }
  };

  // 3. Payment Success
  const handlePaymentSuccess = async (project: Project, trackingCode: string, receiptNumber: string) => {
    const now = getCurrentShamsiDateTime();
    const amount = project.proposal?.costToman || 4500000;

    const paymentRecord = {
      transactionId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      trackingCode,
      amountToman: amount,
      gateway: 'شاپرک (سامان)' as const,
      paidAt: now,
      cardLast4: '6037-****-****-4182',
      receiptNumber,
    };

    const newTimelineEvent = {
      id: 'tl_' + Date.now(),
      title: 'پرداخت آنلاین و آغاز طراحی در ویراگرافیک',
      description: `مبلغ صورتحساب با کد رهگیری ${trackingCode} تسویه شد و پروژه وارد فاز طراحی شد.`,
      timestamp: now,
      actor: 'customer' as const,
      channel: 'website' as const,
    };

    const updated = projects.map((p) =>
      p.id === project.id
        ? {
            ...p,
            status: 'in_progress' as const,
            payment: paymentRecord,
            timeline: [newTimelineEvent, ...p.timeline],
            updatedAt: now.split(' - ')[0],
          }
        : p
    );

    setProjects(updated);
    setPaymentProject(null);

    addToast('پرداخت موفق', `صورتحساب سفارش ${project.orderCode} پرداخت شد و طراحی آغاز گردید.`, 'success');

    if (project.customerTelegram) {
      const msg = `پرداخت ${formatToman(
        amount
      )} با کد رهگیری ${trackingCode} تایید شد. طراحی سفارش «${project.title}» توسط طراح ارشد ویراگرافیک آغاز گردید.`;
      const { updatedConfig } = await sendTelegramNotification(
        telegramConfig,
        project.customerTelegram,
        msg,
        'payment_received'
      );
      setTelegramConfig(updatedConfig);
    }
  };

  // 4. Admin uploads draft preview
  const handleUploadDraft = async (projectId: string, title: string, previewUrl: string, notes: string) => {
    const now = getCurrentShamsiDateTime();
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;

    const newDraft = {
      id: 'drf_' + Date.now(),
      title,
      version: target.draftFiles.length + 1,
      previewUrl,
      designerNotes: notes,
      uploadedAt: now,
      status: 'pending' as const,
    };

    const newTimelineEvent = {
      id: 'tl_' + Date.now(),
      title: 'بارگذاری اتود و پیش‌نمایش اولیه برای مشتری',
      description: `نمونه اولیه طرح جهت بررسی و تایید در سایت و ربات تلگرام ارسال گردید.`,
      timestamp: now,
      actor: 'admin' as const,
      channel: 'telegram' as const,
    };

    const updated = projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            status: 'draft_ready' as const,
            draftFiles: [newDraft, ...p.draftFiles],
            timeline: [newTimelineEvent, ...p.timeline],
            updatedAt: now.split(' - ')[0],
          }
        : p
    );

    setProjects(updated);

    addToast('اتود اولیه ارسال شد', `پیش‌نمایش برای پروژه ${target.orderCode} بارگذاری شد.`, 'success');

    if (target.customerTelegram) {
      const msg = `طراح ویراگرافیک نمونه اولیه سفارش «${target.title}» (${target.orderCode}) را ارسال کرد.\nلطفاً وارد پنل کاربری یا ربات تلگرام شوید و تایید یا اصلاحیه را ثبت نمایید.`;
      const { updatedConfig } = await sendTelegramNotification(
        telegramConfig,
        target.customerTelegram,
        msg,
        'draft_uploaded'
      );
      setTelegramConfig(updatedConfig);
      addToast('اعلان تلگرام ارسال شد', `پیش‌نمایش طرح به تلگرام ${target.customerTelegram} فرستاده شد.`, 'telegram');
    }
  };

  // 5. Customer approves draft
  const handleApproveDraft = async (project: Project, draftId: string) => {
    const now = getCurrentShamsiDateTime();

    const finalFiles = [
      {
        id: 'fin_' + Date.now() + '_1',
        title: `فایل لایه باز وکتور نهایی ${project.title}`,
        format: 'AI Vector' as const,
        fileSize: '54.2 MB',
        downloadUrl: '#download-ai',
        deliveredAt: now,
      },
      {
        id: 'fin_' + Date.now() + '_2',
        title: `فایل با کیفیت چاپی 300DPI با تفکیک رنگ`,
        format: 'Print Ready PDF' as const,
        fileSize: '88.7 MB',
        downloadUrl: '#download-pdf',
        deliveredAt: now,
      },
      {
        id: 'fin_' + Date.now() + '_3',
        title: `پکیج کامل فایل‌های PNG بدون پس‌زمینه و SVG`,
        format: 'Web PNG/SVG' as const,
        fileSize: '18.4 MB',
        downloadUrl: '#download-png',
        deliveredAt: now,
      },
    ];

    const newTimelineEvent = {
      id: 'tl_' + Date.now(),
      title: 'تایید اتود توسط مشتری و تبدیل به فایل‌های نهایی',
      description: 'مشتری طرح را تایید کرد و فایل‌های نهایی آماده‌سازی شدند.',
      timestamp: now,
      actor: 'customer' as const,
      channel: 'website' as const,
    };

    const updated = projects.map((p) =>
      p.id === project.id
        ? {
            ...p,
            status: 'approved_final' as const,
            finalDeliverables: finalFiles,
            timeline: [newTimelineEvent, ...p.timeline],
            updatedAt: now.split(' - ')[0],
          }
        : p
    );

    setProjects(updated);

    addToast('طرح تایید شد', 'پکیج فایل‌های نهایی آماده گردید و در تب دانلودها قرار گرفت.', 'success');

    if (project.customerTelegram) {
      const msg = `تاییدیه شما برای طرح «${project.title}» با موفقیت در ویراگرافیک ثبت شد. فایل‌های نهایی با کیفیت بالا آماده دانلود در مینی‌اپ تلگرام است.`;
      const { updatedConfig } = await sendTelegramNotification(
        telegramConfig,
        project.customerTelegram,
        msg,
        'final_delivered'
      );
      setTelegramConfig(updatedConfig);
    }
  };

  // 6. Customer requests revision
  const handleRequestRevision = async (project: Project, notes: string) => {
    const now = getCurrentShamsiDateTime();

    const newTimelineEvent = {
      id: 'tl_' + Date.now(),
      title: `درخواست اصلاحیه شماره ${(project.revisionCount || 0) + 1}`,
      description: `مشتری اصلاحات زیر را ثبت کرد: ${notes}`,
      timestamp: now,
      actor: 'customer' as const,
      channel: 'website' as const,
    };

    const updated = projects.map((p) =>
      p.id === project.id
        ? {
            ...p,
            status: 'revision_requested' as const,
            revisionCount: (p.revisionCount || 0) + 1,
            revisionNotes: notes,
            timeline: [newTimelineEvent, ...p.timeline],
            updatedAt: now.split(' - ')[0],
          }
        : p
    );

    setProjects(updated);

    addToast('اصلاحیه ثبت شد', 'درخواست ویرایش به طراح ارسال شد و اتود جدید آماده خواهد شد.', 'info');
  };

  // 7. Admin delivers final deliverables package
  const handleDeliverFinalFiles = async (projectId: string) => {
    const now = getCurrentShamsiDateTime();
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;

    const newTimelineEvent = {
      id: 'tl_' + Date.now(),
      title: 'تحویل رسمی پکیج نهایی و اتمام سفارش',
      description: 'فایل‌های لایه‌باز اصلی تحویل مشتری شد و پروژه بسته شد.',
      timestamp: now,
      actor: 'admin' as const,
      channel: 'telegram' as const,
    };

    const updated = projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            status: 'completed' as const,
            timeline: [newTimelineEvent, ...p.timeline],
            updatedAt: now.split(' - ')[0],
          }
        : p
    );

    setProjects(updated);

    addToast('پروژه تکمیل شد', `فایل‌های نهایی پروژه ${target.orderCode} به مشتری تحویل شد.`, 'success');

    if (target.customerTelegram) {
      const msg = `پروژه «${target.title}» (${target.orderCode}) با موفقیت به پایان رسید. از اعتماد شما به ویراگرافیک (Viragraphy) سپاسگزاریم!`;
      const { updatedConfig } = await sendTelegramNotification(
        telegramConfig,
        target.customerTelegram,
        msg,
        'final_delivered'
      );
      setTelegramConfig(updatedConfig);
    }
  };

  // 8. Send Chat message
  const handleSendMessage = (project: Project, text: string) => {
    const now = getCurrentShamsiDateTime();
    const newMsg = {
      id: 'msg_' + Date.now(),
      sender: currentUser.role,
      senderName: currentUser.name,
      text,
      timestamp: now.split(' - ')[1] || now,
      sentViaTelegram: project.contactPreference === 'telegram',
    };

    const updated = projects.map((p) =>
      p.id === project.id
        ? {
            ...p,
            messages: [...p.messages, newMsg],
          }
        : p
    );

    setProjects(updated);
  };

  // Test telegram sender
  const handleTestTelegramSend = async (
    targetChat: string,
    text: string
  ): Promise<{ success: boolean; error?: string; needsStart?: boolean }> => {
    const { result, updatedConfig } = await sendTelegramNotification(
      telegramConfig,
      targetChat,
      text,
      'order_created'
    );
    setTelegramConfig(updatedConfig);
    if (result.success) {
      addToast('پیام تلگرام ارسال شد', `به ${targetChat}: ${text.slice(0, 40)}...`, 'telegram');
    } else {
      addToast(
        'وضعیت ارسال تلگرام',
        result.needsStartInBot ? 'کاربر باید ابتدا بات را استارت کند' : result.error || 'خطا در ارسال',
        'warning'
      );
    }
    return { success: result.success, error: result.error, needsStart: result.needsStartInBot };
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;

  // View frame wrapper
  const renderAppContent = () => (
    <div className="min-h-screen flex flex-col bg-[#0a0714] text-slate-100 viragraphy-ambient w-full max-w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenNewOrder={handleInitiateNewOrder}
        currentUser={currentUser}
        isCustomerRegistered={isCustomerRegistered}
        onSwitchUser={handleSwitchUser}
        onOpenCustomerAuth={() => {
          setPendingOrderAfterAuth(false);
          setIsCustomerAuthOpen(true);
        }}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        ordersCount={projects.length}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
      />

      {/* Main Content Area with safe bottom clearance for mobile nav */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-8 overflow-x-hidden">
        {/* VIEW 1: Orders / Live Tracking */}
        {currentTab === 'orders' && (
          <>
            {selectedProject ? (
              <ProjectTracker
                project={selectedProject}
                currentUser={currentUser}
                onOpenPayment={(p) => setPaymentProject(p)}
                onApproveDraft={handleApproveDraft}
                onRequestRevision={handleRequestRevision}
                onSendMessage={handleSendMessage}
                onBackToList={() => setSelectedProjectId(null)}
              />
            ) : (
              <div className="space-y-4 sm:space-y-6 text-right">
                {/* Customer Registration / Profile Status Card */}
                {!isCustomerRegistered || !activeCustomer ? (
                  <div className="bg-gradient-to-r from-amber-950/40 via-[#160f30] to-[#110c24] border border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                        <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>⛔ ثبت سفارش قفل است · ابتدا ثبت‌نام مشتری را تکمیل فرمایید</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed max-w-2xl">
                        ثبت سفارش انجام نمی‌گیرد تا زمانی که ثبت‌نام مشتری کامل شود. لطفاً ابتدا مشخصات کامل خود (۱. نام و فامیل، ۲. شماره همراه، ۳. تیک شبکه‌های اجتماعی فعال به ترتیب، ۴. آدرس دقیق ارسال سفارش، ۵. یوزرنیم و پسورد مراجعات بعدی) را ثبت نمایید.
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-1 md:pt-0">
                      <button
                        onClick={() => {
                          setPendingOrderAfterAuth(true);
                          setIsCustomerAuthOpen(true);
                        }}
                        className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-violet-600 hover:from-amber-500 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        <UserPlus className="w-4 h-4 shrink-0" />
                        <span>تکمیل ثبت‌نام مشتری جهت باز شدن ثبت سفارش</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#110c24] border border-emerald-500/40 rounded-2xl p-4 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>مشتری ثبت‌نام شده (مجاز به ثبت سفارش): {activeCustomer.name}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-violet-950/80 border border-violet-700/40 text-violet-300 font-mono text-[11px]">
                          یوزرنیم: {activeCustomer.username}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#0c081c] border border-violet-900/40 text-slate-300 font-mono text-[11px]">
                          شماره تماس: {activeCustomer.phone}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#0c081c] border border-violet-900/40 text-violet-400 font-mono text-[11px]">
                          تلگرام: {activeCustomer.telegramHandle}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 pt-0.5">
                        {activeCustomer.activeSocialNetworks && activeCustomer.activeSocialNetworks.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Share2 className="w-3.5 h-3.5 text-violet-400" />
                            <span className="text-slate-400">شبکه‌های فعال:</span>
                            {activeCustomer.activeSocialNetworks.map((sId, idx) => {
                              const info = SOCIAL_NETWORK_OPTIONS.find((o) => o.id === sId);
                              return (
                                <span
                                  key={sId}
                                  className="px-1.5 py-0.5 rounded bg-violet-900/40 border border-violet-700/40 text-violet-200"
                                >
                                  {idx + 1}.{info?.label.split(' ')[0] || sId}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {activeCustomer.deliveryAddress && (
                          <div className="flex items-start gap-1 text-amber-200/90 max-w-full">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span className="break-words">آدرس ارسال: {activeCustomer.deliveryAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setPendingOrderAfterAuth(false);
                          setIsCustomerAuthOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#181136] hover:bg-violet-900/50 border border-violet-700/40 text-violet-200 font-medium transition cursor-pointer"
                      >
                        ویرایش مشخصات
                      </button>
                      <button
                        onClick={handleCustomerLogout}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 font-medium transition flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>خروج</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Orders page header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-violet-900/30">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      پیگیری لحظه‌ای سفارش‌های طراحی گرافیک
                    </h1>
                    <p className="text-xs text-violet-300/70 mt-1">
                      مشاهده آخرین وضعیت فنی در ویراگرافیک، تایید هزینه‌ها، بازبینی نمونه‌های اولیه و دریافت فایل نهایی
                    </p>
                  </div>

                  <button
                    onClick={handleInitiateNewOrder}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition self-start sm:self-auto cursor-pointer ${
                      isCustomerRegistered
                        ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/30'
                        : 'bg-gradient-to-r from-amber-600 to-violet-700 hover:from-amber-500 hover:to-violet-600 shadow-amber-600/20'
                    }`}
                  >
                    {isCustomerRegistered ? (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>ثبت سفارش جدید</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>تکمیل ثبت‌نام و ثبت سفارش جدید</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Orders Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((proj) => {
                    const statusMeta = getStatusLabel(proj.status);

                    return (
                      <div
                        key={proj.id}
                        onClick={() => setSelectedProjectId(proj.id)}
                        className="bg-[#110c24] border border-violet-900/40 hover:border-violet-700/60 rounded-2xl p-5 shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-violet-300 font-bold bg-[#0c081c] px-2.5 py-0.5 rounded border border-violet-900/40">
                              {proj.orderCode}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-medium ${statusMeta.color}`}>
                              {statusMeta.label}
                            </span>
                          </div>

                          <h3 className="font-bold text-white text-sm group-hover:text-violet-400 transition-colors line-clamp-1">
                            {proj.title}
                          </h3>

                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                            {proj.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-violet-900/30 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>کانال ارتباطی:</span>
                            <span className="text-slate-200 flex items-center gap-1">
                              {proj.contactPreference === 'telegram' ? (
                                <>
                                  <Send className="w-3 h-3 text-violet-400" />
                                  <span>تلگرام {proj.customerTelegram}</span>
                                </>
                              ) : proj.contactPreference === 'phone' ? (
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
                          </div>

                          {proj.proposal && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">مبلغ برآورد شده:</span>
                              <span className="font-bold text-violet-400 font-mono">
                                {formatToman(proj.proposal.costToman)}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 text-[11px] text-violet-400 font-medium">
                            <span>مشاهده جزئیات و پرونده</span>
                            <ChevronLeft className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* VIEW 2: Portfolio & Services Catalog */}
        {currentTab === 'portfolio' && (
          <PortfolioShowcase
            projects={projects}
            currentUser={currentUser}
            onStartOrderWithCategory={() => {
              handleInitiateNewOrder();
            }}
          />
        )}

        {/* VIEW 3: Admin Management Panel */}
        {currentTab === 'admin' && (
          <AdminPanel
            projects={projects}
            currentUser={currentUser}
            onUpdateProjectProposal={handleUpdateProposal}
            onUploadDraft={handleUploadDraft}
            onDeliverFinalFiles={handleDeliverFinalFiles}
            onSelectProject={(project) => {
              setSelectedProjectId(project.id);
              setCurrentTab('orders');
            }}
            onLogout={handleAdminLogout}
            onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
          />
        )}

        {/* VIEW 4: Telegram Bot & Mini App Integration */}
        {currentTab === 'telegram' && (
          <TelegramBotModal
            config={telegramConfig}
            onUpdateConfig={setTelegramConfig}
            onTestSend={handleTestTelegramSend}
            latestProject={projects[0]}
          />
        )}
      </main>

      {/* Footer with mobile bottom bar clearance */}
      <footer className="border-t border-violet-950/60 bg-[#0c081c] pt-6 pb-24 md:pb-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded overflow-hidden bg-white p-0.5">
              <img src={VIRAGRAPHY_LOGO} alt="" className="w-full h-full object-cover" />
            </div>
            <p>© ۱۴۰۳ استودیو طراحی گرافیک ویراگرافیک (Viragraphy). تمامی حقوق محفوظ است.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-violet-300/70">
            <span>متصل به Telegram WebApp</span>
            <span>·</span>
            <span>پشتیبانی PWA</span>
            <span>·</span>
            <span>درگاه شاپرک</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CustomerAuthModal
        isOpen={isCustomerAuthOpen}
        onClose={() => {
          setIsCustomerAuthOpen(false);
          setPendingOrderAfterAuth(false);
        }}
        registeredCustomers={registeredCustomers}
        currentCustomer={activeCustomer}
        onRegisterSuccess={handleCustomerRegisterSuccess}
        onLoginSuccess={handleCustomerLoginSuccess}
        pendingOrderIntent={pendingOrderAfterAuth}
      />

      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        currentUser={currentUser}
        activeCustomer={activeCustomer}
        onRequireRegistration={() => {
          setPendingOrderAfterAuth(true);
          setIsCustomerAuthOpen(true);
        }}
        onSubmitOrder={handleCreateOrder}
      />

      {paymentProject && (
        <PaymentGatewayModal
          isOpen={!!paymentProject}
          onClose={() => setPaymentProject(null)}
          project={paymentProject}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Admin Authentication Password Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onSuccess={handleAdminLoginSuccess}
        onCancel={() => setIsAdminLoginModalOpen(false)}
      />

      {/* GitHub 0-100 Upload & Android APK (Cafe Bazaar / Google Play) Modal */}
      <GitHubAndApkModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Real-time Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={removeToast} />
    </div>
  );

  // If in Telegram Mini App simulated mode
  if (viewMode === 'telegram_app') {
    return (
      <div className="min-h-screen bg-[#07040f] flex flex-col items-center justify-center p-2 sm:p-4">
        {/* Top Control to Exit Simulator */}
        <div className="mb-3 flex items-center justify-between max-w-md w-full px-2 text-xs">
          <span className="text-violet-400 font-semibold flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" />
            شبیه‌ساز مینی‌اپلیکیشن تلگرام ویراگرافیک (Telegram WebApp)
          </span>
          <button
            onClick={() => setViewMode('desktop')}
            className="px-3 py-1 rounded-lg bg-[#161030] hover:bg-violet-600 text-white text-xs transition border border-violet-800"
          >
            خروج از شبیه‌ساز (وب‌سایت)
          </button>
        </div>

        {/* Telegram Phone Frame */}
        <div className="w-full max-w-md bg-[#0e1621] border-4 border-violet-950 rounded-[36px] shadow-2xl overflow-hidden flex flex-col h-[820px] max-h-[92vh]">
          {/* Telegram Header with Viragraphy Logo */}
          <div className="bg-[#17212b] px-4 py-3 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedProjectId) setSelectedProjectId(null);
                  else setViewMode('desktop');
                }}
                className="text-violet-400 text-xs font-medium"
              >
                بستن
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md overflow-hidden bg-white p-0.5">
                <img src={VIRAGRAPHY_LOGO} alt="" className="w-full h-full object-cover rounded-sm" />
              </div>
              <div className="text-right">
                <span className="font-bold text-xs block text-white">ویراگرافیک · Viragraphy</span>
                <span className="text-[10px] text-violet-400 block font-mono">bot mini app</span>
              </div>
            </div>
            <div className="text-slate-400 text-xs font-mono">⋮</div>
          </div>

          {/* Applet content inside Telegram */}
          <div className="flex-1 overflow-y-auto">{renderAppContent()}</div>
        </div>
      </div>
    );
  }

  // If in Mobile PWA simulated mode
  if (viewMode === 'mobile_pwa') {
    return (
      <div className="min-h-screen bg-[#07040f] flex flex-col items-center justify-center p-2 sm:p-4">
        <div className="mb-3 flex items-center justify-between max-w-sm w-full px-2 text-xs">
          <span className="text-violet-400 font-semibold flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            نمای وب‌اپ موبایل ویراگرافیک (Mobile PWA)
          </span>
          <button
            onClick={() => setViewMode('desktop')}
            className="px-3 py-1 rounded-lg bg-[#161030] hover:bg-violet-600 text-white text-xs transition border border-violet-800"
          >
            نمای وب‌سایت
          </button>
        </div>

        <div className="w-full max-w-sm bg-[#110c24] border-4 border-violet-950 rounded-[36px] shadow-2xl overflow-hidden flex flex-col h-[780px] max-h-[90vh]">
          <div className="flex-1 overflow-y-auto">{renderAppContent()}</div>
        </div>
      </div>
    );
  }

  // Default Desktop Web
  return renderAppContent();
}
