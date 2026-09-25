#!/bin/bash
# deploy-ingesta.sh - Para la MV de Ingesta

echo "[1/2] Instalando Docker y Python..."
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git python3-pip

sudo systemctl start docker
sudo systemctl enable docker

cd data-science
echo "Directorio de data-science listo. Aquí se construirán los contenedores Python para AWS S3."
