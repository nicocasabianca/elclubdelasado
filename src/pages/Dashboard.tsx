import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, ArrowRight } from "lucide-react";

const CATEGORY_COLORS = {
  "Fuego": "bg-red-500",
  "Brasas": "bg-orange-500", 
  "Carbón": "bg-gray-700",
  "Digital": "bg-blue-500"
};

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { events } = useEvents();
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

  // Calcular próximos eventos
  const upcomingEvents = events.filter(event => new Date(event.event_date) > new Date()).slice(0, 3);
  const myRegistrations = events.filter(event => event.is_registered).length;

  return (
    <div className="bg-background p-6">
      <div className="max-w-6xl mx-auto">
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
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Próximos Eventos</p>
                  <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Mis Inscripciones</p>
                  <p className="text-2xl font-bold">{myRegistrations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Badge className={`${CATEGORY_COLORS[profile.membership_category]} h-8 w-8 text-white flex items-center justify-center`}>
                  {profile.membership_category[0]}
                </Badge>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                  <p className="text-2xl font-bold">{profile.membership_category}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Próximos Eventos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Próximos Eventos</CardTitle>
                  <CardDescription>
                    Asados y reuniones programadas
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate("/events")}>
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.event_date), "d 'de' MMMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                      <Badge variant={event.is_registered ? "default" : "outline"}>
                        {event.is_registered ? "Inscrito" : "Disponible"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No hay eventos próximos</p>
                  <Button className="mt-2" onClick={() => navigate("/events")}>
                    Ver todos los eventos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mi Perfil */}
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>
                Tu información del club
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile.profile_picture_url} alt={`${profile.first_name} ${profile.last_name}`} />
                    <AvatarFallback>
                      {profile.first_name[0]}{profile.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoría:</span>
                    <Badge className={`${CATEGORY_COLORS[profile.membership_category]} text-white`}>
                      {profile.membership_category}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de nacimiento:</span>
                    <span>{new Date(profile.birth_date).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Miembro desde:</span>
                    <span>{new Date(profile.created_at).getFullYear()}</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline" onClick={() => navigate("/complete-profile")}>
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;