import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createBooking, isApiErrorWithCode } from "@/lib/api/bookings";
import { listEventTypeSlots } from "@/lib/api/slots";
import { formatUtcDateTime } from "@/lib/format/utc";
import type { Booking } from "@/lib/types/booking";
import { isSlot, type Slot } from "@/lib/types/slot";
import { cn } from "@/lib/utils";

type BookingConfirmState =
  | { status: "resolving" }
  | { status: "idle"; slot: Slot }
  | { status: "submitting"; slot: Slot }
  | { status: "success"; booking: Booking }
  | { status: "slot-conflict"; slot: Slot; message: string }
  | { status: "rule-violation"; slot: Slot; message: string }
  | { status: "error"; slot?: Slot; message: string };

export function BookingConfirmPage() {
  const { eventTypeId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const slotFromState = getSlotFromLocationState(location.state);
  const requestedStartAt = searchParams.get("startAt")?.trim() ?? "";
  const selectedSlot = getSelectedSlot(slotFromState, eventTypeId, requestedStartAt);
  const [state, setState] = useState<BookingConfirmState>(() =>
    buildInitialState(eventTypeId, requestedStartAt, selectedSlot),
  );

  const canReturnToSlots = Boolean(eventTypeId);

  useEffect(() => {
    if (!eventTypeId) {
      setState({
        status: "error",
        message: "Не удалось определить тип события по текущей ссылке.",
      });
      return;
    }

    if (selectedSlot) {
      setState({ status: "idle", slot: selectedSlot });
      return;
    }

    if (!requestedStartAt) {
      setState({
        status: "error",
        message: "Ссылка не содержит выбранный слот. Вернитесь к списку времени и выберите его заново.",
      });
      return;
    }

    const controller = new AbortController();
    setState({ status: "resolving" });

    listEventTypeSlots(eventTypeId, { signal: controller.signal })
      .then((slots) => {
        const resolvedSlot = slots.find((slot) => slot.startAt === requestedStartAt);

        if (!resolvedSlot) {
          setState({
            status: "error",
            message: "Выбранный слот больше недоступен. Откройте список свободного времени и выберите другой.",
          });
          return;
        }

        setState({
          status: "idle",
          slot: resolvedSlot,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Не удалось восстановить выбранный слот по текущей ссылке.",
        });
      });

    return () => {
      controller.abort();
    };
  }, [eventTypeId, requestedStartAt, selectedSlot?.eventTypeId, selectedSlot?.startAt, selectedSlot?.endAt]);

  async function handleSubmit() {
    if (state.status === "resolving" || state.status === "success" || (state.status === "error" && !state.slot)) {
      return;
    }

    const activeSlot = "slot" in state ? state.slot : undefined;
    if (!activeSlot) {
      return;
    }

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
            <Badge>Ошибка</Badge>
            <CardTitle>Не удалось открыть подтверждение</CardTitle>
            <CardDescription>Ссылка не содержит корректный слот или выбранное время уже недоступно.</CardDescription>
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

  if (state.status === "resolving") {
    return (
      <section className="screen-grid">
        <Card className="screen-state" data-testid="booking-resolving-slot">
          <CardHeader>
            <Badge>Загрузка</Badge>
            <CardTitle>Восстанавливаем выбранный слот</CardTitle>
            <CardDescription>Проверяем, что время из ссылки всё ещё доступно для бронирования.</CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  if (state.status === "success") {
    return (
      <section className="screen-grid">
        <Card className="screen-state" data-testid="booking-success">
          <CardHeader>
            <Badge>Готово</Badge>
            <CardTitle>Запись подтверждена</CardTitle>
            <CardDescription>Встреча успешно создана. Ниже показаны детали подтверждённого бронирования.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="summary-list">
              <div className="summary-list__row">
                <dt>ID бронирования</dt>
                <dd>
                  <code>{state.booking.id}</code>
                </dd>
              </div>
              <div className="summary-list__row">
                <dt>ID типа события</dt>
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
          <Badge>Подтверждение</Badge>
          <CardTitle>Проверьте детали встречи</CardTitle>
          <CardDescription>Если всё верно, подтвердите бронирование. Время на странице указано в UTC.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="summary-list">
            <div className="summary-list__row">
              <dt>ID типа события</dt>
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
            <Badge>Отправка</Badge>
            <CardTitle>Отправляем бронирование</CardTitle>
            <CardDescription>Сохраняем запись и ждём подтверждение от сервиса.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {state.status === "slot-conflict" && (
        <Card className="screen-state" data-testid="booking-slot-conflict">
          <CardHeader>
            <Badge>409</Badge>
            <CardTitle>Слот уже занят</CardTitle>
            <CardDescription>Это время уже занято. Вернитесь к слотам и выберите другой интервал.</CardDescription>
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
            <CardDescription>Текущее время больше недоступно для записи по правилам сервиса.</CardDescription>
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
            <Badge>Ошибка</Badge>
            <CardTitle>Не удалось создать бронирование</CardTitle>
            <CardDescription>Сервис не подтвердил запись. Попробуйте выбрать слот заново или повторить попытку позже.</CardDescription>
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

function getSlotFromLocationState(value: unknown): Slot | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const candidate = value as { slot?: unknown };

  return isSlot(candidate.slot) ? candidate.slot : undefined;
}

function buildInitialState(
  eventTypeId: string | undefined,
  requestedStartAt: string,
  selectedSlot: Slot | undefined,
): BookingConfirmState {
  if (!eventTypeId) {
    return {
      status: "error",
      message: "Не удалось определить тип события по текущей ссылке.",
    };
  }

  if (selectedSlot) {
    return {
      status: "idle",
      slot: selectedSlot,
    };
  }

  if (requestedStartAt) {
    return {
      status: "resolving",
    };
  }

  return {
    status: "error",
    message: "Ссылка не содержит выбранный слот. Вернитесь к списку времени и выберите его заново.",
  };
}

function getSelectedSlot(
  slot: Slot | undefined,
  eventTypeId: string | undefined,
  requestedStartAt: string,
): Slot | undefined {
  if (!slot) {
    return undefined;
  }

  if (eventTypeId && slot.eventTypeId !== eventTypeId) {
    return undefined;
  }

  if (requestedStartAt && slot.startAt !== requestedStartAt) {
    return undefined;
  }

  return slot;
}
