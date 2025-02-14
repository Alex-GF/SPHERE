export function formatStringDates(dates: string[]) {
  return dates.map(date => new Date(date).toISOString().split('T')[0]);
}
