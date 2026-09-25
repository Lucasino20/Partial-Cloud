#!/bin/bash
# deploy-frontend.sh - Prepara, compila y despliega el Frontend en AWS Amplify vía CLI

API_URL=$1

if [ -z "$API_URL" ]; then
    echo "ERROR: Debes proporcionar la URL de tu API (Load Balancer o Nginx)."
    exit 1
fi

echo "[1/4] Configurando variables de entorno automáticamente..."
cd frontend
cat <<EOF > .env
VITE_API_URL=${API_URL}
EOF

echo "[2/4] Instalando dependencias de React y compilando..."
if ! command -v npm &> /dev/null; then
    sudo apt update
    sudo apt install -y nodejs npm
fi
if ! command -v zip &> /dev/null; then
    sudo apt install -y zip
fi

npm install > /dev/null
npm run build > /dev/null

echo "[3/4] Empaquetando y subiendo artefacto a AWS S3 temporal..."
cd dist
zip -r ../dist.zip . > /dev/null
cd ..

TEMP_BUCKET="amplify-deploy-cloudeats-$RANDOM$RANDOM"
aws s3api create-bucket --bucket $TEMP_BUCKET --region us-east-1 > /dev/null
aws s3 cp dist.zip s3://$TEMP_BUCKET/dist.zip > /dev/null

echo "[4/4] Desplegando en AWS Amplify (Zero-Touch)..."
APP_ID=$(aws amplify list-apps --query "apps[?name=='CloudEats-Frontend'].appId | [0]" --output text)

if [ "$APP_ID" == "None" ] || [ -z "$APP_ID" ]; then
    APP_ID=$(aws amplify create-app --name "CloudEats-Frontend" --query 'app.appId' --output text)
    aws amplify create-branch --app-id $APP_ID --branch-name main > /dev/null
fi

# Generamos una URL firmada (Presigned URL) para evitar errores de permisos "UnauthorizedException"
PRESIGNED_URL=$(aws s3 presign s3://$TEMP_BUCKET/dist.zip --expires-in 600)

aws amplify start-deployment --app-id $APP_ID --branch-name main --source-url "$PRESIGNED_URL" > /dev/null

echo "AWS Amplify está publicando tu sitio... (esperando 15 segundos)"
sleep 15

# Limpieza
aws s3 rm s3://$TEMP_BUCKET/dist.zip > /dev/null
aws s3api delete-bucket --bucket $TEMP_BUCKET > /dev/null

echo "========================================================="
echo "✅ ¡FRONTEND DESPLEGADO CON ÉXITO EN AWS AMPLIFY!"
echo "Tu aplicación ya está en vivo 100% automatizada."
echo "URL de producción:"
echo "👉 https://main.${APP_ID}.amplifyapp.com"
echo "========================================================="
