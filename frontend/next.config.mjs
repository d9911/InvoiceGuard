import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js build output directory configured to .next to avoid conflict with express server build
  distDir: '.next',

  // Disable browser source maps in production to optimize speed/security (like sourcemap: false in Vite)
  productionBrowserSourceMaps: false,

  // Handle API proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
