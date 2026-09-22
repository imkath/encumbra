import { elegirParqueInicial } from "@/lib/salida.ts";
import { Vivo } from "@/components/Vivo.tsx";
import type { Perfil } from "@/lib/bandas.ts";
import { getPronostico } from "@/server/pronostico.ts";
import { ZONAS } from "@/lib/zonas.ts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modo de terreno",
  description:
    "Consulta en terreno el viento, las rachas, la dirección y el tiempo de luz disponible.",
  alternates: { canonical: "/volar" },
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

type VolarProps = {
  readonly searchParams: Promise<{
    readonly perfil?: string | string[];
    readonly zona?: string | string[];
    readonly parque?: string | string[];
    readonly destino?: string | string[];
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
  const desdeUbicacion = parametros.destino === "ubicacion";
  const parquePedido =
    typeof parametros.parque === "string" ? parametros.parque : undefined;
  const parqueInicial =
    desdeUbicacion || !parquePedido
      ? undefined
      : elegirParqueInicial(parquePedido, zonaInicial);

  return (
    <Vivo
      inicial={pronostico}
      perfilInicial={perfilInicial}
      zonaInicial={zonaInicial}
      parqueInicial={parqueInicial?.id}
      coordenadasParqueInicial={
        parqueInicial
          ? { lat: parqueInicial.lat, lon: parqueInicial.lon }
          : undefined
      }
      desdeUbicacion={desdeUbicacion}
      servidoEn={new Date().toISOString()}
    />
  );
}
