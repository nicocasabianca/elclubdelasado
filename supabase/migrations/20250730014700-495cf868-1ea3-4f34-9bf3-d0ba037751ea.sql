-- Crear tabla de eventos
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  max_participants INTEGER DEFAULT 50,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Políticas para eventos (todos pueden ver, solo creadores pueden editar)
CREATE POLICY "Todos pueden ver eventos" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear eventos" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creadores pueden actualizar sus eventos" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Creadores pueden eliminar sus eventos" 
ON public.events 
FOR DELETE 
USING (auth.uid() = created_by);

-- Crear tabla de inscripciones a eventos
CREATE TABLE public.event_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Políticas para inscripciones
CREATE POLICY "Todos pueden ver inscripciones" 
ON public.event_registrations 
FOR SELECT 
USING (true);

CREATE POLICY "Usuarios pueden inscribirse" 
ON public.event_registrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden cancelar su inscripción" 
ON public.event_registrations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at en eventos
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Crear índices para mejor rendimiento
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_registrations_user ON public.event_registrations(user_id);