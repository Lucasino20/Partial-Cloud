#!/bin/bash
# deploy-ingesta.sh - Para la MV de Ingesta (Data Science)

DB_IP=$1
S3_BUCKET=$2

if [ -z "$DB_IP" ] || [ -z "$S3_BUCKET" ]; then
    echo "ERROR: Faltan argumentos."
    echo "Uso: bash deploy-ingesta.sh <IP_PRIVADA_MV_BBDD> <NOMBRE_BUCKET_S3>"
    exit 1
fi

echo "[1/3] Instalando Docker y Python..."
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git python3-pip

sudo systemctl start docker
sudo systemctl enable docker

cd data-science

echo "[2/3] Configurando variables para S3 y BBDD..."
cat <<EOF > .env
DB_IP=${DB_IP}
S3_BUCKET=${S3_BUCKET}
# Las variables AWS_* debes añadirlas editando el archivo .env a mano luego de correr el script
# ya que en Academy expiran cada 4 horas.
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=PON_TU_ACCESS_KEY_AQUI
AWS_SECRET_ACCESS_KEY=PON_TU_SECRET_KEY_AQUI
AWS_SESSION_TOKEN=PON_TU_SESSION_TOKEN_AQUI
EOF

echo "[3/3] Construyendo contenedores..."
sudo docker compose build

echo "--------------------------------------------------------"
echo "¡Configuración exitosa!"
echo "ATENCIÓN: Edita el archivo data-science/.env con las credenciales de AWS Academy (AWS Details)."
echo "Luego, para extraer los datos y subirlos a S3, ejecuta:"
echo "sudo docker compose up"
echo "--------------------------------------------------------"
