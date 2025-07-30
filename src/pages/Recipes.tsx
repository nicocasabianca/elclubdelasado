import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Clock, Users, ChefHat, Search, Filter, Heart, FileText, Plus } from 'lucide-react';
import { useRecipes, RecipeCategory } from '@/hooks/useRecipes';
import { CreateRecipeForm } from '@/components/CreateRecipeForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

export function Recipes() {
  console.log('📄 Recipes component mounting...');
  
  const { recipes, meatCuts, loading, fetchRecipes, error } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | ''>('');
  const [selectedMeatCut, setSelectedMeatCut] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  console.log('📄 Recipes component state:', { 
    recipesCount: recipes.length, 
    meatCutsCount: meatCuts.length, 
    loading, 
    error 
  });

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = !searchTerm || 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.instructions.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      recipe.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
    
    const matchesMeatCut = !selectedMeatCut || 
      recipe.meat_cuts?.some(cut => cut.toLowerCase().includes(selectedMeatCut.toLowerCase()));

    return matchesSearch && matchesCategory && matchesMeatCut;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedMeatCut('');
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedMeatCut;

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error al cargar recetas</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recetas del Club</h1>
            <p className="text-muted-foreground">
              Descubre y comparte recetas de parrilla y gastronomía
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Receta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Receta</DialogTitle>
              </DialogHeader>
              <CreateRecipeForm 
                meatCuts={meatCuts}
                onSuccess={() => {
                  setShowCreateDialog(false);
                  fetchRecipes();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar recetas, ingredientes, instrucciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as RecipeCategory | '')}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Tipo de receta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMeatCut} onValueChange={setSelectedMeatCut}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Corte de carne" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los cortes</SelectItem>
                  {meatCuts.map((cut) => (
                    <SelectItem key={cut.id} value={cut.name}>
                      {cut.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary">
                  Búsqueda: "{searchTerm}"
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary">
                  Tipo: {categoryLabels[selectedCategory]}
                </Badge>
              )}
              {selectedMeatCut && (
                <Badge variant="secondary">
                  Corte: {selectedMeatCut}
                </Badge>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Cargando...' : `${filteredRecipes.length} receta${filteredRecipes.length !== 1 ? 's' : ''} encontrada${filteredRecipes.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {recipe.image_url && (
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={recipe.image_url} 
                      alt={recipe.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{recipe.title}</CardTitle>
                      {recipe.description && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {recipe.description}
                        </CardDescription>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Category and Difficulty */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {categoryLabels[recipe.category]}
                    </Badge>
                    {recipe.difficulty_level && (
                      <Badge variant="secondary">
                        {difficultyLabels[recipe.difficulty_level]}
                      </Badge>
                    )}
                  </div>

                  {/* Meat Cuts */}
                  {recipe.meat_cuts && recipe.meat_cuts.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Cortes:</p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.meat_cuts.slice(0, 3).map((cut, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cut}
                          </Badge>
                        ))}
                        {recipe.meat_cuts.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{recipe.meat_cuts.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {recipe.tags.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Etiquetas:</p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {recipe.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{recipe.tags.length - 3} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Time and Servings */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {recipe.prep_time_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{recipe.prep_time_minutes}min</span>
                      </div>
                    )}
                    {recipe.cook_time_minutes && (
                      <div className="flex items-center gap-1">
                        <ChefHat className="h-3 w-3" />
                        <span>{recipe.cook_time_minutes}min</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{recipe.servings}</span>
                      </div>
                    )}
                  </div>

                  {/* PDF Link */}
                  {recipe.pdf_url && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={recipe.pdf_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        Ver PDF Original
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {!loading && filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron recetas</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Sé el primero en agregar una receta al club'
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}