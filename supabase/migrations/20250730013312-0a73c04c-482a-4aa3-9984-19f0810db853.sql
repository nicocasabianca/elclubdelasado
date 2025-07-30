-- Cambiar birth_year por birth_date en la tabla profiles
ALTER TABLE public.profiles 
DROP COLUMN birth_year;

ALTER TABLE public.profiles 
ADD COLUMN birth_date DATE NOT NULL DEFAULT '1990-01-01';

-- Comentario: Ahora almacenamos la fecha completa de nacimiento para poder enviar felicitaciones y beneficios en cumpleaños