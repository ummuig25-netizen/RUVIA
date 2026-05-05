import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from "react-leaflet";
import { useEffect, ReactNode, useState } from "react";
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

function AnimatedPolyline({ positions, color = "#FFD700" }: { positions: [number, number][]; color?: string }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setOffset((prev) => (prev - 0.5) % 30);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      {/* Outer glow */}
      <Polyline
        positions={positions}
        pathOptions={{
          color,
          weight: 10,
          opacity: 0.15,
          lineCap: "round",
        }}
      />
      {/* Middle glow */}
      <Polyline
        positions={positions}
        pathOptions={{
          color,
          weight: 6,
          opacity: 0.3,
          lineCap: "round",
        }}
      />
      {/* Main animated line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color,
          weight: 4,
          opacity: 1,
          dashArray: "15 15",
          dashOffset: offset.toString(),
          lineCap: "round",
        }}
      />
    </>
  );
}

function MapBehavior({ center, followCenter, onClick, passenger, destination }: { center: Coords; followCenter?: boolean; onClick?: (c: Coords) => void; passenger?: Coords | null; destination?: Coords | null }) {
  const map = useMap();

  useEffect(() => {
    if (followCenter) {
      map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
    }
  }, [center.lat, center.lng, followCenter, map]);

  useEffect(() => {
    if (passenger && destination) {
      const bounds: [number, number][] = [
        [passenger.lat, passenger.lng],
        [destination.lat, destination.lng],
      ];
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [passenger, destination, map]);

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
      style={{ background: "#f8fafc" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
        subdomains="abcd"
        maxZoom={20}
      />
      <MapBehavior 
        center={center} 
        followCenter={followCenter} 
        onClick={onMapClick} 
        passenger={passenger}
        destination={destination}
      />

      {drivers.map((d) => (
        <Marker key={d.id} position={[d.coords.lat, d.coords.lng]} icon={d.active ? driverActiveIcon : driverIcon} />
      ))}

      {passenger && <Marker position={[passenger.lat, passenger.lng]} icon={passengerIcon} />}

      {destination && <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />}

      {routeFrom && routeTo && (
        <AnimatedPolyline
          positions={[
            [routeFrom.lat, routeFrom.lng],
            [routeTo.lat, routeTo.lng],
          ]}
        />
      )}

      {children}
    </MapContainer>
  );
}
