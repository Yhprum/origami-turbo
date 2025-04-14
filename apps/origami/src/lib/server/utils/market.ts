export const holidays = [
  // Market is closed all day
  { date: "2023-01-02", name: "New Year's Day (Observed)" },
  { date: "2023-01-16", name: "Martin Luther King Jr. Day" },
  { date: "2023-02-20", name: "Washington's Birthday" },
  { date: "2023-04-07", name: "Good Friday" },
  { date: "2023-05-29", name: "Memorial Day" },
  { date: "2023-06-19", name: "Juneteenth National Independence Day" },
  { date: "2023-07-04", name: "Independence Day" },
  { date: "2023-09-04", name: "Labor Day" },
  { date: "2023-11-23", name: "Thanksgiving" },
  { date: "2023-12-25", name: "Christmas" },
  // Market closes at 1pm E.T.
  { date: "2023-07-03", name: "Independence Day", early: true },
  { date: "2023-11-24", name: "Thanksgiving", early: true },
  { date: "2023-12-024", name: "Christmas Eve", early: true },
];

export function isMarketOpen() {
  const dateString = new Date().toLocaleString("sv", {
    timeZone: "America/New_York",
  });
  const date = new Date(dateString);
  const day = date.getDay() !== 0 && date.getDay() !== 6;

  const holiday = holidays.find(
    (holiday) => holiday.date === dateString.slice(0, 10)
  );
  const closing = holiday?.early ? 13 : 16;
  const time =
    ((date.getHours() === 9 && date.getMinutes() >= 30) ||
      date.getHours() > 9) &&
    date.getHours() < closing;

  return day && time && !holiday?.early;
}

export function cacheMarketTime(defaultTTL = 15 * 60) {
  if (isMarketOpen()) return defaultTTL;

  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(9, 30, 0, 0);

  if (now > targetTime) {
    targetTime.setDate(now.getDate() + 1);
  }

  const secondsUntilOpen = Math.floor(
    (targetTime.getTime() - now.getTime()) / 1000
  );
  return secondsUntilOpen;
}
