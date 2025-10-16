"use client";

import React from "react";
import { WindowBadge } from "./WindowBadge";
import { Navigation, MapPin } from "lucide-react";

type ParkItem = {
  id: string;
  name: string;
  comuna?: string;
  best?: { start: string; end: string; score: number; meanS: number };
  etaMin?: number;
  distance?: number;
};

interface NearbyListProps {
  items: ParkItem[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

export function NearbyList({ items, onSelect, selectedId }: NearbyListProps) {
  return (
    <div>
      <p className="text-sm text-neutral-500 mb-4">
        Ordenados por mejor ventana en próximas 3h
      </p>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="mx-auto h-8 w-8 text-neutral-400" />
          <p className="mt-2 text-sm text-neutral-500">
            No hay parques disponibles
          </p>
        </div>
      ) : (
        <ul role="list" className="space-y-3">
          {items.map((park) => (
            <li key={park.id}>
              <button
                onClick={() => onSelect(park.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all duration-180 hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 cursor-pointer ${
                  selectedId === park.id
                    ? "border-brand-500 bg-brand-50 shadow-card"
                    : "border-neutral-200 bg-white hover:bg-neutral-50"
                }`}
                aria-pressed={selectedId === park.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-neutral-900 truncate">
                        {park.name}
                      </h3>
                      {selectedId === park.id && (
                        <div
                          className="flex-shrink-0 w-2 h-2 bg-brand-500 rounded-full"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
                      <span>{park.comuna ?? ""}</span>
                      {park.distance && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {park.distance.toFixed(1)} km
                          </div>
                        </>
                      )}
                      {typeof park.etaMin === "number" && (
                        <>
                          <span>•</span>
                          <span>{park.etaMin} min</span>
                        </>
                      )}
                    </div>

                    {park.best ? (
                      <div className="space-y-2">
                        <div className="text-sm text-neutral-700">
                          <span className="font-medium">Ventana: </span>
                          {formatTime(park.best.start)} -{" "}
                          {formatTime(park.best.end)}
                        </div>
                        <WindowBadge
                          score={park.best.score}
                          label={`${park.best.meanS} km/h`}
                          size="sm"
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-500">
                        Sin ventanas en próximas 12h
                      </div>
                    )}
                  </div>

                  {/* Score principal a la derecha */}
                  {park.best && (
                    <div className="flex-shrink-0">
                      <WindowBadge score={park.best.score} size="md" />
                    </div>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {items.length > 8 && (
        <div className="mt-6 text-center">
          <button className="text-sm text-brand-600 hover:text-brand-700 font-medium cursor-pointer">
            Ver parques
          </button>
        </div>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
