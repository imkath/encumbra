import { EncumbraApp } from "@/components/EncumbraApp.tsx";
import { getPronostico } from "@/server/pronostico.ts";
import type { Perfil } from "@/lib/bandas.ts";
export const dynamic = "force-dynamic";
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export default async function Home({ searchParams }: Props) {
  const [inicial, params] = await Promise.all([getPronostico(), searchParams]);
  const texto = (key: string) =>
    typeof params[key] === "string" ? params[key] : undefined;
  const candidato = texto("perfil");
  const perfil: Perfil =
    candidato === "liviano" || candidato === "acrobatico"
      ? candidato
      : "estandar";
  const vista = texto("vista");
  return (
    <EncumbraApp
      inicial={inicial}
      perfilInicial={perfil}
      parqueInicial={texto("parque")}
      zonaInicial={texto("zona")}
      vistaInicial={vista === "salida" || vista === "guia" ? vista : "parques"}
      servidoEn={new Date().toISOString()}
    />
  );
}
