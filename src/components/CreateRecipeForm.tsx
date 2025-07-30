import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRecipes, RecipeCategory, MeatCut } from '@/hooks/useRecipes';
import { X, Plus, Upload, FileText } from 'lucide-react';

const recipeSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  category: z.enum(['vacuna', 'cerdo', 'ave', 'pez', 'vegetales', 'salsas', 'acompañamientos']),
  prep_time_minutes: z.number().min(0).optional(),
  cook_time_minutes: z.number().min(0).optional(),
  servings: z.number().min(1).optional(),
  difficulty_level: z.number().min(1).max(5).optional(),
  instructions: z.string().min(1, 'Las instrucciones son requeridas'),
  image_url: z.string().url().optional().or(z.literal('')),
  pdf_url: z.string().url().optional().or(z.literal(''))
});

const categoryLabels: Record<RecipeCategory, string> = {
  vacuna: 'Vacuna',
  cerdo: 'Cerdo',
  ave: 'Ave',
  pez: 'Pez',
  vegetales: 'Vegetales',
  salsas: 'Salsas',
  acompañamientos: 'Acompañamientos'
};

const difficultyLabels = ['', 'Muy Fácil', 'Fácil', 'Intermedio', 'Difícil', 'Muy Difícil'];

interface CreateRecipeFormProps {
  meatCuts: MeatCut[];
  onSuccess: () => void;
}

export function CreateRecipeForm({ meatCuts, onSuccess }: CreateRecipeFormProps) {
  const { toast } = useToast();
  const { createRecipe } = useRecipes();
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedMeatCuts, setSelectedMeatCuts] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof recipeSchema>>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: '',
      description: '',
      instructions: '',
      image_url: '',
      pdf_url: '',
      prep_time_minutes: undefined,
      cook_time_minutes: undefined,
      servings: undefined,
      difficulty_level: undefined
    }
  });

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleMeatCutChange = (meatCutId: string, checked: boolean) => {
    if (checked) {
      setSelectedMeatCuts([...selectedMeatCuts, meatCutId]);
    } else {
      setSelectedMeatCuts(selectedMeatCuts.filter(id => id !== meatCutId));
    }
  };

  const onSubmit = async (values: z.infer<typeof recipeSchema>) => {
    try {
      setSubmitting(true);
      
      // Filter out empty ingredients
      const validIngredients = ingredients.filter(ingredient => ingredient.trim() !== '');
      
      if (validIngredients.length === 0) {
        toast({
          title: 'Error',
          description: 'Debes agregar al menos un ingrediente',
          variant: 'destructive'
        });
        return;
      }

      const recipeData = {
        title: values.title,
        description: values.description,
        category: values.category,
        prep_time_minutes: values.prep_time_minutes,
        cook_time_minutes: values.cook_time_minutes,
        servings: values.servings,
        difficulty_level: values.difficulty_level,
        instructions: values.instructions,
        ingredients: validIngredients,
        tags: tags,
        // Convert empty strings to undefined for optional URLs
        image_url: values.image_url || undefined,
        pdf_url: values.pdf_url || undefined
      };

      await createRecipe(recipeData, selectedMeatCuts);
      
      toast({
        title: 'Éxito',
        description: 'Receta creada exitosamente'
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast({
        title: 'Error',
        description: 'Error al crear la receta',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Detalles principales de la receta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título de la Receta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Asado de Tira Patagónico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción breve de la receta..."
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prep_time_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prep. (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="30"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cook_time_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cocción (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="45"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Porciones</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="4"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dificultad</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {difficultyLabels.slice(1).map((label, index) => (
                            <SelectItem key={index + 1} value={(index + 1).toString()}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media and Files */}
          <Card>
            <CardHeader>
              <CardTitle>Multimedia</CardTitle>
              <CardDescription>
                Imágenes y documentos de la receta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Imagen</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://ejemplo.com/imagen.jpg" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL de una imagen para la receta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pdf_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del PDF Original</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://ejemplo.com/receta.pdf" 
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Si tienes un PDF de esta receta, incluye su URL aquí
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredientes</CardTitle>
            <CardDescription>
              Lista todos los ingredientes necesarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Ingrediente ${index + 1}`}
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    className="flex-1"
                  />
                  {ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addIngredient}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Ingrediente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
            <CardDescription>
              Pasos detallados para preparar la receta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="1. Preparar la parrilla...&#10;2. Condimentar la carne...&#10;3. Asar por X minutos..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meat Cuts */}
          <Card>
            <CardHeader>
              <CardTitle>Cortes de Carne</CardTitle>
              <CardDescription>
                Selecciona los cortes que se usan en esta receta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(
                  meatCuts.reduce((acc, cut) => {
                    if (!acc[cut.category]) acc[cut.category] = [];
                    acc[cut.category].push(cut);
                    return acc;
                  }, {} as Record<RecipeCategory, MeatCut[]>)
                ).map(([category, cuts]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      {categoryLabels[category as RecipeCategory]}
                    </h4>
                    {cuts.map((cut) => (
                      <div key={cut.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={cut.id}
                          checked={selectedMeatCuts.includes(cut.id)}
                          onCheckedChange={(checked) => 
                            handleMeatCutChange(cut.id, checked as boolean)
                          }
                        />
                        <label htmlFor={cut.id} className="text-sm">
                          {cut.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Etiquetas</CardTitle>
              <CardDescription>
                Agrega etiquetas para facilitar la búsqueda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Agregar etiqueta..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear Receta'}
          </Button>
        </div>
      </form>
    </Form>
  );
}