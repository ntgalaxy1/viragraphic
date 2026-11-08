import { TelegramConfig } from '../types';
import { getCurrentShamsiDateTime } from './formatters';

export interface SendTelegramResult {
  success: boolean;
  isSimulated: boolean;
  messageId?: string;
  error?: string;
  resolvedChatId?: string | number;
  needsStartInBot?: boolean;
}

export async function sendTelegramNotification(
  config: TelegramConfig,
  targetChat: string,
  messageText: string,
  type: 'order_created' | 'proposal_sent' | 'draft_uploaded' | 'payment_received' | 'final_delivered'
): Promise<{ result: SendTelegramResult; updatedConfig: TelegramConfig }> {
  const timestamp = getCurrentShamsiDateTime();
  const logId = 'log_' + Date.now();
  const token = config.botToken.trim() || '7985891870:AAGi5Rc_UDU35TZg6JdxWtyCu7st3O1KzPk';

  // If simulation is turned off or real token exists, send via server proxy
  if (token && !config.isSimulated) {
    try {
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          chatId: targetChat,
          text: messageText,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();

      if (data.ok) {
        const newLog = {
          id: logId,
          timestamp,
          chatId: String(data.resolvedChatId || targetChat),
          messageText,
          type,
          status: 'sent' as const,
        };

        return {
          result: {
            success: true,
            isSimulated: false,
            messageId: String(data.result?.message_id),
            resolvedChatId: data.resolvedChatId,
          },
          updatedConfig: {
            ...config,
            logs: [newLog, ...config.logs.slice(0, 49)],
          },
        };
      } else {
        const errorMsg = data.description || data.error || 'خطا در ارسال پیام به تلگرام';
        const needsStartInBot = errorMsg.includes('chat not found') || errorMsg.includes('blocked');

        const newLog = {
          id: logId,
          timestamp,
          chatId: targetChat,
          messageText: `${messageText} (⚠️ ${needsStartInBot ? 'کاربر هنوز ربات را در تلگرام استارت نکرده است' : errorMsg})`,
          type,
          status: 'failed' as const,
        };

        return {
          result: {
            success: false,
            isSimulated: false,
            error: errorMsg,
            needsStartInBot,
          },
          updatedConfig: {
            ...config,
            logs: [newLog, ...config.logs.slice(0, 49)],
          },
        };
      }
    } catch (err: any) {
      console.warn('Network call to /api/telegram/send failed:', err);
    }
  }

  // Fallback Simulation Mode
  const newLog = {
    id: logId,
    timestamp,
    chatId: targetChat || config.botUsername,
    messageText,
    type,
    status: 'simulated' as const,
  };

  return {
    result: { success: true, isSimulated: true },
    updatedConfig: {
      ...config,
      logs: [newLog, ...config.logs.slice(0, 49)],
    },
  };
}

export async function fetchBotInfo(token: string) {
  try {
    const res = await fetch(`/api/telegram/info?token=${encodeURIComponent(token)}`);
    return await res.json();
  } catch (err) {
    return { ok: false, error: 'Failed to fetch bot info' };
  }
}

export async function fetchBotUpdates(token: string) {
  try {
    const res = await fetch(`/api/telegram/updates?token=${encodeURIComponent(token)}`);
    return await res.json();
  } catch (err) {
    return { ok: false, error: 'Failed to fetch bot updates' };
  }
}
