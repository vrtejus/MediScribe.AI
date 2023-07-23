FROM node:14 as base

 WORKDIR /home/node/app

 COPY package.json ./

 RUN npm i

 # Copy your service account key file to the Docker image
 COPY ./src/mediscribe-ai-8b070e434cf7.json ./src/
 COPY . .

 FROM base as production

 ENV NODE_PATH=./build

 RUN npm run build 