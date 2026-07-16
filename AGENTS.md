# Guidelines for AI agents
This file provides guidance to AI coding agents working in this repository.
The [README](README.md) provides more context and instructions.

## Core rules
- Do not start a new feature without my approval.
- Comments and documentation should be in english.
- Use `pnpm` for repo commands.
- Do not change `.env` file
- Keep changes scoped to the request and the affected package. Do not refactor unrelated code.
- Respect existing worktree changes. Do not revert user changes unless explicitly asked.
- Use sentence case for headings, titles, labels, and documentation text.

## Stack
- **PNPM**: For package management.
- **Node.js**: Use the latest LTS version.
- **TypeScript**: Use the latest version.
- **Astro**: is the meta-framework in SSR mode.
- **Vue**: For the specific components and interactivity.
- **WebAwesome**: Is the library for the generic components.
- **Supabase**: For the database and storage.
- **Leaflet**: For the maps.
- **Paraglide**: For the internationalization.
- **Nanostores**: For the state management.
- **PWA**: It is a Progressive Web App

## Components
### WebAwesome
Allways use WebAwesome components when possible.
- Read `/node_modules/@awesome.me/webawesome/dist/skills/webawesome/SKILL.md`
- Apply the webawesome rules to the project.
- Do not try to guess the webawesome rules when you are not sure.
### Vue
- Only create Vue components when WebAwesome is not enough.
- Use Vue components for the specific features.
### Astro
- Do not create Astro components in the `src/components` folder.
- Astro components should be used only for pages and layouts.

## Business rules
- The documentation of the project is in the `docs` folder.
- The documentation should be in English.

## Project structure
### docs
The `docs` folder contains the documentation of the project.
### `src`
The `src` folder contains the source code of the project.
- `src/actions`: contains the Astro Actions (server actions)
- `src/composables`: contains the Vue Composables (like helpers with reactive state)
- `src/components` contains the UI components (it includes the template, the component styles, and the js logic)
- `src/config` contains static configurations
- `src/css` contains the global styles
- `src/data` contains specific data to use in the project
- `src/i18n` contains the translations
- `src/layouts` contains the .astro layout components
- `src/pages` contains the .astro routes
- `src/paraglide` contains Paraglide build files. It is read-only.
- `src/stores` contains the nanostores files for the global state management
- `src/types` contains the typescript types
- `src/utils` contains the utility functions
- `src/middleware.ts` is where we check user authentication and page access.

## Coding conventions
- Keep changes scoped to the request: avoid broad refactors or unrelated files.
- Check `.editorconfig` and `.vscode/settings.json` for coding conventions.

### Typescript
- All type definitions should be in `src/types`.
- Check if types are already available before creating new ones.
- Use the `@/` alias for all imports.
- Don't use semicolons at the end of the lines.

### HTML and Components
- Prefer **Astro components** for static markup; use client islands only when client-side JS is required.
- Before creating a new component, check if it is already available in the WebAwesome library.
- Use the Grid component for the layout. Do not create new css for it.

### CSS
- Use WebAwesome custom properties instead of hardcoded values.
- Keep styles aligned with tokens in `src/css/base/variables.css`.
- Do not use inline styles.
- Do not user tailwind or other css frameworks.
- Components specific styles should be in the component file (.vue or .astro).
- Global styles should be in the `src/css/global` folder.
- Always use CSS Logical Properties (e.g. `margin-block-start`) instead of `margin-top` and `margin-bottom`.

### DevOps
- The project uses Docker and docker-compose for the development environment.
- The project uses the Supabase CLI for the database.