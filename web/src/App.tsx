import { useEffect, useState, useRef } from "react";
import styles from "./App.module.css";

const API = "http://localhost:5100/api/account"; // <-- use YOUR API port

type Account = { id: number; balance: number };

export default function App() {
  const [account, setAccount] = useState<Account | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isBalanceAnimating, setIsBalanceAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const load = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setAccount(data);
    } catch (e) {
      setError("Failed to load account");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Trigger balance animation when balance changes
  const handleBalanceUpdate = (newAccount: Account) => {
    setIsBalanceAnimating(true);
    setAccount(newAccount);
    // Reset animation state after animation completes
    setTimeout(() => setIsBalanceAnimating(false), 300);
  };

  const send = async (action: "deposit" | "withdraw") => {
    // Clear previous error
    setError("");
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    // Validate amount
    const num = Number(amount);
    if (!amount || num <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        setError(errorText);
        // Auto-dismiss error after 5 seconds
        errorTimeoutRef.current = setTimeout(() => setError(""), 5000);
        return;
      }

      const updatedAccount = await res.json();
      handleBalanceUpdate(updatedAccount);
      setAmount("");
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Enter key on input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      send("deposit");
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Header / Title */}
      <div className={styles.header}>
        <h1 className={styles.title}>Checking Account</h1>
      </div>

      {/* Balance Section (Hero) */}
      <section className={styles.balanceSection}>
        <label className={styles.balanceLabel}>Current Balance</label>
        <div
          className={`${styles.balance} ${
            isBalanceAnimating ? styles.balanceAnimating : ""
          }`}
        >
          {account ? (
            `$${account.balance.toFixed(2)}`
          ) : (
            <span className={styles.balancePlaceholder}>$-.--</span>
          )}
        </div>
      </section>

      {/* Form Section */}
      <div className={styles.formSection}>
        {/* Amount Input */}
        <input
          type="number"
          className={styles.input}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter amount"
          step="0.01"
          min="0"
          disabled={isSubmitting}
          aria-label="Transaction amount"
        />

        {/* Button Group */}
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.buttonBase} ${styles.buttonDeposit}`}
            onClick={() => send("deposit")}
            disabled={isSubmitting || !amount}
            aria-label="Deposit money"
          >
            Deposit
          </button>
          <button
            className={`${styles.buttonBase} ${styles.buttonWithdraw}`}
            onClick={() => send("withdraw")}
            disabled={isSubmitting || !amount}
            aria-label="Withdraw money"
          >
            Withdraw
          </button>
        </div>

        {/* Error Message */}
        <div className={`${styles.errorContainer} ${error ? styles.visible : ""}`}>
          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>
    </div>
  );
}