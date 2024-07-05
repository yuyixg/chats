export const isMobile = () => {
  const userAgent =
    typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  return mobileRegex.test(userAgent);
};

// -> 1234567890 -> 12345***90
export const addAsterisk = (value?: string, separator = '*') => {
  if (!value) {
    return null;
  }
  return (
    value.substring(0, 5) +
    value
      .substring(5, value.length - 2)
      .split('')
      .map(() => separator)
      .join('') +
    value.substring(value.length - 2, value.length)
  );
};

export const checkKey = (
  originValue: string | undefined,
  currentValue: string | undefined,
) => {
  if (originValue && addAsterisk(originValue) === currentValue) {
    return originValue;
  }
  return currentValue;
};

export function formatRMB(number: number) {
  const formatted = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(number);
  return formatted.replace(/￥(\d)/, '￥ $1');
}

export function formatNumberAsMoney(amount: number, maximumFractionDigits = 4) {
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits }).format(
    amount,
  );
}

export function generateUniqueCode() {
  let code = '';
  while (code.length < 6) {
    const digit = Math.floor(Math.random() * 10);
    if (!code.includes(digit.toString())) {
      code += digit;
    }
  }
  return code;
}

export function calcHrtime(hrtime: [number, number]) {
  // 将秒和纳秒转换为毫秒
  return hrtime[0] * 1000 + hrtime[1] / 1000000;
}

export const PhoneRegExp = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
export const SmsExpirationSeconds = 300;

export const gitApiUrl = () => (window as any)['API_URL'] || '';
