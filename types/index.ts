type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type LoadingState = 'loading' | 'sorting' | 'loadingMore' | 'error' | 'idle' | 'filtering';