import { useState } from 'react';
import { api, ApiError } from '../api/client';
import type { Account, RewardsSummary } from '../api/types';
import { ErrorText, Loading, Money, Panel } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { titleCase } from '../lib/format';

export function Rewards() {
  const summary = useApi<{ summary: RewardsSummary }>('/rewards/summary');
  const accounts = useApi<{ accounts: Account[] }>('/accounts');
  const targets = (accounts.data?.accounts ?? []).filter((a) => a.type !== 'CREDIT');
  const [accountId, setAccountId] = useState('');
  const [error, setError] = useState<ApiError | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const s = summary.data?.summary;

  const redeem = async () => {
    setError(null);
    setMessage(null);
    try {
      await api('/rewards/redeem', { method: 'POST', body: { accountId: accountId || targets[0]?.id } });
      setMessage('Cashback deposited.');
      summary.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(0, 'UNKNOWN', String(err)));
    }
  };

  if (!s) return <Loading />;

  return (
    <div className="stack">
      <h1>Cashback rewards</h1>
      <div className="grid-2">
        <Panel title="Available to redeem">
          <div className="big-number">
            <Money cents={s.availableCents} />
          </div>
          <p className="muted small">
            <Money cents={s.earnedCents} /> earned · <Money cents={s.redeemedCents} /> redeemed
          </p>
          <div className="row">
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {targets.map((a) => (
                <option key={a.id} value={a.id}>
                  Deposit to {a.nickname}
                </option>
              ))}
            </select>
            <button className="primary" onClick={() => void redeem()}>
              Redeem
            </button>
          </div>
          <ErrorText error={error} />
          {message && <p className="success">{message}</p>}
        </Panel>
        <Panel title="How you earn">
          <ul className="plain">
            <li>3% dining</li>
            <li>2% groceries and travel</li>
            <li>1% everything else</li>
          </ul>
          <p className="muted small">Northstar Rewards Card purchases only. Refunds reverse cashback.</p>
        </Panel>
      </div>
      <Panel title="By category">
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th className="right">Spend</th>
              <th className="right">Rate</th>
              <th className="right">Earned</th>
            </tr>
          </thead>
          <tbody>
            {s.byCategory.map((row) => (
              <tr key={row.category}>
                <td>{titleCase(row.category)}</td>
                <td className="right">
                  <Money cents={row.spendCents} />
                </td>
                <td className="right">{row.rateBps / 100}%</td>
                <td className="right">
                  <Money cents={row.earnedCents} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
