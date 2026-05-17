const CURRENCIES = {
  IDR: { code: 'IDR', symbol: 'Rp', locale: 'id-ID', rate: 1, name: 'Indonesian Rupiah' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', rate: 0.000062, name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', rate: 0.000057, name: 'Euro' },
  SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG', rate: 0.000083, name: 'Singapore Dollar' },
  MYR: { code: 'MYR', symbol: 'RM', locale: 'ms-MY', rate: 0.00029, name: 'Malaysian Ringgit' },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', rate: 0.0093, name: 'Japanese Yen' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', rate: 0.000049, name: 'British Pound' },
  AUD: { code: 'AUD', symbol: 'A$', locale: 'en-AU', rate: 0.000094, name: 'Australian Dollar' },
  CNY: { code: 'CNY', symbol: '¥', locale: 'zh-CN', rate: 0.00045, name: 'Chinese Yuan' },
};

export const getSupportedCurrencies = () => Object.values(CURRENCIES);

export const getCurrencyInfo = (code) => CURRENCIES[code] || CURRENCIES.IDR;

export const convertAmount = (amountInIDR, targetCurrency) => {
  const info = getCurrencyInfo(targetCurrency);
  return amountInIDR * info.rate;
};

export const formatCurrency = (amountInIDR, currencyCode, options = {}) => {
  const info = getCurrencyInfo(currencyCode);
  const converted = convertAmount(amountInIDR, currencyCode);
  const rounded = options.round !== false ? Math.round(converted) : converted;
  
  if (currencyCode === 'JPY') {
    return `${info.symbol}${rounded.toLocaleString(info.locale)}`;
  }
  
  return `${info.symbol}${rounded.toLocaleString(info.locale)}`;
};

export const formatIDR = (val) => {
  const rounded = Math.round(val);
  return rounded.toLocaleString('id-ID');
};
