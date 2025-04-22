# Common build stage
FROM node:22-alpine as common-build-stage

COPY . ./app

WORKDIR /app

RUN npm install

EXPOSE 3000

# Development build stage
FROM common-build-stage as development-build-stage

ENV NODE_ENV development

CMD ["npm", "run", "dev"]

# Production build stage
FROM common-build-stage as production-build-stage

ENV NODE_ENV production

CMD ["npm", "run", "start"]


# FROM node:lts-alpine

# WORKDIR /usr/src/app

# COPY package*.json ./

# RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# COPY . .

# EXPOSE 3000

# RUN npm run build

# CMD [ "node", "dist/index.js" ]
