import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Use '.' as default path if process.cwd is undefined in the environment
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    server: {
      // Always use port 5174
      port: 5174,
      strictPort: true,

      // Allow access from your Cloudflare Tunnel domain
      allowedHosts: ['hpc.a-lab-nlp.com'],
    },
  }
})