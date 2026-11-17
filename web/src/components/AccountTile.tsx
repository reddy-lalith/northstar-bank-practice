import { Link } from 'react-router-dom';
import type { Account } from '../api/types';
import { Money } from './ui';

export function AccountTile({ account }: { account: Account }) {
  const isCredit = account.type === 'CREDIT';
  return (
    <Link to={`/accounts/${account.id}`} className={`tile tile-${account.type.toLowerCase()}`}>
      <div className="tile-top">
        <span>{account.nickname}</span>
        <span className="muted small">{account.maskedNumber}</span>
      </div>
      <div className="tile-balance">
        <Money cents={account.balanceCents} />
      </div>
      <div className="muted small">
        {isCredit ? (
          <>
            Balance owed · <Money cents={account.availableCents} /> available
          </>
        ) : (
          <>Available balance</>
        )}
      </div>
    </Link>
  );
}
