#!/bin/bash

docker login

USERNAME=hollwopelw
IMAGES=("ai-base" "project-acne_service" "project-wrinkle_service" "project-darkspot_service" "project-backend_api" "project-frontend" "mongo")

for IMAGE in "${IMAGES[@]}"
do
    echo "📦 Tagging $IMAGE"
    docker tag $IMAGE $USERNAME/$IMAGE:latest

    echo "🚀 Pushing $USERNAME/$IMAGE:latest"
    docker push $USERNAME/$IMAGE:latest
done
