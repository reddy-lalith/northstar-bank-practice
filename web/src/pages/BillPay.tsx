import { useState, type FormEvent } from 'react';
import { api, ApiError } from '../api/client';
import { CATEGORIES, type Account, type Category, type Payee } from '../api/types';
import { ErrorText, Panel } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { formatCents, titleCase, toDollars } from '../lib/format';

export function BillPay() {
  const payees = useApi<{ payees: Payee[] }>('/payees');
  const accounts = useApi<{ accounts: Account[] }>('/accounts');
  const checking = accounts.data?.accounts.find((a) => a.type === 'CHECKING');

  const [payeeId, setPayeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    if (!checking) return;
    setError(null);
    setMessage(null);
    try {
      const res = await api<{ transaction: { amountCents: number } }>('/payees/pay', {
        method: 'POST',
        body: { payeeId: payeeId || payees.data?.payees[0]?.id, fromAccountId: checking.id, amount: toDollars(amount) },
      });
      setMessage(`Paid ${formatCents(res.transaction.amountCents)}.`);
      setAmount('');
      accounts.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', String(err)));
    }
  };

  return (
    <div className="stack">
      <h1>Bill pay</h1>
      <div className="grid-2">
        <Panel title="Pay a bill">
          <form className="form" onSubmit={pay}>
            <label>
              Payee
              <select value={payeeId} onChange={(e) => setPayeeId(e.target.value)}>
                {payees.data?.payees.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (••{p.accountLast4})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Amount
              <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
            </label>
            {checking && (
              <p className="muted small">
                From {checking.nickname} · {formatCents(checking.availableCents)} available
              </p>
            )}
            <ErrorText error={error} />
            {message && <p className="success">{message}</p>}
            <button className="primary" disabled={!amount}>
              Pay
            </button>
          </form>
        </Panel>
        <AddPayee onAdded={payees.reload} />
      </div>
    </div>
  );
}

function AddPayee({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState('');
  const [last4, setLast4] = useState('');
  const [category, setCategory] = useState<Category>('UTILITIES');
  const [error, setError] = useState<ApiError | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api('/payees', { method: 'POST', body: { name, accountLast4: last4, category } });
      setName('');
      setLast4('');
      onAdded();
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', String(err)));
    }
  };

  return (
    <Panel title="Add a payee">
      <form className="form" onSubmit={submit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Account last 4
          <input value={last4} maxLength={4} onChange={(e) => setLast4(e.target.value)} />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {titleCase(c)}
              </option>
            ))}
          </select>
        </label>
        <ErrorText error={error} />
        <button disabled={!name || last4.length !== 4}>Add payee</button>
      </form>
    </Panel>
  );
}
