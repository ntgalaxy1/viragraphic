import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Telegram Bot credentials
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7985891870:AAGi5Rc_UDU35TZg6JdxWtyCu7st3O1KzPk';
const BOT_USERNAME = '@Viragraphicbot';
const ADMIN_USERNAME = '@Ntgalaxy1';
const ADMIN_NUMERIC_ID = 257362200;

// Resolve app URL for web access
const APP_URL = process.env.APP_URL || 'https://ais-dev-4cxncm3qqsaif7jupzp23b-972518644509.europe-west2.run.app';

app.use(express.json({ limit: '10mb' }));

// Allow CORS & iframe where possible
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// In-memory store for projects, registered customers & user conversation states
interface TelegramSession {
  step:
    | 'idle'
    | 'reg_name'
    | 'reg_phone'
    | 'reg_socials'
    | 'reg_address'
    | 'reg_credentials'
    | 'awaiting_category'
    | 'awaiting_title'
    | 'awaiting_description'
    | 'awaiting_reference';
  regData?: {
    name?: string;
    phone?: string;
    socialsText?: string;
    deliveryAddress?: string;
    username?: string;
    password?: string;
  };
  orderData: {
    category?: string;
    categoryTitle?: string;
    title?: string;
    description?: string;
    referenceUrl?: string;
    referenceName?: string;
  };
}

const userSessions = new Map<number, TelegramSession>();
const usernameToChatId = new Map<string, number>([
  ['ntgalaxy1', ADMIN_NUMERIC_ID],
  ['@ntgalaxy1', ADMIN_NUMERIC_ID],
]);

let serverCustomers: any[] = [];

function getCompletedCustomer(chatId: number, username?: string): any | null {
  const handle = username ? `@${username.toLowerCase()}` : '';
  return (
    serverCustomers.find(
      (c) =>
        c &&
        c.isRegistered &&
        c.name &&
        c.phone &&
        c.deliveryAddress &&
        c.username &&
        c.password &&
        (c.chatId === chatId || (handle && c.telegramHandle?.toLowerCase() === handle))
    ) || null
  );
}

// Shared in-memory projects store synced with frontend (pre-populated so the bot always has order context)
let serverProjects: any[] = [
  {
    id: 'prj_101',
    orderCode: 'VRA-8492',
    userId: 'usr_cust_1',
    customerName: 'ناصر توکلی',
    customerPhone: '09123456789',
    customerTelegram: '@Ntgalaxy1',
    title: 'طراحی لوگو و هویت بصری برند عطر «نارسیس»',
    category: 'logo_identity',
    description: 'نیازمند طراحی لوگوتایپ فارسی به همراه مونوگرام لاتین به سبک مینیمال و لوکس.',
    status: 'draft_ready',
    proposal: {
      costToman: 9800000,
      depositPercent: 50,
      estimatedDays: 6,
      deliveryDate: '۱۴۰۳/۰۸/۲۵',
    },
    createdAt: '۱۴۰۳/۰۸/۱۸',
    updatedAt: '۱۴۰۳/۰۸/۲۱',
  },
  {
    id: 'prj_102',
    orderCode: 'VRA-8510',
    userId: 'usr_cust_1',
    customerName: 'ناصر توکلی',
    customerPhone: '09123456789',
    customerTelegram: '@Ntgalaxy1',
    title: 'طراحی جعبه و لیبل زعفران صادراتی «زرین‌فام»',
    category: 'print_packaging',
    description: 'طراحی بسته‌بندی مقوایی کشویی برای مثقالی زعفران با طرح اسلیمی مدرن و طلاکوب.',
    status: 'proposal_ready',
    proposal: {
      costToman: 12500000,
      depositPercent: 50,
      estimatedDays: 7,
      deliveryDate: '۱۴۰۳/۰۸/۲۹',
    },
    createdAt: '۱۴۰۳/۰۸/۲۰',
    updatedAt: '۱۴۰۳/۰۸/۲۱',
  },
];

// Helper: Find latest project for a Telegram user (falls back to latest project in store)
function getLatestUserProject(chatId: number, username?: string): any | null {
  if (!serverProjects || serverProjects.length === 0) return null;
  const userHandle = username ? `@${username.toLowerCase()}` : '';
  const userMatches = serverProjects.filter(
    (p) =>
      p.userId === 'usr_tg_' + chatId ||
      (userHandle && p.customerTelegram?.toLowerCase() === userHandle)
  );
  if (userMatches.length > 0) {
    return userMatches[0];
  }
  return serverProjects[0];
}

