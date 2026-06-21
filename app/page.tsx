"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Mode = "exclusive" | "inclusive";

type SavedCalculation = {
  id: string;
  clientName: string;
  description: string;
  amount: number;
  gstRate: number;
  mode: Mode;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  createdAt?: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export default function Home() {
  const [clientName, setClientName] = useState("Freelance client");
  const [description, setDescription] = useState("Website landing page");
  const [amount, setAmount] = useState(25000);
  const [gstRate, setGstRate] = useState(18);
  const [mode, setMode] = useState<Mode>("exclusive");
  const [saved, setSaved] = useState<SavedCalculation[]>([]);
  const [databaseStatus, setDatabaseStatus] = useState<"checking" | "connected" | "local">("checking");
  const [message, setMessage] = useState("Ready to calculate.");

  const result = useMemo(() => {
    const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;
    const safeRate = Number.isFinite(gstRate) && gstRate >= 0 ? gstRate : 0;
    const multiplier = 1 + safeRate / 100;

    if (mode === "inclusive") {
      const subtotal = multiplier === 0 ? safeAmount : safeAmount / multiplier;
      const gstAmount = safeAmount - subtotal;
      return {
        subtotal: roundMoney(subtotal),
        gstAmount: roundMoney(gstAmount),
        grandTotal: roundMoney(safeAmount)
      };
    }

    const gstAmount = safeAmount * (safeRate / 100);
    return {
      subtotal: roundMoney(safeAmount),
      gstAmount: roundMoney(gstAmount),
      grandTotal: roundMoney(safeAmount + gstAmount)
    };
  }, [amount, gstRate, mode]);

  useEffect(() => {
    async function loadSavedCalculations() {
      try {
        const response = await fetch("/api/calculations", { cache: "no-store" });
        const data = await response.json();
        setDatabaseStatus(data.connected ? "connected" : "local");
        setSaved(data.calculations || []);
      } catch {
        setDatabaseStatus("local");
      }
    }

    loadSavedCalculations();
  }, []);

  async function saveCalculation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      clientName,
      description,
      amount,
      gstRate,
      mode,
      ...result
    };

    try {
      const response = await fetch("/api/calculations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.connected && data.calculation) {
        setDatabaseStatus("connected");
        setSaved((current) => [data.calculation, ...current].slice(0, 8));
        setMessage("Saved to MongoDB history.");
        return;
      }

      setDatabaseStatus("local");
      setSaved((current) => [
        {
          ...payload,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString()
        },
        ...current
      ].slice(0, 8));
      setMessage("MongoDB is not configured yet, so this quote was kept in this browser session.");
    } catch {
      setDatabaseStatus("local");
      setMessage("Could not reach the API. The live calculation still works locally.");
    }
  }

  return (
    <main className="page-shell">
      <section className="hero-band">
        <div className="hero-copy">
          <span className="eyebrow">Free Next.js + MongoDB tool</span>
          <h1>GST Invoice Calculator</h1>
          <p>
            Turn a base price or GST-inclusive price into a clean invoice-ready tax split in seconds.
          </p>
          <div className="identity">
            <strong>Aman Raza</strong>
            <a href="mailto:amanraza1234@gmail.com">amanraza1234@gmail.com</a>
          </div>
        </div>

        <div className="status-panel" aria-label="Project requirements">
          <div>
            <span>Stack</span>
            <strong>Next.js, React, MongoDB</strong>
          </div>
          <div>
            <span>Cost</span>
            <strong>₹0 / $0</strong>
          </div>
          <a className="dh-button" href="https://digitalheroesco.com" target="_blank" rel="noreferrer">
            Built for Digital Heroes
          </a>
        </div>
      </section>

      <section className="tool-grid" aria-label="GST calculator">
        <form className="calculator" onSubmit={saveCalculation}>
          <div className="section-heading">
            <span>Inputs</span>
            <h2>Build a quote</h2>
          </div>

          <label>
            Client or project
            <input value={clientName} onChange={(event) => setClientName(event.target.value)} />
          </label>

          <label>
            Description
            <input value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>

          <div className="field-row">
            <label>
              Amount
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />
            </label>
            <label>
              GST %
              <select value={gstRate} onChange={(event) => setGstRate(Number(event.target.value))}>
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </label>
          </div>

          <div className="segmented" aria-label="Calculation mode">
            <button type="button" className={mode === "exclusive" ? "active" : ""} onClick={() => setMode("exclusive")}>
              Add GST
            </button>
            <button type="button" className={mode === "inclusive" ? "active" : ""} onClick={() => setMode("inclusive")}>
              Extract GST
            </button>
          </div>

          <button className="primary-action" type="submit">
            Save calculation
          </button>
          <p className="form-note">{message}</p>
        </form>

        <aside className="result-panel" aria-label="Invoice output">
          <div className="section-heading">
            <span>Output</span>
            <h2>Invoice totals</h2>
          </div>

          <div className="invoice-preview">
            <div>
              <span>Client</span>
              <strong>{clientName || "Untitled client"}</strong>
            </div>
            <div>
              <span>Work</span>
              <strong>{description || "GST calculation"}</strong>
            </div>
            <dl>
              <div>
                <dt>Taxable value</dt>
                <dd>{formatCurrency(result.subtotal)}</dd>
              </div>
              <div>
                <dt>GST at {gstRate}%</dt>
                <dd>{formatCurrency(result.gstAmount)}</dd>
              </div>
              <div className="grand-total">
                <dt>Total payable</dt>
                <dd>{formatCurrency(result.grandTotal)}</dd>
              </div>
            </dl>
          </div>

          <button className="secondary-action" type="button" onClick={() => window.print()}>
            Print / save PDF
          </button>
        </aside>
      </section>

      <section className="history-band" aria-label="Saved calculations">
        <div className="history-header">
          <div className="section-heading">
            <span>History</span>
            <h2>Recent calculations</h2>
          </div>
          <p className={databaseStatus === "connected" ? "db connected" : "db"}>
            {databaseStatus === "checking"
              ? "Checking MongoDB..."
              : databaseStatus === "connected"
                ? "MongoDB connected"
                : "Local preview mode"}
          </p>
        </div>

        <div className="history-list">
          {saved.length === 0 ? (
            <p className="empty-state">Save a calculation to see it here.</p>
          ) : (
            saved.map((item) => (
              <article className="history-card" key={item.id}>
                <div>
                  <strong>{item.clientName}</strong>
                  <span>{item.description}</span>
                </div>
                <div>
                  <span>{item.mode === "exclusive" ? "GST added" : "GST extracted"}</span>
                  <strong>{formatCurrency(item.grandTotal)}</strong>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
