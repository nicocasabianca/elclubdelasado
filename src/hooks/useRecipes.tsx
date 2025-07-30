import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type RecipeCategory = 'vacuna' | 'cerdo' | 'ave' | 'pez' | 'vegetales' | 'salsas' | 'acompañamientos';

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  difficulty_level?: number;
  category: RecipeCategory;
  image_url?: string;
  pdf_url?: string;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  meat_cuts?: string[];
}

export interface MeatCut {
  id: string;
  name: string;
  category: RecipeCategory;
  description?: string;
}

export interface RecipeFilters {
  searchTerm?: string;
  category?: RecipeCategory;
  tags?: string[];
  meatCuts?: string[];
}

export const useRecipes = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [meatCuts, setMeatCuts] = useState<MeatCut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async (filters: RecipeFilters = {}) => {
    try {
      console.log('🔍 Fetching recipes...', filters);
      setLoading(true);
      let query = supabase.from('recipes').select(`
        *,
        recipe_meat_cuts(
          meat_cuts(name, category)
        )
      `);

      // Apply filters
      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,instructions.ilike.%${filters.searchTerm}%`);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      console.log('🔍 Executing query...');
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Recipes data received:', data);

      // Transform the data to include meat_cuts as a flat array
      const transformedRecipes = data?.map(recipe => ({
        ...recipe,
        meat_cuts: recipe.recipe_meat_cuts?.map((rmc: any) => rmc.meat_cuts.name) || []
      })) || [];

      console.log('✅ Transformed recipes:', transformedRecipes);
      setRecipes(transformedRecipes);
    } catch (err) {
      console.error('❌ Error in fetchRecipes:', err);
      setError(err instanceof Error ? err.message : 'Error fetching recipes');
    } finally {
      setLoading(false);
    }
  };

  const fetchMeatCuts = async () => {
    try {
      console.log('🥩 Fetching meat cuts...');
      const { data, error } = await supabase
        .from('meat_cuts')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Meat cuts error:', error);
        throw error;
      }
      
      console.log('✅ Meat cuts received:', data);
      setMeatCuts(data || []);
    } catch (err) {
      console.error('❌ Error fetching meat cuts:', err);
    }
  };

  const createRecipe = async (recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'meat_cuts' | 'created_by'>, selectedMeatCuts: string[] = []) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert([{
          ...recipeData,
          created_by: user.id
        }])
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Add meat cuts relationships
      if (selectedMeatCuts.length > 0) {
        const meatCutRelations = selectedMeatCuts.map(meatCutId => ({
          recipe_id: recipe.id,
          meat_cut_id: meatCutId
        }));

        const { error: relationError } = await supabase
          .from('recipe_meat_cuts')
          .insert(meatCutRelations);

        if (relationError) throw relationError;
      }

      await fetchRecipes();
      return recipe;
    } catch (err) {
      throw err;
    }
  };

  const updateRecipe = async (id: string, recipeData: Partial<Recipe>, selectedMeatCuts: string[] = []) => {
    try {
      const { error: recipeError } = await supabase
        .from('recipes')
        .update(recipeData)
        .eq('id', id);

      if (recipeError) throw recipeError;

      // Update meat cuts relationships
      // First delete existing relationships
      await supabase
        .from('recipe_meat_cuts')
        .delete()
        .eq('recipe_id', id);

      // Then add new ones
      if (selectedMeatCuts.length > 0) {
        const meatCutRelations = selectedMeatCuts.map(meatCutId => ({
          recipe_id: id,
          meat_cut_id: meatCutId
        }));

        const { error: relationError } = await supabase
          .from('recipe_meat_cuts')
          .insert(meatCutRelations);

        if (relationError) throw relationError;
      }

      await fetchRecipes();
    } catch (err) {
      throw err;
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchRecipes();
    } catch (err) {
      throw err;
    }
  };

  const toggleFavorite = async (recipeId: string) => {
    if (!user) return;

    try {
      // Check if already favorited
      const { data: existing } = await supabase
        .from('recipe_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('recipe_id', recipeId)
        .single();

      if (existing) {
        // Remove favorite
        await supabase
          .from('recipe_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);
      } else {
        // Add favorite
        await supabase
          .from('recipe_favorites')
          .insert([{
            user_id: user.id,
            recipe_id: recipeId
          }]);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const addMeatCut = async (name: string, category: RecipeCategory, description?: string) => {
    try {
      const { error } = await supabase
        .from('meat_cuts')
        .insert([{ name, category, description }]);

      if (error) throw error;
      await fetchMeatCuts();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    console.log('🚀 useRecipes hook initializing...');
    fetchRecipes();
    fetchMeatCuts();
  }, []);

  return {
    recipes,
    meatCuts,
    loading,
    error,
    fetchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
    addMeatCut
  };
};