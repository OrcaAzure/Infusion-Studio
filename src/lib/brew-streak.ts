/** Consecutive daily brew streak from brew log dates (newest first). */
export function calcStreak(logs: { brewedAt: Date | string }[]): number {
  if (!logs.length) return 0;
  const days = [
    ...new Set(
      logs.map((l) =>
        (l.brewedAt instanceof Date ? l.brewedAt : new Date(l.brewedAt)).toISOString().slice(0, 10)
      )
    ),
  ].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]!);
    const curr = new Date(days[i]!);
    if (prev.getTime() - curr.getTime() === 86400000) streak++;
    else break;
  }
  return streak;
}
