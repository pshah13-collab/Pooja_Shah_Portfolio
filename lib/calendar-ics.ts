export function downloadIcs(booking: {
  id: string;
  slot: string;
  topic: string;
  code: string;
}): void {
  const fmt = (date: Date): string =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escape = (text: string): string =>
    text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");

  const start = new Date(booking.slot);
  const end = new Date(start.getTime() + 15 * 60 * 1000);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pooja Shah Portfolio//Coffee Chat//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@pooja-shah-portfolio`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    "SUMMARY:Coffee chat with Pooja Shah",
    `DESCRIPTION:15-min video call. booking code: ${escape(
      booking.code,
    )} (reschedule or cancel anytime). topic: ${escape(booking.topic)}`,
    "LOCATION:video call — link sent after confirmation",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "coffee-chat-pooja.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
