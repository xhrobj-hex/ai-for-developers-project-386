import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminPage() {
  return (
    <section className="screen-grid screen-grid--admin">
      <Card>
        <CardHeader>
          <Badge>Маршрут /admin</Badge>
          <CardTitle>Создание типа события</CardTitle>
          <CardDescription>
            На следующем шаге здесь появится минимальная форма создания event type через <code>POST /admin/event-types</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="screen-list">
            <li>Поля name, description, durationMinutes.</li>
            <li>Состояния idle, submitting, created, validation error.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Badge>Owner flow</Badge>
          <CardTitle>Предстоящие записи</CardTitle>
          <CardDescription>
            Здесь появится список записей владельца через <code>GET /admin/bookings/upcoming</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="screen-list">
            <li>Покажем loading, empty и error состояния.</li>
            <li>Добавим список будущих бронирований по мере появления данных.</li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
