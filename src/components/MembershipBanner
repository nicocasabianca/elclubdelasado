import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  {
    name: "Carbón",
    price: "Gs. 180.000",
    emoji: "🪨",
    description: "Ideal para iniciarte en el asado",
    highlight: false,
  },
  {
    name: "Brasas",
    price: "Gs. 280.000",
    emoji: "🔥",
    description: "Para el asador con experiencia",
    highlight: true,
  },
  {
    name: "Fuego",
    price: "Gs. 540.000",
    emoji: "🌟",
    description: "La experiencia premium del asado",
    highlight: false,
  },
];

export const MembershipBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-orange-900">
          🥩 Sumate al Club del Asado
        </h2>
        <p className="text-sm text-orange-700">
          Recibí cada mes un kit de asado con recetario paso a paso — un kit
          nuevo y distinto cada vez.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.name}
            className={`rounded-xl p-4 text-center space-y-1 border transition-shadow ${
              cat.highlight
                ? "bg-orange-500 text-white border-orange-600 shadow-md"
                : "bg-white text-orange-900 border-orange-200"
            }`}
          >
            <div className="text-2xl">{cat.emoji}</div>
            <div className="font-bold text-base">{cat.name}</div>
            <div
              className={`text-xs font-semibold ${
                cat.highlight ? "text-orange-100" : "text-orange-600"
              }`}
            >
              {cat.price} / mes
            </div>
            <div
              className={`text-xs ${
                cat.highlight ? "text-orange-100" : "text-muted-foreground"
              }`}
            >
              {cat.description}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          onClick={() => navigate("/auth?tab=register")}
        >
          Quiero ser socio
        </Button>
        <Button
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-50"
          onClick={() => navigate("/auth")}
        >
          Ya tengo cuenta, iniciar sesión
        </Button>
      </div>
    </div>
  );
};
