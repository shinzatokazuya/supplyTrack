import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  CheckCircle,
  Calendar,
  User,
  Trophy,
  RefreshCw,
  FileText
} from "lucide-react";
import { Delivery, WasteType } from "../App";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner";

interface ValidationHistoryProps {
  accessToken: string;
  wasteTypes: WasteType[];
}

export function ValidationHistory({ accessToken, wasteTypes }: ValidationHistoryProps) {
  const [validatedDeliveries, setValidatedDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadValidatedDeliveries();
  }, []);

  const loadValidatedDeliveries = async () => {
    setLoading(true);
    try {
      // Since we don't have a specific endpoint for staff validation history,
      // we'll use the general deliveries endpoint and filter for validated ones
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/pending-deliveries`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter for validated deliveries only
        const validated = data.deliveries?.filter((d: Delivery) => d.status === 'validated') || [];
        setValidatedDeliveries(validated);
      } else {
        toast.error('Erro ao carregar histórico de validações');
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de validações');
    } finally {
      setLoading(false);
    }
  };

  const getWasteTypeName = (id: string) => {
    return wasteTypes.find(wt => wt.id === id)?.name || "Desconhecido";
  };

  const getWasteTypeColor = (id: string) => {
    return wasteTypes.find(wt => wt.id === id)?.color || "#6B7280";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando histórico...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Histórico de Validações ({validatedDeliveries.length})
              </CardTitle>
              <CardDescription>
                Entregas que foram validadas por funcionários
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadValidatedDeliveries}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {validatedDeliveries.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma validação registrada</h3>
              <p className="text-sm">
                As entregas validadas aparecerão aqui
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {validatedDeliveries.map((delivery) => (
            <Card key={delivery.id} className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Validado
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatDate(delivery.validated_at!)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{delivery.user_info?.name}</span>
                      <span className="text-sm text-gray-600">
                        RA: {delivery.user_info?.ra} • {delivery.user_info?.course}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-green-600">Pontos creditados</p>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold text-green-700">{delivery.actual_points}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Pre-registered Items */}
                  <div>
                    <h4 className="font-medium text-sm text-orange-700 mb-2">Pré-cadastrado:</h4>
                    <div className="space-y-1">
                      {delivery.waste_items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getWasteTypeColor(item.waste_type_id) }}
                            />
                            {getWasteTypeName(item.waste_type_id)}
                          </span>
                          <span className="text-gray-600">{item.estimated_weight} kg</span>
                        </div>
                      ))}
                      <div className="pt-1 border-t text-sm font-medium text-orange-600">
                        Estimado: {delivery.expected_points} pontos
                      </div>
                    </div>
                  </div>

                  {/* Actual Items */}
                  <div>
                    <h4 className="font-medium text-sm text-green-700 mb-2">Validado:</h4>
                    <div className="space-y-1">
                      {delivery.actual_waste_items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: getWasteTypeColor(item.waste_type_id) }}
                            />
                            {getWasteTypeName(item.waste_type_id)}
                          </span>
                          <span className="text-gray-600">{item.actual_weight} kg</span>
                        </div>
                      ))}
                      <div className="pt-1 border-t text-sm font-medium text-green-700">
                        Creditado: {delivery.actual_points} pontos
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4 space-y-2">
                  {delivery.notes && (
                    <div className="p-2 bg-white rounded border">
                      <p className="text-xs text-gray-500 mb-1">Observações do aluno:</p>
                      <p className="text-sm">{delivery.notes}</p>
                    </div>
                  )}

                  {delivery.validation_notes && (
                    <div className="p-2 bg-green-100 rounded border border-green-200">
                      <p className="text-xs text-green-600 mb-1">Observações da validação:</p>
                      <p className="text-sm text-green-800">{delivery.validation_notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-green-200 flex justify-between items-center text-xs text-gray-500">
                  <span>Pré-cadastro: {formatDate(delivery.created_at)}</span>
                  <span>ID: {delivery.id.split('_')[1]}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
