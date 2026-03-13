import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calculator, Save, Lock } from 'lucide-react';
import { useMeatCalculator, MeatCalculation } from '@/hooks/useMeatCalculator';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface MeatCalculatorFormProps {
  onCalculationComplete: (calculation: MeatCalculation) => void;
  // If provided, only these meat types are selectable (free tier)
  restrictedMeatTypes?: string[];
}

const ALL_MEAT_TYPES = [
  {
    value: 'beef',
    label: 'Carne Vacuna',
    description: 'Asado, tira, vacío, etc.',
    free: true,
  },
  {
    value: 'pork',
    label: 'Carne de Cerdo',
    description: 'Costillas, bondiola, etc.',
    free: true,
  },
  {
    value: 'chicken',
    label: 'Pollo',
    description: 'Muslos, pechugas, etc.',
    free: false,
  },
  {
    value: 'chorizos',
    label: 'Chorizos',
    description: 'Mix de chorizos a elección',
    free: false,
  },
];

export const MeatCalculatorForm = ({
  onCalculationComplete,
  restrictedMeatTypes,
}: MeatCalculatorFormProps) => {
  const { calculateMeat, saveCalculation, loading } = useMeatCalculator();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);
  const [bigEaters, setBigEaters] = useState(0);
  const [vegetarians, setVegetarians] = useState(0);
  const [meatTypes, setMeatTypes] = useState<string[]>([]);
  const [includeOffal, setIncludeOffal] = useState(false);
  const [longEvent, setLongEvent] = useState(false);
  const [currentResult, setCurrentResult] = useState<MeatCalculation | null>(null);

  // A meat type is locked if we have a restriction list and this type is not in it
  const isLocked = (meatValue: string) =>
    restrictedMeatTypes !== undefined && !restrictedMeatTypes.includes(meatValue);

  const isOfalLocked = restrictedMeatTypes !== undefined;

  const handleMeatTypeToggle = (type: string) => {
    if (isLocked(type)) return;
    setMeatTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
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
      longEvent,
    };

    const result = calculateMeat(calculationParams);
    setCurrentResult(result);
    onCalculationComplete(result);
  };

  const handleSaveCalculation = async () => {
    if (!currentResult) return;
    if (!user) {
      toast.error('Iniciá sesión para guardar cálculos');
      return;
    }
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
              <Badge variant="secondary">Total: {totalParticipants} personas</Badge>
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
              <Label htmlFor="bigEaters">De buen comer (500g)</Label>
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

        {/* Tipos de insumos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tipos de insumos</h3>
            {restrictedMeatTypes && (
              <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                🔒 Socios acceden a más opciones
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {ALL_MEAT_TYPES.map((meat) => {
              const locked = isLocked(meat.value);
              const selected = meatTypes.includes(meat.value);
              return (
                <div
                  key={meat.value}
                  className={`border rounded-lg p-3 transition-colors ${
                    locked
                      ? 'border-border opacity-50 cursor-not-allowed bg-muted/30'
                      : selected
                      ? 'border-primary bg-primary/5 cursor-pointer'
                      : 'border-border hover:border-primary/50 cursor-pointer'
                  }`}
                  onClick={() => handleMeatTypeToggle(meat.value)}
                >
                  <div className="flex items-start gap-2">
                    {locked ? (
                      <Lock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => {}}
                        className="mt-0.5"
                      />
                    )}
                    <div>
                      <div className="font-medium text-sm">{meat.label}</div>
                      <div className="text-xs text-muted-foreground">{meat.description}</div>
                      {locked && (
                        <div className="text-xs text-orange-500 mt-1 font-medium">Solo socios</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Opciones adicionales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Opciones Adicionales</h3>
          <div className="space-y-3">
            <div
              className={`flex items-center space-x-2 ${isOfalLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Checkbox
                id="offal"
                checked={includeOffal}
                disabled={isOfalLocked}
                onCheckedChange={(checked) => {
                  if (!isOfalLocked) setIncludeOffal(checked as boolean);
                }}
              />
              <Label
                htmlFor="offal"
                className={`text-sm font-medium leading-none ${isOfalLocked ? 'cursor-not-allowed' : ''}`}
              >
                Incluir achuras (chinchulines, mollejas, etc.) - 10% del total
                {isOfalLocked && (
                  <span className="ml-2 text-orange-500 font-normal text-xs">
                    🔒 Solo socios
                  </span>
                )}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="longEvent"
                checked={longEvent}
                onCheckedChange={(checked) => setLongEvent(checked as boolean)}
              />
              <Label
                htmlFor="longEvent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
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
              disabled={loading || !user}
              variant="outline"
              title={!user ? 'Iniciá sesión para guardar' : ''}
            >
              <Save className="h-4 w-4 mr-2" />
              {user ? 'Guardar Cálculo' : '🔒 Guardar (requiere cuenta)'}
            </Button>
          )}
          <Button onClick={resetForm} variant="outline">
            Limpiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
