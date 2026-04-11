import { apiGet } from "@/lib/api/client";
import { isEventType, type EventType } from "@/lib/types/event-type";

type ListEventTypesOptions = {
  signal?: AbortSignal;
};

export async function listEventTypes(options: ListEventTypesOptions = {}): Promise<EventType[]> {
  const payload = await apiGet("/event-types", options);

  if (!Array.isArray(payload) || !payload.every(isEventType)) {
    throw new Error("API returned an unexpected event types payload");
  }

  return payload;
}
