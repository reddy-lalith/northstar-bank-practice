import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import { CATEGORIES, type Authorization, type Card, type Category, type Transaction } from '../api/types';
import { TransactionTable } from '../components/TransactionTable';
import { ErrorText, Loading, Money, Panel, StatusBadge, Tag } from '../components/ui';
import { useApi } from '../hooks/useApi';
import { formatCents, formatDate, titleCase, toDollars } from '../lib/format';

const REASON_TEXT: Record<string, string> = {
  CARD_NOT_FOUND: 'Card not recognized',
  CARD_INACTIVE: 'Card is not active',
  MERCHANT_MISMATCH: 'Card is locked to a different merchant',
  OVER_CARD_LIMIT: 'Over this card’s spend limit',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  FRAUD_REVIEW: 'Held for fraud review',
  VELOCITY: 'Too many attempts, try again shortly',
};

export function CardDetail() {
  const { id } = useParams<{ id: string }>();
  const card = useApi<{ card: Card }>(`/cards/${id}`);
  const txs = useApi<{ transactions: Transaction[] }>(`/cards/${id}/transactions`);
  const [revealed, setRevealed] = useState(false);
  const [closing, setClosing] = useState(false);

  const c = card.data?.card;

  const close = async () => {
    setClosing(true);
    try {
      await api(`/cards/${id}/close`, { method: 'POST' });
      card.reload();
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="stack">
      <Link to="/cards" className="muted">
        ← Cards
      </Link>
      <ErrorText error={card.error} />
      {!c ? (
        <Loading />
      ) : (
        <>
          <div className="page-head">
            <div>
              <h1>
                {c.nickname} <StatusBadge status={c.status} />
              </h1>
              <div className="tags">
                <Tag>{titleCase(c.kind)}</Tag>
                <Tag>{c.network}</Tag>
                {c.merchantLock && <Tag>Locked to {c.merchantLock}</Tag>}
                {c.singleUse && <Tag>Single-use</Tag>}
                {c.spendLimitCents !== null && (
                  <Tag>
                    Limit <Money cents={c.spendLimitCents} />
                  </Tag>
                )}
              </div>
            </div>
            {c.status !== 'CLOSED' && (
              <button className="danger" onClick={() => void close()} disabled={closing}>
                Close card
              </button>
            )}
          </div>

          <div className="grid-2">
            <Panel title="Card details">
              <dl className="dl">
                <dt>Number</dt>
                <dd className="mono">
                  {revealed ? c.cardNumber?.replace(/(\d{4})(?=\d)/g, '$1 ') : `•••• •••• •••• ${c.last4}`}{' '}
                  <button className="link" onClick={() => setRevealed(!revealed)}>
                    {revealed ? 'Hide' : 'Show'}
                  </button>
                </dd>
                <dt>Expires</dt>
                <dd>
                  {String(c.expMonth).padStart(2, '0')}/{c.expYear}
                </dd>
                <dt>Created</dt>
                <dd>{formatDate(c.createdAt)}</dd>
              </dl>
            </Panel>
            {c.cardNumber && (
              <SimulatePurchase
                cardNumber={c.cardNumber}
                defaultMerchant={c.merchantLock ?? ''}
                onDone={() => {
                  card.reload();
                  txs.reload();
                }}
              />
            )}
          </div>

          <Panel title="Card activity">
            {txs.data ? <TransactionTable transactions={txs.data.transactions} emptyText="No purchases on this card yet" /> : <Loading />}
          </Panel>
        </>
      )}
    </div>
  );
}

function SimulatePurchase({
  cardNumber,
  defaultMerchant,
  onDone,
}: {
  cardNumber: string;
  defaultMerchant: string;
  onDone: () => void;
}) {
  const [merchant, setMerchant] = useState(defaultMerchant);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('SHOPPING');
  const [result, setResult] = useState<Authorization | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/simulate/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber, merchant, amount: toDollars(amount), category }),
      });
      const body = await res.json();
      if (body.authorization) {
        setResult(body.authorization as Authorization);
        onDone();
      } else {
        setError(new ApiError(res.status, body.error?.code ?? 'UNKNOWN', body.error?.message ?? 'Request failed'));
      }
    } catch (err) {
      setError(new ApiError(0, 'NETWORK', String(err)));
    }
  };

  return (
    <Panel title="Test a purchase">
      <form className="form" onSubmit={submit}>
        <p className="muted small">Sends this card to the merchant terminal simulator.</p>
        <label>
          Merchant
          <input value={merchant} onChange={(e) => setMerchant(e.target.value)} />
        </label>
        <label>
          Amount
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </label>
        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {titleCase(cat)}
              </option>
            ))}
          </select>
        </label>
        <ErrorText error={error} />
        {result && (
          <p className={result.approved ? 'success' : 'error'}>
            {result.approved
              ? `Approved: ${formatCents(result.amountCents)}`
              : `Declined: ${REASON_TEXT[result.reason ?? ''] ?? result.reason}`}
          </p>
        )}
        <button className="primary" disabled={!merchant || !amount}>
          Run authorization
        </button>
      </form>
    </Panel>
  );
}
