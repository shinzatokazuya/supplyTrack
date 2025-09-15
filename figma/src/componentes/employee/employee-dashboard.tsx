import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CheckCircle, Clock, Users, TrendingUp, AlertTriangle, Package } from "lucide-react";

interface EmployeeDashboardProps {
  stats: {
    pendingValidations: number;
    todayValidations: number;
    todayPoints: number;
    activeStudents: number;
    weeklyCollection: number;
    alerts: number;
  };
}

const recentDeliveries = [
  {
    id: "DEL001",
    studentName: "Ana Silva",
    studentRA: "2021001234",
    wasteType: "Plástico",
    weight: 2.5,
    points: 25,
    timestamp: "10:30",
    status: "pending"
  },
  {
    id: "DEL002",
    studentName: "João Santos",
    studentRA: "2020005678",
    wasteType: "Papel",
    weight: 1.8,
    points: 14,
    timestamp: "10:15",
    status: "validated"
  },
  {
    id: "DEL003",
    studentName: "Maria Costa",
    studentRA: "2021009876",
    wasteType: "Metal",
    weight: 0.5,
    points: 8,
    timestamp: "09:45",
    status: "validated"
  },
  {
    id: "DEL004",
    studentName: "Pedro Lima",
    studentRA: "2019003456",
    wasteType: "Eletrônico",
    weight: 3.2,
    points: 80,
    timestamp: "09:30",
    status: "pending"
  }
];

const alerts = [
  {
    id: 1,
    type: "warning",
    message: "Container de plástico 70% cheio - Ponto Principal",
    timestamp: "09:15"
  },
  {
    id: 2,
    type: "info",
    message: "Meta diária de validações atingida!",
    timestamp: "08:30"
  }
];

export function EmployeeDashboard({ stats }: EmployeeDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "validated": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pendente";
      case "validated": return "Validado";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard do Funcionário</h2>
        <p className="text-muted-foreground">
          Gerencie validações e acompanhe o desempenho do programa
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validações Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingValidations}</div>
            <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validações Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayValidations}</div>
            <p className="text-xs text-muted-foreground">Entregas confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Distribuídos</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.todayPoints}</div>
            <p className="text-xs text-muted-foreground">Pontos dados hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents}</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coleta Semanal</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyCollection}kg</div>
            <p className="text-xs text-muted-foreground">Resíduos coletados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.alerts}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Entregas Recentes</CardTitle>
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDeliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{delivery.studentName}</span>
                      <Badge variant="outline" className="text-xs">
                        {delivery.studentRA}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {delivery.wasteType} • {delivery.weight}kg • {delivery.timestamp}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium">+{delivery.points}</span>
                    <Badge className={getStatusColor(delivery.status)}>
                      {getStatusText(delivery.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts and Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas e Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-start gap-2">
                    {alert.type === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full">
                Ver Todos os Alertas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Validar Entregas
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Ver Ranking
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Relatórios
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Inventário
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
