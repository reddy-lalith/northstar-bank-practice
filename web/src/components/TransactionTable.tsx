import type { Transaction } from '../api/types';
import { categoryLabel, formatDateTime, signedAmount, TYPE_LABEL } from '../lib/format';
import { Money } from './ui';

interface Props {
  transactions: Transaction[];
  showAccount?: boolean;
  emptyText?: string;
}

export function TransactionTable({ transactions, showAccount = false, emptyText = 'No transactions yet' }: Props) {
  if (transactions.length === 0) return <p className="muted">{emptyText}</p>;
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          {showAccount && <th>Account</th>}
          <th>Type</th>
          <th>Category</th>
          <th className="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t.id}>
            <td className="nowrap">{formatDateTime(t.createdAt)}</td>
            <td>{t.description}</td>
            {showAccount && <td className="muted">{t.accountNickname}</td>}
            <td>{TYPE_LABEL[t.type]}</td>
            <td className="muted">{categoryLabel(t.category)}</td>
            <td className="right">
              <Money cents={signedAmount(t)} signed />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
