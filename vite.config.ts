import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // `@` path alias is resolved from tsconfig.json's compilerOptions.paths.
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 8080,
  },
});
