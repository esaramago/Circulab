FROM node:22-alpine AS base
WORKDIR /app
# pnpm refuses to purge/reinstall node_modules without a TTY unless CI is set
ENV CI=true
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG PUBLIC_SUPABASE_URL
ARG PUBLIC_SUPABASE_ANON_KEY
ARG PUBLIC_SUPABASE_PROJECT_ID
ARG PUBLIC_BASEMAPS_API_KEY
ARG SITE

ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY
ENV PUBLIC_SUPABASE_PROJECT_ID=$PUBLIC_SUPABASE_PROJECT_ID
ENV PUBLIC_BASEMAPS_API_KEY=$PUBLIC_BASEMAPS_API_KEY
ENV SITE=$SITE

COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/dist ./dist

EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
