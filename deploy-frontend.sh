#!/bin/bash
# deploy-frontend.sh - Prepara y compila el Frontend para AWS Amplify

API_URL=$1

if [ -z "$API_URL" ]; then
    echo "ERROR: Debes proporcionar la URL de tu API (Load Balancer o Nginx)."
    echo "Uso: bash deploy-frontend.sh <URL_DEL_LOAD_BALANCER>"
    echo "Ejemplo: bash deploy-frontend.sh http://mi-load-balancer-123.us-east-1.elb.amazonaws.com"
    exit 1
fi

echo "[1/3] Configurando variables de entorno automáticamente..."
cd frontend

# Generamos el .env automáticamente, ¡sin que toques nada manual!
cat <<EOF > .env
VITE_API_URL=${API_URL}
EOF

echo "[2/3] Instalando dependencias de React..."
# Dependiendo de si están en Cloud9 o una MV limpia, validamos npm
if ! command -v npm &> /dev/null; then
    echo "Instalando Node.js y NPM..."
    sudo apt update
    sudo apt install -y nodejs npm
fi

npm install

echo "[3/3] Compilando el proyecto para producción..."
npm run build

echo "--------------------------------------------------------"
echo "¡Frontend compilado exitosamente!"
echo "Tu API URL ha sido inyectada automáticamente."
echo "Los archivos listos para producción están en la carpeta: frontend/dist/"
echo ""
echo "Para desplegar en AWS Amplify solo tienes dos opciones:"
echo "1. Consola AWS: Arrastrar la carpeta 'dist/' a la consola de Amplify (Deploy without Git)."
echo "2. O si prefieres, usar Amplify CLI."
echo "--------------------------------------------------------"
