export type AnchorCurrency = "USD" | "EUR" | "DZD";

export type CurrencyDefinition = {
  code: string;
  name: string;
  anchor: AnchorCurrency;
  anchorPerUnit: number;
};

export const currencyDefinitions: CurrencyDefinition[] = [
  { code: "DZD", name: "Algerian Dinar", anchor: "DZD", anchorPerUnit: 1 },
  { code: "EUR", name: "Euro", anchor: "EUR", anchorPerUnit: 1 },
  { code: "USD", name: "US Dollar", anchor: "USD", anchorPerUnit: 1 },
  { code: "GBP", name: "British Pound", anchor: "USD", anchorPerUnit: 1.27 },
  { code: "CAD", name: "Canadian Dollar", anchor: "USD", anchorPerUnit: 0.73 },
  { code: "AUD", name: "Australian Dollar", anchor: "USD", anchorPerUnit: 0.65 },
  { code: "CHF", name: "Swiss Franc", anchor: "USD", anchorPerUnit: 1.09 },
  { code: "JPY", name: "Japanese Yen", anchor: "USD", anchorPerUnit: 0.0066 },
  { code: "CNY", name: "Chinese Yuan", anchor: "USD", anchorPerUnit: 0.14 },
  { code: "SAR", name: "Saudi Riyal", anchor: "USD", anchorPerUnit: 0.2667 },
  { code: "AED", name: "UAE Dirham", anchor: "USD", anchorPerUnit: 0.2723 },
  { code: "QAR", name: "Qatari Riyal", anchor: "USD", anchorPerUnit: 0.2747 },
  { code: "MAD", name: "Moroccan Dirham", anchor: "USD", anchorPerUnit: 0.096 },
  { code: "TND", name: "Tunisian Dinar", anchor: "USD", anchorPerUnit: 0.32 },
  { code: "EGP", name: "Egyptian Pound", anchor: "USD", anchorPerUnit: 0.0204 },
  { code: "TRY", name: "Turkish Lira", anchor: "USD", anchorPerUnit: 0.031 },
  { code: "NOK", name: "Norwegian Krone", anchor: "USD", anchorPerUnit: 0.095 },
  { code: "SEK", name: "Swedish Krona", anchor: "USD", anchorPerUnit: 0.094 },
  {
    code: "DKK",
    name: "Danish Krone",
    anchor: "EUR",
    anchorPerUnit: 0.134,
  },
  {
    code: "XOF",
    name: "West African CFA Franc",
    anchor: "EUR",
    anchorPerUnit: 0.001524,
  },
  {
    code: "XAF",
    name: "Central African CFA Franc",
    anchor: "EUR",
    anchorPerUnit: 0.001524,
  },
  {
    code: "CFA",
    name: "CFA Franc BEAC",
    anchor: "EUR",
    anchorPerUnit: 0.001524,
  },
];

export const defaultDzdPerEuro = 146.5;
export const defaultDzdPerUsd = 136.2;
