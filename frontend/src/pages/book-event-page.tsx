import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function BookEventPage() {
  const { eventTypeId } = useParams();

  return (
    <section className="screen-grid">
      <Card>
        <CardHeader>
          <Badge>Маршрут /book/:eventTypeId</Badge>
          <CardTitle>Выбор слотов</CardTitle>
          <CardDescription>
            Здесь появится экран свободных слотов для типа события <code>{eventTypeId}</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="screen-list">
            <li>Загрузим slots по выбранному event type.</li>
            <li>Сгруппируем их по датам.</li>
            <li>Покажем текущие backend MVP-допущения про 14 дней и UTC.</li>
          </ul>
          <div className="screen-actions">
            <Link className={cn("ui-button", "ui-button--ghost")} to="/">
              Назад к типам событий
            </Link>
            <Link className={cn("ui-button", "ui-button--primary")} to={`/book/${eventTypeId}/confirm`}>
              Открыть заглушку подтверждения
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
