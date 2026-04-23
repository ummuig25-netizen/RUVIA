import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from "react-leaflet";
import { useEffect, ReactNode } from "react";
import type { Coords } from "../../types";
import { passengerIcon, driverIcon, driverActiveIcon, destinationIcon } from "./markers";

interface DriverPin {
  id: string;
  coords: Coords;
  active?: boolean;
}

interface Props {
  center: Coords;
  passenger?: Coords | null;
  drivers?: DriverPin[];
  destination?: Coords | null;
  routeFrom?: Coords | null;
  routeTo?: Coords | null;
  onMapClick?: (c: Coords) => void;
  followCenter?: boolean;
  children?: ReactNode;
}

function MapBehavior({ center, followCenter, onClick }: { center: Coords; followCenter?: boolean; onClick?: (c: Coords) => void }) {
  const map = useMap();

  useEffect(() => {
    if (followCenter) {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
    }
  }, [center.lat, center.lng, followCenter, map]);

  useMapEvents({
    click(e) {
      onClick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}

export function MapView({
  center,
  passenger,
  drivers = [],
  destination,
  routeFrom,
  routeTo,
  onMapClick,
  followCenter,
  children,
}: Props) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      zoomControl={false}
      attributionControl={false}
      className="w-full h-full"
      style={{ background: "#0a0a0a" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
        subdomains="abcd"
        maxZoom={20}
      />
      <MapBehavior center={center} followCenter={followCenter} onClick={onMapClick} />

      {drivers.map((d) => (
        <Marker key={d.id} position={[d.coords.lat, d.coords.lng]} icon={d.active ? driverActiveIcon : driverIcon} />
      ))}

      {passenger && <Marker position={[passenger.lat, passenger.lng]} icon={passengerIcon} />}

      {destination && <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />}

      {routeFrom && routeTo && (
        <Polyline
          positions={[
            [routeFrom.lat, routeFrom.lng],
            [routeTo.lat, routeTo.lng],
          ]}
          pathOptions={{ color: "#FFD700", weight: 4, opacity: 0.85, dashArray: "8 8" }}
        />
      )}

      {children}
    </MapContainer>
  );
}
