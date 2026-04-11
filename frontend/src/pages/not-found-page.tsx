import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function NotFoundPage() {
  return (
    <section className="screen-grid">
      <Card>
        <CardHeader>
          <Badge>404</Badge>
          <CardTitle>Маршрут не найден</CardTitle>
          <CardDescription>Этот экран нужен только как безопасная заглушка каркаса на этапе 4.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link className={cn("ui-button", "ui-button--primary")} to="/">
            Вернуться на главную
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
