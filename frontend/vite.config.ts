import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()], // 支持 React JSX/TSX 编译
  server: {
    port: 5173,
    open: true, // 启动后自动打开浏览器
  },
  test: {
    // Vitest 测试配置（Vite 生态的测试框架）
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
});
