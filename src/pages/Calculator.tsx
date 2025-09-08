import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calculator as CalculatorIcon, History, Trash2 } from 'lucide-react';
import { useMeatCalculator, MeatCalculation } from '@/hooks/useMeatCalculator';
import { MeatCalculatorForm } from '@/components/MeatCalculatorForm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
const Calculator = () => {
  const {
    calculations,
    loading,
    fetchCalculations,
    deleteCalculation
  } = useMeatCalculator();
  const [currentCalculation, setCurrentCalculation] = useState<MeatCalculation | null>(null);
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
      chicken: 'Pollo'
    };
    return meatTypes.map(type => labels[type] || type).join(', ');
  };
  return <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <CalculatorIcon className="h-8 w-8" />
          Calculadora para Asados
        </h1>
        <p className="text-muted-foreground">
          Calcula la cantidad exacta de insumos que necesitas para tu asado
        </p>
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="space-y-6">
          
          
          {currentCalculation && <Card>
              <CardHeader>
                <CardTitle>Resultado del Cálculo</CardTitle>
                <CardDescription>
                  {currentCalculation.title}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Resumen de Participantes</h4>
                    <ul className="space-y-1 text-sm">
                      {currentCalculation.adults > 0 && <li>• {currentCalculation.adults} adultos</li>}
                      {currentCalculation.children > 0 && <li>• {currentCalculation.children} niños</li>}
                      {currentCalculation.bigEaters > 0 && <li>• {currentCalculation.bigEaters} comedores grandes</li>}
                      {currentCalculation.vegetarians > 0 && <li>• {currentCalculation.vegetarians} vegetarianos</li>}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Configuración</h4>
                    <div className="space-y-1 text-sm">
                      <p>• Tipos de carne: {formatMeatTypes(currentCalculation.meatTypes)}</p>
                      {currentCalculation.includeOffal && <p>• Incluye achuras</p>}
                      {currentCalculation.longEvent && <p>• Evento largo (+20%)</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Lista de Compras</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(currentCalculation.shoppingList).map(([item, details]) => <Card key={item} className="p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{item}</span>
                          <Badge variant="secondary">
                            {details.quantity} {details.unit}
                          </Badge>
                        </div>
                      </Card>)}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>Total proteína: {currentCalculation.totalProteinKg.toFixed(1)} kg</span>
                    {currentCalculation.totalVegetablesKg > 0 && <span>• Verduras: {currentCalculation.totalVegetablesKg.toFixed(1)} kg</span>}
                  </div>
                </div>
              </CardContent>
            </Card>}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Cálculos Guardados</h2>
            <p className="text-muted-foreground">
              Revisa y reutiliza tus cálculos anteriores
            </p>
          </div>
          
          {loading ? <div className="text-center py-8">
              <p>Cargando historial...</p>
            </div> : calculations.length === 0 ? <div className="text-center py-8">
              <p className="text-muted-foreground">
                No tienes cálculos guardados aún
              </p>
            </div> : <div className="grid gap-4">
              {calculations.map(calc => <Card key={calc.id} className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{calc.title}</CardTitle>
                        <CardDescription>
                          {calc.createdAt && format(new Date(calc.createdAt), 'PPP', {
                      locale: es
                    })}
                        </CardDescription>
                      </div>
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
                            <AlertDialogAction onClick={() => calc.id && handleDeleteCalculation(calc.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
                          <p>{calc.totalProteinKg.toFixed(1)} kg proteína</p>
                          {calc.totalVegetablesKg > 0 && <p>{calc.totalVegetablesKg.toFixed(1)} kg verduras</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => setCurrentCalculation(calc)}>
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>}
        </TabsContent>
      </Tabs>
    </div>;
};
export default Calculator;