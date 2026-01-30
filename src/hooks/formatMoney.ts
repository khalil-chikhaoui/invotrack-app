import { CURRENCIES } from "./currencies";

interface FormatOptions {
  display?: "symbol" | "code";
  position?: "left" | "right";
  digits?: number;
  groupSep?: string;
  decimalSep?: string;
}

export function formatMoney(
  amount: number | string,
  currencyCode: string = "USD",
  options: FormatOptions = {},
): string {
  const numericAmount = Number(amount) || 0;

  const baseConfig = CURRENCIES.find((c) => c.code === currencyCode) || {
    code: "USD",
    symbol: "$",
    digits: 2,
    groupSep: ",",
    decimalSep: ".",
  };

  const digits = options.digits ?? baseConfig.digits;
  const groupSep = options.groupSep ?? baseConfig.groupSep;
  const decimalSep = options.decimalSep ?? baseConfig.decimalSep;

  const fixed = numericAmount.toFixed(digits);
  const [integerPart, decimalPart] = fixed.split(".");

  const formattedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    groupSep,
  );

  const numberString =
    digits > 0
      ? `${formattedInteger}${decimalSep}${decimalPart}`
      : formattedInteger;

  const currency =
    options.display === "code" ? baseConfig.code : baseConfig.symbol;

  const position = options.position || "left";

  // Check for Arabic/RTL characters
  const isRTL = /[\u0600-\u06FF]/.test(currency);

  if (position === "right") {
    return `${numberString} ${currency}`;
  } else {
    if (isRTL) {
      // Inject LTR Mark (\u200E) so browser aligns it correctly (Symbol LEFT, Number RIGHT)
      return `${currency}\u200E  ${numberString}`;
    }
    return `${currency} ${numberString}`;
  }
}
