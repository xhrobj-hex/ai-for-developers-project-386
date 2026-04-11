import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function BookingConfirmPage() {
  const { eventTypeId } = useParams();

  return (
    <section className="screen-grid">
      <Card>
        <CardHeader>
          <Badge>Маршрут /book/:eventTypeId/confirm</Badge>
          <CardTitle>Подтверждение бронирования</CardTitle>
          <CardDescription>
            Здесь появится минимальный confirm screen перед отправкой <code>POST /bookings</code> для события{" "}
            <code>{eventTypeId}</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="screen-list">
            <li>Покажем выбранный slot.</li>
            <li>Добавим отправку бронирования и success state.</li>
            <li>Отдельно обработаем 409 и 422.</li>
          </ul>
          <div className="screen-actions">
            <Link className={cn("ui-button", "ui-button--ghost")} to={`/book/${eventTypeId}`}>
              Назад к слотам
            </Link>
            <Link className={cn("ui-button", "ui-button--primary")} to="/admin">
              Открыть admin-заглушку
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
