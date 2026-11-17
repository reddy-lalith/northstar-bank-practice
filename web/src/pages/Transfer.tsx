import { useEffect, useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import type { Account } from '../api/types';
import { ErrorText, Loading, Money, Panel } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { formatCents, toDollars } from '../lib/format';

interface TransferResponse {
  transfer: { transferId: string; amountCents: number; isCardPayment: boolean };
}

export function Transfer() {
  const accounts = useApi<{ accounts: Account[] }>('/accounts');
  const list = accounts.data?.accounts ?? [];
  const sources = list.filter((a) => a.type !== 'CREDIT');

  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!fromId && sources[0]) setFromId(sources[0].id);
    if (!toId && list[1]) setToId(list[1].id);
  }, [list, sources, fromId, toId]);

  const from = list.find((a) => a.id === fromId);
  const to = list.find((a) => a.id === toId);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await api<TransferResponse>('/transfers', {
        method: 'POST',
        body: { fromAccountId: fromId, toAccountId: toId, amount: toDollars(amount), memo: memo || undefined },
      });
      setDone(
        `${res.transfer.isCardPayment ? 'Payment' : 'Transfer'} of ${formatCents(res.transfer.amountCents)} complete.`,
      );
      setAmount('');
      setMemo('');
      accounts.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', String(err)));
    } finally {
      setBusy(false);
    }
  };

  if (accounts.loading && !accounts.data) return <Loading />;

  return (
    <div className="stack narrow">
      <h1>Move money</h1>
      <Panel>
        <form className="form" onSubmit={submit}>
          <label>
            From
            <select value={fromId} onChange={(e) => setFromId(e.target.value)}>
              {sources.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nickname} ({formatCents(a.availableCents)})
                </option>
              ))}
            </select>
          </label>
          <label>
            To
            <select value={toId} onChange={(e) => setToId(e.target.value)}>
              {list
                .filter((a) => a.id !== fromId)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nickname}
                    {a.type === 'CREDIT' ? ` (owed ${formatCents(a.balanceCents)})` : ''}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Amount
            <input inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label>
            Memo (optional)
            <input value={memo} maxLength={80} onChange={(e) => setMemo(e.target.value)} />
          </label>
          {from && (
            <p className="muted small">
              Available in {from.nickname}: <Money cents={from.availableCents} />
              {to?.type === 'CREDIT' && <> · Paying {to.nickname}</>}
            </p>
          )}
          <ErrorText error={error} />
          {done && <p className="success">{done}</p>}
          <button className="primary" disabled={busy || !amount}>
            {busy ? 'Sending…' : to?.type === 'CREDIT' ? 'Make payment' : 'Transfer'}
          </button>
        </form>
      </Panel>
    </div>
  );
}
