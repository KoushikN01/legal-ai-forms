/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'travel-app',
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: 'legal_docs',
    NEXT_PUBLIC_API_URL: 'https://1mv2qmg5-8000.inc1.devtunnels.ms',
  },
}

export default nextConfig
