#!/bin/sh

# Install deno
curl -fsSL https://deno.land/x/install/install.sh | sh

# Install pagic
/vercel/.deno/bin/deno install --global --allow-import --unstable --allow-read --allow-write --allow-net https://deno.land/x/pagic/mod.ts

# Pagic build
/vercel/.deno/bin/deno run --unstable --allow-read --allow-write --allow-net --allow-env --allow-run --allow-import https://deno.land/x/pagic/mod.ts build