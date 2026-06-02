"use client";

import { useEffect, useRef } from "react";

interface DealerMapProps {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
  zoom?: number;
  className?: string;
}

// Dynamically loaded Leaflet - no SSR issues, zero cost (OpenStreetMap tiles are free)
export function DealerMap({ latitude, longitude, name, address, zoom = 15, className = "h-64 w-full rounded-xl" }: DealerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamic import to avoid SSR issues with Leaflet
    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix default marker icon path issue with Webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current).setView([latitude, longitude], zoom);

      // OpenStreetMap tiles - completely free, no API key
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Marker with popup
      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(`<strong>${name}</strong>${address ? `<br/><span style="font-size:12px;color:#666">${address}</span>` : ""}`)
        .openPopup();

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, name, address, zoom]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100">
      <div ref={mapRef} className={className} />
      <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">© OpenStreetMap contributors</span>
        <a
          href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gold-700 hover:underline"
        >
          Open in Maps →
        </a>
      </div>
    </div>
  );
}

// Static map thumbnail using free OSM static tiles (no JS required)
export function StaticMapThumbnail({ latitude, longitude, zoom = 14, width = 400, height = 200 }: {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: number;
  height?: number;
}) {
  // Using staticmap.openstreetmap.de - free static tile service
  const url = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=${width}x${height}&markers=${latitude},${longitude},red-pushpin`;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="Dealership location map"
      width={width}
      height={height}
      className="w-full object-cover rounded-lg"
      loading="lazy"
    />
  );
}
