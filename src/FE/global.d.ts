declare global {
  interface Date {
    addYear(years: number, date?: Date | string): Date;
  }
}

export {};
