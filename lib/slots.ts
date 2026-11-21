export type Slot = { iso: string; label: string };

export function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function buildSlots(
  taken: Set<string>,
  blockedDays: Set<string> = new Set(),
): Slot[] {
  const slots: Slot[] = [];
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  const times: [number, number][] = [
    [12, 30],
    [17, 30],
  ];
  while (slots.length < 10) {
    day.setDate(day.getDate() + 1);
    const weekday = day.getDay();
    if (weekday === 0 || weekday === 6) continue;
    for (const [h, m] of times) {
      if (slots.length >= 10) break;
      const slot = new Date(day);
      slot.setHours(h, m, 0, 0);
      if (slot.getTime() < Date.now() + 2 * 60 * 60 * 1000) continue;
      const iso = slot.toISOString();
      if (taken.has(iso)) continue;
      if (blockedDays.has(localDayKey(slot))) continue;
      slots.push({
        iso,
        label: slot.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }),
      });
    }
  }
  return slots;
}
