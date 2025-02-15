#!/usr/bin/env bash

composeFile="/root/Brilliant-Chess/docker-compose.yml"

docker-compose -f $composeFile down --rmi local -v

docker image prune -f