// Helper: Build compact Telegram status card for the customer's latest order
function buildMiniStatusCardText(project: any): string {
  if (!project) return '';

  const statusConfig: Record<string, { label: string; icon: string; progress: string; stepText: string }> = {
    submitted: {
      label: 'در انتظار کارشناسی و قیمت‌گذاری',
      icon: '🟡',
      progress: '🟣⚪⚪⚪⚪⚪ (۱۵٪)',
      stepText: 'مرحله ۱ از ۶: ثبت و بررسی اولیه',
    },
    proposal_ready: {
      label: 'آماده تایید پیش‌فاکتور و پرداخت بیعانه',
      icon: '🟣',
      progress: '🟣🟣⚪⚪⚪⚪ (۳۵٪)',
      stepText: 'مرحله ۲ از ۶: صدور پیش‌فاکتور رسمی',
    },
    in_progress: {
      label: 'در حال طراحی توسط استودیو',
      icon: '🔵',
      progress: '🟣🟣🟣⚪⚪⚪ (۵۰٪)',
      stepText: 'مرحله ۳ از ۶: اجرای طراحی اختصاصی',
    },
    draft_ready: {
      label: 'اتود آماده بررسی و تایید شما',
      icon: '🟢',
      progress: '🟣🟣🟣🟣⚪⚪ (۷۰٪)',
      stepText: 'مرحله ۴ از ۶: ارسال اتود و پیش‌نمایش',
    },
    revision_requested: {
      label: 'در حال اعمال اصلاحیه درخواستی',
      icon: '🟠',
      progress: '🟣🟣🟣🟣⚪⚪ (۷۵٪)',
      stepText: 'مرحله ۴ از ۶: ویرایش و بازنگری طرح',
    },
    approved_final: {
      label: 'تایید نهایی · آماده تحویل فایل لایه‌باز',
      icon: '✨',
      progress: '🟣🟣🟣🟣🟣⚪ (۹۰٪)',
      stepText: 'مرحله ۵ از ۶: آماده‌سازی پکیج نهایی',
    },
    completed: {
      label: 'تکمیل و تحویل نهایی شده',
      icon: '✅',
      progress: '🟣🟣🟣🟣🟣🟣 (۱۰۰٪)',
      stepText: 'مرحله ۶ از ۶: تحویل کامل فایل‌های اصلی',
    },
  };

  const meta = statusConfig[project.status] || {
    label: 'در جریان بررسی',
    icon: '🟣',
    progress: '🟣🟣⚪⚪⚪⚪ (۳۰٪)',
    stepText: 'در حال پیگیری',
  };

  const costFormatted = project.proposal?.costToman
    ? `${Number(project.proposal.costToman).toLocaleString('fa-IR')} تومان`
    : 'در دست برآورد کارشناسی';

  const deliveryFormatted = project.proposal?.deliveryDate || project.preferredDeadline || 'طبق زمان‌بندی توافقی';

  return `┌──────────────────────────
📊 <b>کارت وضعیت آخرین سفارش شما</b>
├──────────────────────────
🔖 <b>کد سفارش:</b> <code>${project.orderCode}</code>
🎨 <b>عنوان:</b> ${project.title}
${meta.icon} <b>وضعیت فعلی:</b> <b>${meta.label}</b>
📈 <b>پیشرفت:</b> ${meta.progress}
📍 <b>گام اجرایی:</b> ${meta.stepText}
💳 <b>برآورد هزینه:</b> ${costFormatted}
📅 <b>موعد تحویل:</b> ${deliveryFormatted}
└──────────────────────────`;
}

// API: Sync projects from client
app.post('/api/projects/sync', (req, res) => {
  if (Array.isArray(req.body.projects) && req.body.projects.length > 0) {
    serverProjects = req.body.projects;
  }
  res.json({ ok: true, count: serverProjects.length });
});

app.get('/api/projects', (req, res) => {
  res.json({ ok: true, projects: serverProjects });
});

// API: Sync registered customers from client
app.post('/api/customers/sync', (req, res) => {
  if (Array.isArray(req.body.customers)) {
    serverCustomers = req.body.customers;
  }
  res.json({ ok: true, count: serverCustomers.length });
});

app.get('/api/customers', (req, res) => {
  res.json({ ok: true, customers: serverCustomers });
});

