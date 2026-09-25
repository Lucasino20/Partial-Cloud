#!/bin/bash
# update-infrastructure.sh - Actualización remota de todas las MVs sin usar SSH

echo "========================================================="
echo "🔄 Iniciando Actualización Global de Infraestructura..."
echo "========================================================="

echo "[1/4] Buscando y actualizando instancias Backend..."
BACKEND_IDS=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=MV-Backend" "Name=instance-state-name,Values=running" --query "Reservations[*].Instances[*].InstanceId" --output text)

if [ -n "$BACKEND_IDS" ] && [ "$BACKEND_IDS" != "None" ]; then
    for ID in $BACKEND_IDS; do
        aws ssm send-command --instance-ids $ID --document-name "AWS-RunShellScript" \
            --parameters 'commands=["sudo systemctl stop apache2 || true", "sudo systemctl disable apache2 || true", "cd /home/ubuntu/app", "sudo -u ubuntu git pull", "S3_B=\$(aws s3api list-buckets --query \"Buckets[?starts_with(Name, \\\"cloudeats\\\")].Name\" --output text | awk \"{print \\$1}\")", "if [ -z \"\$S3_B\" ]; then S3_B=\"cloudeats-datalake-lucas2026\"; fi", "sed -i \"s|ATHENA_S3_OUTPUT=.*|ATHENA_S3_OUTPUT=s3://\$S3_B/athena-results/|g\" backend/.env", "sed -i \"s|ATHENA_DATABASE=.*|ATHENA_DATABASE=cloudeats_glue_db|g\" backend/.env", "sudo docker compose -f backend/docker-compose.yml up -d --build"]' > /dev/null
        echo "✅ Comando de actualización enviado al Backend ($ID)"
    done
else
    echo "⚠️ No se encontraron instancias de Backend."
fi

echo "[2/4] Buscando y actualizando instancia de Ingesta..."
INGESTA_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=MV-Ingesta" "Name=instance-state-name,Values=running" --query "Reservations[*].Instances[*].InstanceId" --output text)

if [ -n "$INGESTA_ID" ] && [ "$INGESTA_ID" != "None" ]; then
    aws ssm send-command --instance-ids $INGESTA_ID --document-name "AWS-RunShellScript" \
        --parameters 'commands=["cd /home/ubuntu/app", "sudo -u ubuntu git pull", "sudo docker compose -f data-science/docker-compose.yml up -d --build --force-recreate"]' > /dev/null
    echo "✅ Comando de actualización enviado a la Ingesta ($INGESTA_ID)"
else
    echo "⚠️ No se encontró la instancia de Ingesta."
fi

echo "[3/4] Recreando vistas en Athena (si hubo cambios en Data Science)..."
if [ -f "data-science/setup_athena.py" ]; then
    source data-science/venv/bin/activate 2>/dev/null || true
    S3_B=$(aws s3api list-buckets --query "Buckets[?starts_with(Name, 'cloudeats')].Name" --output text | awk '{print $1}')
    if [ -z "$S3_B" ] || [ "$S3_B" == "None" ]; then
        S3_B="cloudeats-datalake-lucas2026"
    fi
    export S3_BUCKET=$S3_B
    python3 data-science/setup_athena.py
else
    echo "⚠️ Script de Athena no encontrado localmente."
fi

echo "[4/4] Actualizando y Recompilando el Frontend..."
API_ID=$(aws apigatewayv2 get-apis --query 'Items[?Name==`CloudEats-API`].ApiId | [0]' --output text 2>/dev/null)
if [ -n "$API_ID" ] && [ "$API_ID" != "None" ]; then
    bash deploy-frontend.sh https://$API_ID.execute-api.us-east-1.amazonaws.com
else
    echo "⚠️ No se encontró el API Gateway para el Frontend."
fi

echo "========================================================="
echo "🎉 ¡Actualización finalizada! Los contenedores remotos se"
echo "están reconstruyendo con el nuevo código automáticamente."
echo "========================================================="
