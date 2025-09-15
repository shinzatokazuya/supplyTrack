import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

interface LeaderboardUser {
  id: string;
  name: string;
  course: string;
  points: number;
  collections: number;
  avatar?: string;
}

const mockUsers: LeaderboardUser[] = [
  { id: "1", name: "Ana Silva", course: "Engenharia Ambiental", points: 1250, collections: 45 },
  { id: "2", name: "João Santos", course: "Administração", points: 1180, collections: 38 },
  { id: "3", name: "Maria Costa", course: "Ciências Biológicas", points: 950, collections: 42 },
  { id: "4", name: "Pedro Lima", course: "Engenharia Civil", points: 870, collections: 35 },
  { id: "5", name: "Julia Rocha", course: "Marketing", points: 820, collections: 28 },
  { id: "6", name: "Carlos Mendes", course: "Sistemas de Informação", points: 750, collections: 31 },
  { id: "7", name: "Luciana Dias", course: "Psicologia", points: 680, collections: 25 },
  { id: "8", name: "Roberto Alves", course: "Direito", points: 650, collections: 22 },
  { id: "9", name: "Fernanda Cruz", course: "Nutrição", points: 590, collections: 19 },
  { id: "10", name: "Gabriel Souza", course: "Educação Física", points: 540, collections: 18 },
];

const topCourses = [
  { name: "Engenharia Ambiental", points: 5420, students: 12 },
  { name: "Ciências Biológicas", points: 4380, students: 15 },
  { name: "Administração", points: 3950, students: 18 },
  { name: "Engenharia Civil", points: 3650, students: 10 },
];

interface LeaderboardProps {
  currentUserId?: string;
}

export function Leaderboard({ currentUserId = "1" }: LeaderboardProps) {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">#{position}</span>;
    }
  };

  const getBadgeVariant = (position: number) => {
    if (position <= 3) return "default";
    if (position <= 10) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ranking Individual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockUsers.map((user, index) => {
                  const position = index + 1;
                  const isCurrentUser = user.id === currentUserId;

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isCurrentUser ? 'bg-primary/5 border-primary' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8">
                          {getRankIcon(position)}
                        </div>

                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                              {user.name}
                            </span>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">Você</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.course}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-green-600">{user.points} pts</div>
                        <div className="text-sm text-muted-foreground">{user.collections} entregas</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ranking por Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topCourses.map((course, index) => (
                  <div key={course.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{index + 1}</span>
                        <span className="text-sm">{course.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{course.students} estudantes</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">{course.points}</div>
                      <div className="text-xs text-muted-foreground">pontos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">1,247</div>
                <div className="text-sm text-muted-foreground">Total de participantes</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">15.8 ton</div>
                <div className="text-sm text-muted-foreground">Resíduos coletados</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">8,540</div>
                <div className="text-sm text-muted-foreground">Entregas realizadas</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
