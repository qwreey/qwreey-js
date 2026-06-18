import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import path from "node:path";
import { name } from "./package.json";

const formattedName = name.match(/[^/]+$/)?.[0] ?? name;

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true })],
  build: {
    copyPublicDir: false,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: formattedName,
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "@qwreey-js/react-util",
        "@qwreey-js/ts-util",
      ],
      output: {
        globals: {
          react: "React",
          "react/jsx-runtime": "react/jsx-runtime",
          "react-dom": "ReactDOM",
          "@qwreey-js/react-util": "@qwreey-js/react-util",
          "@qwreey-js/ts-util": "@qwreey-js/ts-util",
        },
      },
    },
  },
});
