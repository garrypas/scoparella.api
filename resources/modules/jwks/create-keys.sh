#!/bin/bash
rm -rf RS512.key && rm -rf RS512.key.pub
ssh-keygen -t rsa -b 4096 -m PEM -f RS512.key -Kqy -N ""
openssl rsa -in RS512.key -pubout -outform PEM -out RS512.key.pub

public_key=$(<./RS512.key.pub)
private_key=$(<./RS512.key)

az keyvault secret set --vault-name=${ENV}scoparellavault --name=private-key --value="$private_key"
az keyvault secret set --vault-name=${ENV}scoparellavault --name=public-key --value="$public_key"

rm -rf ./RS512.key.pub
rm -rf ./RS512.key

echo "Setup keys"
