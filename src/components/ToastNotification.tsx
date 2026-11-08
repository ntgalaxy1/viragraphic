import React, { useEffect } from 'react';
import { Send, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type?: 'success' | 'info' | 'telegram' | 'warning';
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'telegram':
        return <Send className="w-4 h-4 text-sky-400 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'telegram':
        return 'border-sky-500/40 bg-slate-900/95';
      case 'success':
        return 'border-emerald-500/40 bg-slate-900/95';
      case 'warning':
        return 'border-amber-500/40 bg-slate-900/95';
      default:
        return 'border-slate-800 bg-slate-900/95';
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 ${getBorderColor()}`}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 text-right">
        <h4 className="text-xs font-semibold text-white">{toast.title}</h4>
        <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.description}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white p-1 -mr-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