// Telegram Bot Info endpoint
app.get('/api/telegram/info', async (req, res) => {
  const token = (req.query.token as string) || BOT_TOKEN;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// Telegram getUpdates endpoint
app.get('/api/telegram/updates', async (req, res) => {
  const token = (req.query.token as string) || BOT_TOKEN;
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=-20`);
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// Telegram Send Message endpoint
app.post('/api/telegram/send', async (req, res) => {
  const { token = BOT_TOKEN, chatId, text, parse_mode = 'HTML', reply_markup } = req.body;

  if (!chatId || !text) {
    return res.status(400).json({ ok: false, error: 'chatId and text are required' });
  }

  let targetChatId = String(chatId).trim();

  // If username passed, resolve from cache if known
  const cleanKey = targetChatId.replace('@', '').toLowerCase();
  if (usernameToChatId.has(cleanKey)) {
    targetChatId = String(usernameToChatId.get(cleanKey));
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text,
        parse_mode,
        reply_markup,
      }),
    });

    const data = await response.json();
    if (data.ok) {
      return res.json({ ...data, resolvedChatId: targetChatId });
    }

    return res.status(400).json(data);
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// ----------------------------------------------------
// Automated Telegram Bot Engine
// ----------------------------------------------------
let lastUpdateId = 0;
let isPolling = false;

async function sendTelegram(chatId: number | string, text: string, replyMarkup?: any) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error sending telegram message:', err);
    return { ok: false };
  }
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    });
  } catch {}
}

// Get photo download URL from Telegram
async function getTelegramPhotoUrl(fileId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const data = await res.json();
    if (data.ok && data.result?.file_path) {
      return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
    }
  } catch {}
  return null;
}

const CATEGORY_NAMES: Record<string, string> = {
  logo: 'طراحی لوگو و هویت بصری',
  packaging: 'بسته‌بندی، لیبل و چاپ',
  poster: 'پوستر و تبلیغات محیطی',
  social: 'پست، استوری و اینستاگرام',
};

async function handleTelegramMessage(message: any) {
  if (!message || !message.chat) return;

  const chatId = message.chat.id;
  const from = message.from || {};
  const text = (message.text || '').trim();

  // Save username mapping
  if (from.username) {
    usernameToChatId.set(from.username.toLowerCase(), chatId);
    usernameToChatId.set(`@${from.username.toLowerCase()}`, chatId);
  }

  const senderName = from.first_name || from.username || 'کاربر گرامی';
  const isAdmin = chatId === ADMIN_NUMERIC_ID || from.username?.toLowerCase() === 'ntgalaxy1';
  const latestOrder = getLatestUserProject(chatId, from.username);
  const miniStatusCard = latestOrder ? buildMiniStatusCardText(latestOrder) : '';

  // Handle /start or restart
  if (text.startsWith('/start') || text === 'شروع' || text === 'منوی اصلی') {
    userSessions.set(chatId, { step: 'idle', orderData: {} });

    const welcomeMsg = `🎨 <b>به ربات رسمی استودیو طراحی گرافیک ویراگرافیک (Viragraphy) خوش آمدید!</b>

سلام <b>${senderName}</b> عزیز 🌸
${isAdmin ? '👑 <b>شما به عنوان مدیر استودیو شناسایی شدید.</b>' : 'سامانه هوشمند ثبت و پیگیری آنلاین سفارش‌های طراحی گرافیک.'}
${miniStatusCard ? `\n${miniStatusCard}\n` : ''}
برای استفاده از خدمات ویراگرافیک می‌توانید از گزینه‌های زیر استفاده کنید:`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '📊 کارت وضعیت آخرین سفارش', callback_data: 'bot_latest_status' },
          { text: '✏️ ثبت سفارش طراحی جدید', callback_data: 'bot_order_start' },
        ],
        [
          { text: '📂 همه سفارش‌های من', callback_data: 'bot_my_orders' },
          { text: '🌐 باز کردن وب‌سایت', url: APP_URL },
        ],
        [{ text: '📞 ارتباط با مدیریت (@Ntgalaxy1)', url: 'https://t.me/Ntgalaxy1' }],
      ],
    };

    const replyKeyboard = {
      keyboard: [
        [{ text: '📊 کارت وضعیت آخرین سفارش' }, { text: '✏️ ثبت سفارش طراحی' }],
        [{ text: '📂 پیگیری سفارشات' }, { text: '🌐 ورود به سایت' }],
      ],
      resize_keyboard: true,
      persistent: true,
    };

    await sendTelegram(chatId, welcomeMsg, inlineKeyboard);
    await sendTelegram(chatId, '👇 از منوی زیر همواره می‌توانید به بخش‌های مختلف دسترسی داشته باشید:', replyKeyboard);
    return;
  }

  // Handle dedicated Mini Status Card button/command
  if (text === '📊 کارت وضعیت آخرین سفارش' || text === '/status' || text.includes('وضعیت')) {
    if (miniStatusCard) {
      await sendTelegram(chatId, miniStatusCard, {
        inline_keyboard: [
          [
            { text: '🌐 مشاهده پرونده و اتودها در سایت', url: APP_URL },
            { text: '✏️ ثبت سفارش جدید', callback_data: 'bot_order_start' },
          ],
        ],
      });
    } else {
      await showUserOrders(chatId, from.username);
    }
    return;
  }

  // Handle Menu Buttons
  if (text === '✏️ ثبت سفارش طراحی' || text === '/new_order') {
    startOrderConversation(chatId, from);
    return;
  }

  if (text === '📂 پیگیری سفارشات' || text === '/my_orders') {
    showUserOrders(chatId, from.username);
    return;
  }

  if (text === '🌐 ورود به سایت' || text === '/website') {
    await sendTelegram(
      chatId,
      `🌐 <b>آدرس وب‌سایت و سامانه ویراگرافیک:</b>\n\nبرای دسترسی به پنل کامل، پیش‌نمایش طرح‌ها و پرداخت آنلاین وارد لینک زیر شوید:\n${APP_URL}`,
      {
        inline_keyboard: [[{ text: 'باز کردن وب‌سایت در مرورگر ↗️', url: APP_URL }]],
      }
    );
    return;
  }

  if (text === '📞 تماس با مدیریت' || text === '/contact') {
    await sendTelegram(
      chatId,
      `📞 <b>ارتباط با مدیریت استودیو ویراگرافیک:</b>\n\nمدیر مسئول: <b>ناصر توکلی (@Ntgalaxy1)</b>\nجهت مشاوره، ثبت سفارش اختصاصی یا هماهنگی تلفنی به آیدی مدیریت پیام دهید.`
    );
    return;
  }

  if (text === '/help' || text === 'راهنما' || text.includes('راهنما') || text === '/webapp' || text.includes('مینی اپ') || text.includes('خطا')) {
    const helpMsg = `💡 <b>راهنمای سامانه ویراگرافیک (Viragraphy):</b>

۱. <b>ثبت سفارش در تلگرام:</b>
کافیست دستور /new_order یا دکمه «✏️ ثبت سفارش طراحی» را بزنید. دسته‌بندی را انتخاب کنید، عنوان و توضیحات و در صورت داشتن، عکس نمونه را ارسال کنید. سفارش شما فوراً ثبت و به مدیریت ارجاع داده می‌شود.

۲. <b>کارت وضعیت هوشمند:</b>
هر زمان به ربات پیام بدهید، کارت وضعیت کوچک آخرین سفارش شما به صورت خودکار نمایش داده می‌شود.`;

    await sendTelegram(chatId, helpMsg, {
      inline_keyboard: [
        [
          { text: '📊 کارت وضعیت آخرین سفارش', callback_data: 'bot_latest_status' },
          { text: '✏️ ثبت سفارش مستقیم در تلگرام', callback_data: 'bot_order_start' },
        ],
        [{ text: '🌐 باز کردن وب‌سایت در مرورگر کروم', url: APP_URL }],
        [{ text: '📞 پشتیبانی تلگرام (@Ntgalaxy1)', url: 'https://t.me/Ntgalaxy1' }],
      ],
    });
    return;
  }

  // Step-by-step order creation flow in Telegram Chat
  const session = userSessions.get(chatId);
  if (session && session.step !== 'idle') {
    await processOrderStep(chatId, from, text, message.photo, session);
    return;
  }

  // Default response whenever customer sends ANY message: automatically include the compact status card of their latest order!
  const replyWithStatusCard = `💬 سلام <b>${senderName}</b> گرامی، پیام شما دریافت شد.\n\n${
    miniStatusCard
      ? `${miniStatusCard}\n\n👇 جهت مشاهده جزئیات کامل، تایید اتود یا ثبت سفارش جدید از دکمه‌های زیر استفاده فرمایید:`
      : 'جهت ثبت سفارش یا پیگیری وضعیت طرح‌ها از دکمه‌های زیر استفاده فرمایید:'
  }`;

  await sendTelegram(chatId, replyWithStatusCard, {
    inline_keyboard: [
      [
        { text: '📊 بروزرسانی کارت وضعیت', callback_data: 'bot_latest_status' },
        { text: '✏️ ثبت سفارش جدید', callback_data: 'bot_order_start' },
      ],
      [
        { text: '📂 همه سفارش‌ها', callback_data: 'bot_my_orders' },
        { text: '🌐 مشاهده سایت ویراگرافیک', url: APP_URL },
      ],
    ],
  });
}

// Start interactive intake (strictly gated by completed customer registration!)
async function startOrderConversation(chatId: number, from?: any) {
  const registeredCustomer = getCompletedCustomer(chatId, from?.username);

  if (!registeredCustomer) {
    userSessions.set(chatId, { step: 'reg_name', regData: {}, orderData: {} });
    const regPrompt = `⛔ <b>ثبت سفارش قفل است!</b>
تا زمانی که ثبت‌نام مشتری کامل نشود، امکان ثبت سفارش وجود ندارد.

👤 <b>گام ۱ از ۵ ثبت‌نام مشتری:</b>
لطفاً <b>نام و نام خانوادگی (اسم و فامیل)</b> خود را به طور کامل ارسال فرمایید:`;

    await sendTelegram(chatId, regPrompt, {
      inline_keyboard: [[{ text: '❌ انصراف', callback_data: 'order_cancel' }]],
    });
    return;
  }

  userSessions.set(chatId, { step: 'awaiting_category', orderData: {} });

  const text = `✅ <b>ثبت‌نام مشتری تایید شد (${registeredCustomer.name})</b>\n\n✏️ <b>مرحله ۱ از ۴ ثبت سفارش: دسته‌بندی طرح مورد نظر خود را انتخاب کنید:</b>`;
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🎨 طراحی لوگو و هویت', callback_data: 'cat:logo' },
        { text: '📦 بسته‌بندی و چاپ لوکس', callback_data: 'cat:packaging' },
      ],
      [
        { text: '🖼️ پوستر و بنر تبلیغاتی', callback_data: 'cat:poster' },
        { text: '📱 پست و استوری اینستاگرام', callback_data: 'cat:social' },
      ],
      [{ text: '❌ انصراف', callback_data: 'order_cancel' }],
    ],
  };

  await sendTelegram(chatId, text, keyboard);
}

async function processOrderStep(chatId: number, from: any, text: string, photo: any[], session: TelegramSession) {
  if (text === '❌ انصراف') {
    userSessions.set(chatId, { step: 'idle', orderData: {} });
    await sendTelegram(chatId, 'عملیات لغو گردید. هر زمان مایل بودید می‌توانید از منو شروع کنید.');
    return;
  }

  // ------------------------------------------------
  // Mandatory 5-Step Customer Registration Flow
  // ------------------------------------------------
  if (session.step === 'reg_name') {
    if (!text || text.length < 3) {
      await sendTelegram(chatId, '⚠️ لطفاً نام و نام خانوادگی کامل خود را وارد فرمایید (حداقل ۳ کاراکتر):');
      return;
    }
    session.regData = { ...session.regData, name: text };
    session.step = 'reg_phone';
    await sendTelegram(
      chatId,
      `✅ نام ثبت شد: <b>${text}</b>\n\n📱 <b>گام ۲ از ۵ ثبت‌نام مشتری:</b>\nلطفاً <b>شماره تلفن همراه برای تماس</b> را ارسال فرمایید (مثال: 09121234567):`
    );
    return;
  }

  if (session.step === 'reg_phone') {
    if (!text || text.length < 10) {
      await sendTelegram(chatId, '⚠️ لطفاً شماره تلفن همراه معتبر (۱۱ رقمی) وارد فرمایید:');
      return;
    }
    session.regData = { ...session.regData, phone: text };
    session.step = 'reg_socials';
    await sendTelegram(
      chatId,
      `✅ شماره همراه ثبت شد: <b>${text}</b>\n\n🌐 <b>گام ۳ از ۵ ثبت‌نام مشتری:</b>\n<b>در کدام شبکه‌های اجتماعی فعال هستید؟</b> به ترتیب اولویت بنویسید (مثال: ۱. تلگرام ۲. واتساپ ۳. اینستاگرام):`
    );
    return;
  }

  if (session.step === 'reg_socials') {
    if (!text || text.length < 2) {
      await sendTelegram(chatId, '⚠️ لطفاً حداقل یک شبکه اجتماعی فعال خود را به ترتیب اولویت بنویسید:');
      return;
    }
    session.regData = { ...session.regData, socialsText: text };
    session.step = 'reg_address';
    await sendTelegram(
      chatId,
      `✅ شبکه‌های اجتماعی ثبت شد: <b>${text}</b>\n\n📍 <b>گام ۴ از ۵ ثبت‌نام مشتری:</b>\nلطفاً <b>آدرس دقیق جهت ارسال سفارش</b> (شهر، خیابان، پلاک، واحد و کد پستی) را وارد فرمایید:`
    );
    return;
  }

  if (session.step === 'reg_address') {
    if (!text || text.length < 8) {
      await sendTelegram(chatId, '⚠️ لطفاً آدرس دقیق و کامل جهت ارسال سفارش را وارد فرمایید:');
      return;
    }
    session.regData = { ...session.regData, deliveryAddress: text };
    session.step = 'reg_credentials';
    await sendTelegram(
      chatId,
      `✅ آدرس دقیق ثبت شد.\n\n🔐 <b>گام ۵ از ۵ ثبت‌نام مشتری:</b>\nلطفاً یک <b>یوزرنیم و پسورد جهت مراجعات بعدی</b> با یک فاصله ارسال کنید (مثال: <code>naser 1234</code>):`
    );
    return;
  }

  if (session.step === 'reg_credentials') {
    const parts = text.trim().split(/\s+/);
    if (parts.length < 2 || parts[0].length < 3 || parts[1].length < 4) {
      await sendTelegram(
        chatId,
        '⚠️ لطفاً ابتدا نام کاربری (حداقل ۳ حرف) و سپس با یک فاصله رمز عبور (حداقل ۴ کاراکتر) را بفرستید (مثال: <code>naser 1234</code>):'
      );
      return;
    }

    const [uname, upass] = parts;
    const tgHandle = from.username ? `@${from.username}` : `@Ntgalaxy1`;
    const newCustomer = {
      id: 'usr_tg_' + chatId,
      chatId,
      name: session.regData?.name || 'مشتری ویراگرافیک',
      phone: session.regData?.phone || '',
      telegramHandle: tgHandle,
      activeSocialNetworks: ['telegram'],
      socialsRaw: session.regData?.socialsText || 'تلگرام',
      deliveryAddress: session.regData?.deliveryAddress || '',
      username: uname,
      password: upass,
      isRegistered: true,
      role: 'customer',
    };

    serverCustomers = [newCustomer, ...serverCustomers.filter((c) => c.chatId !== chatId)];

    await sendTelegram(
      chatId,
      `🎉 <b>ثبت‌نام شما با موفقیت تکمیل شد!</b>\n👤 نام: ${newCustomer.name}\n📱 تلفن: ${newCustomer.phone}\n🌐 شبکه‌های فعال: ${newCustomer.socialsRaw}\n📍 آدرس: ${newCustomer.deliveryAddress}\n🔐 نام کاربری: <code>${newCustomer.username}</code>\n\n✅ اکنون قفل ثبت سفارش برای شما باز شد!`
    );

    await startOrderConversation(chatId, from);
    return;
  }

  // ------------------------------------------------
  // Order Creation Steps (only reachable after registration)
  // ------------------------------------------------
  const registeredCustomer = getCompletedCustomer(chatId, from?.username);
  if (!registeredCustomer) {
    await startOrderConversation(chatId, from);
    return;
  }

  if (session.step === 'awaiting_title') {
    if (!text || text.length < 2) {
      await sendTelegram(chatId, 'لطفاً عنوان طرح یا نام برند خود را ارسال فرمایید (مثال: طراحی لوگو فروشگاه آرتین):');
      return;
    }
    session.orderData.title = text;
    session.step = 'awaiting_description';

    await sendTelegram(
      chatId,
      `✅ عنوان ثبت شد: <b>${text}</b>\n\n📝 <b>مرحله ۳ از ۴: لطفاً توضیحات و بریف طرح را بنویسید:</b>\n(زمینه فعالیت، سبک مورد نظر مینیمال یا کلاسیک، متن‌هایی که باید درج شود و هر نکته مهم دیگر)`
    );
    return;
  }

  if (session.step === 'awaiting_description') {
    if (!text || text.length < 5) {
      await sendTelegram(chatId, 'لطفاً توضیحات کامل‌تری درباره طرح مورد نظر خود بنویسید:');
      return;
    }
    session.orderData.description = text;
    session.step = 'awaiting_reference';

    await sendTelegram(
      chatId,
      `✅ توضیحات ثبت شد.\n\n📎 <b>مرحله ۴ از ۴: آیا عکس نمونه، اتود قبلی یا لوگوی قدیمی دارید؟</b>\n\n• اگر دارید: <b>عکس نمونه را همینجا ارسال فرمایید</b> 📷\n• اگر نمونه ندارید: کلمه <b>«ندارم»</b> را بفرستید.`
    );
    return;
  }

  if (session.step === 'awaiting_reference') {
    let refUrl = '';
    let refName = 'بدون فایل پیوست';

    if (photo && photo.length > 0) {
      const bestPhoto = photo[photo.length - 1];
      const downloadedUrl = await getTelegramPhotoUrl(bestPhoto.file_id);
      if (downloadedUrl) {
        refUrl = downloadedUrl;
        refName = 'عکس نمونه ارسالی از تلگرام';
      }
    }

    // Complete order creation using the registered customer's verified profile
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `VRA-${randomSuffix}`;
    const now = new Date().toLocaleDateString('fa-IR') + ' - ' + new Date().toLocaleTimeString('fa-IR');

    const customerUsername = registeredCustomer.telegramHandle || (from.username ? `@${from.username}` : `ChatID: ${chatId}`);
    const customerName = registeredCustomer.name;

    const newProject = {
      id: 'prj_tg_' + Date.now(),
      orderCode,
      userId: registeredCustomer.id || 'usr_tg_' + chatId,
      customerName,
      customerPhone: registeredCustomer.phone || '',
      customerTelegram: customerUsername,
      customerUsername: registeredCustomer.username,
      customerAddress: registeredCustomer.deliveryAddress,
      title: session.orderData.title || 'سفارش ثبت شده از تلگرام',
      category: session.orderData.category || 'logo_identity',
      description: session.orderData.description || 'ثبت شده از طریق ربات تلگرام',
      dimensions: 'قطع استاندارد',
      preferredStyle: 'طبق توافق با مشتری',
      colorPreferences: 'بنفش ویراگرافیک / طبق سلیقه مشتری',
      budgetExpectation: 'برآورد فنی مدیریت',
      preferredDeadline: '۵ روز کاری',
      contactPreference: 'telegram',
      referenceFiles: refUrl
        ? [
            {
              id: 'ref_' + Date.now(),
              name: refName,
              url: refUrl,
              sizeMb: 1.5,
              type: 'image',
              uploadedAt: now,
              uploadedBy: 'customer',
            },
          ]
        : [],
      status: 'submitted',
      draftFiles: [],
      finalDeliverables: [],
      revisionCount: 0,
      timeline: [
        {
          id: 'tl_' + Date.now(),
          title: 'ثبت سفارش از طریق ربات تلگرام',
          description: `سفارش توسط مشتری ثبت‌نام‌شده ${customerName} (${customerUsername}) در تلگرام ثبت شد.`,
          timestamp: now,
          actor: 'customer',
          channel: 'telegram',
        },
      ],
      messages: [],
      createdAt: now.split(' - ')[0],
      updatedAt: now.split(' - ')[0],
    };

    serverProjects.unshift(newProject);
    userSessions.set(chatId, { step: 'idle', orderData: {} });

    // Confirm to customer
    const receiptMsg = `🎉 <b>سفارش شما با موفقیت در ویراگرافیک ثبت شد!</b>

📋 <b>کد پیگیری:</b> <code>${orderCode}</code>
👤 <b>مشتری:</b> ${customerName} (${registeredCustomer.phone})
📍 <b>آدرس ارسال:</b> ${registeredCustomer.deliveryAddress}
🎨 <b>عنوان طرح:</b> ${newProject.title}
📂 <b>دسته‌بندی:</b> ${session.orderData.categoryTitle || 'طراحی گرافیک'}
${refUrl ? '📎 <b>فایل نمونه:</b> با موفقیت دریافت و پیوست شد.' : ''}

⏳ کارشناسان و مدیریت ویراگرافیک بریف شما را بررسی کرده و هزینه، شیوه انجام و زمان تحویل را به زودی در همین چت تلگرام به شما اعلام خواهند کرد.`;

    await sendTelegram(chatId, receiptMsg, {
      inline_keyboard: [
        [{ text: '📂 مشاهده سفارش در وب‌سایت', url: APP_URL }],
        [{ text: '📞 پیام به مدیریت (@Ntgalaxy1)', url: 'https://t.me/Ntgalaxy1' }],
      ],
    });

    // Notify Admin (Naser / @Ntgalaxy1)
    if (chatId !== ADMIN_NUMERIC_ID) {
      const adminAlert = `🔔 <b>سفارش جدید در ویراگرافیک ثبت شد!</b>

کد سفارش: <code>${orderCode}</code>
مشتری: ${customerName} (${customerUsername})
تلفن: ${registeredCustomer.phone}
آدرس: ${registeredCustomer.deliveryAddress}
عنوان: ${newProject.title}
توضیحات: ${newProject.description}
${refUrl ? `عکس نمونه: ${refUrl}` : ''}

لطفاً وارد پنل مدیریت در سایت شوید تا هزینه و زمان تحویل را برای مشتری تعیین فرمایید.`;

      await sendTelegram(ADMIN_NUMERIC_ID, adminAlert, {
        inline_keyboard: [[{ text: 'ورود به پنل مدیریت در سایت ↗️', url: APP_URL }]],
      });
    }
  }
}

// Show user orders
async function showUserOrders(chatId: number, username?: string) {
  const userHandle = username ? `@${username.toLowerCase()}` : '';
  let myProjects = serverProjects.filter(
    (p) =>
      p.userId === 'usr_tg_' + chatId ||
      (userHandle && p.customerTelegram?.toLowerCase() === userHandle)
  );

  if (myProjects.length === 0 && serverProjects.length > 0) {
    myProjects = serverProjects.slice(0, 2);
  }

  if (myProjects.length === 0) {
    await sendTelegram(
      chatId,
      `📂 شما در حال حاضر سفارش فعالی در سامانه ندارید.\nبرای ثبت سفارش جدید دکمه زیر را لمس فرمایید:`,
      {
        inline_keyboard: [[{ text: '✏️ ثبت سفارش طراحی جدید', callback_data: 'bot_order_start' }]],
      }
    );
    return;
  }

  const latestCard = buildMiniStatusCardText(myProjects[0]);
  let text = `${latestCard}\n\n📂 <b>لیست کل سفارش‌های شما در ویراگرافیک:</b>\n\n`;
  myProjects.slice(0, 5).forEach((p, i) => {
    const statusFa =
      p.status === 'submitted'
        ? 'در انتظار بررسی مدیریت'
        : p.status === 'proposal_ready'
        ? 'پیشنهاد قیمت آماده پرداخت'
        : p.status === 'in_progress'
        ? 'در حال طراحی'
        : p.status === 'draft_ready'
        ? 'اتود آماده بررسی'
        : p.status === 'approved_final'
        ? 'تایید شده / آماده تحویل'
        : 'تکمیل شده';

    text += `${i + 1}. <b>${p.title}</b> (<code>${p.orderCode}</code>)\nوضعیت: <b>${statusFa}</b>\n\n`;
  });

  await sendTelegram(chatId, text, {
    inline_keyboard: [[{ text: 'مشاهده کامل در وب‌سایت ویراگرافیک ↗️', url: APP_URL }]],
  });
}

// Callback queries handler
async function handleTelegramCallbackQuery(callbackQuery: any) {
  if (!callbackQuery || !callbackQuery.data) return;
  const chatId = callbackQuery.message?.chat?.id;
  const data = callbackQuery.data;

  await answerCallbackQuery(callbackQuery.id);

  if (data === 'bot_latest_status') {
    const latest = getLatestUserProject(chatId, callbackQuery.from?.username);
    if (latest) {
      await sendTelegram(chatId, buildMiniStatusCardText(latest), {
        inline_keyboard: [
          [
            { text: '🌐 مشاهده پرونده و اتودها در سایت', url: APP_URL },
            { text: '✏️ ثبت سفارش جدید', callback_data: 'bot_order_start' },
          ],
        ],
      });
    } else {
      await showUserOrders(chatId, callbackQuery.from?.username);
    }
    return;
  }

  if (data === 'bot_order_start') {
    startOrderConversation(chatId, callbackQuery.from);
    return;
  }

  if (data === 'bot_my_orders') {
    showUserOrders(chatId, callbackQuery.from?.username);
    return;
  }

  if (data.startsWith('cat:')) {
    if (!getCompletedCustomer(chatId, callbackQuery.from?.username)) {
      await startOrderConversation(chatId, callbackQuery.from);
      return;
    }

    const catKey = data.split(':')[1];
    const catTitle = CATEGORY_NAMES[catKey] || 'طراحی گرافیک';

    const session = userSessions.get(chatId) || { step: 'idle', orderData: {} };
    session.orderData.category = catKey;
    session.orderData.categoryTitle = catTitle;
    session.step = 'awaiting_title';
    userSessions.set(chatId, session);

    await sendTelegram(
      chatId,
      `✅ دسته‌بندی انتخاب شد: <b>${catTitle}</b>\n\n📝 <b>مرحله ۲ از ۴: لطفاً عنوان پروژه یا نام برند خود را بنویسید:</b>\n(مثال: طراحی لوگو برند جواهری ماهور)`
    );
    return;
  }

  if (data === 'order_cancel') {
    userSessions.set(chatId, { step: 'idle', orderData: {} });
    await sendTelegram(chatId, 'عملیات ثبت سفارش لغو شد.');
    return;
  }
}

async function pollTelegramUpdates() {
  if (isPolling) return;
  isPolling = true;

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=5`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = Math.max(lastUpdateId, update.update_id);

        if (update.message) {
          await handleTelegramMessage(update.message);
        } else if (update.callback_query) {
          await handleTelegramCallbackQuery(update.callback_query);
        }
      }
    }
  } catch (err) {
    // transient backoff
  } finally {
    isPolling = false;
    setTimeout(pollTelegramUpdates, 1200);
  }
}

// ----------------------------------------------------
// Express Vite App Server Setup
// ----------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    let viteMiddleware: any = null;
    const viteReadyPromise = (async () => {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false,
        },
        appType: 'spa',
      });
      viteMiddleware = vite.middlewares;
      return viteMiddleware;
    })();

    app.use(async (req, res, next) => {
      try {
        const mw = viteMiddleware || (await viteReadyPromise);
        mw(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Viragraphy app server listening on http://0.0.0.0:${PORT}`);
    pollTelegramUpdates();
  });
}

startServer();
