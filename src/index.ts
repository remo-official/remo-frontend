import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    "/mockServiceWorker.js": () =>
      new Response(Bun.file(new URL("../public/mockServiceWorker.js", import.meta.url)), {
        headers: { "Content-Type": "text/javascript" },
      }),
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
