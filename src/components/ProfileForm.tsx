import { useState, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Camera, Upload, CalendarIcon } from "lucide-react";
import { useProfile, MembershipCategory } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
  onComplete?: () => void;
}

const MEMBERSHIP_CATEGORIES: { value: MembershipCategory; label: string; description: string }[] = [
  { value: "Fuego", label: "Fuego 🔥", description: "Asador experto con técnicas avanzadas" },
  { value: "Brasas", label: "Brasas 🔴", description: "Asador intermedio con buena experiencia" },
  { value: "Carbón", label: "Carbón ⚫", description: "Asador principiante aprendiendo" },
  { value: "Digital", label: "Digital 📱", description: "Miembro virtual del club" },
];

const ProfileForm = ({ onComplete }: ProfileFormProps) => {
  const { profile, upsertProfile, uploadProfilePicture } = useProfile();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    membership_category: profile?.membership_category || ("" as MembershipCategory),
    birth_date: profile?.birth_date || new Date(new Date().getFullYear() - 25, 0, 1).toISOString().split('T')[0],
    profile_picture_url: profile?.profile_picture_url || "",
  });

  const [birthDate, setBirthDate] = useState<Date | undefined>(
    profile?.birth_date ? new Date(profile.birth_date) : undefined
  );

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones
    if (file.size > 5 * 1024 * 1024) { // 5MB
      alert("La imagen no puede ser mayor a 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Por favor selecciona un archivo de imagen");
      return;
    }

    setImageUploading(true);

    // Preview local
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir a Supabase
    const { url, error } = await uploadProfilePicture(file);
    
    if (error) {
      alert(`Error al subir imagen: ${error}`);
      setPreviewUrl(null);
    } else if (url) {
      setFormData(prev => ({ ...prev, profile_picture_url: url }));
    }

    setImageUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.profile_picture_url) {
      alert("Por favor sube una foto de perfil");
      return;
    }

    setLoading(true);

    const { error } = await upsertProfile(formData);
    
    if (!error) {
      onComplete?.();
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Completa tu Perfil</CardTitle>
          <CardDescription>
            Comparte tu información para ser parte del Club del Asado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto de perfil */}
            <div className="flex flex-col items-center space-y-4">
              <div 
                className="relative cursor-pointer group"
                onClick={handleImageClick}
              >
                <Avatar className="w-32 h-32">
                  <AvatarImage 
                    src={previewUrl || formData.profile_picture_url} 
                    alt="Foto de perfil" 
                  />
                  <AvatarFallback className="text-2xl">
                    <Camera className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                {imageUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <Label className="text-sm text-muted-foreground text-center">
                Haz clic para subir tu foto de perfil (máx. 5MB)
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Información personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Tu apellido"
                  required
                />
              </div>
            </div>

            {/* Fecha de nacimiento */}
            <div className="space-y-2">
              <Label>Fecha de Nacimiento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? (
                      format(birthDate, "PPP", { locale: es })
                    ) : (
                      <span>Selecciona tu fecha de nacimiento</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={(date) => {
                      setBirthDate(date);
                      if (date) {
                        setFormData(prev => ({ 
                          ...prev, 
                          birth_date: date.toISOString().split('T')[0] 
                        }));
                      }
                    }}
                    disabled={(date) =>
                      date > new Date(new Date().getFullYear() - 18, 11, 31) || 
                      date < new Date(new Date().getFullYear() - 80, 0, 1)
                    }
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    captionLayout="dropdown-buttons"
                    fromYear={new Date().getFullYear() - 80}
                    toYear={new Date().getFullYear() - 18}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-muted-foreground">
                Debes tener entre 18 y 80 años para unirte al club
              </p>
            </div>

            {/* Categoría de membresía */}
            <div className="space-y-2">
              <Label>Categoría de Membresía *</Label>
              <Select
                value={formData.membership_category}
                onValueChange={(value: MembershipCategory) => 
                  setFormData(prev => ({ ...prev, membership_category: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu nivel de experiencia" />
                </SelectTrigger>
                <SelectContent>
                  {MEMBERSHIP_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{category.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || imageUploading}
              size="lg"
            >
              {loading ? "Guardando..." : "Completar Perfil"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileForm;