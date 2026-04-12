import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listEventTypes } from "@/lib/api/event-types";
import type { EventType } from "@/lib/types/event-type";
import { cn } from "@/lib/utils";

type HomePageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; eventTypes: EventType[] };

export function HomePage() {
  const [state, setState] = useState<HomePageState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    setState({ status: "loading" });

    listEventTypes({ signal: controller.signal })
      .then((eventTypes) => {
        setState({ status: "success", eventTypes });
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
  }, []);

  return (
    <section className="screen-grid">
      <Card>
        <CardHeader>
          <Badge>Публичная запись</Badge>
          <CardTitle>Выберите тип встречи</CardTitle>
          <CardDescription>
            Это публичная страница записи. Гость начинает сценарий с выбора подходящего формата встречи.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="screen-list">
            <li>Выберите подходящий тип встречи.</li>
            <li>Откройте свободные слоты на ближайшие 14 дней.</li>
            <li>Подтвердите бронирование на следующем шаге.</li>
          </ul>
        </CardContent>
      </Card>

      {state.status === "loading" && (
        <Card className="screen-state">
          <CardHeader>
            <Badge>Загрузка</Badge>
            <CardTitle>Загружаем доступные встречи</CardTitle>
            <CardDescription>Получаем список типов событий для публичной записи.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {state.status === "error" && (
        <Card className="screen-state">
          <CardHeader>
            <Badge>Ошибка</Badge>
            <CardTitle>Не удалось открыть список встреч</CardTitle>
            <CardDescription>Сервис временно недоступен. Попробуйте обновить страницу или проверьте доступность API.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="screen-state__message">
              Детали: <code>{state.message}</code>
            </p>
          </CardContent>
        </Card>
      )}

      {state.status === "success" && state.eventTypes.length === 0 && (
        <Card className="screen-state">
          <CardHeader>
            <Badge>Пусто</Badge>
            <CardTitle>Пока нет доступных встреч</CardTitle>
            <CardDescription>Сначала создайте хотя бы один тип события в панели владельца.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="screen-actions">
              <Link className={cn("ui-button", "ui-button--primary")} to="/admin">
                Открыть панель владельца
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {state.status === "success" && state.eventTypes.length > 0 && (
        <div className="event-type-grid">
          {state.eventTypes.map((eventType) => (
            <Card key={eventType.id} className="event-type-card" data-testid="event-type-card">
              <CardHeader>
                <Badge>{formatDuration(eventType.durationMinutes)}</Badge>
                <CardTitle>{eventType.name}</CardTitle>
                <CardDescription>{eventType.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="event-type-card__meta">
                  <span>Длительность: {formatDuration(eventType.durationMinutes)}</span>
                  <span>Следующий шаг: выбор времени</span>
                </div>
                <Link
                  className={cn("ui-button", "ui-button--primary", "screen-action")}
                  data-testid="event-type-open"
                  to={`/book/${eventType.id}`}
                >
                  Выбрать время
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDuration(durationMinutes: number) {
  return `${durationMinutes} мин`;
}
