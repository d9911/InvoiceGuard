FROM node:18-alpine

WORKDIR /app

# We are in the root context, so we copy from the backend directory
COPY backend/package*.json ./
RUN npm install

COPY backend/ .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
