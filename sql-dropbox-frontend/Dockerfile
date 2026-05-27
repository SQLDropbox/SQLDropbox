#docker build -t nextjs-app .
#docker run -p 3000:3000 nextjs-app
# =========================
# Builder stage
# =========================
FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# =========================
# Runner stage
# =========================
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Run as non-root user (security improvement)
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs
USER nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]