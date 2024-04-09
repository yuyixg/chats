export function generateOrderTradeNo() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth()}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const time = date.getTime();
  return `${year}${month}${day}${time}`;
}

export function centsToYuan(amount: number) {
  return amount / 100;
}

export function yuanToCents(amount: number) {
  return Number((amount * 100).toFixed(2));
}
