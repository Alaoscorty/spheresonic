# Next.js to React + Vite Migration TODO

## Status: In Progress ✅

### 1. [DONE] Create this TODO.md file
### 2. Update package.json (deps/scripts) → npm i / uninstall → Update lockfile
### 3. Install @fontsource/inter → Update src/index.css (fonts + globals.css merge)
### 4. Update src/components/theme-provider.tsx (replace next-themes)
### 5. Update key components: conditional-layout.tsx, dashboard-sidebar.tsx, header.tsx (replace Next navigation → react-router)
### 6. Migrate pages: Create src/pages/ dir, move/rename/update src/app/*/*.tsx → src/pages/*Page.tsx, replace Link/Image/useParams
### 7. Implement src/App.tsx: Providers + Router + Routes + ConditionalLayout
### 8. Update src/main.tsx if needed
### 9. Handle server actions: Make client-side (Cloudinary upload via hooks, AI direct calls)
### 10. Replace next/script (Fedapay) in App.tsx or dedicated component
### 11. Delete src/app/* entirely, next.config.ts, public/assets/*
### 12. Test: npm run dev → Verify all routes, auth, upload, AI, theme, i18n
### 13. [DONE] attempt_completion

*Updated by BLACKBOXAI - Next step: package.json*

