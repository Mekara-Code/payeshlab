"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (location: { latitude: number; longitude: number }) => void;
};

const defaultLocation: [number, number] = [35.6892, 51.389];

function MapLocationEvents({
  onChange,
}: {
  onChange: LocationPickerProps["onChange"];
}) {
  useMapEvents({
    click(event) {
      onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });
  return null;
}

function RecenterMap({ location }: { location: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(location, Math.max(map.getZoom(), 14), { animate: false });
  }, [location, map]);
  return null;
}

export default function InteractiveLocationMap({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const location: [number, number] =
    latitude !== null && longitude !== null
      ? [latitude, longitude]
      : defaultLocation;
  const hasLocation = latitude !== null && longitude !== null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
      <MapContainer
        center={location}
        className="h-72 w-full sm:h-96"
        scrollWheelZoom={false}
        zoom={hasLocation ? 14 : 11}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapLocationEvents onChange={onChange} />
        <RecenterMap location={location} />
        {hasLocation ? (
          <CircleMarker
            center={location}
            color="#0f766e"
            fillColor="#14b8a6"
            fillOpacity={0.95}
            radius={10}
            weight={3}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
