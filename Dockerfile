FROM node:12
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN bash create-keys.sh
ENV PORT=3000
EXPOSE ${PORT}
CMD [ "node", "." ]

# To test
# docker build -t scoparella_api .
# dockers run --net=host -e SQL_PASSWORD=P@ss55w0rd scoparella_api
