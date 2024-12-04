FROM node:18.16.1-alpine

# RUN apk add --no-cache bash
WORKDIR /app

# Install dependencies
RUN mkdir -p /app/react_artifacts
WORKDIR /app/react_artifacts
COPY package.json package-lock.json *.js jsconfig.json .* ./
RUN npm ci

#Install server
WORKDIR /app
COPY ./server/ ./
RUN npm ci

WORKDIR /app/react_artifacts
COPY ./webpack ./webpack
COPY ./src ./src
ARG BRANCH_NAME
RUN npm run build -- --env environment="${BRANCH_NAME}"

WORKDIR /app
RUN npm run build
RUN cp -r ./react_artifacts/dist/. ./dist
RUN rm -rf ./react_artifacts

RUN addgroup -S app && adduser -S -G app app


# CMD [ "bash" ]
CMD ["npm","start"]
