module.exports = {
  reactStrictMode: true,
  // Keep visited/prefetched pages in the browser for a short time so clicking between pages is instant.
  experimental: { staleTimes: { dynamic: 30, static: 180 } },
};
