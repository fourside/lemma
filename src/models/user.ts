import * as v from "valibot";

export const LoginRequestSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  password: v.pipe(v.string(), v.minLength(1)),
});

export type LoginRequest = v.InferOutput<typeof LoginRequestSchema>;

export interface User {
  id: number;
  name: string;
}
