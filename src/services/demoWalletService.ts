import { DemoTransaction } from '../types';

const BALANCE_KEY = 'reprush_demo_balance';
const TRANSACTIONS_KEY = 'reprush_demo_transactions';
const DEFAULT_INITIAL_BALANCE = 500;

export function getDemoBalance(): number {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_BALANCE;
  const stored = localStorage.getItem(BALANCE_KEY);
  if (stored === null) {
    localStorage.setItem(BALANCE_KEY, DEFAULT_INITIAL_BALANCE.toString());
    return DEFAULT_INITIAL_BALANCE;
  }
  const parsed = parseFloat(stored);
  return isNaN(parsed) ? DEFAULT_INITIAL_BALANCE : parsed;
}

export function getDemoTransactions(): DemoTransaction[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  if (!stored) {
    const initial: DemoTransaction[] = [
      {
        id: 'tx-welcome',
        label: 'Starter Welcome Demo Grant',
        amount: 500,
        type: 'credit',
        date: 'Today',
        balanceAfter: 500,
      },
    ];
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function notifyWalletChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('reprush_wallet_update'));
  }
}

export function addDemoCredits(
  amount: number,
  label: string,
  _category?: string
): number {
  const current = getDemoBalance();
  const next = Math.round((current + amount) * 100) / 100;
  localStorage.setItem(BALANCE_KEY, next.toString());

  const txs = getDemoTransactions();
  const newTx: DemoTransaction = {
    id: `tx-${Date.now()}`,
    label,
    amount,
    type: 'credit',
    date: 'Just now',
    balanceAfter: next,
  };
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([newTx, ...txs].slice(0, 50)));
  notifyWalletChange();
  return next;
}

export const creditDemoWinnings = addDemoCredits;

export function refundDemoEntry(amount: number, label: string): number {
  return addDemoCredits(amount, label, 'refund');
}

export const refundDemoStake = refundDemoEntry;

export function deductDemoEntry(
  amount: number,
  label: string,
  _category?: string
): { success: boolean; newBalance: number } {
  const current = getDemoBalance();
  if (current < amount) {
    return { success: false, newBalance: current };
  }
  const next = Math.round((current - amount) * 100) / 100;
  localStorage.setItem(BALANCE_KEY, next.toString());

  const txs = getDemoTransactions();
  const newTx: DemoTransaction = {
    id: `tx-${Date.now()}`,
    label,
    amount,
    type: 'debit',
    date: 'Just now',
    balanceAfter: next,
  };
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([newTx, ...txs].slice(0, 50)));
  notifyWalletChange();
  return { success: true, newBalance: next };
}

export function resetDemoWallet(): number {
  localStorage.setItem(BALANCE_KEY, DEFAULT_INITIAL_BALANCE.toString());
  const resetTx: DemoTransaction = {
    id: `tx-${Date.now()}`,
    label: 'Demo Balance Reset to ₹500',
    amount: DEFAULT_INITIAL_BALANCE,
    type: 'credit',
    date: 'Just now',
    balanceAfter: DEFAULT_INITIAL_BALANCE,
  };
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([resetTx]));
  notifyWalletChange();
  return DEFAULT_INITIAL_BALANCE;
}
