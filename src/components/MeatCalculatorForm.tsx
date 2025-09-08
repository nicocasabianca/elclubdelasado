import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calculator, Save } from 'lucide-react';
import { useMeatCalculator, MeatCalculation } from '@/hooks/useMeatCalculator';
import { toast } from 'sonner';

interface MeatCalculatorFormProps {
  onCalculationComplete: (calculation: MeatCalculation) => void;
}

export const MeatCalculatorForm = ({ onCalculationComplete }: MeatCalculatorFormProps) => {
  const { calculateMeat, saveCalculation, loading } = useMeatCalculator();
  
  const [title, setTitle] = useState('');
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [bigEaters, setBigEaters] = useState(0);
  const [vegetarians, setVegetarians] = useState(0);
  const [meatTypes, setMeatTypes] = useState<string[]>([]);
  const [includeOffal, setIncludeOffal] = useState(false);
  const [longEvent, setLongEvent] = useState(false);
  const [currentResult, setCurrentResult] = useState<MeatCalculation | null>(null);

  const handleMeatTypeToggle = (type: string) => {
    setMeatTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleCalculate = () => {
    if (meatTypes.length === 0) {
      toast.error('Selecciona al menos un tipo de carne');
      return;
    }
    
    if (adults + children + bigEaters === 0) {
      toast.error('Agrega al menos un participante');
      return;
    }

    const calculationParams = {
      title: title || `Asado ${new Date().toLocaleDateString()}`,
      adults,
      children,
      bigEaters,
      vegetarians,
      meatTypes,
      includeOffal,
      longEvent
    };

    const result = calculateMeat(calculationParams);
    setCurrentResult(result);
    onCalculationComplete(result);
  };

  const handleSaveCalculation = async () => {
    if (!currentResult) return;
    
    try {
      await saveCalculation(currentResult);
      toast.success('Cálculo guardado exitosamente');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const resetForm = () => {
    setTitle('');
    setAdults(0);
    setChildren(0);
    setBigEaters(0);
    setVegetarians(0);
    setMeatTypes([]);
    setIncludeOffal(false);
    setLongEvent(false);
    setCurrentResult(null);
  };

  const totalParticipants = adults + children + bigEaters + vegetarians;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Nuevo cálculo
        </CardTitle>
        <CardDescription>
          Completa los datos del asado para calcular las cantidades necesarias
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Título del evento */}
        <div className="space-y-2">
          <Label htmlFor="title">Título del evento (opcional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Asado familiar, Reunión de amigos..."
          />
        </div>

        <Separator />

        {/* Participantes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Participantes</h3>
            {totalParticipants > 0 && (
              <Badge variant="secondary">
                Total: {totalParticipants} personas
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adults">Adultos (400g)</Label>
              <Input
                id="adults"
                type="number"
                min="0"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="children">Niños (200g)</Label>
              <Input
                id="children"
                type="number"
                min="0"
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bigEaters">Comedores grandes (500g)</Label>
              <Input
                id="bigEaters"
                type="number"
                min="0"
                value={bigEaters}
                onChange={(e) => setBigEaters(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vegetarians">Vegetarianos (400g verduras)</Label>
              <Input
                id="vegetarians"
                type="number"
                min="0"
                value={vegetarians}
                onChange={(e) => setVegetarians(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Tipos de carne */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tipos de Carne</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'beef', label: 'Carne Vacuna', description: 'Asado, tira, vacío, etc.' },
              { value: 'pork', label: 'Carne de Cerdo', description: 'Costillas, bondiola, etc.' },
              { value: 'chicken', label: 'Pollo', description: 'Muslos, pechugas, etc.' }
            ].map((meat) => (
              <div
                key={meat.value}
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  meatTypes.includes(meat.value)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleMeatTypeToggle(meat.value)}
              >
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={meatTypes.includes(meat.value)}
                    onCheckedChange={() => {}} // Handled by parent div click
                  />
                  <div>
                    <p className="font-medium">{meat.label}</p>
                    <p className="text-sm text-muted-foreground">{meat.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Opciones adicionales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Opciones Adicionales</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="offal"
                checked={includeOffal}
                onCheckedChange={(checked) => setIncludeOffal(checked as boolean)}
              />
              <Label htmlFor="offal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Incluir achuras (chinchulines, morcilla, etc.) - 10% del total
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="longEvent"
                checked={longEvent}
                onCheckedChange={(checked) => setLongEvent(checked as boolean)}
              />
              <Label htmlFor="longEvent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Evento largo (más de 6 horas) - +20% cantidad
              </Label>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={handleCalculate}
            disabled={meatTypes.length === 0 || totalParticipants === 0}
            className="flex-1"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calcular Cantidades
          </Button>
          
          {currentResult && (
            <Button 
              onClick={handleSaveCalculation}
              disabled={loading}
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Cálculo
            </Button>
          )}
          
          <Button 
            onClick={resetForm}
            variant="outline"
          >
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};