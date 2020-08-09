#!/bin/bash
PASSWORD=$(az keyvault secret show --vault-name="${ENV}scoparellavault" --name=dbpassword -o tsv --query value)
APP_PASSWORD=$(az keyvault secret show --vault-name="${ENV}scoparellavault" --name=dbapppassword -o tsv --query value)

sed -i '' -e "s/\<PASSWORD\>/$APP_PASSWORD/g" ./setup-database.sql
sqlcmd -S "$ENV-scoparella-database-instance.database.windows.net" -d "master" -U scoparella_admin -P "$PASSWORD" -i "./setup-database.sql"
sed -i '' -e "s/$APP_PASSWORD/\<PASSWORD\>/g" ./setup-database.sql
