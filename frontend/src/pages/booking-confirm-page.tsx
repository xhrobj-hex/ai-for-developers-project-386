import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createBooking, isApiErrorWithCode } from "@/lib/api/bookings";
import { formatUtcDateTime } from "@/lib/format/utc";
import type { Booking } from "@/lib/types/booking";
import { isSlot, type Slot } from "@/lib/types/slot";
import { cn } from "@/lib/utils";

type BookingConfirmState =
  | { status: "idle"; slot: Slot }
  | { status: "submitting"; slot: Slot }
  | { status: "success"; booking: Booking }
  | { status: "slot-conflict"; slot: Slot; message: string }
  | { status: "rule-violation"; slot: Slot; message: string }
  | { status: "error"; slot?: Slot; message: string };

export function BookingConfirmPage() {
  const { eventTypeId } = useParams();
  const location = useLocation();

  const selectedSlot = useMemo(() => getSlotFromLocationState(location.state), [location.state]);
  const [state, setState] = useState<BookingConfirmState>(() => buildInitialState(eventTypeId, selectedSlot));

  const canReturnToSlots = Boolean(eventTypeId);

  useEffect(() => {
    setState(buildInitialState(eventTypeId, selectedSlot));
  }, [eventTypeId, selectedSlot?.eventTypeId, selectedSlot?.startAt, selectedSlot?.endAt]);

  async function handleSubmit() {
    if (state.status === "error" || state.status === "success") {
      return;
    }

    const activeSlot = state.slot;
    setState({
      status: "submitting",
      slot: activeSlot,
    });

    try {
      const booking = await createBooking({
        eventTypeId: activeSlot.eventTypeId,
        startAt: activeSlot.startAt,
      });

      setState({
        status: "success",
        booking,
      });
    } catch (error: unknown) {
      if (isApiErrorWithCode(error, 409, "SLOT_ALREADY_BOOKED")) {
        setState({
          status: "slot-conflict",
          slot: activeSlot,
          message: error.message,
        });
        return;
      }

      if (isApiErrorWithCode(error, 422, "BOOKING_RULE_VIOLATION")) {
        setState({
          status: "rule-violation",
          slot: activeSlot,
          message: error.message,
        });
        return;
      }

      setState({
        status: "error",
        slot: activeSlot,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (state.status === "error" && !state.slot) {
    return (
      <section className="screen-grid">
        <Card className="screen-state" data-testid="booking-missing-slot">
          <CardHeader>
            <Badge>Error</Badge>
            <CardTitle>Невозможно подтвердить бронирование</CardTitle>
            <CardDescription>
              Confirm screen открыт без выбранного слота. На этом этапе бронь создаётся только после явного выбора на
              предыдущем экране.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="screen-state__message">
              Детали: <code>{state.message}</code>
            </p>
            <div className="screen-actions">
              {canReturnToSlots && (
                <Link className={cn("ui-button", "ui-button--primary")} to={`/book/${eventTypeId}`}>
                  Вернуться к слотам
                </Link>
              )}
              <Link className={cn("ui-button", "ui-button--ghost")} to="/">
                На главную
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (state.status === "success") {
    return (
      <section className="screen-grid">
        <Card className="screen-state" data-testid="booking-success">
          <CardHeader>
            <Badge>Success</Badge>
            <CardTitle>Бронирование создано</CardTitle>
            <CardDescription>
              Backend подтвердил запись и вернул итоговый объект бронирования. Этот ответ остаётся source of truth.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="summary-list">
              <div className="summary-list__row">
                <dt>Booking ID</dt>
                <dd>
                  <code>{state.booking.id}</code>
                </dd>
              </div>
              <div className="summary-list__row">
                <dt>Event type</dt>
                <dd>
                  <code>{state.booking.eventTypeId}</code>
                </dd>
              </div>
              <div className="summary-list__row">
                <dt>Начало</dt>
                <dd>{formatUtcDateTime(state.booking.startAt)} UTC</dd>
              </div>
              <div className="summary-list__row">
                <dt>Конец</dt>
                <dd>{formatUtcDateTime(state.booking.endAt)} UTC</dd>
              </div>
            </dl>
            <div className="screen-actions">
              <Link className={cn("ui-button", "ui-button--ghost")} to={`/book/${state.booking.eventTypeId}`}>
                Назад к слотам
              </Link>
              <Link className={cn("ui-button", "ui-button--primary")} to="/">
                На главную
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const activeSlot = state.slot;
  if (!activeSlot) {
    return null;
  }

  return (
    <section className="screen-grid">
      <Card data-testid="booking-confirm">
        <CardHeader>
          <Badge>Маршрут /book/:eventTypeId/confirm</Badge>
          <CardTitle>Подтверждение бронирования</CardTitle>
          <CardDescription>
            Страница отправляет только контрактный <code>POST /bookings</code> с полями <code>eventTypeId</code> и{" "}
            <code>startAt</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="summary-list">
            <div className="summary-list__row">
              <dt>Event type</dt>
              <dd>
                <code>{eventTypeId}</code>
              </dd>
            </div>
            <div className="summary-list__row">
              <dt>Начало</dt>
              <dd>{formatUtcDateTime(activeSlot.startAt)} UTC</dd>
            </div>
            <div className="summary-list__row">
              <dt>Конец</dt>
              <dd>{formatUtcDateTime(activeSlot.endAt)} UTC</dd>
            </div>
          </dl>
          <div className="screen-actions">
            <Link className={cn("ui-button", "ui-button--ghost")} to={`/book/${eventTypeId}`}>
              Назад к слотам
            </Link>
            <Button data-testid="booking-submit" onClick={handleSubmit} disabled={state.status === "submitting"}>
              {state.status === "submitting" ? "Создаём бронирование..." : "Подтвердить бронирование"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {state.status === "submitting" && (
        <Card className="screen-state">
          <CardHeader>
            <Badge>Submitting</Badge>
            <CardTitle>Отправляем бронирование</CardTitle>
            <CardDescription>Frontend ждёт ответ backend по текущему выбранному слоту.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {state.status === "slot-conflict" && (
        <Card className="screen-state" data-testid="booking-slot-conflict">
          <CardHeader>
            <Badge>409</Badge>
            <CardTitle>Слот уже занят</CardTitle>
            <CardDescription>Backend вернул контрактную ошибку <code>SLOT_ALREADY_BOOKED</code>.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="screen-state__message">
              Детали: <code>{state.message}</code>
            </p>
            <div className="screen-actions">
              <Link className={cn("ui-button", "ui-button--primary")} to={`/book/${eventTypeId}`}>
                Выбрать другой слот
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {state.status === "rule-violation" && (
        <Card className="screen-state" data-testid="booking-rule-violation">
          <CardHeader>
            <Badge>422</Badge>
            <CardTitle>Слот больше не проходит правила бронирования</CardTitle>
            <CardDescription>
              Backend вернул контрактную ошибку <code>BOOKING_RULE_VIOLATION</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="screen-state__message">
              Детали: <code>{state.message}</code>
            </p>
            <div className="screen-actions">
              <Link className={cn("ui-button", "ui-button--primary")} to={`/book/${eventTypeId}`}>
                Вернуться к слотам
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {state.status === "error" && state.slot && (
        <Card className="screen-state">
          <CardHeader>
            <Badge>Error</Badge>
            <CardTitle>Не удалось создать бронирование</CardTitle>
            <CardDescription>
              Backend не подтвердил бронь. Этот сценарий не маппится на специальные 409/422 состояния.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="screen-state__message">
              Детали: <code>{state.message}</code>
            </p>
            <div className="screen-actions">
              <Link className={cn("ui-button", "ui-button--ghost")} to={`/book/${eventTypeId}`}>
                Назад к слотам
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function getSlotFromLocationState(value: unknown): Slot | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as { slot?: unknown };

  return isSlot(candidate.slot) ? candidate.slot : null;
}

function buildInitialState(eventTypeId: string | undefined, selectedSlot: Slot | null): BookingConfirmState {
  if (!eventTypeId) {
    return {
      status: "error",
      message: "Event type id is missing in the route",
    };
  }

  if (!selectedSlot || selectedSlot.eventTypeId !== eventTypeId) {
    return {
      status: "error",
      message: "Open this screen from the slot selection page to confirm a booking.",
    };
  }

  return {
    status: "idle",
    slot: selectedSlot,
  };
}
