import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type MembershipCategory = "Fuego" | "Brasas" | "Carbón" | "Digital";

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  membership_category: MembershipCategory;
  profile_picture_url: string;
  birth_date: string;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar perfil del usuario
  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Crear o actualizar perfil
  const upsertProfile = async (profileData: Omit<Profile, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return { error: "Usuario no autenticado" };

    try {
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...profileData,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo guardar el perfil",
          variant: "destructive",
        });
        return { error: error.message };
      }

      setProfile(data);
      toast({
        title: "¡Perfil guardado!",
        description: "Tu información se ha guardado correctamente",
      });
      return { data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    }
  };

  // Subir imagen de perfil
  const uploadProfilePicture = async (file: File): Promise<{ url?: string; error?: string }> => {
    if (!user) return { error: "Usuario no autenticado" };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile.${fileExt}`;

      // Eliminar imagen anterior si existe
      await supabase.storage
        .from('profile-pictures')
        .remove([fileName]);

      // Subir nueva imagen
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        return { error: uploadError.message };
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      return { url: publicUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al subir imagen";
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    upsertProfile,
    uploadProfilePicture,
    refetch: fetchProfile,
  };
};