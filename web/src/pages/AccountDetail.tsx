import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Account, Page, Transaction, TransactionType } from '../api/types';
import { Pagination } from '../components/Pagination';
import { TransactionTable } from '../components/TransactionTable';
import { ErrorText, Loading, Money, Panel } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { TYPE_LABEL } from '../lib/format';

const PAGE_SIZE = 10;

export function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [type, setType] = useState<TransactionType | ''>('');

  const account = useApi<{ account: Account }>(`/accounts/${id}`);
  const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (type) query.set('type', type);
  const txs = useApi<Page<Transaction>>(`/accounts/${id}/transactions?${query.toString()}`);

  const a = account.data?.account;

  return (
    <div className="stack">
      <Link to="/" className="muted">
        ← Dashboard
      </Link>
      <ErrorText error={account.error} />
      {a && (
        <div className="page-head">
          <div>
            <h1>{a.nickname}</h1>
            <div className="muted">
              {a.type[0] + a.type.slice(1).toLowerCase()} {a.maskedNumber}
              {a.interestRateBps > 0 && ` · ${(a.interestRateBps / 100).toFixed(2)}% ${a.type === 'CREDIT' ? 'APR' : 'APY'}`}
            </div>
          </div>
          <div className="right">
            <div className="big-number">
              <Money cents={a.balanceCents} />
            </div>
            <div className="muted small">
              {a.type === 'CREDIT' ? (
                <>
                  owed · <Money cents={a.availableCents} /> of <Money cents={a.creditLimitCents ?? 0} /> available
                </>
              ) : (
                'available'
              )}
            </div>
          </div>
        </div>
      )}

      <Panel
        title="Activity"
        action={
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as TransactionType | '');
              setPage(1);
            }}
          >
            <option value="">All types</option>
            {(Object.keys(TYPE_LABEL) as TransactionType[]).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        }
      >
        <ErrorText error={txs.error} />
        {txs.loading && !txs.data ? (
          <Loading />
        ) : (
          txs.data && (
            <>
              <TransactionTable transactions={txs.data.items} />
              <Pagination page={txs.data.page} totalPages={txs.data.totalPages} total={txs.data.total} onChange={setPage} />
            </>
          )
        )}
      </Panel>
    </div>
  );
}
