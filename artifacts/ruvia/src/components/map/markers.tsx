import L from "leaflet";

export const passengerIcon = L.divIcon({
  className: "ruvia-passenger-marker",
  html: `<div class="relative w-4 h-4">
    <span class="absolute inset-0 rounded-full bg-white/30 animate-ping"></span>
    <span class="absolute inset-0 rounded-full bg-white border-2 border-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.8)]"></span>
  </div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export const driverIcon = L.divIcon({
  className: "ruvia-driver-marker",
  html: `<div class="flex items-center justify-center w-9 h-9 rounded-xl bg-[#FFD700] text-black shadow-[0_4px_18px_rgba(255,215,0,0.45)] border border-black/20">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export const driverActiveIcon = L.divIcon({
  className: "ruvia-driver-marker",
  html: `<div class="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FFD700] text-black shadow-[0_4px_24px_rgba(255,215,0,0.7)] ring-2 ring-white">
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export const destinationIcon = L.divIcon({
  className: "ruvia-destination-marker",
  html: `<div class="relative">
    <div class="w-6 h-6 rounded-full bg-[#FFD700] border-2 border-black shadow-lg flex items-center justify-center">
      <div class="w-2 h-2 rounded-full bg-black"></div>
    </div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
