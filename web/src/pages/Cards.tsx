import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { Account, Card } from '../api/types';
import { ErrorText, Loading, Money, Panel, StatusBadge, Tag } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { toDollars } from '../lib/format';

export function Cards() {
  const cards = useApi<{ cards: Card[] }>('/cards');
  const accounts = useApi<{ accounts: Account[] }>('/accounts');
  const [showForm, setShowForm] = useState(false);

  const nameOf = (accountId: string) => accounts.data?.accounts.find((a) => a.id === accountId)?.nickname ?? '';

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Cards</h1>
        <button className="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New virtual card'}
        </button>
      </div>

      {showForm && accounts.data && (
        <NewVirtualCard
          accounts={accounts.data.accounts}
          onCreated={() => {
            setShowForm(false);
            cards.reload();
          }}
        />
      )}

      <ErrorText error={cards.error} />
      {cards.loading && !cards.data && <Loading />}
      <div className="card-grid">
        {cards.data?.cards.map((c) => (
          <Link key={c.id} to={`/cards/${c.id}`} className={`card-face ${c.kind.toLowerCase()} ${c.status.toLowerCase()}`}>
            <div className="card-face-top">
              <span>{c.nickname}</span>
              <StatusBadge status={c.status} />
            </div>
            <div className="card-number">{c.maskedNumber}</div>
            <div className="card-face-bottom">
              <span className="small">{nameOf(c.accountId)}</span>
              <span className="small">{c.network}</span>
            </div>
            <div className="tags">
              {c.kind === 'VIRTUAL' && <Tag>Virtual</Tag>}
              {c.merchantLock && <Tag>Locked to {c.merchantLock}</Tag>}
              {c.singleUse && <Tag>Single-use</Tag>}
              {c.spendLimitCents !== null && (
                <Tag>
                  Limit <Money cents={c.spendLimitCents} />
                </Tag>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function NewVirtualCard({ accounts, onCreated }: { accounts: Account[]; onCreated: () => void }) {
  const eligible = accounts.filter((a) => a.type !== 'SAVINGS');
  const [accountId, setAccountId] = useState(eligible.find((a) => a.type === 'CREDIT')?.id ?? eligible[0]?.id ?? '');
  const [nickname, setNickname] = useState('');
  const [merchantLock, setMerchantLock] = useState('');
  const [singleUse, setSingleUse] = useState(false);
  const [spendLimit, setSpendLimit] = useState('');
  const [error, setError] = useState<ApiError | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api('/cards/virtual', {
        method: 'POST',
        body: {
          accountId,
          nickname,
          merchantLock: merchantLock || null,
          singleUse,
          spendLimit: spendLimit ? toDollars(spendLimit) : null,
        },
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', String(err)));
    }
  };

  return (
    <Panel title="New virtual card">
      <form className="form form-grid" onSubmit={submit}>
        <label>
          Funding account
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {eligible.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nickname}
              </option>
            ))}
          </select>
        </label>
        <label>
          Nickname
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="e.g. Spotify" />
        </label>
        <label>
          Lock to merchant (optional)
          <input value={merchantLock} onChange={(e) => setMerchantLock(e.target.value)} placeholder="Merchant name" />
        </label>
        <label>
          Spend limit per purchase (optional)
          <input inputMode="decimal" value={spendLimit} onChange={(e) => setSpendLimit(e.target.value)} placeholder="0.00" />
        </label>
        <label className="check">
          <input type="checkbox" checked={singleUse} onChange={(e) => setSingleUse(e.target.checked)} />
          Single-use (stops working after the first purchase)
        </label>
        <ErrorText error={error} />
        <button className="primary" disabled={!nickname}>
          Create card
        </button>
      </form>
    </Panel>
  );
}
