"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SANTIAGO_PARKS } from "@/lib/parks-data";
import type { Park } from "@/lib/types";

interface InteractiveMapProps {
  selectedPark: Park | null;
  onSelectPark: (park: Park) => void;
  userLocation: { latitude: number; longitude: number } | null;
}

export function InteractiveMap({
  selectedPark,
  onSelectPark,
  userLocation,
}: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const hasZoomedRef = useRef(false); // Track if we've zoomed to a park

  useEffect(() => {
    if (!mapRef.current) {
      // Inicializar mapa centrado en Santiago con zoom que muestre toda la ciudad
      // Mobile-optimized options
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

      const map = L.map("map", {
        // Disable double-tap zoom delay for better mobile UX
        tap: true,
        tapTolerance: 15,
        // Improve touch interactions
        touchZoom: true,
        scrollWheelZoom: !isMobile, // Disable scroll zoom on mobile
        doubleClickZoom: true,
        // Smoother animations
        zoomAnimation: true,
        markerZoomAnimation: true,
      }).setView([-33.4489, -70.6693], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        // Improve tile loading on mobile
        detectRetina: true,
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
      hasZoomedRef.current = false; // Reset zoom tracking on init
    }

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Añadir marcadores de parques con colores estilo Google Maps
    // Larger markers on mobile for better tap targets
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const markerSize = isMobile ? 36 : 24;
    const selectedMarkerSize = isMobile ? 44 : 32;

    SANTIAGO_PARKS.forEach((park) => {
      const isSelected = selectedPark?.id === park.id;
      const size = isSelected ? selectedMarkerSize : markerSize;

      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            position: relative;
            width: ${size}px;
            height: ${size}px;
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              background: ${isSelected ? "#EA4335" : "#34A853"};
              border: 3px solid white;
              border-radius: 50%;
              width: 100%;
              height: 100%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              touch-action: manipulation;
            ">
              ${
                isSelected
                  ? `<div style="color: white; font-size: ${isMobile ? 20 : 16}px; font-weight: bold;">★</div>`
                  : ""
              }
            </div>
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([park.lat, park.lon], { icon })
        .addTo(mapRef.current!)
        .bindPopup(
          `<strong>${park.name}</strong><br/>${park.comuna}<br/><small>Click para ver detalles</small>`
        )
        .on("click", () => {
          onSelectPark(park);
        });

      markersRef.current.push(marker);
    });

    // Añadir marcador de ubicación del usuario estilo Google Maps (punto azul)
    if (userLocation) {
      const userIcon = L.divIcon({
        className: "user-marker",
        html: `
          <div style="
            position: relative;
            width: 24px;
            height: 24px;
          ">
            <div style="
              position: absolute;
              top: 4px;
              left: 4px;
              background: #4285F4;
              border: 3px solid white;
              border-radius: 50%;
              width: 16px;
              height: 16px;
              box-shadow: 0 2px 8px rgba(66,133,244,0.6);
            "></div>
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              background: rgba(66,133,244,0.2);
              border-radius: 50%;
              width: 24px;
              height: 24px;
              animation: pulse 2s infinite;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0% {
                transform: scale(1);
                opacity: 1;
              }
              50% {
                transform: scale(1.3);
                opacity: 0.5;
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
          </style>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const userMarker = L.marker(
        [userLocation.latitude, userLocation.longitude],
        { icon: userIcon }
      )
        .addTo(mapRef.current!)
        .bindPopup("<strong>Tu ubicación</strong>");

      markersRef.current.push(userMarker);
    }

    // No hacer zoom automático la primera vez que se carga el mapa
    // Solo hacer zoom si el usuario hace click en un parque después de cargar
    // Esto mantiene la vista completa de Santiago al abrir "Elegir parque"
    if (!hasZoomedRef.current) {
      // Primera carga: mantener vista de Santiago completa
      mapRef.current.setView([-33.4489, -70.6693], 11, {
        animate: false,
      });
      hasZoomedRef.current = true;
    } else if (selectedPark && selectedPark !== null) {
      // Después de la primera carga, hacer zoom al parque seleccionado
      mapRef.current.setView([selectedPark.lat, selectedPark.lon], 14, {
        animate: true,
      });
    }
  }, [selectedPark, onSelectPark, userLocation]);

  return <div id="map" style={{ height: "100%", width: "100%" }} />;
}
