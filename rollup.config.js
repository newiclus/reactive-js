import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

const pkg = {
  name: "ReactiveJS",
  version: "1.0.0",
  author: "Junihor Moran",
  license: "MIT",
};

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License
 */`;

export default {
  input: "index.js",
  output: [
    {
      file: "dist/reactive.esm.js",
      format: "es",
      banner,
      sourcemap: true,
    },
    {
      file: "dist/reactive.cjs.js",
      format: "cjs",
      banner,
      sourcemap: true,
    },
    {
      file: "dist/reactive.umd.js",
      format: "umd",
      name: "ReactiveJS",
      banner,
      sourcemap: true,
    },
    {
      file: "dist/reactive.min.js",
      format: "umd",
      name: "ReactiveJS",
      banner,
      sourcemap: true,
      plugins: [terser()],
    },
  ],
  plugins: [nodeResolve(), commonjs()],
};
