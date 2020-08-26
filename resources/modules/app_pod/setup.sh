#!/bin/bash -e

export ENV="preprod"
export DB_HOST=$(az sql server show --resource-group "$ENV-scoparella-resource-group" --name "$ENV-scoparella-database-instance" --query fullyQualifiedDomainName -otsv)
export DB_PORT="1433"

cp app.yaml _app.yaml
envsubst < "_app.yaml" > "app.yaml"
cat app.yaml
# kubectl apply -f ./app.yaml
mv _app.yaml app.yaml

cp app-lb.yaml _app-lb.yaml
envsubst < "_app-lb.yaml" > "app-lb.yaml"
cat app-lb.yaml
# kubectl apply -f ./app-lb.yaml
mv _app-lb.yaml app-lb.yaml
