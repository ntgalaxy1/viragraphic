import { INITIAL_PROJECTS, INITIAL_TELEGRAM_CONFIG, INITIAL_USERS } from '../data/initialData';
import { Project, TelegramConfig, UserProfile } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'artline_projects_v2',
  TELEGRAM_CONFIG: 'artline_telegram_cfg_v2',
  CURRENT_USER_ID: 'artline_user_id_v2',
  REGISTERED_CUSTOMERS: 'viragraphy_registered_customers_v1',
  ACTIVE_CUSTOMER: 'viragraphy_active_customer_v1',
};

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed
          .filter((p: any) => p.category !== 'ui_ux_web' && p.category !== 'motion_3d')
          .map((p: Project) => {
            // Migrate any old @sara_mhd placeholder to @Ntgalaxy1
            const isLegacyPlaceholder =
              p.customerTelegram?.toLowerCase() === '@sara_mhd' ||
              p.customerName === 'سارا محمدی';
            if (isLegacyPlaceholder) {
              return {
                ...p,
                customerName: p.customerName === 'سارا محمدی' ? 'ناصر توکلی' : p.customerName,
                customerTelegram: '@Ntgalaxy1',
                customerPhone: p.customerPhone === '09124567890' ? '09121112233' : p.customerPhone,
              };
            }
            return p;
          });
        if (filtered.length > 0) return filtered;
      }
    }
  } catch (e) {
    console.error('Failed reading projects from localStorage', e);
  }
  return INITIAL_PROJECTS;
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed saving projects to localStorage', e);
  }
}

export function loadTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TELEGRAM_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...parsed,
        adminChatId: '257362200',
      };
    }
  } catch (e) {
    console.error('Failed reading telegram config', e);
  }
  return INITIAL_TELEGRAM_CONFIG;
}

export function saveTelegramConfig(config: TelegramConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TELEGRAM_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed saving telegram config', e);
  }
}

export function loadCurrentUserId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (raw) return raw;
  } catch {}
  return INITIAL_USERS[0].id;
}

export function saveCurrentUserId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
  } catch {}
}

export function loadRegisteredCustomers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_CUSTOMERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveRegisteredCustomers(customers: UserProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_CUSTOMERS, JSON.stringify(customers));
  } catch {}
}

export function isCustomerRegistrationComplete(customer: UserProfile | null | undefined): boolean {
  if (!customer) return false;
  if (customer.role !== 'customer' || !customer.isRegistered) return false;
  if (!customer.name || customer.name.trim().length < 3 || customer.name.includes('کاربر مهمان')) return false;
  if (!customer.phone || customer.phone.trim().length < 10) return false;
  if (!Array.isArray(customer.activeSocialNetworks) || customer.activeSocialNetworks.length === 0) return false;
  if (!customer.deliveryAddress || customer.deliveryAddress.trim().length < 8) return false;
  if (!customer.username || customer.username.trim().length < 3) return false;
  if (!customer.password || customer.password.trim().length < 4) return false;
  return true;
}

export function loadActiveCustomer(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_CUSTOMER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isCustomerRegistrationComplete(parsed)) {
        if (parsed.telegramHandle === '@sara_mhd') {
          parsed.telegramHandle = '@Ntgalaxy1';
        }
        return parsed;
      }
    }
  } catch {}
  return null;
}

export function saveActiveCustomer(customer: UserProfile | null): void {
  try {
    if (customer && isCustomerRegistrationComplete(customer)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CUSTOMER, JSON.stringify(customer));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CUSTOMER);
    }
  } catch {}
}
