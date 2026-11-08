import React, { useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors whitespace-nowrap shrink-0"
          title="نصب وب‌اپلیکیشن روی دستگاه"
        >
          <Download className="w-3.5 h-3.5" />
          <span>نصب اپلیکیشن (PWA)</span>
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          title="نصب در آیفون / آیپد"
        >
          <Download className="w-3.5 h-3.5" />
          <span>نصب روی iOS</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-semibold text-white">نصب روی آیفون و آیپد (iOS)</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-4 space-y-3 text-sm text-slate-300 leading-relaxed">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/50">
                <Share className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">۱. دکمه Share</span>
                  <p className="text-xs text-slate-400 mt-0.5">در نوار پایین مرورگر سافاری روی آیکون اشتراک‌گذاری کلیک کنید.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/50">
                <PlusSquare className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">۲. Add to Home Screen</span>
                  <p className="text-xs text-slate-400 mt-0.5">منو را اسکرول کرده و گزینه «افزودن به صفحه اصلی» را لمس فرمایید.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
};
