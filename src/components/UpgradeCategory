import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useProfile, MembershipCategory } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES: {
  name: MembershipCategory;
  price: string;
  emoji: string;
  description: string;
}[] = [
  {
    name: "Carbón",
    price: "Gs. 180.000",
    emoji: "🪨",
    description: "Kit mensual básico con recetario",
  },
  {
    name: "Brasas",
    price: "Gs. 280.000",
    emoji: "🔥",
    description: "Kit mensual ampliado con recetario y extras",
  },
  {
    name: "Fuego",
    price: "Gs. 540.000",
    emoji: "🌟",
    description: "Kit premium completo — la experiencia máxima",
  },
];

const CATEGORY_ORDER: MembershipCategory[] = ["Digital", "Carbón", "Brasas", "Fuego"];

const isUpgrade = (current: MembershipCategory, target: MembershipCategory) => {
  return CATEGORY_ORDER.indexOf(target) > CATEGORY_ORDER.indexOf(current);
};

export const UpgradeCategory = () => {
  const { profile, upsertProfile } = useProfile();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MembershipCategory | null>(null);
  const [loading, setLoading] = useState(false);

  if (!profile) return null;

  const availableUpgrades = CATEGORIES.filter((c) =>
    isUpgrade(profile.membership_category, c.name)
  );

  if (availableUpgrades.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 text-center">
        🏆 ¡Ya estás en la categoría máxima <strong>Fuego</strong>!
      </div>
    );
  }

  const handleUpgrade = async () => {
    if (!selected || !profile) return;
    setLoading(true);
    const result = await upsertProfile({
      first_name: profile.first_name,
      last_name: profile.last_name,
      membership_category: selected,
      profile_picture_url: profile.profile_picture_url,
      birth_date: profile.birth_date,
    });
    setLoading(false);
    if (!result?.error) {
      toast({
        title: "¡Solicitud enviada!",
        description: `Tu solicitud de upgrade a ${selected} fue enviada. El admin la aprobará pronto.`,
      });
      setOpen(false);
      setSelected(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-50 w-full sm:w-auto"
        >
          ⬆️ Hacer upgrade de categoría
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade de categoría</DialogTitle>
          <DialogDescription>
            Actualmente sos socio{" "}
            <Badge variant="secondary">{profile.membership_category}</Badge>.
            Elegí la nueva categoría — el admin aprobará el cambio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {availableUpgrades.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelected(cat.name)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                selected === cat.name
                  ? "border-orange-500 bg-orange-50 ring-2 ring-orange-400"
                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm">{cat.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {cat.description}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold text-orange-600">
                  {cat.price}
                  <span className="text-xs font-normal text-muted-foreground">
                    /mes
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!selected || loading}
            onClick={handleUpgrade}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? "Enviando..." : "Solicitar upgrade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
