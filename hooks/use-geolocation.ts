"use client";

import { useState, useEffect } from "react";

// Interface para el estado de geolocalización
interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

// Claves de localStorage para persistir permisos y ubicación
const LOCATION_STORAGE_KEY = "encumbra_location_permission";
const LOCATION_DATA_KEY = "encumbra_last_location";

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    // Verificar si el navegador soporta geolocalización
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        error: "Geolocalización no disponible",
        loading: false,
      });
      return;
    }

    // Revisar si tenemos datos en caché
    const cachedPermission = localStorage.getItem(LOCATION_STORAGE_KEY);
    const cachedLocation = localStorage.getItem(LOCATION_DATA_KEY);

    // Si el permiso fue denegado previamente, no pedir de nuevo
    if (cachedPermission === "denied") {
      setState({
        latitude: null,
        longitude: null,
        error: null, // No mostrar error, simplemente no tener ubicación
        loading: false,
      });
      return;
    }

    // Si tenemos permisos y datos en caché, SIEMPRE usar esos datos sin pedir ubicación
    if (cachedPermission === "granted" && cachedLocation) {
      try {
        const location = JSON.parse(cachedLocation);

        // Usar ubicación guardada independientemente de la edad
        // El usuario puede refrescar manualmente si quiere actualizar
        setState({
          latitude: location.latitude,
          longitude: location.longitude,
          error: null,
          loading: false,
        });

        // IMPORTANTE: NO llamar a getCurrentPosition() aquí
        // Esto evita que se muestre el popup del navegador
        return;
      } catch (e) {
        console.error("Error al parsear ubicación en caché:", e);
        // Si hay error parseando, limpiar y solicitar de nuevo
        localStorage.removeItem(LOCATION_DATA_KEY);
        localStorage.removeItem(LOCATION_STORAGE_KEY);
      }
    }

    // Solo solicitar geolocalización si NO hay datos en caché
    requestLocation();

    function requestLocation() {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now(),
          };

          // Guardar permisos y ubicación en localStorage para persistencia
          localStorage.setItem(LOCATION_STORAGE_KEY, "granted");
          localStorage.setItem(LOCATION_DATA_KEY, JSON.stringify(locationData));

          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
            loading: false,
          });
        },
        (error) => {
          console.error("[Encumbra] Error de geolocalización:", error);

          // Guardar permiso denegado para no volver a preguntar
          localStorage.setItem(LOCATION_STORAGE_KEY, "denied");

          setState({
            latitude: null,
            longitude: null,
            error: null,
            loading: false,
          });
        },
        {
          timeout: 10000,
          maximumAge: 300000, // 5 minutos
          enableHighAccuracy: false,
        }
      );
    }
  }, []);

  return state;
}
