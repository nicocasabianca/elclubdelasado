import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-primary">Calculadora de Asados</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La herramienta perfecta para calcular las cantidades exactas de carne 
            que necesitas para tu asado. Solo para socios del club.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          {user ? (
            <Link to="/calculator">
              <Button size="lg">Ir a la Calculadora</Button>
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/auth">
                <Button size="lg" className="w-full">Acceder con Código de Socio</Button>
              </Link>
              <Link to="/calculator">
                <Button size="lg" variant="outline" className="w-full">Probar Calculadora (Demo)</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
