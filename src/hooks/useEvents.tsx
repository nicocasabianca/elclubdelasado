import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string;
  max_participants: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  registrations?: EventRegistration[];
  registration_count?: number;
  is_registered?: boolean;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registered_at: string;
}

export const useEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar eventos
  const fetchEvents = async () => {
    try {
      const { data: eventsData, error } = await supabase
        .from("events")
        .select(`
          *,
          registrations:event_registrations(*)
        `)
        .order("event_date", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        return;
      }

      // Añadir información de inscripciones
      const eventsWithRegistrations = eventsData?.map(event => ({
        ...event,
        registration_count: event.registrations?.length || 0,
        is_registered: user ? event.registrations?.some((reg: any) => reg.user_id === user.id) : false
      })) || [];

      setEvents(eventsWithRegistrations);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Crear evento
  const createEvent = async (eventData: {
    title: string;
    description: string;
    event_date: string;
    location: string;
    max_participants: number;
  }) => {
    if (!user) return { error: "Usuario no autenticado" };

    try {
      const { data, error } = await supabase
        .from("events")
        .insert({
          ...eventData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo crear el evento",
          variant: "destructive",
        });
        return { error: error.message };
      }

      toast({
        title: "¡Evento creado!",
        description: "El evento se ha creado correctamente",
      });

      await fetchEvents(); // Recargar eventos
      return { data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  // Inscribirse a evento
  const registerForEvent = async (eventId: string) => {
    if (!user) return { error: "Usuario no autenticado" };

    try {
      const { error } = await supabase
        .from("event_registrations")
        .insert({
          event_id: eventId,
          user_id: user.id,
        });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo inscribir al evento",
          variant: "destructive",
        });
        return { error: error.message };
      }

      toast({
        title: "¡Inscrito!",
        description: "Te has inscrito al evento correctamente",
      });

      await fetchEvents(); // Recargar eventos
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  // Cancelar inscripción
  const unregisterFromEvent = async (eventId: string) => {
    if (!user) return { error: "Usuario no autenticado" };

    try {
      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", user.id);

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo cancelar la inscripción",
          variant: "destructive",
        });
        return { error: error.message };
      }

      toast({
        title: "Inscripción cancelada",
        description: "Has cancelado tu inscripción al evento",
      });

      await fetchEvents(); // Recargar eventos
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  return {
    events,
    loading,
    createEvent,
    registerForEvent,
    unregisterFromEvent,
    refetch: fetchEvents,
  };
};