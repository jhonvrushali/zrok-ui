# Stage 1: Build TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 2>/dev/null || npx tsc --outDir dist 2>/dev/null || true

# Stage 2: Run compiled JS
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

EXPOSE 5001

# Run with ts-node for simplicity (can switch to compiled JS in production)
CMD ["npx", "ts-node", "src/index.ts"]
