import { Link } from 'react-router-dom';
import type { Account, RewardsSummary, Transaction } from '../api/types';
import { AccountTile } from '../components/AccountTile';
import { TransactionTable } from '../components/TransactionTable';
import { ErrorText, Loading, Money, Panel } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

export function Dashboard() {
  const { user } = useAuth();
  const accounts = useApi<{ accounts: Account[] }>('/accounts');
  const recent = useApi<{ transactions: Transaction[] }>('/transactions/recent?limit=5');
  const rewards = useApi<{ summary: RewardsSummary }>('/rewards/summary');

  const deposits = (accounts.data?.accounts ?? [])
    .filter((a) => a.type !== 'CREDIT')
    .reduce((s, a) => s + a.balanceCents, 0);

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Good to see you, {user?.name.split(' ')[0]}</h1>
        <div className="muted">
          Total deposits <Money cents={deposits} />
        </div>
      </div>

      {accounts.loading && <Loading />}
      <ErrorText error={accounts.error} />
      <div className="tiles">
        {accounts.data?.accounts.map((a) => <AccountTile key={a.id} account={a} />)}
      </div>

      <div className="grid-2">
        <Panel title="Recent activity">
          {recent.loading ? <Loading /> : <TransactionTable transactions={recent.data?.transactions ?? []} showAccount />}
        </Panel>
        <Panel title="Cashback" action={<Link to="/rewards">Details</Link>}>
          {rewards.data ? (
            <div className="stack-sm">
              <div className="big-number">
                <Money cents={rewards.data.summary.availableCents} />
              </div>
              <div className="muted">ready to redeem</div>
              <div className="muted small">
                <Money cents={rewards.data.summary.earnedCents} /> earned all time
              </div>
            </div>
          ) : (
            <Loading />
          )}
        </Panel>
      </div>
    </div>
  );
}
