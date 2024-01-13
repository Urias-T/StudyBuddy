FROM node:20.8.1

WORKDIR /app

COPY . . 

# RUN npm install --production

RUN npm install

RUN npm run build

CMD [ "npm", "start" ] 