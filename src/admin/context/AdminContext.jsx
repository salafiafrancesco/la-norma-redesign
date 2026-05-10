import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  auth as authApi,
  inquiries as inquiriesApi,
  cateringRequests as cateringRequestsApi,
  bookings as bookingsApi,
  homepageContent as homepageContentApi,
} from '../api/client';

const AdminContext = createContext(null);
const SEEN_KEY_PREFIX = 'ln_admin_seen:';
const EMPTY_NOTIFICATIONS = { inquiries: 0, catering: 0, experiences: 0, newsletter: 0 };

function getSeenAt(key) {
  try {
    const raw = localStorage.getItem(`${SEEN_KEY_PREFIX}${key}`);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

function setSeenAt(key, ts) {
  try {
    localStorage.setItem(`${SEEN_KEY_PREFIX}${key}`, String(ts));
  } catch {
    // Storage may be unavailable in private mode; ignore.
  }
}

async function fetchNotificationCounts() {
  const [inquiriesResult, cateringResult, bookingsResult, subscribersResult] = await Promise.allSettled([
    inquiriesApi.list(),
    cateringRequestsApi.list(),
    bookingsApi.list(),
    homepageContentApi.listSubscribers(),
  ]);

  const inquiries = inquiriesResult.status === 'fulfilled'
    ? inquiriesResult.value.filter((entry) => entry.status === 'new').length
    : 0;

  const catering = cateringResult.status === 'fulfilled'
    ? cateringResult.value.filter((entry) => entry.status === 'new').length
    : 0;

  const experiences = bookingsResult.status === 'fulfilled'
    ? bookingsResult.value.filter((entry) => entry.status === 'pending').length
    : 0;

  const newsletterSeenAt = getSeenAt('newsletter');
  const newsletter = subscribersResult.status === 'fulfilled'
    ? subscribersResult.value.filter((entry) => {
        const ts = Date.parse(entry.subscribed_at || entry.created_at || '') || 0;
        return ts > newsletterSeenAt;
      }).length
    : 0;

  return { inquiries, catering, experiences, newsletter };
}

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(authApi.getToken()));
  const [notifications, setNotifications] = useState(EMPTY_NOTIFICATIONS);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const token = authApi.getToken();

    if (!token) return undefined;

    authApi.me()
      .then((user) => {
        if (!cancelled) {
          setAdmin(user);
        }
      })
      .catch(() => {
        authApi.logout();
      })
      .finally(() => {
        if (!cancelled) {
          setChecking(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const counts = await fetchNotificationCounts();
      setNotifications(counts);
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!admin) {
      setNotifications(EMPTY_NOTIFICATIONS);
      return;
    }
    refreshNotifications();
  }, [admin, refreshNotifications]);

  const markTabSeen = useCallback((key) => {
    // Newsletter has no per-item status — clearing the badge is tied to a "seen" timestamp.
    // The other tabs clear naturally when items move out of the new/pending status and
    // the admin refreshes notifications.
    if (key === 'newsletter') {
      setSeenAt('newsletter', Date.now());
      setNotifications((prev) => ({ ...prev, newsletter: 0 }));
    }
  }, []);

  const login = useCallback(async (username, password, totpCode) => {
    const { token, username: user } = await authApi.login(username, password, totpCode);
    authApi.saveToken(token);
    setAdmin({ username: user });
    setChecking(false);
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setAdmin(null);
    setChecking(false);
  }, []);

  return (
    <AdminContext.Provider
      value={{
        admin,
        checking,
        login,
        logout,
        notifications,
        notificationsLoading,
        refreshNotifications,
        markTabSeen,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error('useAdmin must be used inside AdminProvider.');
  }

  return context;
}
