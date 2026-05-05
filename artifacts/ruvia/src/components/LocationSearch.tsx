import { Search, MapPin, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Coords } from "../types";
import { useDebounce } from "../hooks/useDebounce";

interface Props {
  onSelect: (coords: Coords, address: string) => void;
  placeholder?: string;
}

export function LocationSearch({ onSelect, placeholder = "Search for a place or address..." }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 500);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        // Use Nominatim (OSM) for all of Spain
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&countrycodes=es&limit=10&addressdetails=1`
        );
        const data = await res.json();
        setResults(data);
        setOpen(true);
      } catch (err) {
        console.error("Geocoding failed:", err);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-background/60 border border-card-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/60 transition-all shadow-inner"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden z-[1000] glass animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[320px] overflow-y-auto">
            {results.map((r, i) => {
              // Nominatim returns a display_name, but sometimes the 'address' object has better parts
              const addr = r.address || {};
              const mainName = addr.amenity || addr.building || addr.office || addr.school || addr.university || addr.industrial || addr.commercial || r.display_name.split(',')[0];
              const subName = r.display_name.split(',').slice(1).join(',').trim();
              
              return (
                <button
                  key={i}
                  onClick={() => {
                    onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) }, r.display_name);
                    setQuery(mainName);
                    setOpen(false);
                  }}
                  className="w-full flex items-start gap-4 p-4 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0 group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-semibold text-foreground truncate">{mainName}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-1 leading-relaxed">{subName}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
