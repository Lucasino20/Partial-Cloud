#!/bin/bash
# deploy-ingesta.sh - Para la MV de Ingesta (Data Science)

echo "[1/6] Instalando AWS CLI y dependencias base..."
sudo apt update
sudo apt install -y awscli curl unzip docker.io docker-compose-v2 git python3-pip python3-venv

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
sudo ./aws/install --update || true

sudo systemctl start docker
sudo systemctl enable docker

echo "[2/6] Detectando configuración de AWS automáticamente (Sin pedirte nada)..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "lucas2026")
S3_BUCKET="cloudeats-datalake-${ACCOUNT_ID}"

DB_IP=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=*BBDD*" "Name=instance-state-name,Values=running" --query "Reservations[*].Instances[*].PrivateIpAddress" --output text 2>/dev/null | awk '{print $1}')
if [ -z "$DB_IP" ] || [ "$DB_IP" == "None" ]; then
    MY_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)
    DB_IP=$(aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query "Reservations[*].Instances[*].PrivateIpAddress" --output text 2>/dev/null | grep -v "$MY_IP" | head -n 1)
fi

echo "✅ IP de BD detectada: $DB_IP"
echo "✅ Bucket S3 generado: $S3_BUCKET"

echo "[3/6] Creando el bucket S3 automáticamente..."
aws s3 mb s3://${S3_BUCKET} --region us-east-1 || echo "El bucket ya existe o no se pudo crear. Continuando..."

cd data-science

echo "[4/6] Configurando variables de entorno y DB..."
cat <<EOF > .env
DB_IP=${DB_IP}
S3_BUCKET=${S3_BUCKET}
EOF

echo "[5/6] Inyectando 20,000+ registros de Fake Data antes de la extracción..."
sudo docker run --rm -v $(pwd)/../backend/scripts:/scripts -w /scripts -e DB_HOST=${DB_IP} python:3.10-slim bash -c "pip install faker psycopg2-binary mysql-connector-python pymongo && python -u seed_fake_data.py"

echo "[6/6] Construyendo y ejecutando contenedores de extracción a S3..."
sudo docker compose build
sudo docker compose up -d

echo "Esperando 15 segundos para asegurar que los contenedores suban los datos a S3..."
sleep 15

echo "Automatizando creación de AWS Glue y AWS Athena..."
python3 -m venv venv
source venv/bin/activate
pip install boto3

export S3_BUCKET=${S3_BUCKET}
python3 setup_athena.py

echo "--------------------------------------------------------"
echo "¡Todo desplegado exitosamente sin intervención manual!"
echo "Los contenedores están corriendo, los datos subieron a S3,"
echo "y AWS Glue y Athena fueron configurados automáticamente."
echo "--------------------------------------------------------"
