import { getPronostico } from "@/lib/openmeteo.ts";

export const runtime = "edge";

export async function GET(): Promise<Response> {
  return Response.json(await getPronostico());
}
