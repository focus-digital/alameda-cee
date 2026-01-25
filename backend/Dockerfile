# ---------- Build stage ----------
FROM node:22-alpine AS build

WORKDIR /app

# Ensure Docker uses Yarn 4 (same as local)
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Copy Yarn files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install all dependencies (including dev) for build + prisma generate
RUN yarn install --immutable

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN yarn prisma generate

# Copy full app source and build TypeScript
COPY . .
RUN yarn build


# ---------- Runtime stage ----------
FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Ensure Docker uses Yarn 4 (same as local)
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Copy package.json + yarn.lock and install only prod dependencies
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
RUN yarn install --immutable

# Copy Prisma schema and generated client
COPY prisma ./prisma
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/node_modules/@prisma /app/node_modules/@prisma

# Copy compiled JS
COPY --from=build /app/dist ./dist

# SQLite data directory (will be mounted)
RUN mkdir -p /data
VOLUME ["/data"]

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/src/server.js"]