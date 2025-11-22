'use client';

import { useEffect, useMemo, useState } from "react";
import {
  currencyDefinitions,
  defaultDzdPerEuro,
  defaultDzdPerUsd,
} from "@/lib/currencies";

type ActiveField = "dzd" | "foreign";
type Tab = "convert" | "rates";

const keypadLayout = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0", "⌫", "C"];

const storageKeys = {
  dzdPerEuro: "dzd-per-euro",
  dzdPerUsd: "dzd-per-usd",
} satisfies Record<string, string>;

function sanitizeNumberInput(value: string) {
  const normalized = value.replace(/[^\d.,]/g, "").replace(",", ".");
  if (normalized === "") return "0";
  const parts = normalized.split(".");
  if (parts.length > 2) {
    const [integer, ...rest] = parts;
    return `${integer}.${rest.join("")}`;
  }
  if (parts[0] === "") {
    parts[0] = "0";
  }
  const sanitized = parts.join(".");
  return sanitized;
}

function formatDisplay(value: number) {
  if (!Number.isFinite(value)) return "0";
  if (value === 0) return "0";
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (Math.abs(value) >= 1) {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("convert");
  const [dzdPerEuro, setDzdPerEuro] = usePersistentNumber(
    storageKeys.dzdPerEuro,
    defaultDzdPerEuro,
  );
  const [dzdPerUsd, setDzdPerUsd] = usePersistentNumber(
    storageKeys.dzdPerUsd,
    defaultDzdPerUsd,
  );
  const [dzdAmount, setDzdAmount] = useState<string>(() => {
    if (typeof window === "undefined") return "0";
    const stored = localStorage.getItem("last-dzd-amount");
    return stored ?? "0";
  });
  const [foreignAmount, setForeignAmount] = useState<string>(() => {
    if (typeof window === "undefined") return "0";
    const stored = localStorage.getItem("last-foreign-amount");
    return stored ?? "0";
  });
  const [activeField, setActiveField] = useState<ActiveField>("dzd");
  const [dzdToForeignCurrency, setDzdToForeignCurrency] = useState("USD");
  const [foreignToDzdCurrency, setForeignToDzdCurrency] = useState("EUR");

  useEffect(() => {
    localStorage.setItem("last-dzd-amount", dzdAmount);
  }, [dzdAmount]);

  useEffect(() => {
    localStorage.setItem("last-foreign-amount", foreignAmount);
  }, [foreignAmount]);

  const dzdRates = useMemo(() => {
    const map = new Map<string, number>();
    currencyDefinitions.forEach((currency) => {
      let rate = 1;
      if (currency.anchor === "USD") {
        rate = dzdPerUsd * currency.anchorPerUnit;
      } else if (currency.anchor === "EUR") {
        rate = dzdPerEuro * currency.anchorPerUnit;
      } else {
        rate = currency.anchorPerUnit;
      }
      map.set(currency.code, rate);
    });
    return map;
  }, [dzdPerEuro, dzdPerUsd]);

  const dzdAmountNumber = parseFloat(dzdAmount) || 0;
  const foreignAmountNumber = parseFloat(foreignAmount) || 0;

  const foreignRate = dzdRates.get(dzdToForeignCurrency) ?? 1;
  const inverseForeignRate = foreignRate === 0 ? 0 : 1 / foreignRate;
  const dzdToForeignResult = dzdAmountNumber * inverseForeignRate;

  const foreignToDzdRate = dzdRates.get(foreignToDzdCurrency) ?? 1;
  const foreignToDzdResult = foreignAmountNumber * foreignToDzdRate;

  function handleKeyPress(symbol: string) {
    const setter = activeField === "dzd" ? setDzdAmount : setForeignAmount;
    const value = activeField === "dzd" ? dzdAmount : foreignAmount;

    switch (symbol) {
      case "C":
        setter("0");
        break;
      case "⌫": {
        const trimmed = value.length <= 1 ? "0" : value.slice(0, -1);
        setter(trimmed);
        break;
      }
      case ".":
        if (!value.includes(".")) {
          setter(value + ".");
        }
        break;
      default: {
        const digit = symbol;
        if (value === "0") {
          setter(digit);
        } else {
          setter(value + digit);
        }
      }
    }
  }

  function handleAmountChange(next: string, field: ActiveField) {
    const sanitized = sanitizeNumberInput(next);
    if (field === "dzd") setDzdAmount(sanitized);
    else setForeignAmount(sanitized);
  }

  function resetDefaults() {
    setDzdPerEuro(defaultDzdPerEuro);
    setDzdPerUsd(defaultDzdPerUsd);
  }

  const orderedCurrencies = useMemo(
    () =>
      currencyDefinitions
        .filter((currency) => currency.code !== "DZD")
        .sort((a, b) => a.code.localeCompare(b.code)),
    [],
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-zinc-100 to-white px-4 py-12 font-sans text-zinc-900">
      <main className="w-full max-w-5xl rounded-[36px] border border-zinc-200 bg-white/90 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.4)] backdrop-blur-md">
        <header className="flex flex-col gap-4 border-b border-zinc-200 px-8 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Dinar Desk
            </h1>
            <p className="text-sm text-zinc-500 sm:text-base">
              Quick conversions between Algerian Dinar and your frequently used currencies.
            </p>
          </div>
          <div className="flex gap-2 rounded-full border border-zinc-200 bg-zinc-100/60 p-1 text-sm font-medium text-zinc-600">
            <button
              type="button"
              onClick={() => setTab("convert")}
              className={`rounded-full px-4 py-2 transition ${
                tab === "convert"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "hover:text-zinc-800"
              }`}
            >
              Calculator
            </button>
            <button
              type="button"
              onClick={() => setTab("rates")}
              className={`rounded-full px-4 py-2 transition ${
                tab === "rates"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "hover:text-zinc-800"
              }`}
            >
              Rates
            </button>
          </div>
        </header>

        {tab === "convert" ? (
          <section className="grid gap-8 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex flex-col gap-8">
              <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-inner">
                <div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest text-zinc-400">
                    <span>From</span>
                    <span className="text-zinc-500">Algerian Dinar</span>
                  </div>
                  <div
                    className={`mt-3 flex items-center gap-4 rounded-2xl bg-zinc-900 px-5 py-4 text-white transition ${
                      activeField === "dzd" ? "ring-4 ring-zinc-200/50" : ""
                    }`}
                  >
                    <span className="text-sm font-semibold tracking-wide">DZD</span>
                    <input
                      value={dzdAmount}
                      onChange={(event) => handleAmountChange(event.target.value, "dzd")}
                      onFocus={() => setActiveField("dzd")}
                      inputMode="decimal"
                      className="w-full bg-transparent text-right text-4xl font-semibold tracking-tight outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest text-zinc-400">
                    <span>To</span>
                    <select
                      value={dzdToForeignCurrency}
                      onChange={(event) => setDzdToForeignCurrency(event.target.value)}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-zinc-600"
                    >
                      {orderedCurrencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} · {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div
                    className={`mt-3 flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 transition ${
                      activeField === "foreign" ? "ring-4 ring-zinc-200/70" : ""
                    }`}
                  >
                    <span className="text-sm font-semibold tracking-wide">
                      {dzdToForeignCurrency}
                    </span>
                    <div className="w-full text-right text-4xl font-semibold tracking-tight">
                      {formatDisplay(dzdToForeignResult)}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    {`1 ${dzdToForeignCurrency} = ${formatDisplay(foreignRate)} DZD`}
                  </p>
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-inner">
                <div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest text-zinc-400">
                    <span>From</span>
                    <select
                      value={foreignToDzdCurrency}
                      onChange={(event) => setForeignToDzdCurrency(event.target.value)}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-widest text-zinc-600"
                    >
                      {orderedCurrencies.map((currency) => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} · {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-3 flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900">
                    <span className="text-sm font-semibold tracking-wide">
                      {foreignToDzdCurrency}
                    </span>
                    <input
                      value={foreignAmount}
                      onChange={(event) => handleAmountChange(event.target.value, "foreign")}
                      onFocus={() => setActiveField("foreign")}
                      inputMode="decimal"
                      className="w-full bg-transparent text-right text-4xl font-semibold tracking-tight outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-widest text-zinc-400">
                    <span>To</span>
                    <span className="text-zinc-500">Algerian Dinar</span>
                  </div>
                  <div className="mt-3 flex items-center gap-4 rounded-2xl bg-zinc-900 px-5 py-4 text-white">
                    <span className="text-sm font-semibold tracking-wide">DZD</span>
                    <div className="w-full text-right text-4xl font-semibold tracking-tight">
                      {formatDisplay(foreignToDzdResult)}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    {`1 ${foreignToDzdCurrency} = ${formatDisplay(foreignToDzdRate)} DZD`}
                  </p>
                </div>
              </div>
            </div>

            <aside className="flex flex-col justify-between gap-6 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-inner">
              <div>
                <p className="text-sm uppercase tracking-widest text-zinc-400">
                  Keypad
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Tap to enter values. Active field is highlighted.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {keypadLayout.map((symbol) => (
                  <button
                    key={symbol}
                    type="button"
                    onClick={() => handleKeyPress(symbol)}
                    className={`h-16 rounded-2xl border border-zinc-200 bg-white text-xl font-semibold text-zinc-800 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md ${
                      symbol === "C"
                        ? "bg-rose-500 text-white hover:bg-rose-500/90"
                        : symbol === "⌫"
                          ? "bg-zinc-900 text-white hover:bg-zinc-800"
                          : ""
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-zinc-100 px-4 py-3 text-xs uppercase tracking-widest text-zinc-500">
                <span>Active field</span>
                <span className="font-semibold text-zinc-700">
                  {activeField === "dzd" ? "DZD amount" : `${foreignToDzdCurrency} amount`}
                </span>
              </div>
            </aside>
          </section>
        ) : (
          <section className="flex flex-col gap-10 px-8 py-10">
            <div className="grid gap-6 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-inner lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
                  Base Market Rates
                </h2>
                <p className="text-sm text-zinc-500">
                  Set the current market parity for EUR/DZD and USD/DZD. These drive the calculator
                  and every other currency derives from one of them.
                </p>
                <div className="space-y-5">
                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-zinc-500">
                      1 EUR equals
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={dzdPerEuro}
                      onChange={(event) => setDzdPerEuro(Number(event.target.value) || 0)}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-right text-2xl font-semibold text-zinc-900 outline-none focus:border-zinc-900"
                    />
                    <span className="mt-1 block text-xs text-zinc-500">Algerian Dinar</span>
                  </label>

                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-zinc-500">
                      1 USD equals
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={dzdPerUsd}
                      onChange={(event) => setDzdPerUsd(Number(event.target.value) || 0)}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-right text-2xl font-semibold text-zinc-900 outline-none focus:border-zinc-900"
                    />
                    <span className="mt-1 block text-xs text-zinc-500">Algerian Dinar</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={resetDefaults}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900"
                >
                  Reset to defaults
                </button>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
                  Snapshot
                </h3>
                <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
                  {[{ code: "EUR", rate: dzdPerEuro }, { code: "USD", rate: dzdPerUsd }].map(
                    ({ code, rate }) => (
                      <div key={code} className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm font-medium text-zinc-500">
                          1&nbsp;{code} =
                        </span>
                        <span className="text-lg font-semibold text-zinc-900">
                          {formatDisplay(rate)}&nbsp;DZD
                        </span>
                      </div>
                    ),
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  Rates persist in your browser and sync instantly with the calculator.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
                  Derived Currency Table
                </h3>
                <span className="text-xs uppercase tracking-widest text-zinc-400">
                  live from inputs
                </span>
              </div>
              <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/80 shadow-inner">
                <table className="min-w-full text-left">
                  <thead className="bg-zinc-50/80 text-xs uppercase tracking-widest text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Currency</th>
                      <th className="px-4 py-3 font-medium text-right">1 unit in DZD</th>
                      <th className="px-4 py-3 font-medium text-right">1 DZD in unit</th>
                      <th className="px-4 py-3 font-medium text-right">Anchor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-sm text-zinc-700">
                    {currencyDefinitions.map((currency) => {
                      const dzdValue = dzdRates.get(currency.code) ?? 0;
                      const inverse = dzdValue === 0 ? 0 : 1 / dzdValue;
                      return (
                        <tr key={currency.code} className="hover:bg-zinc-50/60">
                          <td className="px-4 py-3 font-medium text-zinc-900">
                            {currency.code}
                            <span className="pl-2 text-xs font-normal text-zinc-500">
                              {currency.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-zinc-900">
                            {formatDisplay(dzdValue)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatDisplay(inverse)}
                          </td>
                          <td className="px-4 py-3 text-right uppercase text-zinc-500">
                            {currency.anchor}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function usePersistentNumber(key: string, defaultValue: number) {
  const [value, setValue] = useState<number>(() => {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    const parsed = Number(stored);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value.toString());
    }
  }, [key, value]);

  return [value, setValue] as const;
}
