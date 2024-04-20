# Use the official Node.js image as the base image
FROM node:20-bookworm

# Set the working directory in the container
WORKDIR /usr/app


COPY . .
# Install app dependencies
WORKDIR /usr/app/training
RUN npm install \
    && npm uninstall @tensorflow/tfjs \
    && npm install @tensorflow/tfjs-node \
    && npm rebuild @tensorflow/tfjs-node --build-from-source
# Copy the rest of the application files
WORKDIR /usr/app/server
RUN npm install \
    && npm rebuild @tensorflow/tfjs-node --build-from-source \
    && npm install -g typescript
# Compile TypeScript code to JavaScript
RUN node ./utils/change-tf.js && tsc
