#!/bin/bash
# deploy-dbs.sh - Para la MV de Bases de Datos

echo "[1/3] Instalando Docker..."
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git

sudo systemctl start docker
sudo systemctl enable docker

cd backend

echo "[2/3] Levantando bases de datos..."
sudo docker compose -f docker-compose-db.yml up -d

echo "[3/3] Esperando a que estén listas (20 seg)..."
sleep 20
sudo docker compose -f docker-compose-db.yml ps

echo "¡Bases de datos levantadas!"
# Aquí podrías llamar al script de seeding en el futuro:
# python3 ../scripts/seed_fake_data.py
