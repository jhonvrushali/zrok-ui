# Single stage: run directly with ts-node (simpler & reliable)
FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 5001

# Run TypeScript directly with ts-node
CMD ["npx", "ts-node", "--transpile-only", "src/index.ts"]
