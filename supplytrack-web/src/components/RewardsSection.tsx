import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Gift,
  Trophy,
  Percent,
  Clock,
  FileText,
  Award,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import type { Reward } from "../App";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface RewardsSectionProps {
  rewards: Reward[];
  userPoints: number;
  accessToken: string;
  onRewardRedeemed: () => void;
}

export function RewardsSection({ rewards, userPoints, accessToken, onRewardRedeemed }: RewardsSectionProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <Percent className="h-5 w-5" />;
      case 'hours':
        return <Clock className="h-5 w-5" />;
      case 'certificate':
        return <FileText className="h-5 w-5" />;
      case 'item':
        return <Gift className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'discount':
        return 'text-green-600';
      case 'hours':
        return 'text-blue-600';
      case 'certificate':
        return 'text-purple-600';
      case 'item':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressPercentage = (requiredPoints: number) => {
    return Math.min((userPoints / requiredPoints) * 100, 100);
  };

  const handleRedeem = async (reward: Reward) => {
    if (userPoints < reward.points_required) {
      toast.error('Pontos insuficientes para esta recompensa');
      return;
    }

    setIsRedeeming(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/redeem-reward`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          reward_id: reward.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Recompensa resgatada com sucesso! Pontos restantes: ${data.remaining_points}`);
        onRewardRedeemed();
        setSelectedReward(null);
      } else {
        const data = await response.json();
        toast.error('Erro ao resgatar recompensa: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao resgatar recompensa:', error);
      toast.error('Erro interno do servidor');
    } finally {
      setIsRedeeming(false);
    }
  };

  const availableRewards = rewards.filter(r => userPoints >= r.points_required);
  const unavailableRewards = rewards.filter(r => userPoints < r.points_required);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            Sistema de Recompensas
          </CardTitle>
          <CardDescription>
            Troque seus pontos por benefícios exclusivos da USCS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm text-green-600">Seus pontos disponíveis</p>
              <p className="text-2xl font-bold text-green-700">{userPoints}</p>
            </div>
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      {availableRewards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Recompensas Disponíveis ({availableRewards.length})
            </CardTitle>
            <CardDescription>
              Você tem pontos suficientes para resgatar estas recompensas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableRewards.map((reward) => (
                <div key={reward.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`${getRewardColor(reward.type)}`}>
                        {getRewardIcon(reward.type)}
                      </div>
                      <h3 className="font-medium">{reward.name}</h3>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {reward.points_required} pts
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <Progress value={100} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600 font-medium">
                        ✅ Disponível para resgate
                      </span>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setSelectedReward(reward)}
                          >
                            Resgatar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          {selectedReward && (
                            <>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {getRewardIcon(selectedReward.type)}
                                  Confirmar Resgate
                                </DialogTitle>
                                <DialogDescription>
                                  Confirme o resgate da recompensa abaixo:
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <h3 className="font-medium mb-2">{selectedReward.name}</h3>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600">Custo:</span>
                                      <p className="font-medium">{selectedReward.points_required} pontos</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600">Pontos após resgate:</span>
                                      <p className="font-medium">{userPoints - selectedReward.points_required}</p>
                                    </div>
                                  </div>
                                </div>

                                {selectedReward.type === 'discount' && (
                                  <div className="p-3 bg-blue-50 rounded border-blue-200">
                                    <p className="text-sm text-blue-700">
                                      💡 O desconto será aplicado automaticamente na sua próxima mensalidade
                                    </p>
                                  </div>
                                )}

                                {selectedReward.type === 'hours' && (
                                  <div className="p-3 bg-purple-50 rounded border-purple-200">
                                    <p className="text-sm text-purple-700">
                                      🎓 As horas complementares serão creditadas em até 48h úteis
                                    </p>
                                  </div>
                                )}

                                {selectedReward.type === 'item' && (
                                  <div className="p-3 bg-orange-50 rounded border-orange-200">
                                    <p className="text-sm text-orange-700">
                                      📦 O item estará disponível para retirada na secretaria em até 5 dias úteis
                                    </p>
                                  </div>
                                )}

                                {selectedReward.type === 'certificate' && (
                                  <div className="p-3 bg-green-50 rounded border-green-200">
                                    <p className="text-sm text-green-700">
                                      📜 O certificado será enviado por e-mail em até 24h
                                    </p>
                                  </div>
                                )}
                              </div>

                              <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedReward(null)}>
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={() => handleRedeem(selectedReward)}
                                  disabled={isRedeeming}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  {isRedeeming ? "Resgatando..." : "Confirmar Resgate"}
                                </Button>
                              </DialogFooter>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unavailable Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <AlertCircle className="h-5 w-5" />
            Próximas Metas ({unavailableRewards.length})
          </CardTitle>
          <CardDescription>
            Continue coletando para desbloquear estas recompensas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unavailableRewards
              .sort((a, b) => a.points_required - b.points_required)
              .map((reward) => (
                <div key={reward.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`${getRewardColor(reward.type)} opacity-60`}>
                        {getRewardIcon(reward.type)}
                      </div>
                      <h3 className="font-medium text-gray-700">{reward.name}</h3>
                    </div>
                    <Badge variant="outline">
                      {reward.points_required} pts
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progresso</span>
                        <span className="text-gray-600">
                          {userPoints}/{reward.points_required}
                        </span>
                      </div>
                      <Progress value={getProgressPercentage(reward.points_required)} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Faltam {reward.points_required - userPoints} pontos
                      </span>
                      <Button size="sm" variant="outline" disabled>
                        Indisponível
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Earn Points */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Como Ganhar Mais Pontos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">Tipos de Resíduos Mais Valiosos:</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Pilhas/Baterias: 100 pts/kg</li>
                <li>• Eletrônicos: 50 pts/kg</li>
                <li>• Óleo de Cozinha: 30 pts/kg</li>
                <li>• Metal: 25 pts/kg</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">Dicas para Maximizar Pontos:</h4>
              <ul className="space-y-1 text-blue-600">
                <li>• Separe corretamente os materiais</li>
                <li>• Limpe os recipientes antes da entrega</li>
                <li>• Traga quantidades maiores</li>
                <li>• Participe de eventos especiais</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
