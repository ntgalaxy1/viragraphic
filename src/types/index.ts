export type ProjectStatus =
  | 'submitted'            // ثبت اولیه در انتظار بررسی مدیریت
  | 'under_review'         // در حال بررسی فنی توسط مدیر
  | 'proposal_ready'       // اعلام هزینه و زمان انجام توسط مدیر
  | 'payment_pending'      // در انتظار پرداخت صورتحساب
  | 'in_progress'          // تایید پرداخت و در حال طراحی
  | 'draft_ready'          // ارسال نمونه اولیه برای تایید مشتری
  | 'revision_requested'   // درخواست اصلاحیه از سمت مشتری
  | 'approved_final'       // تایید طرح و آماده‌سازی فایل نهایی
  | 'completed';           // تحویل نهایی و اتمام پروژه

export type CategoryId =
  | 'logo_identity'
  | 'social_media'
  | 'print_packaging'
  | 'poster_banner'
  | 'editorial_book';

export interface CategoryInfo {
  id: CategoryId;
  titleFa: string;
  titleEn: string;
  description: string;
  typicalDeliveryDays: number;
  basePriceToman: number;
  popularFormats: string[];
}

export interface ReferenceFile {
  id: string;
  name: string;
  url: string;
  sizeMb: number;
  type: 'image' | 'pdf' | 'archive' | 'vector';
  uploadedAt: string;
  uploadedBy: 'customer' | 'admin';
}

export interface DraftFile {
  id: string;
  title: string;
  version: number;
  previewUrl: string;
  designerNotes: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'revision';
}

export interface FinalDeliverable {
  id: string;
  title: string;
  format: 'AI Vector' | 'Layered PSD' | 'Print Ready PDF' | 'Web PNG/SVG' | 'Full Source ZIP';
  fileSize: string;
  downloadUrl: string;
  deliveredAt: string;
}

export type ContactMethod = 'website' | 'telegram' | 'phone';

export interface ProjectProposal {
  costToman: number;
  estimatedDays: number;
  deliveryDateShamsi: string;
  executionPlan: string;
  contactMethodUsed: ContactMethod;
  phoneCallNotes?: string;
  telegramMessageSent?: boolean;
  sentAt: string;
}

export interface PaymentRecord {
  transactionId: string;
  trackingCode: string;
  amountToman: number;
  gateway: 'شاپرک (سامان)' | 'زرین‌پال' | 'کارت به کارت تایید شده';
  paidAt: string;
  cardLast4?: string;
  receiptNumber: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  actor: 'customer' | 'admin' | 'system';
  channel?: 'website' | 'telegram' | 'phone';
}

export interface ProjectMessage {
  id: string;
  sender: 'customer' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
  sentViaTelegram?: boolean;
}

export type SocialNetworkId =
  | 'telegram'
  | 'whatsapp'
  | 'eitaa'
  | 'rubika'
  | 'bale'
  | 'instagram';

export interface Project {
  id: string;
  orderCode: string;             // e.g. VRA-2084
  userId: string;
  customerName: string;
  customerPhone: string;
  customerTelegram: string;
  customerUsername?: string;
  customerSocialNetworks?: SocialNetworkId[];
  customerAddress?: string;
  title: string;
  category: CategoryId;
  description: string;           // توضیحات کامل درخواست مشتری
  dimensions: string;            // ابعاد درخواستی
  preferredStyle?: string;       // سبک مورد نظر (مینیمال، مدرن، کلاسیک...)
  colorPreferences?: string;     // رنگ‌های سازمانی یا دلخواه
  preferredDeadline?: string;    // زمان مورد نظر مشتری
  budgetExpectation?: string;    // بودجه تقریبی در نظر گرفته شده
  contactPreference: ContactMethod;
  referenceFiles: ReferenceFile[];
  status: ProjectStatus;
  proposal?: ProjectProposal;
  payment?: PaymentRecord;
  draftFiles: DraftFile[];
  finalDeliverables: FinalDeliverable[];
  revisionCount: number;
  revisionNotes?: string;
  timeline: TimelineEvent[];
  messages: ProjectMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface TelegramConfig {
  botToken: string;
  adminChatId: string;
  botUsername: string;
  enableAutoNotify: boolean;
  isSimulated: boolean;
  logs: {
    id: string;
    timestamp: string;
    chatId: string;
    messageText: string;
    type: 'order_created' | 'proposal_sent' | 'draft_uploaded' | 'payment_received' | 'final_delivered';
    status: 'sent' | 'failed' | 'simulated';
  }[];
}

export interface UserProfile {
  id: string;
  name: string;                  // اسم و فامیل
  phone: string;                 // شماره تلفن همراه برای تماس
  telegramHandle: string;        // آیدی تلگرام
  activeSocialNetworks?: SocialNetworkId[]; // در کدام شبکه‌های اجتماعی فعال است (به ترتیب انتخاب)
  deliveryAddress?: string;      // آدرس جهت ارسال سفارش (دقیق)
  username?: string;             // یوزرنیم جهت مراجعه برای دفعات بعدی
  password?: string;             // پسورد جهت مراجعه برای دفعات بعدی
  isRegistered?: boolean;        // آیا ثبت‌نام مشتری تکمیل شده است
  role: 'customer' | 'admin';
}

export interface TelegramWebhookInfo {
  url: string;
  hasCustomCertificate: boolean;
  pendingUpdateCount: number;
  lastErrorDate: number | null;
  lastErrorMessage: string | null;
  lastSyncErrorDate?: number | null;
  maxConnections?: number;
  ipAddress?: string | null;
}

export interface TelegramConnectivityDiagnostic {
  id: string;
  name: string;
  status: 'pass' | 'warning' | 'fail' | 'info' | 'skipped';
  detail: string;
}

export interface TelegramConnectivityReport {
  ok: boolean;
  latencyMs: number;
  timestamp: string;
  error?: string;
  errorCode?: number;
  bot?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
    supports_inline_queries?: boolean;
  } | null;
  webhook?: TelegramWebhookInfo | null;
  mode?: 'webhook' | 'polling' | 'none';
  diagnostics: TelegramConnectivityDiagnostic[];
}
