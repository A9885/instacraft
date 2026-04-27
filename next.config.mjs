import path from 'path';
import fs from 'fs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.1.5'],
  reactCompiler: true,
  turbopack: {}, // Silences the Next.js 16 build error with custom webpack configs
  serverExternalPackages: ["firebase-admin", "mysql2"],

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(process.cwd(), 'src'),
    };
    if (isServer) {
      // Force these to be external so the build output doesn't get mangled
      config.externals.push("firebase-admin", "mysql2");
    }
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        stream: false,
        constants: false,
      };
    }
    return config;
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://apis.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*.firebaseapp.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
