#!/bin/bash

USERNAME=hollwopelw
IMAGES=("ai-base" "project-acne_service" "project-wrinkle_service" "project-darkspot_service" "project-backend_api" "project-frontend" "mongo")

for IMAGE in "${IMAGES[@]}"
do
    echo "⬇️ Pulling $USERNAME/$IMAGE:latest"
    docker pull $USERNAME/$IMAGE:latest
done
