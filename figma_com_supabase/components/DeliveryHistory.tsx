import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { 
  Calendar, 
  Package, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Weight,
  User,
  FileText,
  RefreshCw,
  Plus
} from "lucide-react";
import { Delivery, WasteType } from "../App";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";

interface DeliveryHistoryProps {
  deliveries: Delivery[];
  wasteTypes: WasteType[];
  onRefresh: () => void;
}

export function DeliveryHistory({ deliveries, wasteTypes, onRefresh }: DeliveryHistoryProps) {
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'validated':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_delivery':
        return 'Aguardando Entrega';
      case 'validated':
        return 'Validado';
      default:
        return 'Desconhecido';
    }
  };

  const pendingDeliveries = deliveries.filter(d => d.status === 'pending_delivery');
  const validatedDeliveries = deliveries.filter(d => d.status === 'validated');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Histórico de Entregas
              </CardTitle>
              <CardDescription>
                Acompanhe todas as suas entregas de resíduos
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Pending Deliveries */}
      {pendingDeliveries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Clock className="h-5 w-5" />
              Entregas Pendentes ({pendingDeliveries.length})
            </CardTitle>
            <CardDescription>
              Pré-cadastros aguardando para serem levados ao ponto de coleta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingDeliveries.map((delivery) => (
              <div key={delivery.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getStatusColor(delivery.status)}>
                        {getStatusText(delivery.status)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatDate(delivery.created_at)}
                      </span>
                    </div>
                    <p className="text-sm font-medium">
                      {delivery.waste_items.length} {delivery.waste_items.length === 1 ? 'item' : 'itens'} pré-cadastrado{delivery.waste_items.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-orange-600">Pontos estimados</p>
                    <p className="font-semibold text-orange-700">{delivery.expected_points}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
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
                </div>

                {delivery.notes && (
                  <div className="mt-3 p-2 bg-white rounded border">
                    <p className="text-xs text-gray-500 mb-1">Observações:</p>
                    <p className="text-sm">{delivery.notes}</p>
                  </div>
                )}

                <div className="mt-3 p-2 bg-orange-100 rounded border-orange-200">
                  <p className="text-xs text-orange-700">
                    📍 Leve estes resíduos ao ponto de coleta para validação (8:00 às 17:00)
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Validated Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Entregas Validadas ({validatedDeliveries.length})
          </CardTitle>
          <CardDescription>
            Entregas que já foram validadas e pontuadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validatedDeliveries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma entrega validada ainda</p>
              <p className="text-sm">Suas entregas validadas aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {validatedDeliveries.map((delivery) => (
                <div key={delivery.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getStatusColor(delivery.status)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {getStatusText(delivery.status)}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {formatDate(delivery.validated_at!)}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {delivery.actual_waste_items?.length} {delivery.actual_waste_items?.length === 1 ? 'item validado' : 'itens validados'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">Pontos recebidos</p>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-green-700">{delivery.actual_points}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
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
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedDelivery(delivery)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        {selectedDelivery && (
                          <>
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-green-600" />
                                Detalhes da Entrega
                              </DialogTitle>
                              <DialogDescription>
                                Informações completas da entrega validada
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Status and Dates */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">Pré-cadastro</Label>
                                  <p className="text-sm">{formatDate(selectedDelivery.created_at)}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">Validação</Label>
                                  <p className="text-sm">{formatDate(selectedDelivery.validated_at!)}</p>
                                </div>
                              </div>

                              <Separator />

                              {/* Comparison */}
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-medium mb-3 text-orange-700">Pré-cadastrado</h4>
                                  <div className="space-y-2">
                                    {selectedDelivery.waste_items.map((item, index) => (
                                      <div key={index} className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                          <div 
                                            className="w-2 h-2 rounded-full" 
                                            style={{ backgroundColor: getWasteTypeColor(item.waste_type_id) }}
                                          />
                                          {getWasteTypeName(item.waste_type_id)}
                                        </span>
                                        <span>{item.estimated_weight} kg</span>
                                      </div>
                                    ))}
                                    <div className="pt-2 border-t text-sm font-medium">
                                      <span>Total estimado: {selectedDelivery.expected_points} pontos</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-medium mb-3 text-green-700">Validado</h4>
                                  <div className="space-y-2">
                                    {selectedDelivery.actual_waste_items?.map((item, index) => (
                                      <div key={index} className="flex justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                          <div 
                                            className="w-2 h-2 rounded-full" 
                                            style={{ backgroundColor: getWasteTypeColor(item.waste_type_id) }}
                                          />
                                          {getWasteTypeName(item.waste_type_id)}
                                        </span>
                                        <span>{item.actual_weight} kg</span>
                                      </div>
                                    ))}
                                    <div className="pt-2 border-t text-sm font-medium text-green-700">
                                      <span>Total recebido: {selectedDelivery.actual_points} pontos</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Notes */}
                              {(selectedDelivery.notes || selectedDelivery.validation_notes) && (
                                <>
                                  <Separator />
                                  <div className="space-y-3">
                                    {selectedDelivery.notes && (
                                      <div>
                                        <Label className="text-sm font-medium text-gray-600">Observações do aluno</Label>
                                        <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{selectedDelivery.notes}</p>
                                      </div>
                                    )}
                                    {selectedDelivery.validation_notes && (
                                      <div>
                                        <Label className="text-sm font-medium text-gray-600">Observações da validação</Label>
                                        <p className="text-sm mt-1 p-2 bg-green-50 rounded">{selectedDelivery.validation_notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <span className="text-xs text-gray-500">
                      ID: {delivery.id.split('_')[1]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {deliveries.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma entrega registrada</h3>
              <p className="text-sm mb-4">
                Comece fazendo seu primeiro pré-cadastro de entrega
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Entrega
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}