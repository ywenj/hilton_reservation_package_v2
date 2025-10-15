FROM node:20-alpine AS build
WORKDIR /usr/src/app
COPY frontend/package.json frontend/package-lock.json* ./
COPY frontend ./frontend
WORKDIR /usr/src/app/frontend
RUN npm install
RUN npm run build
FROM nginx:stable-alpine
COPY --from=build /usr/src/app/frontend/build /usr/share/nginx/html
EXPOSE 80
