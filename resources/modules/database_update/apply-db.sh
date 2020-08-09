#!/bin/bash
ENV=preprod

PASSWORD=$(az keyvault secret show --vault-name=${ENV}scoparellavault --name=dbpassword)
APP_PASSWORD=$(az keyvault secret show --vault-name=${ENV}scoparellavault --name=dbapppassword)

sed -i -e "s/\<PASSWORD\>/$APP_PASSWORD/g" ./create-database.sql
sqlcmd -S preprod-scoparella-database-instance.database.windows.net -U SA -P "$PASSWORD" -i "./create-database.sql"
