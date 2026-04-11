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
          <Badge>Маршрут /</Badge>
          <CardTitle>Публичная запись</CardTitle>
          <CardDescription>
            Гость видит доступные типы событий из backend и выбирает, с какого сценария записи начать.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="screen-list">
            <li>Источник данных: контрактный `GET /event-types`.</li>
            <li>Список типов событий уже загружается из backend.</li>
            <li>Переход ведёт на реальный экран свободных слотов.</li>
          </ul>
        </CardContent>
      </Card>

      {state.status === "loading" && (
        <Card className="screen-state">
          <CardHeader>
            <Badge>Loading</Badge>
            <CardTitle>Загружаем типы событий</CardTitle>
            <CardDescription>Frontend запрашивает список доступных event types у backend.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {state.status === "error" && (
        <Card className="screen-state">
          <CardHeader>
            <Badge>Error</Badge>
            <CardTitle>Не удалось загрузить список типов событий</CardTitle>
            <CardDescription>
              Проверьте `VITE_API_BASE_URL`, доступность backend и разрешение браузерных запросов к API.
            </CardDescription>
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
            <Badge>Empty</Badge>
            <CardTitle>Типы событий пока не созданы</CardTitle>
            <CardDescription>
              Публичная страница готова, но backend пока возвращает пустой список `GET /event-types`.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {state.status === "success" && state.eventTypes.length > 0 && (
        <div className="event-type-grid">
          {state.eventTypes.map((eventType) => (
            <Card key={eventType.id} className="event-type-card">
              <CardHeader>
                <Badge>{formatDuration(eventType.durationMinutes)}</Badge>
                <CardTitle>{eventType.name}</CardTitle>
                <CardDescription>{eventType.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="event-type-card__meta">
                  <span>Длительность: {formatDuration(eventType.durationMinutes)}</span>
                  <span>Переход ведёт на выбор слотов</span>
                </div>
                <Link className={cn("ui-button", "ui-button--primary", "screen-action")} to={`/book/${eventType.id}`}>
                  Выбрать тип события
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
