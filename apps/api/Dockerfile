# Multi-stage build for Express API
FROM hmctspublic.azurecr.io/base/node:22-alpine as base

# Dependencies stage
FROM base AS dependencies
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY apps/api/package.json apps/api/
COPY apps/postgres/package.json apps/postgres/
COPY libs/*/package.json libs/*/
RUN yarn workspaces focus @hmcts/api --production

# Build stage
FROM base AS build
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY . .
RUN yarn install --immutable
RUN yarn workspace @hmcts/api build

# Runtime stage
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy production dependencies and built application
COPY --from=dependencies --chown=hmcts:hmcts /app/node_modules ./node_modules
COPY --from=dependencies --chown=hmcts:hmcts /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build --chown=hmcts:hmcts /app/apps/api/dist ./apps/api/dist
COPY --from=build --chown=hmcts:hmcts /app/apps/postgres/node_modules/.prisma ./apps/postgres/node_modules/.prisma

USER hmcts
EXPOSE 3001

CMD ["node", "apps/api/dist/server.js"]