#!/bin/bash
# deploy-apps.sh - Para las MVs de Producción (Backend)

DB_IP=$1

if [ -z "$DB_IP" ]; then
    echo "ERROR: Debes proporcionar la IP de la base de datos."
    echo "Uso: bash deploy-apps.sh <IP_PRIVADA_MV_BBDD>"
    exit 1
fi

echo "[1/4] Instalando dependencias..."
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git

sudo systemctl start docker
sudo systemctl enable docker

# Entramos a la carpeta de backend
cd backend

echo "[2/4] Configurando entorno..."
cat <<EOF > .env
DATABASE_URL=mysql+pymysql://root:utec@${DB_IP}:3306/mydb
MONGO_URI=mongodb://root:utec@${DB_IP}:27017/cloudeats_catalogo?authSource=admin
DB_HOST=${DB_IP}
DB_PORT=5432
DB_USER=root
DB_PASSWORD=utec
DB_NAME=bd_api_orders
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
ATHENA_S3_OUTPUT=
ATHENA_DATABASE=
EOF

echo "[3/4] Construyendo contenedores..."
sudo docker compose build

echo "[4/4] Levantando microservicios..."
sudo docker compose up -d

echo "Esperando 10 segundos..."
sleep 10
sudo docker compose ps
echo "¡Despliegue finalizado exitosamente! Nginx escuchando en el puerto 80."
