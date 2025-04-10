# Path: /frontend/Dockerfile

# Step 1: Build the Next.js app
FROM node:18-alpine AS builder

WORKDIR /app
COPY . .

# Optional: faster install using pnpm
RUN npm install -g pnpm && pnpm install && pnpm build

# Step 2: Use a smaller image to serve the app
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy from build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

CMD ["npm", "run", "start"]
