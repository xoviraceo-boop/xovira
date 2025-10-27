import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/trpc/root";

export const trpc = createTRPCReact<AppRouter>();
