import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUtcDate, formatUtcTime } from "@/lib/format/utc";
import { listEventTypeSlots } from "@/lib/api/slots";
import type { Slot } from "@/lib/types/slot";
import { cn } from "@/lib/utils";

type BookEventPageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; slots: Slot[] };

type SlotGroup = {
  dateKey: string;
  label: string;
  slots: Slot[];
};

export function BookEventPage() {
  const { eventTypeId } = useParams();
  const [state, setState] = useState<BookEventPageState>({ status: "loading" });

  useEffect(() => {
    if (!eventTypeId) {
      setState({
        status: "error",
        message: "Event type id is missing in the route",
      });
      return;
    }

    const controller = new AbortController();

    setState({ status: "loading" });

    listEventTypeSlots(eventTypeId, { signal: controller.signal })
      .then((slots) => {
        setState({ status: "success", slots });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      });

    return () => {
      controller.abort();
    };
  }, [eventTypeId]);

  const groupedSlots = useMemo(() => {
    if (state.status !== "success") {
      return [];
    }

    return groupSlotsByDate(state.slots);
  }, [state]);

  return (
    <section className="screen-grid">
      <Card>
        <CardHeader>
          <Badge>Маршрут /book/:eventTypeId</Badge>
          <CardTitle>Свободные слоты</CardTitle>
          <CardDescription>
            Backend уже отфильтровал доступные слоты для типа события <code>{eventTypeId}</code>. Frontend только
            показывает то, что пришло по текущему API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="screen-list">
            <li>
              Источник данных: контрактный <code>GET /event-types/{"{eventTypeId}"}/slots</code>.
            </li>
            <li>Слоты сгруппированы по дате.</li>
            <li>Клиент не вычисляет слоты самостоятельно.</li>
          </ul>
          <div className="slot-rules">
            <p className="slot-rules__title">Текущие operational rules MVP</p>
            <ul className="screen-list">
              <li>Доступны только ближайшие 14 дней.</li>
              <li>Окно показа: 09:00–18:00 UTC.</li>
              <li>Шаг сетки: 30 минут.</li>
            </ul>
          </div>
          <div className="screen-actions">
            <Link className={cn("ui-button", "ui-button--ghost")} to="/">
              Назад к типам событий
            </Link>
          </div>
        </CardContent>
      </Card>

      {state.status === "loading" && (
        <Card className="screen-state">
          <CardHeader>
            <Badge>Loading</Badge>
            <CardTitle>Загружаем свободные слоты</CardTitle>
            <CardDescription>Frontend запрашивает доступные интервалы у backend для выбранного типа события.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {state.status === "error" && (
        <Card className="screen-state">
          <CardHeader>
            <Badge>Error</Badge>
            <CardTitle>Не удалось загрузить свободные слоты</CardTitle>
            <CardDescription>
              Проверьте, что `eventTypeId` существует и backend доступен через текущий frontend API client.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="screen-state__message">
              Детали: <code>{state.message}</code>
            </p>
          </CardContent>
        </Card>
      )}

      {state.status === "success" && state.slots.length === 0 && (
        <Card className="screen-state">
          <CardHeader>
            <Badge>Empty</Badge>
            <CardTitle>Свободных слотов пока нет</CardTitle>
            <CardDescription>
              Backend вернул пустой список по <code>GET /event-types/{"{eventTypeId}"}/slots</code>.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {state.status === "success" && state.slots.length > 0 && (
        <div className="slot-group-list">
          {groupedSlots.map((group) => (
            <Card key={group.dateKey}>
              <CardHeader>
                <Badge>{group.slots.length} слотов</Badge>
                <CardTitle>{group.label}</CardTitle>
                <CardDescription>Все времена показаны в UTC.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="slot-grid">
                  {group.slots.map((slot) => (
                    <Link
                      key={`${slot.eventTypeId}-${slot.startAt}`}
                      className={cn("slot-pill", "slot-pill--interactive")}
                      to={`/book/${eventTypeId}/confirm`}
                      state={{ slot }}
                    >
                      <span>{formatUtcTime(slot.startAt)}</span>
                      <span className="slot-pill__divider">—</span>
                      <span>{formatUtcTime(slot.endAt)}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function groupSlotsByDate(slots: Slot[]): SlotGroup[] {
  const groups = new Map<string, Slot[]>();

  for (const slot of slots) {
    const dateKey = slot.startAt.slice(0, 10);
    const dateSlots = groups.get(dateKey) ?? [];

    dateSlots.push(slot);
    groups.set(dateKey, dateSlots);
  }

  return Array.from(groups.entries()).map(([dateKey, groupedSlots]) => ({
    dateKey,
    label: formatUtcDate(`${dateKey}T00:00:00Z`),
    slots: groupedSlots,
  }));
}
