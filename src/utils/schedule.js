function toTimestamp(value) {
  if (!value) return Number.POSITIVE_INFINITY;

  const parsed = new Date(`${value}T12:00:00`).getTime();
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

export function sortByNearestUpcomingDate(items, getDateValue) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  return [...items].sort((left, right) => {
    const leftTime = toTimestamp(getDateValue(left));
    const rightTime = toTimestamp(getDateValue(right));
    const leftIsPast = leftTime < todayTime;
    const rightIsPast = rightTime < todayTime;

    if (leftIsPast !== rightIsPast) {
      return leftIsPast ? 1 : -1;
    }

    return leftTime - rightTime;
  });
}
