"use client";

import dynamic from "next/dynamic";

type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onChange: (location: { latitude: number; longitude: number }) => void;
};

const InteractiveLocationMap = dynamic(
  () => import("@/components/admin/interactive-location-map"),
  {
    loading: () => (
      <div className="grid h-72 place-items-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-500 sm:h-96">
        در حال آماده‌سازی نقشه…
      </div>
    ),
    ssr: false,
  },
);

export function LocationPicker(props: LocationPickerProps) {
  return <InteractiveLocationMap {...props} />;
}
