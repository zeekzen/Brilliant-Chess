#!/usr/bin/env bash

composeFile="/root/Brilliant-Chess/docker-compose.yml"

certbot renew
docker-compose -f $composeFile up --build -d

docker image prune -f
