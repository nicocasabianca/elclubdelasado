-- Create access codes table for member authentication
CREATE TABLE public.access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  member_name TEXT NOT NULL,
  membership_status TEXT NOT NULL DEFAULT 'active' CHECK (membership_status IN ('active', 'inactive', 'suspended')),
  used_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Access codes are viewable by authenticated users" 
ON public.access_codes 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own access code" 
ON public.access_codes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for code lookup
CREATE INDEX idx_access_codes_code ON public.access_codes(code);
CREATE INDEX idx_access_codes_user_id ON public.access_codes(user_id);

-- Insert some sample access codes for testing
INSERT INTO public.access_codes (code, member_name, membership_status) VALUES
('ASADOR001', 'Juan Pérez', 'active'),
('ASADOR002', 'María González', 'active'),
('ASADOR003', 'Carlos Rodríguez', 'active'),
('PARRILLA001', 'Ana López', 'active'),
('PARRILLA002', 'Roberto Silva', 'active');

-- Create function to verify and use access code
CREATE OR REPLACE FUNCTION public.verify_access_code(access_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  code_record RECORD;
  result JSON;
BEGIN
  -- Look for the access code
  SELECT * INTO code_record 
  FROM public.access_codes 
  WHERE code = access_code 
    AND membership_status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
    AND used_at IS NULL;

  IF NOT FOUND THEN
    result := json_build_object(
      'valid', false,
      'error', 'Código inválido, expirado o ya utilizado'
    );
  ELSE
    result := json_build_object(
      'valid', true,
      'member_name', code_record.member_name,
      'code_id', code_record.id
    );
  END IF;

  RETURN result;
END;
$$;

-- Create function to mark code as used
CREATE OR REPLACE FUNCTION public.mark_code_as_used(code_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.access_codes 
  SET used_at = now(), user_id = mark_code_as_used.user_id, updated_at = now()
  WHERE id = code_id AND used_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_access_codes_updated_at
  BEFORE UPDATE ON public.access_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();