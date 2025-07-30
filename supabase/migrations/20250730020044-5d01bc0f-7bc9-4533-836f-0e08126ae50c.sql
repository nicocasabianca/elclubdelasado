-- Create recipe categories enum
CREATE TYPE recipe_category AS ENUM (
  'vacuna',
  'cerdo', 
  'ave',
  'pez',
  'vegetales',
  'salsas',
  'acompañamientos'
);

-- Create meat cuts table
CREATE TABLE public.meat_cuts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category recipe_category NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT NOT NULL,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER,
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  category recipe_category NOT NULL,
  image_url TEXT,
  pdf_url TEXT, -- Para PDFs opcionales
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipe_meat_cuts junction table (many-to-many)
CREATE TABLE public.recipe_meat_cuts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  meat_cut_id UUID NOT NULL REFERENCES public.meat_cuts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, meat_cut_id)
);

-- Create recipe favorites table
CREATE TABLE public.recipe_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE public.meat_cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_meat_cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meat_cuts
CREATE POLICY "Todos pueden ver cortes de carne" 
ON public.meat_cuts 
FOR SELECT 
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear cortes" 
ON public.meat_cuts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden actualizar cortes" 
ON public.meat_cuts 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for recipes
CREATE POLICY "Todos pueden ver recetas" 
ON public.recipes 
FOR SELECT 
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear recetas" 
ON public.recipes 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creadores pueden actualizar sus recetas" 
ON public.recipes 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Creadores pueden eliminar sus recetas" 
ON public.recipes 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create RLS policies for recipe_meat_cuts
CREATE POLICY "Todos pueden ver relaciones receta-corte" 
ON public.recipe_meat_cuts 
FOR SELECT 
USING (true);

CREATE POLICY "Usuarios autenticados pueden crear relaciones" 
ON public.recipe_meat_cuts 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Usuarios autenticados pueden eliminar relaciones" 
ON public.recipe_meat_cuts 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for recipe_favorites
CREATE POLICY "Usuarios pueden ver sus favoritos" 
ON public.recipe_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden agregar favoritos" 
ON public.recipe_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus favoritos" 
ON public.recipe_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_recipes_category ON public.recipes(category);
CREATE INDEX idx_recipes_tags ON public.recipes USING GIN(tags);
CREATE INDEX idx_recipes_created_by ON public.recipes(created_by);
CREATE INDEX idx_recipes_title_search ON public.recipes USING GIN(to_tsvector('spanish', title));
CREATE INDEX idx_recipes_ingredients_search ON public.recipes USING GIN(to_tsvector('spanish', array_to_string(ingredients, ' ')));
CREATE INDEX idx_recipes_instructions_search ON public.recipes USING GIN(to_tsvector('spanish', instructions));
CREATE INDEX idx_meat_cuts_name ON public.meat_cuts(name);
CREATE INDEX idx_meat_cuts_category ON public.meat_cuts(category);

-- Create trigger for updating timestamps
CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meat_cuts_updated_at
BEFORE UPDATE ON public.meat_cuts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial meat cuts
INSERT INTO public.meat_cuts (name, category, description) VALUES
-- Vacuna
('Bife de Chorizo', 'vacuna', 'Corte premium de la parte posterior del lomo'),
('Asado de Tira', 'vacuna', 'Corte clásico para asados'),
('Vacío', 'vacuna', 'Corte sabroso de la parte abdominal'),
('Entraña', 'vacuna', 'Corte interno muy tierno'),
('Ojo de Bife', 'vacuna', 'Corte magro del centro del lomo'),
('Bife Ancho', 'vacuna', 'Corte con hueso T'),
('Cuadril', 'vacuna', 'Corte de la parte posterior'),
('Picaña', 'vacuna', 'Corte superior del cuadril'),

-- Cerdo
('Bondiola', 'cerdo', 'Corte del cuello del cerdo'),
('Costillas', 'cerdo', 'Costillar de cerdo'),
('Matambre', 'cerdo', 'Corte plano del cerdo'),
('Solomillo', 'cerdo', 'Lomo interno del cerdo'),

-- Ave
('Pechuga', 'ave', 'Parte pectoral del pollo'),
('Muslo', 'ave', 'Pata superior del pollo'),
('Alitas', 'ave', 'Alas de pollo'),
('Pollo Entero', 'ave', 'Pollo completo'),

-- Pez
('Salmón', 'pez', 'Pescado graso de agua fría'),
('Merluza', 'pez', 'Pescado blanco magro'),
('Atún', 'pez', 'Pescado azul'),
('Dorado', 'pez', 'Pescado de río');

-- Create search function for recipes
CREATE OR REPLACE FUNCTION public.search_recipes(
  search_term TEXT DEFAULT '',
  filter_category recipe_category DEFAULT NULL,
  filter_tags TEXT[] DEFAULT NULL,
  filter_meat_cuts UUID[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  ingredients TEXT[],
  instructions TEXT,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  servings INTEGER,
  difficulty_level INTEGER,
  category recipe_category,
  image_url TEXT,
  pdf_url TEXT,
  tags TEXT[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  meat_cuts TEXT[]
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    r.id,
    r.title,
    r.description,
    r.ingredients,
    r.instructions,
    r.prep_time_minutes,
    r.cook_time_minutes,
    r.servings,
    r.difficulty_level,
    r.category,
    r.image_url,
    r.pdf_url,
    r.tags,
    r.created_by,
    r.created_at,
    r.updated_at,
    COALESCE(
      ARRAY(
        SELECT mc.name 
        FROM public.recipe_meat_cuts rmc 
        JOIN public.meat_cuts mc ON rmc.meat_cut_id = mc.id 
        WHERE rmc.recipe_id = r.id
      ), 
      '{}'::TEXT[]
    ) as meat_cuts
  FROM public.recipes r
  WHERE 
    (search_term = '' OR (
      to_tsvector('spanish', r.title) @@ plainto_tsquery('spanish', search_term) OR
      to_tsvector('spanish', array_to_string(r.ingredients, ' ')) @@ plainto_tsquery('spanish', search_term) OR
      to_tsvector('spanish', r.instructions) @@ plainto_tsquery('spanish', search_term) OR
      r.title ILIKE '%' || search_term || '%'
    ))
    AND (filter_category IS NULL OR r.category = filter_category)
    AND (filter_tags IS NULL OR r.tags && filter_tags)
    AND (filter_meat_cuts IS NULL OR EXISTS (
      SELECT 1 FROM public.recipe_meat_cuts rmc 
      WHERE rmc.recipe_id = r.id AND rmc.meat_cut_id = ANY(filter_meat_cuts)
    ))
  ORDER BY r.created_at DESC;
$$;