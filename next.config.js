/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.ctfassets.net", "assets.ctfassets.net"],
  },
};

module.exports = nextConfig;

// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/api/whatsapp",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};
