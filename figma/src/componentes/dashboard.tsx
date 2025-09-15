import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Leaf, Recycle, Trophy, Users } from "lucide-react";

interface DashboardProps {
  userPoints: number;
  userRank: number;
  totalCollections: number;
  monthlyGoal: number;
  monthlyProgress: number;
}

export function Dashboard({
  userPoints,
  userRank,
  totalCollections,
  monthlyGoal,
  monthlyProgress
}: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seus Pontos</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userPoints}</div>
            <p className="text-xs text-muted-foreground">+20 pontos esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ranking</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{userRank}</div>
            <p className="text-xs text-muted-foreground">Entre todos os alunos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas Totais</CardTitle>
            <Recycle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCollections}</div>
            <p className="text-xs text-muted-foreground">Desde o início do programa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Mensal</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyProgress}/{monthlyGoal}</div>
            <p className="text-xs text-muted-foreground">kg de resíduos coletados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progresso da Meta Mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Meta de Setembro</span>
                <span>{Math.round((monthlyProgress / monthlyGoal) * 100)}% concluída</span>
              </div>
              <Progress value={(monthlyProgress / monthlyGoal) * 100} className="h-2" />
            </div>
            <div className="text-sm text-muted-foreground">
              Faltam {monthlyGoal - monthlyProgress}kg para atingir a meta da universidade
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seus Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                🌱 Iniciante Verde
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                ♻️ Reciclador
              </Badge>
              {userPoints >= 500 && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  🏆 Eco Campeão
                </Badge>
              )}
              {totalCollections >= 10 && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  🎯 Dedicado
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Impacto Ambiental</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{(totalCollections * 0.5).toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Árvores salvas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{(totalCollections * 1.2).toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Litros de água economizados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{(totalCollections * 2.1).toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">kg de CO₂ não emitidos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
