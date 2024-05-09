# Use the official Node.js image as the base image
FROM node:20-bookworm as build

# Set the working directory in the container
WORKDIR /usr/app

COPY . .
# Install app dependencies
WORKDIR /usr/app/training
RUN npm install
# Copy the rest of the application files
WORKDIR /usr/app/web
RUN npm install \
  && npm run build --prod


FROM nginx:1.25.5-alpine-slim

# Copy the built Angular app from the 'build' stage to the NGINX directory
COPY --from=build /usr/app/web/dist /usr/share/nginx/html
COPY ./web/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
