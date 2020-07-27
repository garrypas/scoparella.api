ssh-keygen -t rsa -b 4096 -m PEM -f RS512.key -qy -N ""
openssl rsa -in RS512.key -pubout -outform PEM -out RS512.key.pub
