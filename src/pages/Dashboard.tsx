import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const CATEGORY_COLORS = {
  "Fuego": "bg-red-500",
  "Brasas": "bg-orange-500", 
  "Carbón": "bg-gray-700",
  "Digital": "bg-blue-500"
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    // Si no hay perfil completado, redirigir a completar perfil
    if (!loading && user && !profile) {
      navigate("/complete-profile");
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return null; // Se está redirigiendo
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile.profile_picture_url} alt={`${profile.first_name} ${profile.last_name}`} />
              <AvatarFallback>
                {profile.first_name[0]}{profile.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">¡Hola, {profile.first_name}!</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`${CATEGORY_COLORS[profile.membership_category]} text-white`}>
                  {profile.membership_category}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">Miembro desde {new Date(profile.created_at).getFullYear()}</span>
              </div>
            </div>
          </div>
          <Button onClick={signOut} variant="outline">
            Cerrar Sesión
          </Button>
        </div>

        {/* Bienvenida */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">¡Bienvenido al Club del Asado!</CardTitle>
            <CardDescription>
              Estás listo para disfrutar de la comunidad de asadores más apasionados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Como miembro <strong>{profile.membership_category}</strong>, tienes acceso a contenido exclusivo,
              eventos especiales y la oportunidad de conectar con otros asadores de tu nivel.
            </p>
          </CardContent>
        </Card>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>
                Gestiona tu información personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Nombre:</strong> {profile.first_name} {profile.last_name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Categoría:</strong> {profile.membership_category}</p>
              </div>
              <Button className="w-full mt-4" variant="outline" onClick={() => navigate("/complete-profile")}>
                Editar Perfil
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Eventos</CardTitle>
              <CardDescription>
                Asados y reuniones del club
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No hay eventos programados por el momento.
              </p>
              <Button className="w-full mt-4" variant="outline" disabled>
                Ver Eventos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comunidad</CardTitle>
              <CardDescription>
                Conecta con otros miembros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Explora la comunidad de El Club del Asado.
              </p>
              <Button className="w-full mt-4" variant="outline" disabled>
                Ver Miembros
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;