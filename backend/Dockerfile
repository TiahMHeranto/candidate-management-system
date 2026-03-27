FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build   # ✅ génère dist/

EXPOSE 5000

CMD ["npm", "run", "start"]
