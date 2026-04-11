export type UpcomingBooking = {
  id: string;
  eventTypeId: string;
  eventTypeName: string;
  startAt: string;
  endAt: string;
  createdAt: string;
};

export function isUpcomingBooking(value: unknown): value is UpcomingBooking {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.eventTypeId === "string" &&
    typeof candidate.eventTypeName === "string" &&
    typeof candidate.startAt === "string" &&
    typeof candidate.endAt === "string" &&
    typeof candidate.createdAt === "string"
  );
}
