import { useState } from 'react';
import type { Notification } from '../api/types';
import { useApi } from '../hooks/useApi';
import { formatDateTime } from '../lib/format';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data, reload } = useApi<{ notifications: Notification[] }>('/notifications');
  const items = data?.notifications ?? [];

  return (
    <div className="bell">
      <button
        className="link"
        onClick={() => {
          if (!open) reload();
          setOpen(!open);
        }}
      >
        Alerts{items.length ? ` (${items.length})` : ''}
      </button>
      {open && (
        <div className="bell-panel">
          {items.length === 0 && <p className="muted">No alerts</p>}
          {items.map((n) => (
            <div key={n.id} className="bell-item">
              <div>{n.message}</div>
              <div className="muted small">{formatDateTime(n.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
