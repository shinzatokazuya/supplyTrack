import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Camera, Plus, Trash2 } from "lucide-react";

const wasteTypes = [
  { id: "plastic", name: "Plástico", points: 10, color: "blue" },
  { id: "paper", name: "Papel", points: 8, color: "green" },
  { id: "metal", name: "Metal", points: 15, color: "gray" },
  { id: "glass", name: "Vidro", points: 12, color: "purple" },
  { id: "electronic", name: "Eletrônico", points: 25, color: "red" },
  { id: "organic", name: "Orgânico", points: 5, color: "yellow" },
];

const collectionPoints = [
  "Prédio Principal - Térreo",
  "Biblioteca Central",
  "Laboratórios - Bloco A",
  "Cantina Universitária",
  "Estacionamento",
  "Quadra Esportiva"
];

interface WasteItem {
  id: string;
  type: string;
  weight: number;
  description: string;
}

interface CollectWasteProps {
  onSubmit: (items: WasteItem[], location: string, photo?: File) => void;
}

export function CollectWaste({ onSubmit }: CollectWasteProps) {
  const [items, setItems] = useState<WasteItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [currentItem, setCurrentItem] = useState({
    type: "",
    weight: "",
    description: ""
  });

  const addItem = () => {
    if (!currentItem.type || !currentItem.weight) {
      toast.error("Selecione o tipo de resíduo e informe o peso");
      return;
    }

    const newItem: WasteItem = {
      id: Date.now().toString(),
      type: currentItem.type,
      weight: parseFloat(currentItem.weight),
      description: currentItem.description
    };

    setItems([...items, newItem]);
    setCurrentItem({ type: "", weight: "", description: "" });
    toast.success("Item adicionado!");
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item");
      return;
    }
    if (!selectedLocation) {
      toast.error("Selecione o ponto de coleta");
      return;
    }

    onSubmit(items, selectedLocation, photo || undefined);
    setItems([]);
    setSelectedLocation("");
    setPhoto(null);
    toast.success("Entrega registrada com sucesso!");
  };

  const totalPoints = items.reduce((sum, item) => {
    const wasteType = wasteTypes.find(w => w.id === item.type);
    return sum + (wasteType?.points || 0) * item.weight;
  }, 0);

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Nova Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="waste-type">Tipo de Resíduo</Label>
              <Select value={currentItem.type} onValueChange={(value) =>
                setCurrentItem({...currentItem, type: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {wasteTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} - {type.points} pts/kg
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={currentItem.weight}
                onChange={(e) => setCurrentItem({...currentItem, weight: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva os itens entregues..."
              value={currentItem.description}
              onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
            />
          </div>

          <Button onClick={addItem} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Item
          </Button>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens da Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => {
                const wasteType = wasteTypes.find(w => w.id === item.type);
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{wasteType?.name}</Badge>
                        <span className="font-medium">{item.weight}kg</span>
                        <span className="text-green-600">+{(wasteType?.points || 0) * item.weight} pts</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span>Total:</span>
                <div className="text-right">
                  <div className="font-bold">{totalWeight.toFixed(1)}kg</div>
                  <div className="text-green-600 font-bold">+{totalPoints} pontos</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Local da Coleta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location">Ponto de Coleta</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o local" />
              </SelectTrigger>
              <SelectContent>
                {collectionPoints.map((point) => (
                  <SelectItem key={point} value={point}>
                    {point}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="photo">Foto da Entrega (opcional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={items.length === 0 || !selectedLocation}
          >
            Confirmar Entrega
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
