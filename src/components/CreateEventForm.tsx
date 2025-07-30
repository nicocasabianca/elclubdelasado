import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEvents } from "@/hooks/useEvents";
import { cn } from "@/lib/utils";

interface CreateEventFormProps {
  onSuccess?: () => void;
}

const CreateEventForm = ({ onSuccess }: CreateEventFormProps) => {
  const { createEvent } = useEvents();
  const [loading, setLoading] = useState(false);
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [eventTime, setEventTime] = useState("18:00");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    max_participants: 20,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventDate) {
      alert("Por favor selecciona una fecha para el evento");
      return;
    }

    setLoading(true);

    // Combinar fecha y hora
    const [hours, minutes] = eventTime.split(":").map(Number);
    const eventDateTime = new Date(eventDate);
    eventDateTime.setHours(hours, minutes, 0, 0);

    const { error } = await createEvent({
      ...formData,
      event_date: eventDateTime.toISOString(),
    });

    if (!error) {
      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        max_participants: 20,
      });
      setEventDate(undefined);
      setEventTime("18:00");
      onSuccess?.();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="title">Título del Evento *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Ej: Asado de Fin de Semana"
          required
        />
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe el evento, qué van a asar, si hay que traer algo..."
          rows={3}
        />
      </div>

      {/* Fecha */}
      <div className="space-y-2">
        <Label>Fecha del Evento *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !eventDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {eventDate ? (
                format(eventDate, "PPP", { locale: es })
              ) : (
                <span>Selecciona la fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={eventDate}
              onSelect={setEventDate}
              disabled={(date) => date < new Date()}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Hora */}
      <div className="space-y-2">
        <Label htmlFor="time">Hora del Evento *</Label>
        <Input
          id="time"
          type="time"
          value={eventTime}
          onChange={(e) => setEventTime(e.target.value)}
          required
        />
      </div>

      {/* Ubicación */}
      <div className="space-y-2">
        <Label htmlFor="location">Ubicación *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="Ej: Quinta de Juan, Calle Falsa 123"
          required
        />
      </div>

      {/* Máximo participantes */}
      <div className="space-y-2">
        <Label htmlFor="max_participants">Máximo de Participantes</Label>
        <Input
          id="max_participants"
          type="number"
          min="1"
          max="100"
          value={formData.max_participants}
          onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
        size="lg"
      >
        {loading ? "Creando..." : "Crear Evento"}
      </Button>
    </form>
  );
};

export default CreateEventForm;