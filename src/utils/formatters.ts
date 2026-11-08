export function formatToman(amount: number): string {
  if (isNaN(amount) || amount === undefined || amount === null) return '۰ تومان';
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
}

export function toPersianDigits(n: number | string): string {
  if (n === null || n === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

export function getCurrentShamsiDateTime(): string {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(now).replace(',', ' -');
  } catch {
    return '۱۴۰۳/۰۸/۱۶ - ' + now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
  }
}

export function getStatusLabel(status: string): { label: string; color: string; stepNumber: number } {
  switch (status) {
    case 'submitted':
      return { label: 'ثبت اولیه / در انتظار بررسی', color: 'text-amber-400 bg-amber-950/60 border-amber-800/60', stepNumber: 1 };
    case 'under_review':
      return { label: 'در حال بررسی فنی مدیریت', color: 'text-sky-400 bg-sky-950/60 border-sky-800/60', stepNumber: 2 };
    case 'proposal_ready':
      return { label: 'پیشنهاد آماده / منتظر پرداخت', color: 'text-violet-400 bg-violet-950/60 border-violet-800/60', stepNumber: 3 };
    case 'payment_pending':
      return { label: 'در انتظار پرداخت صورتحساب', color: 'text-orange-400 bg-orange-950/60 border-orange-800/60', stepNumber: 3 };
    case 'in_progress':
      return { label: 'پرداخت شد / در حال طراحی', color: 'text-blue-400 bg-blue-950/60 border-blue-800/60', stepNumber: 4 };
    case 'draft_ready':
      return { label: 'نمونه اولیه آماده تایید مشتری', color: 'text-pink-400 bg-pink-950/60 border-pink-800/60', stepNumber: 5 };
    case 'revision_requested':
      return { label: 'درخواست اصلاحیه مشتری', color: 'text-amber-300 bg-amber-950/60 border-amber-800/60', stepNumber: 5 };
    case 'approved_final':
      return { label: 'طرح تایید شد / آماده‌سازی فایل‌ها', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60', stepNumber: 6 };
    case 'completed':
      return { label: 'تحویل نهایی و تکمیل شده', color: 'text-teal-400 bg-teal-950/60 border-teal-800/60', stepNumber: 7 };
    default:
      return { label: 'نامشخص', color: 'text-slate-400 bg-slate-900 border-slate-700', stepNumber: 1 };
  }
}
