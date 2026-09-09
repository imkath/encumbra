import { getPronostico } from "@/lib/openmeteo.ts";

export async function GET(): Promise<Response> {
  return Response.json(await getPronostico());
}
