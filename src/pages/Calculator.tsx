import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calculator, History, Trash2 } from 'lucide-react';
import { useMeatCalculator, MeatCalculation } from '@/hooks/useMeatCalculator';
import { MeatCalculatorForm } from '@/components/MeatCalculatorForm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { MembershipBanner } from '@/components/MembershipBanner';
import { UpgradeCategory } from '@/components/UpgradeCategory';

// Free tier: only beef and pork are available without login
const FREE_MEAT_TYPES = ['beef', 'pork'];

const Calculator = () => {
  const { calculations, loading, fetchCalculations, deleteCalculation } = useMeatCalculator();
  const [currentCalculation, setCurrentCalculation] = useState<MeatCalculation | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();

  // A user is a paying member if they have a category other than Digital (or no profile = guest)
  const isMember = !!profile && profile.membership_category !== 'Digital';
  const isLoggedIn = !!user;

  useEffect(() => {
    fetchCalculations();
  }, [fetchCalculations]);

  const handleCalculationComplete = (calculation: MeatCalculation) => {
    setCurrentCalculation(calculation);
  };

  const handleDeleteCalculation = async (id: string) => {
    await deleteCalculation(id);
  };

  const formatMeatTypes = (meatTypes: string[]) => {
    const labels: Record<string, string> = {
      beef: 'Vacuna',
      pork: 'Cerdo',
      chicken: 'Pollo',
      chorizos: 'Chorizos',
    };
    return meatTypes.map(type => labels[type] || type).join(', ');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Logo */}
      <div className="text-center">
        <img
          src="/lovable-uploads/4d7300b4-4574-47d6-97a3-8ad53855fd16.png"
          alt="El Club del Asado"
          className="mx-auto h-20 w-auto mb-4"
        />
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Calculator className="h-8 w-8" />
          Calculadora para Asados
        </h2>
        <p className="text-muted-foreground">
          {isMember
            ? `Bienvenido, socio ${profile?.membership_category} 🔥`
            : 'Calcula la cantidad exacta de insumos que necesitas para tu asado'}
        </p>
      </div>

      {/* Upgrade button for paying members */}
      {isMember && (
        <div className="flex justify-center">
          <UpgradeCategory />
        </div>
      )}

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">
            <Calculator className="h-4 w-4 mr-2" />
            Nuevo cálculo
          </TabsTrigger>
          {/* History tab only for logged-in users */}
          <TabsTrigger value="history" disabled={!isLoggedIn}>
            <History className="h-4 w-4 mr-2" />
            Historial {!isLoggedIn && '🔒'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          {/* Pass freemium restriction to the form */}
          <MeatCalculatorForm
            onCalculationComplete={handleCalculationComplete}
            restrictedMeatTypes={isMember ? undefined : FREE_MEAT_TYPES}
          />

          {currentCalculation && (
            <Card>
              <CardHeader>
                <CardTitle>Resultado del Cálculo</CardTitle>
                <CardDescription>{currentCalculation.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold mb-2">Resumen de Participantes</p>
                    <div className="space-y-1 text-sm">
                      {currentCalculation.adults > 0 && <p>• {currentCalculation.adults} adultos</p>}
                      {currentCalculation.children > 0 && <p>• {currentCalculation.children} niños</p>}
                      {currentCalculation.bigEaters > 0 && <p>• {currentCalculation.bigEaters} comedores grandes</p>}
                      {currentCalculation.vegetarians > 0 && <p>• {currentCalculation.vegetarians} vegetarianos</p>}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Configuración</p>
                    <div className="space-y-1 text-sm">
                      <p>• Tipos de carne: {formatMeatTypes(currentCalculation.meatTypes)}</p>
                      {currentCalculation.includeOffal && <p>• Incluye achuras</p>}
                      {currentCalculation.longEvent && <p>• Evento largo (+20%)</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-2">Lista de Compras</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(currentCalculation.shoppingList).map(([item, details]) => (
                      <Card key={item} className="p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{item}</span>
                          <Badge variant="secondary">
                            {details.quantity} {details.unit}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between items-center">
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    Total proteína: <span>{currentCalculation.totalProteinKg.toFixed(2)}</span> kg
                  </div>
                  {isLoggedIn && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar cálculo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El cálculo será eliminado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCalculation(currentCalculation.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Membership banner for guests / non-paying users */}
          {!isMember && <MembershipBanner />}
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Cargando historial...</p>
            ) : calculations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aún no tenés cálculos guardados.
              </p>
            ) : (
              calculations.map((calc) => (
                <Card key={calc.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {calc.title || 'Cálculo sin título'}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(calc.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">Participantes</p>
                        <div className="space-y-1 text-muted-foreground">
                          {calc.adults > 0 && <p>{calc.adults} adultos</p>}
                          {calc.children > 0 && <p>{calc.children} niños</p>}
                          {calc.bigEaters > 0 && <p>{calc.bigEaters} comedores grandes</p>}
                          {calc.vegetarians > 0 && <p>{calc.vegetarians} vegetarianos</p>}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Configuración</p>
                        <div className="space-y-1 text-muted-foreground">
                          <p>{formatMeatTypes(calc.meatTypes)}</p>
                          {calc.includeOffal && <p>Con achuras</p>}
                          {calc.longEvent && <p>Evento largo</p>}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Totales</p>
                        <div className="space-y-1 text-muted-foreground">
                          <p>{calc.totalProteinKg.toFixed(2)} kg proteína</p>
                          {calc.totalVegetablesKg > 0 && (
                            <p>{calc.totalVegetablesKg.toFixed(2)} kg verduras</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentCalculation(calc)}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Calculator;
