#!/bin/bash
# deploy-apps.sh - Para las MVs de Producción (Backend)

DB_IP=$1

if [ -z "$DB_IP" ]; then
    echo "ERROR: Debes proporcionar la IP de la base de datos."
    echo "Uso: bash deploy-apps.sh <IP_PRIVADA_MV_BBDD>"
    exit 1
fi

echo "[1/4] Instalando dependencias..."
sudo systemctl stop apache2 || true
sudo systemctl disable apache2 || true
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git

sudo systemctl start docker
sudo systemctl enable docker

# Entramos a la carpeta de backend
cd backend

echo "[2/4] Configurando entorno..."
# Encontramos el bucket S3 (si no se pasó como parámetro, buscamos uno que empiece con cloudeats)
S3_BUCKET=$(aws s3api list-buckets --query "Buckets[?starts_with(Name, 'cloudeats')].Name" --output text | awk '{print $1}')
if [ -z "$S3_BUCKET" ] || [ "$S3_BUCKET" == "None" ]; then
    S3_BUCKET="cloudeats-datalake-lucas2026"
fi

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
ATHENA_S3_OUTPUT=s3://${S3_BUCKET}/athena-results/
ATHENA_DATABASE=cloudeats_glue_db
EOF

echo "[3/4] Construyendo contenedores..."
sudo docker compose build

echo "[4/4] Levantando microservicios..."
sudo docker compose up -d

echo "Esperando 10 segundos para inicializar DBs..."
sleep 10
sudo docker compose ps

echo "[5/5] Inyectando 20,000+ registros de Fake Data en las Bases de Datos..."
# Añadimos un pequeño retry loop por si la máquina de BD sigue instalándose
sudo docker run --rm -v $(pwd)/scripts:/scripts -w /scripts -e DB_HOST=${DB_IP} python:3.10-slim bash -c "pip install faker psycopg2-binary mysql-connector-python pymongo && for i in {1..10}; do python seed_fake_data.py && break || echo 'Reintentando inyección en 15s...' && sleep 15; done"

echo "¡Despliegue finalizado exitosamente! Nginx escuchando en el puerto 80 y Fake Data inyectada."
