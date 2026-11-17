import { createApp } from './app';
import { config } from './config';
import { seed } from './db/seed';

const summary = seed();
const app = createApp();

app.listen(config.port, () => {
  console.log(`Northstar API listening on http://localhost:${config.port}`);
  console.log(`Seeded ${summary.accounts} accounts, ${summary.transactions} transactions, ${summary.cards} cards`);
  console.log(`Demo login: ${summary.email} / ${summary.password}`);
});
