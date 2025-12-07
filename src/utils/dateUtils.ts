export const daysBetween = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const ms = endDate.getTime() - startDate.getTime();
  const days = ms / (1000 * 60 * 60 * 24);

  
  return Math.ceil(days);
};
