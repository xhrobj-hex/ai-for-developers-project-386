import { useEffect, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createEventType, isCreateEventTypeValidationError } from "@/lib/api/event-types";
import { listUpcomingBookings } from "@/lib/api/bookings";
import { formatUtcDateTime } from "@/lib/format/utc";
import type { EventType } from "@/lib/types/event-type";
import type { UpcomingBooking } from "@/lib/types/upcoming-booking";

type CreateFormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; eventType: EventType }
  | { status: "error"; message: string };

type UpcomingBookingsState =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "success"; bookings: UpcomingBooking[] };

type FormValues = {
  name: string;
  description: string;
  durationMinutes: string;
};

const initialFormValues: FormValues = {
  name: "",
  description: "",
  durationMinutes: "30",
};

export function AdminPage() {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [createState, setCreateState] = useState<CreateFormState>({ status: "idle" });
  const [upcomingState, setUpcomingState] = useState<UpcomingBookingsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    setUpcomingState({ status: "loading" });

    listUpcomingBookings({ signal: controller.signal })
      .then((bookings) => {
        if (bookings.length === 0) {
          setUpcomingState({ status: "empty" });
          return;
        }

        setUpcomingState({
          status: "success",
          bookings,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setUpcomingState({
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      });

    return () => {
      controller.abort();
    };
  }, []);

  function handleChange(field: keyof FormValues, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));

    if (createState.status !== "submitting") {
      setCreateState({ status: "idle" });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = formValues.name.trim();
    const description = formValues.description.trim();
    const durationMinutes = Number(formValues.durationMinutes);

    if (!name || !description || !Number.isInteger(durationMinutes) || durationMinutes <= 0) {
      setCreateState({
        status: "error",
        message: "Заполните name, description и durationMinutes корректными значениями.",
      });
      return;
    }

    setCreateState({ status: "submitting" });

    try {
      const eventType = await createEventType({
        name,
        description,
        durationMinutes,
      });

      setCreateState({
        status: "success",
        eventType,
      });
      setFormValues(initialFormValues);
    } catch (error: unknown) {
      if (isCreateEventTypeValidationError(error)) {
        const details = error.details?.length ? ` (${error.details.join("; ")})` : "";

        setCreateState({
          status: "error",
          message: `${error.message}${details}`,
        });
        return;
      }

      setCreateState({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <section className="screen-grid screen-grid--admin">
      <Card>
        <CardHeader>
          <Badge>Маршрут /admin</Badge>
          <CardTitle>Создание типа события</CardTitle>
          <CardDescription>
            Форма отправляет только контрактный <code>POST /admin/event-types</code> и после успеха остаётся готовой к
            следующему созданию.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="admin-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span className="form-field__label">Название</span>
              <input
                className="form-field__control"
                type="text"
                name="name"
                value={formValues.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="Demo call"
                autoComplete="off"
              />
            </label>

            <label className="form-field">
              <span className="form-field__label">Описание</span>
              <textarea
                className="form-field__control form-field__control--textarea"
                name="description"
                value={formValues.description}
                onChange={(event) => handleChange("description", event.target.value)}
                placeholder="First event type"
                rows={4}
              />
            </label>

            <label className="form-field">
              <span className="form-field__label">Длительность, минут</span>
              <input
                className="form-field__control"
                type="number"
                min="1"
                step="1"
                name="durationMinutes"
                value={formValues.durationMinutes}
                onChange={(event) => handleChange("durationMinutes", event.target.value)}
              />
            </label>

            <div className="screen-actions">
              <Button type="submit" disabled={createState.status === "submitting"}>
                {createState.status === "submitting" ? "Создаём тип события..." : "Создать тип события"}
              </Button>
            </div>
          </form>

          {createState.status === "idle" && (
            <p className="admin-inline-note">Состояние формы: idle. Можно создать новый тип события.</p>
          )}

          {createState.status === "success" && (
            <div className="admin-feedback admin-feedback--success">
              <p className="admin-feedback__title">Тип события создан</p>
              <p className="admin-feedback__text">
                ID: <code>{createState.eventType.id}</code>, название: <strong>{createState.eventType.name}</strong>,{" "}
                длительность: {createState.eventType.durationMinutes} мин.
              </p>
            </div>
          )}

          {createState.status === "error" && (
            <div className="admin-feedback admin-feedback--error">
              <p className="admin-feedback__title">Не удалось создать тип события</p>
              <p className="admin-feedback__text">
                <code>{createState.message}</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Badge>Owner flow</Badge>
          <CardTitle>Предстоящие записи</CardTitle>
          <CardDescription>
            Блок только читает данные из контрактного <code>GET /admin/bookings/upcoming</code> без клиентских вычислений.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingState.status === "loading" && (
            <div className="admin-feedback">
              <p className="admin-feedback__title">Loading</p>
              <p className="admin-feedback__text">Загружаем предстоящие записи владельца.</p>
            </div>
          )}

          {upcomingState.status === "empty" && (
            <div className="admin-feedback">
              <p className="admin-feedback__title">Empty</p>
              <p className="admin-feedback__text">Backend пока не вернул ни одной предстоящей записи.</p>
            </div>
          )}

          {upcomingState.status === "error" && (
            <div className="admin-feedback admin-feedback--error">
              <p className="admin-feedback__title">Error</p>
              <p className="admin-feedback__text">
                <code>{upcomingState.message}</code>
              </p>
            </div>
          )}

          {upcomingState.status === "success" && (
            <div className="admin-list">
              {upcomingState.bookings.map((booking) => (
                <article key={booking.id} className="admin-list__item">
                  <div className="admin-list__heading">
                    <strong>{booking.eventTypeName}</strong>
                    <span>
                      <code>{booking.eventTypeId}</code>
                    </span>
                  </div>
                  <dl className="summary-list">
                    <div className="summary-list__row">
                      <dt>Начало</dt>
                      <dd>{formatUtcDateTime(booking.startAt)} UTC</dd>
                    </div>
                    <div className="summary-list__row">
                      <dt>Конец</dt>
                      <dd>{formatUtcDateTime(booking.endAt)} UTC</dd>
                    </div>
                    <div className="summary-list__row">
                      <dt>Создано</dt>
                      <dd>{formatUtcDateTime(booking.createdAt)} UTC</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
