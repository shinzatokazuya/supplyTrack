import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { Dashboard } from "./components/dashboard";
import { CollectWaste } from "./components/collect-waste";
import { Leaderboard } from "./components/leaderboard";
import { Rewards } from "./components/rewards";
import { Campaigns } from "./components/campaigns";
import { Profile } from "./components/profile";
import { Login } from "./components/auth/login";
import { EmployeeDashboard } from "./components/employee/employee-dashboard";
import { ValidateDelivery } from "./components/employee/validate-delivery";
import { Reports } from "./components/employee/reports";
import { QRCodeGenerator } from "./components/student/qr-code-generator";
import { Toaster } from "./components/ui/sonner";
import {
  Home,
  Plus,
  Trophy,
  Gift,
  Megaphone,
  User,
  Leaf,
  Bell,
  Settings,
  CheckCircle,
  QrCode,
  BarChart3,
  LogOut,
} from "lucide-react";

interface WasteItem {
  id: string;
  type: string;
  weight: number;
  description: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  ra: string;
  userType: "student" | "employee";
  course?: string;
  semester?: number;
  department?: string;
  joinDate: string;
}

export default function App() {
  const [currentUser, setCurrentUser] =
    useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userStats, setUserStats] = useState({
    points: 847,
    rank: 15,
    totalCollections: 23,
    totalWeight: 45.8,
    monthlyGoal: 500,
    monthlyProgress: 387,
    badges: [
      "iniciante-verde",
      "reciclador",
      "eco-campeao",
      "dedicado",
    ],
  });

  const [employeeStats] = useState({
    pendingValidations: 4,
    todayValidations: 12,
    todayPoints: 340,
    activeStudents: 67,
    weeklyCollection: 156.7,
    alerts: 2,
  });

  const [notifications] = useState([
    {
      id: 1,
      message:
        "Nova campanha 'Outubro Rosa e Verde' disponível!",
      type: "campaign",
    },
    {
      id: 2,
      message: "Você subiu para a posição #15 no ranking!",
      type: "achievement",
    },
    {
      id: 3,
      message: "Meta mensal 77% concluída",
      type: "progress",
    },
  ]);

  const handleLogin = (userData: UserData) => {
    setCurrentUser(userData);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  const handleWasteSubmission = (
    items: WasteItem[],
    location: string,
    photo?: File,
  ) => {
    // Calculate points from the submitted items
    const wasteTypes = {
      plastic: 10,
      paper: 8,
      metal: 15,
      glass: 12,
      electronic: 25,
      organic: 5,
    };

    const newPoints = items.reduce((sum, item) => {
      return (
        sum +
        (wasteTypes[item.type as keyof typeof wasteTypes] ||
          0) *
          item.weight
      );
    }, 0);

    const newWeight = items.reduce(
      (sum, item) => sum + item.weight,
      0,
    );

    setUserStats((prev) => ({
      ...prev,
      points: prev.points + newPoints,
      totalCollections: prev.totalCollections + 1,
      totalWeight: prev.totalWeight + newWeight,
      monthlyProgress: prev.monthlyProgress + newWeight,
    }));

    console.log("Waste submission:", {
      items,
      location,
      photo,
    });
  };

  const handleValidation = (deliveryData: any) => {
    console.log("Delivery validated:", deliveryData);
  };

  // Show login screen if no user is authenticated
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Ecotrack</h1>
                <p className="text-sm text-muted-foreground">
                  {currentUser.userType === "student"
                    ? "Sustentabilidade & Gamificação"
                    : "Painel Administrativo"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {currentUser.userType === "student"
                    ? "Aluno:"
                    : "Funcionário:"}{" "}
                  {currentUser.name}
                </span>
                {currentUser.userType === "student" && (
                  <>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {userStats.points} pontos
                    </Badge>
                    <Badge variant="outline">
                      Ranking #{userStats.rank}
                    </Badge>
                  </>
                )}
              </div>

              <div className="relative">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </div>

              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {currentUser.userType === "student" ? (
            <>
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger
                  value="dashboard"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Dashboard
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="qr-code"
                  className="flex items-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    QR Code
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="collect"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Entregar
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="leaderboard"
                  className="flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Ranking
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="rewards"
                  className="flex items-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Recompensas
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="campaigns"
                  className="flex items-center gap-2"
                >
                  <Megaphone className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Campanhas
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Perfil
                  </span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent
                  value="dashboard"
                  className="space-y-6"
                >
                  <Dashboard
                    userPoints={userStats.points}
                    userRank={userStats.rank}
                    totalCollections={
                      userStats.totalCollections
                    }
                    monthlyGoal={userStats.monthlyGoal}
                    monthlyProgress={userStats.monthlyProgress}
                  />
                </TabsContent>

                <TabsContent
                  value="qr-code"
                  className="space-y-6"
                >
                  <QRCodeGenerator
                    studentRA={currentUser.ra}
                    studentName={currentUser.name}
                  />
                </TabsContent>

                <TabsContent
                  value="collect"
                  className="space-y-6"
                >
                  <CollectWaste
                    onSubmit={handleWasteSubmission}
                  />
                </TabsContent>

                <TabsContent
                  value="leaderboard"
                  className="space-y-6"
                >
                  <Leaderboard currentUserId={currentUser.id} />
                </TabsContent>

                <TabsContent
                  value="rewards"
                  className="space-y-6"
                >
                  <Rewards
                    userPoints={userStats.points}
                    userCollections={userStats.totalCollections}
                  />
                </TabsContent>

                <TabsContent
                  value="campaigns"
                  className="space-y-6"
                >
                  <Campaigns />
                </TabsContent>

                <TabsContent
                  value="profile"
                  className="space-y-6"
                >
                  <Profile
                    user={{
                      id: currentUser.id,
                      name: currentUser.name,
                      email: currentUser.email,
                      course: currentUser.course || "",
                      semester: currentUser.semester || 0,
                      registrationNumber: currentUser.ra,
                      joinDate: currentUser.joinDate,
                    }}
                    stats={{
                      totalPoints: userStats.points,
                      totalCollections:
                        userStats.totalCollections,
                      totalWeight: userStats.totalWeight,
                      rank: userStats.rank,
                      badges: userStats.badges,
                    }}
                  />
                </TabsContent>
              </div>
            </>
          ) : (
            <>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="dashboard"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Dashboard
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="validate"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Validar
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Relatórios
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="leaderboard"
                  className="flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Ranking
                  </span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent
                  value="dashboard"
                  className="space-y-6"
                >
                  <EmployeeDashboard stats={employeeStats} />
                </TabsContent>

                <TabsContent
                  value="validate"
                  className="space-y-6"
                >
                  <ValidateDelivery
                    onValidation={handleValidation}
                  />
                </TabsContent>

                <TabsContent
                  value="reports"
                  className="space-y-6"
                >
                  <Reports />
                </TabsContent>

                <TabsContent
                  value="leaderboard"
                  className="space-y-6"
                >
                  <Leaderboard currentUserId={currentUser.id} />
                </TabsContent>
              </div>
            </>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Ecotrack</h3>
              <p className="text-sm text-muted-foreground">
                Projeto piloto de sustentabilidade e gamificação
                da Universidade Municipal de São Caetano do Sul.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Contato</h3>
              <p className="text-sm text-muted-foreground">
                sustentabilidade@ecotrack.com.br
              </p>
              <p className="text-sm text-muted-foreground">
                (11) 9XXXX-XXXX
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Apoio</h3>
              <p className="text-sm text-muted-foreground">
                Reitoria USCS
              </p>
              <p className="text-sm text-muted-foreground">
                Núcleo de Sustentabilidade
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
            © 2024 USCS - Universidade Municipal de São Caetano
            do Sul. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
