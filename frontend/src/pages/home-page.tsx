import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function HomePage() {
  return (
    <section className="screen-grid">
      <Card>
        <CardHeader>
          <Badge>Маршрут /</Badge>
          <CardTitle>Публичная запись</CardTitle>
          <CardDescription>
            Здесь на следующем шаге появится список типов событий и старт публичного сценария бронирования.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="screen-list">
            <li>Покажем event types из backend.</li>
            <li>Добавим состояния loading, empty и error.</li>
            <li>Переход на экран выбранного типа события.</li>
          </ul>
          <Link className={cn("ui-button", "ui-button--primary", "screen-action")} to="/book/demo-event">
            Открыть заглушку выбора слотов
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
