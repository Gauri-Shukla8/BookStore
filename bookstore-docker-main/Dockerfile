FROM node:14.15.4-alpine3.10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN ["chmod", "+x", "/usr/src/app/wait-for-mysql.sh"]
