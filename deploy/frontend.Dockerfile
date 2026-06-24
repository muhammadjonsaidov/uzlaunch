# Build context: frontend/
# Build: docker build -f deploy/frontend.Dockerfile \
#   --build-arg NEXT_PUBLIC_API_URL=https://api.uzlaunch.uz \
#   --build-arg NEXT_PUBLIC_SITE_URL=https://www.uzlaunch.uz \
#   -t ghcr.io/muhammadjonsaidov/uzlaunch/frontend:latest frontend/

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
 && cp -r .next/static .next/standalone/.next/static \
 && cp -r public .next/standalone/public

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=builder /app/.next/standalone ./
EXPOSE 3000
CMD ["node", "--max-old-space-size=256", "server.js"]
