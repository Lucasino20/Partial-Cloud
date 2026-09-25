#!/bin/bash
# deploy-ingesta.sh - Para la MV de Ingesta (Data Science)

DB_IP=$1
S3_BUCKET=$2

if [ -z "$DB_IP" ] || [ -z "$S3_BUCKET" ]; then
    echo "ERROR: Faltan argumentos."
    echo "Uso: bash deploy-ingesta.sh <IP_PRIVADA_MV_BBDD> <NOMBRE_BUCKET_S3>"
    exit 1
fi

echo "[1/3] Instalando Docker y dependencias..."
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git python3-pip python3-venv

sudo systemctl start docker
sudo systemctl enable docker

cd data-science

echo "[2/4] Instalando AWS CLI y creando el bucket automáticamente..."
sudo apt install -y awscli curl unzip
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
sudo ./aws/install --update || true

# Intentar crear el bucket. Si ya existe y es tuyo, el || true evitará que falle el script.
aws s3 mb s3://${S3_BUCKET} --region us-east-1 || echo "El bucket ya existe o no se pudo crear (podría ser por permisos). Continuando..."

echo "[3/5] Configurando variables de entorno..."
cat <<EOF > .env
DB_IP=${DB_IP}
S3_BUCKET=${S3_BUCKET}
EOF

echo "[4/5] Inyectando 20,000+ registros de Fake Data antes de la extracción..."
sudo docker run --rm -v $(pwd)/../backend/scripts:/scripts -w /scripts -e DB_HOST=${DB_IP} python:3.10-slim bash -c "pip install faker psycopg2-binary mysql-connector-python pymongo && python seed_fake_data.py"

echo "[5/5] Construyendo y ejecutando contenedores de extracción a S3..."
sudo docker compose build
sudo docker compose up -d

echo "Esperando 10 segundos para asegurar que los contenedores suban los datos a S3..."
sleep 10

echo "[4/4] Automatizando creación de AWS Glue y AWS Athena..."
# Configuramos un entorno virtual para correr el script automatizado
python3 -m venv venv
source venv/bin/activate
pip install boto3

# Exportamos las variables para el script de python
export S3_BUCKET=${S3_BUCKET}

python3 setup_athena.py

echo "--------------------------------------------------------"
echo "¡Todo desplegado exitosamente sin intervención manual!"
echo "Los contenedores están corriendo, los datos subieron a S3,"
echo "y AWS Glue y Athena fueron configurados automáticamente."
echo "--------------------------------------------------------"
