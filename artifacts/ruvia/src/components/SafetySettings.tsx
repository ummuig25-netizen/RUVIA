import { useState } from "react";
import { Plus, Trash2, ShieldCheck, Phone } from "lucide-react";
import { toast } from "sonner";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

export function SafetySettings() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const addContact = () => {
    if (!newName || !newPhone) {
      toast.error("Please fill in both name and phone.");
      return;
    }
    const newContact: EmergencyContact = {
      id: crypto.randomUUID(),
      name: newName,
      phone: newPhone,
    };
    setContacts([...contacts, newContact]);
    setNewName("");
    setNewPhone("");
    toast.success("Emergency contact added.");
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
    toast.info("Contact removed.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Círculos de Confianza</h3>
          <p className="text-sm text-muted-foreground">Manage your emergency contacts</p>
        </div>
      </div>

      <div className="space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-4 rounded-2xl bg-card border border-card-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-muted-foreground">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.phone}</p>
              </div>
            </div>
            <button
              onClick={() => removeContact(contact.id)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-card-border text-muted-foreground">
            <p className="text-sm">No emergency contacts added yet.</p>
          </div>
        )}
      </div>

      <div className="p-5 rounded-3xl glass space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-primary font-bold">New Trusted Contact</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/50"
          />
          <input
            type="text"
            placeholder="Phone"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/50"
          />
        </div>
        <button
          onClick={addContact}
          className="w-full py-3.5 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(255,215,0,0.2)]"
        >
          <Plus className="w-5 h-5" />
          Add to Circles
        </button>
      </div>

    </div>
  );
}
