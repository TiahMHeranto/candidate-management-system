FROM node:18-alpine

WORKDIR /app

# 1. Copier uniquement package files
COPY package*.json ./

# 2. Clean install (IMPORTANT)
RUN npm ci

# 3. Copier le reste du code
COPY . .

# 4. Vérifier TypeScript localement
RUN ls -la node_modules/.bin

# 5. Build avec accès direct au binaire
RUN ./node_modules/.bin/tsc

EXPOSE 5000

CMD ["node", "dist/index.js"]
