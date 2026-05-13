FROM node:20-alpine AS deps

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat openssl python3 make g++

COPY package*.json ./
RUN npm ci

FROM deps AS builder

ARG DATABASE_URL=file:/tmp/build.db
ARG NEXTAUTH_URL=http://localhost:3000
ARG BASE_URL=http://localhost:3000
ARG NEXTAUTH_SECRET=docker-build-placeholder-change-me

ENV DATABASE_URL=${DATABASE_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV BASE_URL=${BASE_URL}
ENV NEXT_PUBLIC_SITE_URL=${BASE_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NODE_ENV=production

COPY . .
RUN npx prisma migrate deploy
RUN npm run build

FROM deps AS prod-deps

RUN npm prune --omit=dev && npm cache clean --force

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat openssl libstdc++

COPY --from=prod-deps /app/package*.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/IMAGENS_MARIA_CLARA ./IMAGENS_MARIA_CLARA
COPY --from=builder /app/IMAGENS_MARIA_RITA ./IMAGENS_MARIA_RITA
COPY --from=builder ["/app/PDF Oficial.pdf", "./"]
COPY --from=builder ["/app/PDF Maria Rita.pdf", "./"]

RUN mkdir -p /app/public/uploads /app/prisma/data

EXPOSE 3000

CMD ["npm", "run", "start"]
