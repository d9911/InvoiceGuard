FROM node:22-alpine AS backend-node

WORKDIR /app


COPY backend/package*.json ./
RUN yarn install


COPY backend/ .


RUN yarn run build


COPY backend/swagger.yaml ./dist/swagger.yaml

EXPOSE 3000

CMD ["yarn", "start"]
