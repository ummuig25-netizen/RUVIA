import { Car, Leaf, Shield, Users } from "lucide-react";
import { VehicleCategory } from "../types";
import { calculateFare } from "../services/pricing";
import { cn } from "../lib/utils";

interface CategoryInfo {
  id: VehicleCategory;
  label: string;
  icon: any;
  description: string;
}

const CATEGORIES: CategoryInfo[] = [
  { id: 'standard', label: 'RUVIA Standard', icon: Car, description: 'Affordable, everyday rides' },
  { id: 'eco', label: 'RUVIA Eco', icon: Leaf, description: 'Electric & Hybrid vehicles' },
  { id: 'premium', label: 'RUVIA Premium', icon: Shield, description: 'High-end cars & top drivers' },
  { id: 'xl', label: 'RUVIA XL', icon: Users, description: 'Vans for groups up to 6' },
];

interface Props {
  distanceKm: number;
  selectedCategory: VehicleCategory;
  onSelect: (category: VehicleCategory) => void;
}

export function CategorySelector({ distanceKm, selectedCategory, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">
        Choose your ride
      </p>
      <div className="grid grid-cols-1 gap-2">
        {CATEGORIES.map((cat) => {
          const fare = calculateFare(distanceKm, cat.id);
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                isSelected
                  ? "bg-primary/10 border-primary/50 ring-1 ring-primary/50 shadow-[0_8px_20px_rgba(255,215,0,0.1)]"
                  : "bg-background/40 border-card-border hover:border-white/20"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground group-hover:bg-white/5"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{cat.label}</h3>
                  <span className={cn("font-bold text-base", isSelected ? "text-primary" : "text-foreground")}>
                    ${fare.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
