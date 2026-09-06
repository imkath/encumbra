import { PERFILES, type Perfil } from "./bandas.ts";
import type { HoraPronostico, ZonaPronostico } from "./openmeteo.ts";
import { banda } from "./score.ts";
import { ventanas } from "./ventanas.ts";

const UNA_HORA_MS = 60 * 60 * 1_000;

export function horaVigente(
  horas: readonly HoraPronostico[],
  ahora: Date,
): HoraPronostico | null {
  if (horas.length === 0) {
    return null;
  }

  const ordenadas = [...horas].sort(
    (a, b) => Date.parse(a.fecha) - Date.parse(b.fecha),
  );
  const instante = ahora.getTime();
  const activa = ordenadas.find((hora) => {
    const inicio = Date.parse(hora.fecha);
    return inicio <= instante && instante < inicio + UNA_HORA_MS;
  });

  if (activa) {
    return activa;
  }

  return (
    ordenadas.find(({ fecha }) => Date.parse(fecha) > instante) ??
    ordenadas.at(-1) ??
    null
  );
}

export function proximasDoceHoras(
  horas: readonly HoraPronostico[],
  ahora: Date,
): HoraPronostico[] {
  const ordenadas = [...horas].sort(
    (a, b) => Date.parse(a.fecha) - Date.parse(b.fecha),
  );
  const vigente = horaVigente(ordenadas, ahora);

  if (!vigente) {
    return [];
  }

  const inicio = ordenadas.findIndex(({ fecha }) => fecha === vigente.fecha);
  return ordenadas.slice(inicio, inicio + 12);
}

export function adaptarHorasAlPerfil(
  horas: readonly HoraPronostico[],
  perfil: Perfil,
): HoraPronostico[] {
  return horas.map((hora) => ({
    ...hora,
    banda: banda(hora.viento, hora.racha, perfil),
  }));
}

export function adaptarZonaAlPerfil(
  zona: ZonaPronostico,
  perfil: Perfil,
): ZonaPronostico {
  const horas = adaptarHorasAlPerfil(zona.horas, perfil);

  return {
    ...zona,
    horas,
    ventanas: ventanas(horas, perfil),
  };
}

export function zonasDondeAnda(
  zonas: readonly ZonaPronostico[],
  zonaActualId: string,
  ahora: Date,
  perfil: Perfil,
): ZonaPronostico[] {
  return zonas.filter((zona) => {
    if (zona.id === zonaActualId) {
      return false;
    }

    const hora = horaVigente(adaptarHorasAlPerfil(zona.horas, perfil), ahora);
    return hora?.banda === "ideal";
  });
}

export function fraseBrecha(
  hora: Pick<HoraPronostico, "viento" | "racha">,
  perfil: Perfil,
): string {
  if (hora.racha > PERFILES[perfil].techoRacha) {
    return "viento rachado, se te va a cortar";
  }

  const estado = banda(hora.viento, hora.racha, perfil);
  if (estado === "plancha") {
    return "falta viento para sostenerlo arriba";
  }

  if (estado === "ideal") {
    return "parejo, el volantín se queda quieto arriba";
  }

  return "tirones, anda con cola";
}
