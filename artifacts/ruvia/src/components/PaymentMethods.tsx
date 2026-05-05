import { CreditCard, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

interface PaymentMethod {
  id: string;
  type: 'card' | 'bizum' | 'cash';
  label: string;
  last4?: string;
  isDefault?: boolean;
}

export function PaymentMethods() {
  const [methods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', label: 'Visa', last4: '4242', isDefault: true },
    { id: '2', type: 'bizum', label: 'Bizum' },
    { id: '3', type: 'cash', label: 'Efectivo' },
  ]);

  const [selected, setSelected] = useState('1');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Método de Pago</p>
        <button className="text-[10px] text-primary font-bold flex items-center gap-1 hover:underline">
          <Plus className="w-3 h-3" /> Añadir
        </button>
      </div>

      <div className="space-y-2">
        {methods.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
              selected === m.id
                ? "bg-primary/5 border-primary/40 ring-1 ring-primary/40"
                : "bg-background border-border hover:border-muted-foreground/30"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              selected === m.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            )}>
              {m.type === 'card' ? <CreditCard className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold">{m.label} {m.last4 ? `•••• ${m.last4}` : ''}</p>
              {m.isDefault && <p className="text-[9px] text-primary font-medium">Predeterminado</p>}
            </div>
            <div className={cn(
              "w-4 h-4 rounded-full border flex items-center justify-center",
              selected === m.id ? "border-primary bg-primary" : "border-border"
            )}>
              {selected === m.id && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
