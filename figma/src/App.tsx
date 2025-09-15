import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./componentes/ui/tabs";
import { Button } from "./componentes/ui/button";
import { Badge } from "./componentes/ui/badge";
import { Dashboard } from "./componentes/dashboard";
import { CollectWaste } from "./componentes/collect-waste";
import { Leaderboard } from "./componentes/leaderboard";
import { Rewards } from "./componentes/rewards";
import { Campaigns } from "./componentes/campaigns";
import { Profile } from "./componentes/profile";
import { QRCodeGenerator } from "./componentes/student/qr-code-generator";

export default function App() {
  // Forçando um usuário de teste para pular o login
  const [currentUser] = useState({
    id: "1",
    name: "Aluno Teste",
    ra: "2021001234",
    userType: "student",
    course: "Engenharia Ambiental",
    semester: 1,
    joinDate: "2024-01-01",
  });

  const [activeTab, setActiveTab] = useState("dashboard");

  const userStats = {
    points: 847,
    rank: 15,
    totalCollections: 23,
    totalWeight: 45.8,
    monthlyGoal: 500,
    monthlyProgress: 387,
    badges: ["iniciante-verde", "reciclador"],
  };

  return (
    <div className="min-h-screen bg-white text-black p-4">
      <h1 className="text-xl font-bold mb-4">Tela de Teste</h1>
      <p>Usuário: {currentUser.name}</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="qr-code">QR Code</TabsTrigger>
          <TabsTrigger value="collect">Entregar</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Dashboard
            userPoints={userStats.points}
            userRank={userStats.rank}
            totalCollections={userStats.totalCollections}
            monthlyGoal={userStats.monthlyGoal}
            monthlyProgress={userStats.monthlyProgress}
          />
        </TabsContent>

        <TabsContent value="qr-code">
          <QRCodeGenerator studentRA={currentUser.ra} studentName={currentUser.name} />
        </TabsContent>

        <TabsContent value="collect">
          <CollectWaste onSubmit={(items) => console.log(items)} />
        </TabsContent>

        <TabsContent value="leaderboard">
          <Leaderboard currentUserId={currentUser.id} />
        </TabsContent>

        <TabsContent value="rewards">
          <Rewards userPoints={userStats.points} userCollections={userStats.totalCollections} />
        </TabsContent>

        <TabsContent value="campaigns">
          <Campaigns />
        </TabsContent>

        <TabsContent value="profile">
          <Profile
            user={{
              id: currentUser.id,
              name: currentUser.name,
              email: "teste@teste.com",
              course: currentUser.course,
              semester: currentUser.semester,
              registrationNumber: currentUser.ra,
              joinDate: currentUser.joinDate,
            }}
            stats={userStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
