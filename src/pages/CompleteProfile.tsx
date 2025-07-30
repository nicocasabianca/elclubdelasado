import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import ProfileForm from "@/components/ProfileForm";

const CompleteProfile = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    // Si no hay usuario, redirigir a auth
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    // Si ya tiene perfil completo, redirigir al dashboard
    if (!loading && profile) {
      navigate("/dashboard");
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <ProfileForm onComplete={() => navigate("/dashboard")} />;
};

export default CompleteProfile;