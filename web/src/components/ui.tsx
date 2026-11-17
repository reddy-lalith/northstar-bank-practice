import type { ReactNode } from 'react';
import type { CardStatus } from '../api/types';
import { formatCents } from '../lib/format';

export function Money({ cents, signed = false }: { cents: number; signed?: boolean }) {
  const cls = signed ? (cents >= 0 ? 'money pos' : 'money neg') : 'money';
  const text = signed && cents > 0 ? `+${formatCents(cents)}` : formatCents(cents);
  return <span className={cls}>{text}</span>;
}

export function Panel({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="panel">
      {(title || action) && (
        <div className="panel-head">
          {title && <h2>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({ status }: { status: CardStatus }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{status[0] + status.slice(1).toLowerCase()}</span>;
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}

export function ErrorText({ error }: { error: { message: string } | null | undefined }) {
  if (!error) return null;
  return <p className="error">{error.message}</p>;
}

export function Loading() {
  return <p className="muted">Loading…</p>;
}
