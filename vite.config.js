import { defineConfig } from "vite";
import { resolve } from "path";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  build: {
    // Directorio de salida
    outDir: "dist",
    // Minificación de JavaScript
    minify: "terser",
    // Configuración de Terser para minificación más agresiva
    terserOptions: {
      compress: {
        drop_console: true, // Elimina console.log en producción
        drop_debugger: true,
        pure_funcs: [
          "console.log",
          "console.info",
          "console.debug",
          "console.warn",
        ],
      },
      format: {
        comments: false, // Elimina comentarios
      },
    },
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          // Agrega más chunks según tus dependencias
        },
        // Nombres de archivo más cortos
        chunkFileNames: "assets/[hash].js",
        entryFileNames: "assets/[hash].js",
        assetFileNames: "assets/[hash].[ext]",
      },
    },
    // Optimización de assets
    assetsInlineLimit: 4096, // Archivos menores a 4kb se convierten en base64
    // Generación de sourcemaps
    sourcemap: false, // Desactiva sourcemaps en producción para reducir tamaño
  },
  // Plugins para compresión
  plugins: [
    viteCompression({
      algorithm: "gzip", // Compresión gzip
      ext: ".gz",
      deleteOriginFile: false, // Mantiene el archivo original
    }),
    viteCompression({
      algorithm: "brotliCompress", // Compresión brotli (mejor que gzip)
      ext: ".br",
      deleteOriginFile: false,
    }),
  ],
  // Optimización de CSS
  css: {
    devSourcemap: false,
    modules: {
      localsConvention: "camelCase",
    },
  },
  // Resolución de módulos
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
