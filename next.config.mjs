/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' https://www.youtube.com https://*.ytimg.com https://www.youtube.nocookie.com; frame-src 'self' https://www.youtube.com https://www.youtube.nocookie.com; connect-src 'self' https://www.youtube.com https://*.google.com",
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
