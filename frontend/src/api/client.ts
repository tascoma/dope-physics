// Typed wrappers around the generated OpenAPI schema, built on the existing
// fetch wrapper in lib/api.ts. Regenerate schema.d.ts whenever
// backend/app/schemas/ballistics.py changes:
//   npx openapi-typescript http://localhost:8000/openapi.json -o src/api/schema.d.ts
import { api } from "../lib/api";
import type { components } from "./schema";

export type ShotIn = components["schemas"]["ShotIn"];
export type SolutionOut = components["schemas"]["SolutionOut"];
export type CartridgeOut = components["schemas"]["CartridgeOut"];

export const getCartridges = () => api.get<CartridgeOut[]>("/cartridges");

export const postSolve = (body: ShotIn) => api.post<SolutionOut>("/solve", body);

export const postTrue = (body: unknown) => api.post<void>("/true", body);
