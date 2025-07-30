import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-primary">El Club del Asado</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Únete a la comunidad de asadores más apasionados. Comparte experiencias, 
            aprende técnicas y conecta con otros amantes del asado.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          {user ? (
            <Link to="/dashboard">
              <Button size="lg">Ir al Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/auth">
                <Button size="lg">Iniciar Sesión</Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg">Registrarse</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
