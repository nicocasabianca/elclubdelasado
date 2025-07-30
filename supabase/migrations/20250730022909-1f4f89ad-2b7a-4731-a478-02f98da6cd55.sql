-- Crear tabla para guardar cálculos de carne
CREATE TABLE public.meat_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  adults INTEGER NOT NULL DEFAULT 0,
  children INTEGER NOT NULL DEFAULT 0,
  big_eaters INTEGER NOT NULL DEFAULT 0,
  vegetarians INTEGER NOT NULL DEFAULT 0,
  meat_types TEXT[] NOT NULL DEFAULT '{}', -- ['beef', 'pork', 'chicken']
  include_offal BOOLEAN NOT NULL DEFAULT false,
  long_event BOOLEAN NOT NULL DEFAULT false, -- más de 6 horas
  selected_cuts JSONB NOT NULL DEFAULT '{}', -- {meat_cut_id: quantity_needed}
  total_protein_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_vegetables_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  shopping_list JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meat_calculations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own calculations" 
ON public.meat_calculations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calculations" 
ON public.meat_calculations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations" 
ON public.meat_calculations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations" 
ON public.meat_calculations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_meat_calculations_updated_at
BEFORE UPDATE ON public.meat_calculations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();