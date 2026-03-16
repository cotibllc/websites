<#
.SYNOPSIS
  Scaffolds the Corporate Hardcore Next.js + Tailwind project folder tree.
#>

$root = "corporate-hardcore"

# 1️⃣ Top-level folders
New-Item -ItemType Directory -Path $root
Set-Location $root

# 2️⃣ Src tree
@(
  "src\app",
  "src\app\blog\[slug]",
  "src\components",
  "src\content\posts",
  "src\styles",
  "public"
) | ForEach-Object { New-Item -ItemType Directory -Path $_ -Force }

# 3️⃣ Root-level files
@"
{
  "name": "corporate-hardcore",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.13",
    "react": "^18",
    "react-dom": "^18",
    "lucide-react": "^0.441.0",
    "gray-matter": "^4.0.3",
    "remark": "^15.0.1",
    "remark-html": "^16.0.1",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.13",
    "typescript": "^5",
    "tailwindcss": "^3.4.13",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding utf8

@"
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
"@ | Out-File -FilePath "next.config.mjs" -Encoding utf8

@"
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
"@ | Out-File -FilePath "tailwind.config.ts" -Encoding utf8

@"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"@ | Out-File -FilePath "postcss.config.js" -Encoding utf8

@"
@tailwind base;
@tailwind components;
@tailwind utilities;
"@ | Out-File -FilePath "src/styles/globals.css" -Encoding utf8

@"
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
"@ | Out-File -FilePath ".gitignore" -Encoding utf8

# 4️⃣ Placeholder Next.js boilerplates (so dev server starts without errors)

@"
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Corporate Hardcore",
  description: "Observational satire documenting corporate dysfunction.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
"@ | Out-File -FilePath "src/app/layout.tsx" -Encoding utf8

@"
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">Corporate Hardcore</h1>
      <p className="mt-4 text-muted-foreground">Replace this with real homepage.</p>
    </main>
  );
}
"@ | Out-File -FilePath "src/app/page.tsx" -Encoding utf8

@"
export default function Page() {
  return <div>Blog listing page placeholder</div>;
}
"@ | Out-File -FilePath "src/app/blog/page.tsx" -Encoding utf8

@"
export default function Page({ params }: { params: { slug: string } }) {
  return <div>Article: {params.slug}</div>;
}
"@ | Out-File -FilePath "src/app/blog/[slug]/page.tsx" -Encoding utf8

@"
export default function Page() {
  return <div>About page placeholder</div>;
}
"@ | Out-File -FilePath "src/app/about/page.tsx" -Encoding utf8

# 5️⃣ TypeScript tsconfig stub
@"
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
"@ | Out-File -FilePath "tsconfig.json" -Encoding utf8

# 6️⃣ Public folder assets stub
@"
<!DOCTYPE html>
<html>
  <head>
    <title>Corporate Hardcore</title>
  </head>
  <body>
    <h1>Site under construction</h1>
  </body>
</html>
"@ | Out-File -FilePath "public/index.html" -Encoding utf8

@"
{
  "name": "Corporate Hardcore",
  "short_name": "CH",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#991b1b"
}
"@ | Out-File -FilePath "public/manifest.json" -Encoding utf8

# 7️⃣ Done
Write-Host "`n✅ Scaffold complete." -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1. npm install        (install dependencies)"
Write-Host "  2. npm run dev        (start dev server)"
Write-Host "  3. Paste code from earlier messages into the matching files"
Write-Host "  4. Deploy to Vercel   (git init / commit / git remote add origin ...)`n"
Set-Location ..
