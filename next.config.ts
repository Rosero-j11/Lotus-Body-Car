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
        hostname: 'https://srgrappomudpsncxlrpk.supabase.co', // Replace with your actual Supabase project ID
      },
    ],
  },
}

module.exports = nextConfig