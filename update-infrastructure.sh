#!/bin/bash
# update-infrastructure.sh - Actualización remota de todas las MVs sin usar SSH

echo "========================================================="
echo "🔄 Iniciando Actualización Global de Infraestructura..."
echo "========================================================="

echo "[1/4] Buscando y actualizando instancias Backend..."
BACKEND_IDS=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=MV-Backend" "Name=instance-state-name,Values=running" --query "Reservations[*].Instances[*].InstanceId" --output text)

if [ -n "$BACKEND_IDS" ] && [ "$BACKEND_IDS" != "None" ]; then
    for ID in $BACKEND_IDS; do
        # AWS SSM (Systems Manager) permite ejecutar comandos en las MVs sin usar SSH
        aws ssm send-command --instance-ids $ID --document-name "AWS-RunShellScript" \
            --parameters 'commands=["cd /home/ubuntu/app", "sudo -u ubuntu git pull", "sudo docker compose -f backend/docker-compose.yml up -d --build"]' > /dev/null
        echo "✅ Comando de actualización enviado al Backend ($ID)"
    done
else
    echo "⚠️ No se encontraron instancias de Backend."
fi

echo "[2/4] Buscando y actualizando instancia de Ingesta..."
INGESTA_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=MV-Ingesta" "Name=instance-state-name,Values=running" --query "Reservations[*].Instances[*].InstanceId" --output text)

if [ -n "$INGESTA_ID" ] && [ "$INGESTA_ID" != "None" ]; then
    aws ssm send-command --instance-ids $INGESTA_ID --document-name "AWS-RunShellScript" \
        --parameters 'commands=["cd /home/ubuntu/app", "sudo -u ubuntu git pull", "sudo docker compose -f data-science/docker-compose.yml up -d --build"]' > /dev/null
    echo "✅ Comando de actualización enviado a la Ingesta ($INGESTA_ID)"
else
    echo "⚠️ No se encontró la instancia de Ingesta."
fi

echo "[3/4] Recreando vistas en Athena (si hubo cambios en Data Science)..."
if [ -f "data-science/setup_athena.py" ]; then
    source data-science/venv/bin/activate 2>/dev/null || true
    python3 data-science/setup_athena.py
else
    echo "⚠️ Script de Athena no encontrado localmente."
fi

echo "[4/4] Actualizando y Recompilando el Frontend..."
ALB_DNS=$(aws elbv2 describe-load-balancers --names cloudeats-alb-final --query 'LoadBalancers[0].DNSName' --output text 2>/dev/null)
if [ -n "$ALB_DNS" ] && [ "$ALB_DNS" != "None" ]; then
    bash deploy-frontend.sh http://$ALB_DNS
else
    echo "⚠️ No se encontró el Load Balancer para el Frontend."
fi

echo "========================================================="
echo "🎉 ¡Actualización finalizada! Los contenedores remotos se"
echo "están reconstruyendo con el nuevo código automáticamente."
echo "========================================================="
