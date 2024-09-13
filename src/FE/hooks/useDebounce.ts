export default function useDebounce<A extends any[], R>(
  fn: (...args: A) => R,
  delay: number,
): (...args: A) => R | void {
  let timer: NodeJS.Timeout;
  return function (...args: A): R | void {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
