import { viteSingleFile } from "vite-plugin-singlefile"

const defineConfig = {
  minify: 'terser', // 开启压缩混淆

	plugins: [viteSingleFile()],
};
export default defineConfig