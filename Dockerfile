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

#Find IP of other container:
# docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 79ffb62d8222

# To test
# docker network create scoparella_net
# docker build -t scoparella_api --network=scoparella_net .
# dockers run --network=scoparella_net -p 3000:3000 -e SQL_HOST=172.19.0.2 -e SQL_PASSWORD='P@ss55w0rd' -e HOST=0.0.0.0 -e SQL_PORT=1433 scoparella_api
