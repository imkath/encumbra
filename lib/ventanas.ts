import type { BandaId, Perfil } from "./bandas.ts";
import { banda } from "./score.ts";

const UNA_HORA_MS = 60 * 60 * 1_000;

export type Hora = {
  readonly fecha: string;
  readonly viento: number;
  readonly racha: number;
};

export type Ventana = {
  readonly inicio: string;
  readonly fin: string;
  readonly banda: BandaId;
  readonly vientoMedio: number;
  readonly rachaMax: number;
  readonly brecha: number;
};

export function ventanas(horas: readonly Hora[], perfil: Perfil): Ventana[] {
  const ordenadas = [...horas].sort(
    (a, b) => Date.parse(a.fecha) - Date.parse(b.fecha),
  );
  const resultado: Ventana[] = [];
  let tramo: Hora[] = [];

  const cerrarTramo = (): void => {
    if (tramo.length === 0) {
      return;
    }

    const primera = tramo[0];
    const ultima = tramo.at(-1);

    if (!primera || !ultima) {
      return;
    }

    const vientoMedio =
      tramo.reduce((total, hora) => total + hora.viento, 0) / tramo.length;
    const rachaMax = Math.max(...tramo.map((hora) => hora.racha));

    resultado.push({
      inicio: primera.fecha,
      fin: new Date(Date.parse(ultima.fecha) + UNA_HORA_MS).toISOString(),
      banda: "ideal",
      vientoMedio,
      rachaMax,
      brecha: rachaMax - vientoMedio,
    });
    tramo = [];
  };

  for (const hora of ordenadas) {
    if (banda(hora.viento, hora.racha, perfil) !== "ideal") {
      cerrarTramo();
      continue;
    }

    const anterior = tramo.at(-1);
    const esContigua =
      !anterior ||
      Date.parse(hora.fecha) - Date.parse(anterior.fecha) === UNA_HORA_MS;

    if (!esContigua) {
      cerrarTramo();
    }

    tramo.push(hora);
  }

  cerrarTramo();
  return resultado;
}

export function ventanaActiva(
  candidatas: readonly Ventana[],
  ahora: Date,
): Ventana | null {
  const instante = ahora.getTime();

  return (
    candidatas.find(
      ({ inicio, fin }) =>
        Date.parse(inicio) <= instante && instante < Date.parse(fin),
    ) ?? null
  );
}

export function proximaVentana(
  candidatas: readonly Ventana[],
  ahora: Date,
): Ventana | null {
  const instante = ahora.getTime();

  return (
    candidatas
      .filter(({ inicio }) => Date.parse(inicio) > instante)
      .sort((a, b) => Date.parse(a.inicio) - Date.parse(b.inicio))[0] ?? null
  );
}
