// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'srgrappomudpsncxlrpk.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig