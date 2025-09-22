# Multi-stage build for Express + Nunjucks web app
FROM hmctspublic.azurecr.io/base/node:22-alpine as base

# Dependencies stage
FROM base AS dependencies
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY apps/web/package.json apps/web/
COPY libs/*/package.json libs/*/
RUN yarn workspaces focus @hmcts/web --production

# Build stage
FROM base AS build
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY . .
RUN yarn install --immutable
RUN yarn workspace @hmcts/web build
# Compile SCSS to CSS
RUN yarn workspace @hmcts/web sass

# Runtime stage
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy production dependencies and built application
COPY --from=dependencies --chown=hmcts:hmcts /app/node_modules ./node_modules
COPY --from=dependencies --chown=hmcts:hmcts /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=build --chown=hmcts:hmcts /app/apps/web/dist ./apps/web/dist
COPY --from=build --chown=hmcts:hmcts /app/apps/web/public ./apps/web/public

# Copy view templates from libs (needed for runtime)
COPY --chown=hmcts:hmcts ./libs/*/src/views ./libs/
COPY --chown=hmcts:hmcts ./libs/*/src/pages ./libs/

# Copy GOV.UK Frontend assets
COPY --from=dependencies --chown=hmcts:hmcts /app/node_modules/govuk-frontend/dist/govuk ./apps/web/public/govuk

USER hmcts
EXPOSE 3000

CMD ["node", "apps/web/dist/server.js"]