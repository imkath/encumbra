import { elegirParqueInicial } from "@/lib/salida.ts";
import { Vivo } from "@/components/Vivo.tsx";
import type { Perfil } from "@/lib/bandas.ts";
import { getPronostico } from "@/server/pronostico.ts";
import { ZONAS } from "@/lib/zonas.ts";

export const dynamic = "force-dynamic";

type VolarProps = {
  readonly searchParams: Promise<{
    readonly perfil?: string | string[];
    readonly zona?: string | string[];
    readonly parque?: string | string[];
  }>;
};

const PERFILES: readonly Perfil[] = ["liviano", "estandar", "acrobatico"];

export default async function Volar({ searchParams }: VolarProps) {
  const [pronostico, parametros] = await Promise.all([
    getPronostico(),
    searchParams,
  ]);
  const zonaPedida =
    typeof parametros.zona === "string" ? parametros.zona : undefined;
  const perfilInicial =
    typeof parametros.perfil === "string" &&
    PERFILES.includes(parametros.perfil as Perfil)
      ? (parametros.perfil as Perfil)
      : "estandar";
  const zonaInicial =
    pronostico.estado === "sin-datos"
      ? (ZONAS.find(({ id }) => id === zonaPedida)?.id ?? ZONAS[0].id)
      : (pronostico.zonas.find(({ id }) => id === zonaPedida)?.id ??
        pronostico.zonas[0]?.id ??
        ZONAS[0].id);

  return (
    <Vivo
      inicial={pronostico}
      perfilInicial={perfilInicial}
      zonaInicial={zonaInicial}
      parqueInicial={
        elegirParqueInicial(
          typeof parametros.parque === "string" ? parametros.parque : undefined,
          zonaInicial,
        ).id
      }
      servidoEn={new Date().toISOString()}
    />
  );
}
