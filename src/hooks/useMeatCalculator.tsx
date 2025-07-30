import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface MeatCalculation {
  id?: string;
  title: string;
  adults: number;
  children: number;
  bigEaters: number;
  vegetarians: number;
  meatTypes: string[]; // ['beef', 'pork', 'chicken']
  includeOffal: boolean;
  longEvent: boolean;
  selectedCuts: Record<string, number>; // meat_cut_id -> quantity needed
  totalProteinKg: number;
  totalVegetablesKg: number;
  shoppingList: Record<string, { quantity: number; unit: string }>;
  createdAt?: string;
}

export const useMeatCalculator = () => {
  const { user } = useAuth();
  const [calculations, setCalculations] = useState<MeatCalculation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's saved calculations
  const fetchCalculations = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('meat_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCalculations: MeatCalculation[] = data.map(calc => ({
        id: calc.id,
        title: calc.title,
        adults: calc.adults,
        children: calc.children,
        bigEaters: calc.big_eaters,
        vegetarians: calc.vegetarians,
        meatTypes: calc.meat_types || [],
        includeOffal: calc.include_offal,
        longEvent: calc.long_event,
        selectedCuts: (calc.selected_cuts as Record<string, number>) || {},
        totalProteinKg: parseFloat(String(calc.total_protein_kg || '0')),
        totalVegetablesKg: parseFloat(String(calc.total_vegetables_kg || '0')),
        shoppingList: (calc.shopping_list as Record<string, { quantity: number; unit: string }>) || {},
        createdAt: calc.created_at
      }));

      setCalculations(formattedCalculations);
    } catch (err) {
      console.error('Error fetching calculations:', err);
      setError('Error al cargar los cálculos');
      toast.error('Error al cargar los cálculos');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Calculate meat distribution based on selected types
  const calculateMeatDistribution = useCallback((meatTypes: string[], totalProtein: number, includeOffal: boolean) => {
    let distribution: Record<string, number> = {};
    let remaining = totalProtein;

    // Reserve 10% for offal if selected
    if (includeOffal) {
      distribution.offal = totalProtein * 0.1;
      remaining = totalProtein * 0.9;
    }

    // Apply meat type percentages
    if (meatTypes.length === 1) {
      distribution[meatTypes[0]] = remaining;
    } else if (meatTypes.includes('beef') && meatTypes.includes('pork') && meatTypes.length === 2) {
      distribution.beef = remaining * 0.7;
      distribution.pork = remaining * 0.3;
    } else if (meatTypes.includes('beef') && meatTypes.includes('chicken') && meatTypes.length === 2) {
      distribution.beef = remaining * 0.8;
      distribution.chicken = remaining * 0.2;
    } else if (meatTypes.includes('pork') && meatTypes.includes('chicken') && meatTypes.length === 2) {
      distribution.pork = remaining * 0.6;
      distribution.chicken = remaining * 0.4;
    } else if (meatTypes.length === 3) {
      // If all three types, distribute evenly for now
      const each = remaining / 3;
      distribution.beef = each;
      distribution.pork = each;
      distribution.chicken = each;
    }

    return distribution;
  }, []);

  // Main calculation function
  const calculateMeat = useCallback((params: Omit<MeatCalculation, 'id' | 'selectedCuts' | 'totalProteinKg' | 'totalVegetablesKg' | 'shoppingList' | 'createdAt'>) => {
    const {
      adults,
      children,
      bigEaters,
      vegetarians,
      meatTypes,
      includeOffal,
      longEvent
    } = params;

    // Calculate base protein needs
    let baseProtein = (adults * 400) + (children * 200) + (bigEaters * 500); // in grams
    
    // Add 20% if it's a long event
    if (longEvent) {
      baseProtein *= 1.2;
    }

    const totalProteinKg = baseProtein / 1000; // convert to kg
    const totalVegetablesKg = (vegetarians * 400) / 1000; // 400g vegetables per vegetarian

    // Calculate meat distribution
    const meatDistribution = calculateMeatDistribution(meatTypes, totalProteinKg, includeOffal);

    // Generate shopping list (simplified for now)
    const shoppingList: Record<string, { quantity: number; unit: string }> = {};
    
    Object.entries(meatDistribution).forEach(([meatType, kg]) => {
      let displayName = '';
      let adjustedKg = kg;
      
      switch (meatType) {
        case 'beef':
          displayName = 'Carne Vacuna';
          break;
        case 'pork':
          displayName = 'Carne de Cerdo';
          break;
        case 'chicken':
          displayName = 'Pollo';
          break;
        case 'offal':
          displayName = 'Achuras';
          break;
      }

      // Add 30% for bone-in cuts (simplified assumption)
      if (meatType !== 'offal') {
        adjustedKg *= 1.3; // 30% bone waste
      }

      shoppingList[displayName] = {
        quantity: Math.ceil(adjustedKg * 10) / 10, // round to 1 decimal
        unit: 'kg'
      };
    });

    if (totalVegetablesKg > 0) {
      shoppingList['Verduras/Carbohidratos'] = {
        quantity: Math.ceil(totalVegetablesKg * 10) / 10,
        unit: 'kg'
      };
    }

    return {
      ...params,
      selectedCuts: {}, // Will be populated when user selects specific cuts
      totalProteinKg,
      totalVegetablesKg,
      shoppingList
    };
  }, [calculateMeatDistribution]);

  // Save calculation to database
  const saveCalculation = useCallback(async (calculation: MeatCalculation) => {
    if (!user) {
      toast.error('Debes estar logueado para guardar cálculos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('meat_calculations')
        .insert({
          user_id: user.id,
          title: calculation.title,
          adults: calculation.adults,
          children: calculation.children,
          big_eaters: calculation.bigEaters,
          vegetarians: calculation.vegetarians,
          meat_types: calculation.meatTypes,
          include_offal: calculation.includeOffal,
          long_event: calculation.longEvent,
          selected_cuts: calculation.selectedCuts,
          total_protein_kg: calculation.totalProteinKg,
          total_vegetables_kg: calculation.totalVegetablesKg,
          shopping_list: calculation.shoppingList
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Cálculo guardado exitosamente');
      await fetchCalculations(); // Refresh the list
      
      return data;
    } catch (err) {
      console.error('Error saving calculation:', err);
      setError('Error al guardar el cálculo');
      toast.error('Error al guardar el cálculo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchCalculations]);

  // Delete calculation
  const deleteCalculation = useCallback(async (id: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('meat_calculations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Cálculo eliminado');
      await fetchCalculations();
    } catch (err) {
      console.error('Error deleting calculation:', err);
      setError('Error al eliminar el cálculo');
      toast.error('Error al eliminar el cálculo');
    } finally {
      setLoading(false);
    }
  }, [user, fetchCalculations]);

  return {
    calculations,
    loading,
    error,
    fetchCalculations,
    calculateMeat,
    saveCalculation,
    deleteCalculation
  };
};