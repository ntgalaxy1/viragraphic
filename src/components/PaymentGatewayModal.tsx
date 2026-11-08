import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project } from '../types';
import { formatToman, getCurrentShamsiDateTime } from '../utils/formatters';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onPaymentSuccess: (project: Project, trackingCode: string, receiptNumber: string) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  project,
  onPaymentSuccess,
}) => {
  const [cardNumber, setCardNumber] = useState('6037 9974 ');
  const [cvv2, setCvv2] = useState('482');
  const [expMonth, setExpMonth] = useState('08');
  const [expYear, setExpYear] = useState('05');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState<{ trackingCode: string; receiptNumber: string } | null>(null);

  if (!isOpen) return null;

  const amount = project.proposal?.costToman || 4500000;

  const handleSendOtp = () => {
    setOtpSent(true);
    setOtpCode('849201'); // Auto-fill demo OTP
  };

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentDone(true);
      const tracking = 'SHP-' + Math.floor(100000 + Math.random() * 900000);
      const receipt = 'REC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      setReceiptInfo({ trackingCode: tracking, receiptNumber: receipt });

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#7C3AED', '#8B5CF6', '#C084FC', '#38BDF8'],
        });
      } catch {}

      onPaymentSuccess(project, tracking, receipt);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-[#110c24] border border-violet-900/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Gateway Bar */}
        <div className="bg-[#0c081c] px-5 py-3 border-b border-violet-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-white">درگاه پرداخت امن شاپرک · ویراگرافیک</span>
              <span className="block text-[10px] text-slate-400">اتصال رمزنگاری شده ۲۵۶ بیتی SSL</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-violet-950/40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {paymentDone && receiptInfo ? (
          /* Receipt Success State */
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">پرداخت صورتحساب با موفقیت انجام شد</h3>
              <p className="text-xs text-slate-400 mt-1">پروژه به مرحله «طراحی و پیاده‌سازی» منتقل گردید.</p>
            </div>

            <div className="bg-[#0c081c] rounded-xl p-4 border border-violet-900/30 text-xs space-y-2 text-right">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">مبلغ پرداخت شده:</span>
                <span className="font-bold text-violet-400 font-mono">{formatToman(amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">کد پیگیری شاپرک:</span>
                <span className="font-mono text-white font-medium">{receiptInfo.trackingCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">شماره رسید دیجیتال:</span>
                <span className="font-mono text-white font-medium">{receiptInfo.receiptNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">پروژه:</span>
                <span className="text-slate-200 truncate max-w-[200px]">{project.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">زمان تراکنش:</span>
                <span className="text-slate-300 font-mono">{getCurrentShamsiDateTime()}</span>
              </div>
            </div>

            <p className="text-[11px] text-violet-300">
              ✓ رسید و تاییدیه شروع پروژه هم‌اکنون به ربات تلگرام و پنل کاربری شما در ویراگرافیک ارسال شد.
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition shadow-lg shadow-violet-600/30"
            >
              مشاهده وضعیت لحظه‌ای پروژه در داشبورد
            </button>
          </div>
        ) : (
          /* Payment Form */
          <div className="p-6 space-y-5">
            {/* Invoice summary */}
            <div className="bg-[#0c081c] rounded-xl p-4 border border-violet-900/30 text-xs space-y-1.5 text-right">
              <div className="flex items-center justify-between pb-2 border-b border-violet-900/30">
                <span className="text-slate-400">پروژه:</span>
                <span className="text-white font-semibold truncate max-w-[220px]">{project.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">کد سفارش:</span>
                <span className="font-mono text-violet-400 font-bold">{project.orderCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">زمان برآورد تحویل اتود:</span>
                <span className="text-slate-200">{project.proposal?.estimatedDays || 4} روز کاری ({project.proposal?.deliveryDateShamsi || 'طبق توافق'})</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-violet-900/30 text-sm">
                <span className="font-medium text-slate-300">مبلغ قابل پرداخت:</span>
                <span className="font-bold text-violet-400 font-mono">{formatToman(amount)}</span>
              </div>
            </div>

            {/* Simulated Card Input */}
            <div className="space-y-3 text-right">
              <div>
                <label className="block text-xs text-slate-300 mb-1">شماره کارت بانکی (۱۶ رقم)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    dir="ltr"
                    className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono tracking-wider focus:outline-hidden focus:border-violet-500 pl-10"
                    placeholder="6037-****-****-****"
                  />
                  <CreditCard className="w-4 h-4 text-violet-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">کد CVV2</label>
                  <input
                    type="password"
                    value={cvv2}
                    onChange={(e) => setCvv2(e.target.value)}
                    maxLength={4}
                    dir="ltr"
                    className="w-full bg-[#0c081c] border border-violet-900/40 rounded-xl px-3.5 py-2 text-xs text-white font-mono tracking-widest focus:outline-hidden focus:border-violet-500 text-center"
                    placeholder="***"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">تاریخ انقضا (ماه / سال)</label>
                  <div className="flex items-center gap-1.5" dir="ltr">
                    <input
                      type="text"
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value)}
                      maxLength={2}
                      className="w-1/2 bg-[#0c081c] border border-violet-900/40 rounded-xl py-2 text-xs text-white font-mono text-center focus:outline-hidden focus:border-violet-500"
                      placeholder="MM"
                    />
                    <span className="text-slate-600">/</span>
                    <input
                      type="text"
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value)}
                      maxLength={2}
                      className="w-1/2 bg-[#0c081c] border border-violet-900/40 rounded-xl py-2 text-xs text-white font-mono text-center focus:outline-hidden focus:border-violet-500"
                      placeholder="YY"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">رمز پویا (یکبار مصرف پیامکی)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    dir="ltr"
                    placeholder="رمز دریافتی پیامک"
                    className="flex-1 bg-[#0c081c] border border-violet-900/40 rounded-xl px-3.5 py-2 text-xs text-white font-mono tracking-widest focus:outline-hidden focus:border-violet-500 text-center"
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="px-3 py-2 rounded-xl border border-violet-800 bg-[#1a1238] hover:bg-[#23194a] text-xs text-violet-200 whitespace-nowrap transition"
                  >
                    {otpSent ? 'رمز ارسال شد (۸۴۹۲۰۱)' : 'درخواست رمز پویا'}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePay}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>در حال اعتبارسنجی بانکی شاپرک...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>پرداخت آنلاین {formatToman(amount)} و شروع طراحی</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-violet-300/60 text-center mt-2">
                🔒 پرداخت شما مشمول ضمانت رضایت ۱۰۰٪ و بازگشت وجه استودیو ویراگرافیک (Viragraphy) است.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
