import { useEffect, useState } from "react";

const API = "http://localhost:5100/api/account"; // <-- use YOUR API port

type Account = { id: number; balance: number };

export default function App() {
  const [account, setAccount] = useState<Account | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const res = await fetch(API);
    setAccount(await res.json());
  };

  useEffect(() => { load(); }, []);

  const send = async (action: "deposit" | "withdraw") => {
    setError("");
    const res = await fetch(`${API}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    if (!res.ok) { setError(await res.text()); return; }
    setAccount(await res.json());
    setAmount("");
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 320, margin: "60px auto" }}>
      <h1>Checking Account</h1>
      <p style={{ fontSize: 28 }}>
        Balance: ${account ? account.balance.toFixed(2) : "..."}
      </p>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        style={{ padding: 8, width: "100%", marginBottom: 8 }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => send("deposit")} style={{ flex: 1, padding: 8 }}>Deposit</button>
        <button onClick={() => send("withdraw")} style={{ flex: 1, padding: 8 }}>Withdraw</button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}