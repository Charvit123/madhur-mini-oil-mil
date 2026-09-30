/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Route handlers under app/api/catalogue/** act as the local, dependency-free
    // catalogue backend. Point NEXT_PUBLIC_API_URL / API_URL at the Spring Boot
    // service (see ../backend) to switch to the real one — nothing else changes.
    serverActions: { bodySizeLimit: "2mb" },
  },
  // Whether this needs to be set at all depends on your Next.js major
  // version, which is exactly what made this confusing before:
  //   - Next.js 15.x: unconfigured = permissive (cross-origin dev requests
  //     just log a warning, nothing is blocked).
  //   - Next.js 16.x: unconfigured = BLOCKED by default. Every /_next/*
  //     request (every JS chunk the page loads, not just the HMR websocket)
  //     from an origin that isn't literally "localhost" gets silently
  //     rejected. The page still looks right (server-rendered HTML) and
  //     plain <a href> links still navigate (the browser does that with
  //     zero JS), but nothing requiring React — clicks, the cart drawer,
  //     quantity steppers, animated content — works at all. This is the
  //     exact "products are there but invisible" symptom if you've seen it.
  //
  // Check your installed version (package.json's "next" field, or
  // `npx next --version`) if you're unsure which behaviour applies to you.
  //
  // Either way, setting DEV_LAN_ORIGIN is always safe and always the fix
  // for testing from a phone or another machine on your network — it's a
  // no-op convenience on 15.x, and required on 16.x. Set it in
  // web/.env.local and restart the dev server:
  //   DEV_LAN_ORIGIN=192.168.1.13
  ...(process.env.DEV_LAN_ORIGIN ? { allowedDevOrigins: [process.env.DEV_LAN_ORIGIN] } : {}),
};

export default nextConfig;
