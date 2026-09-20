import { getPronostico } from "@/server/pronostico.ts";

export async function GET(): Promise<Response> {
  return Response.json(await getPronostico());
}
