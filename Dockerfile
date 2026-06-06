FROM node:22-alpine AS backend-node

WORKDIR /app


COPY backend/package*.json ./
RUN npm install


COPY backend/ .


RUN npm run build


COPY backend/swagger.yaml ./dist/swagger.yaml

EXPOSE 3000

CMD ["npm", "start"]
