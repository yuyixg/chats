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
  currentValue: string | undefined
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
