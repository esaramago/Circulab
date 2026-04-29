---
description: Circulab project context and conventions (Astro SSR)
alwaysApply: true
---

## Business rules
- The documentation in the `src/pages/docs`
- The documentation should be in English.

## Dependencies
- The project is internationalized using the Paraglide framework.
- The project uses the WebAwesome framework for the components.
- The project uses the Leaflet for the map.
- The project uses the Supabase for the database.

## Coding conventions
- Do not start a new feature without my approval.
- Prefer **Astro components** for static markup; use client islands only when client-side JS is required.
- Keep changes scoped to the request: avoid broad refactors or unrelated files.
- Code comments should be in English.
- Check `.editorconfig` for coding conventions.
- Add type definitions to `src/types/` when needed.
- Use the `@/` alias for all imports.
- Don't use semicolons at the end of the lines.

## Styles
- Use WebAwesome custom properties for the styles.
- Keep styles aligned with tokens in `src/css/base/variables.css`.
- Do not use inline styles.