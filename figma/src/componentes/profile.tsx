import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { User, Mail, GraduationCap, Calendar, Trophy, Recycle, Edit, Camera } from "lucide-react";

interface ProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    course: string;
    semester: number;
    registrationNumber: string;
    joinDate: string;
    avatar?: string;
  };
  stats: {
    totalPoints: number;
    totalCollections: number;
    totalWeight: number;
    rank: number;
    badges: string[];
  };
}

const badgeInfo = {
  "iniciante-verde": { name: "🌱 Iniciante Verde", description: "Primeira entrega realizada" },
  "reciclador": { name: "♻️ Reciclador", description: "10 entregas realizadas" },
  "eco-campeao": { name: "🏆 Eco Campeão", description: "500+ pontos acumulados" },
  "dedicado": { name: "🎯 Dedicado", description: "15+ entregas realizadas" },
  "sustentavel": { name: "🌍 Sustentável", description: "20kg+ de resíduos coletados" },
  "inspirador": { name: "⭐ Inspirador", description: "Top 50 do ranking" }
};

export function Profile({ user, stats }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSave = () => {
    // Simulate saving user data
    setIsEditing(false);
    toast.success("Perfil atualizado com sucesso!");
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const recentCollections = [
    { date: "2024-09-12", type: "Plástico", weight: 2.5, points: 25 },
    { date: "2024-09-10", type: "Papel", weight: 1.8, points: 14 },
    { date: "2024-09-08", type: "Metal", weight: 0.5, points: 8 },
    { date: "2024-09-05", type: "Eletrônico", weight: 3.2, points: 80 },
    { date: "2024-09-03", type: "Vidro", weight: 1.0, points: 12 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={selectedFile ? URL.createObjectURL(selectedFile) : editedUser.avatar} />
                    <AvatarFallback className="text-lg">
                      {editedUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {!isEditing ? (
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-muted-foreground">{user.course}</p>
                    <p className="text-sm text-muted-foreground">{user.semester}º Semestre</p>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="course">Curso</Label>
                      <Input
                        id="course"
                        value={editedUser.course}
                        onChange={(e) => setEditedUser({...editedUser, course: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="semester">Semestre</Label>
                      <Input
                        id="semester"
                        type="number"
                        value={editedUser.semester}
                        onChange={(e) => setEditedUser({...editedUser, semester: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {!isEditing ? (
                    <span>{user.email}</span>
                  ) : (
                    <Input
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      className="flex-1"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span>RA: {user.registrationNumber}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Ingressou em {new Date(user.joinDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} className="flex-1">
                      Salvar
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="flex-1">
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Pontos Totais</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalCollections}</div>
                <div className="text-sm text-muted-foreground">Entregas</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalWeight}kg</div>
                <div className="text-sm text-muted-foreground">Resíduos</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">#{stats.rank}</div>
                <div className="text-sm text-muted-foreground">Ranking</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conquistas e Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(badgeInfo).map(([key, badge]) => {
                  const hasEarned = stats.badges.includes(key);
                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border ${
                        hasEarned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{badge.name}</div>
                          <div className="text-sm text-muted-foreground">{badge.description}</div>
                        </div>
                        {hasEarned && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Conquistado
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Últimas Entregas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCollections.map((collection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Recycle className="w-4 h-4 text-green-600" />
                      <div>
                        <div className="font-medium">{collection.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(collection.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{collection.weight}kg</div>
                      <div className="text-sm text-green-600">+{collection.points} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
