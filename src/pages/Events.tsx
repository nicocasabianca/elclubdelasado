import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Calendar, MapPin, Users, Clock } from "lucide-react";
import { useEvents, Event } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CreateEventForm from "@/components/CreateEventForm";

const Events = () => {
  const { events, loading, registerForEvent, unregisterFromEvent } = useEvents();
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const upcomingEvents = events.filter(event => new Date(event.event_date) > new Date());
  const pastEvents = events.filter(event => new Date(event.event_date) <= new Date());

  const handleRegisterToggle = async (event: Event) => {
    if (event.is_registered) {
      await unregisterFromEvent(event.id);
    } else {
      await registerForEvent(event.id);
    }
  };

  const EventCard = ({ event }: { event: Event }) => {
    const eventDate = new Date(event.event_date);
    const isUpcoming = eventDate > new Date();
    const isFull = (event.registration_count || 0) >= event.max_participants;
    const canRegister = isUpcoming && !isFull && user;

    return (
      <Card className={`${!isUpcoming ? 'opacity-75' : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <CardDescription className="mt-2">
                {event.description}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!isUpcoming && <Badge variant="secondary">Finalizado</Badge>}
              {isFull && isUpcoming && <Badge variant="destructive">Completo</Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              {format(eventDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              {format(eventDate, "HH:mm", { locale: es })} hs
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2" />
              {event.location}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-2" />
              {event.registration_count || 0} / {event.max_participants} inscriptos
            </div>
          </div>

          {canRegister && (
            <Button
              className="w-full mt-4"
              variant={event.is_registered ? "outline" : "default"}
              onClick={() => handleRegisterToggle(event)}
            >
              {event.is_registered ? "Cancelar Inscripción" : "Inscribirse"}
            </Button>
          )}

          {!isUpcoming && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Este evento ya finalizó
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Eventos del Club</h1>
            <p className="text-muted-foreground mt-2">
              Descubre y participa en los asados y eventos de la comunidad
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear Evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Evento</DialogTitle>
                <DialogDescription>
                  Organiza un asado o evento para la comunidad del club
                </DialogDescription>
              </DialogHeader>
              <CreateEventForm onSuccess={() => setCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Próximos Eventos */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Próximos Eventos</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Eventos Pasados */}
        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Eventos Anteriores</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Sin eventos */}
        {events.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay eventos programados</h3>
            <p className="text-muted-foreground mb-6">
              ¡Sé el primero en organizar un asado para la comunidad!
            </p>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Evento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Evento</DialogTitle>
                  <DialogDescription>
                    Organiza un asado o evento para la comunidad del club
                  </DialogDescription>
                </DialogHeader>
                <CreateEventForm onSuccess={() => setCreateDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;