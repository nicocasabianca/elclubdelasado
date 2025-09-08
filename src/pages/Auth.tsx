import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [memberName, setMemberName] = useState("");
  const [codeId, setCodeId] = useState("");
  const [step, setStep] = useState<'code' | 'register'>('code');

  // Si ya está autenticado, redirigir al dashboard
  if (user) {
    return <Navigate to="/calculator" replace />;
  }

  const handleCodeVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('verify_access_code', {
        access_code: accessCode
      });

      if (error) {
        toast.error("Error al verificar el código");
        setLoading(false);
        return;
      }

      const result = data as { valid: boolean; error?: string; member_name?: string; code_id?: string };

      if (!result.valid) {
        toast.error(result.error || "Código inválido");
        setLoading(false);
        return;
      }

      setMemberName(result.member_name || "");
      setCodeId(result.code_id || "");
      setStep('register');
      toast.success(`¡Bienvenido ${result.member_name}! Ahora crea tu cuenta.`);
    } catch (error) {
      toast.error("Error al verificar el código");
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await signUp(email, password);
      
      if (authError || !authData.user) {
        setLoading(false);
        return;
      }

      // Marcar el código como utilizado
      const { error: markError } = await supabase.rpc('mark_code_as_used', {
        code_id: codeId,
        user_id: authData.user.id
      });

      if (markError) {
        console.error("Error marking code as used:", markError);
      }

      toast.success("¡Cuenta creada exitosamente! Redirigiendo...");
      
      // Redirect immediately after successful signup
      setTimeout(() => {
        navigate('/calculator');
      }, 1500);
      
    } catch (error) {
      toast.error("Error al crear la cuenta");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Calculadora de Asados</CardTitle>
          <CardDescription>
            {step === 'code' 
              ? 'Ingresa tu código de socio para acceder'
              : `Hola ${memberName}, crea tu cuenta para continuar`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'code' ? (
            <form onSubmit={handleCodeVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Código de Acceso</Label>
                <Input
                  id="access-code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="ASADOR001"
                  required
                  className="uppercase"
                />
                <p className="text-sm text-muted-foreground">
                  Usa tu código único de socio (ej: ASADOR001, PARRILLA001)
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading || !accessCode}>
                {loading ? "Verificando..." : "Verificar Código"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => setStep('code')}
              >
                Volver
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;