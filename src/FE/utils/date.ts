export const currentISODateString = () => new Date().toISOString();

Date.prototype.addYear = function (years: number, date?: Date | string): Date {
  const newDate = new Date(date || this);
  newDate.setFullYear(newDate.getFullYear() + years);
  return newDate;
};
