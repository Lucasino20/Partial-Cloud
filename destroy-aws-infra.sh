#!/bin/bash
# destroy-aws-infra.sh - Limpia toda la infraestructura creada por el script principal

echo "========================================================="
echo "🗑️  Destruyendo la Infraestructura Automáticamente"
echo "========================================================="

echo "[1/6] Apagando y eliminando Máquinas Virtuales (EC2)..."
INSTANCE_IDS=$(aws ec2 describe-instances --filters "Name=instance-state-name,Values=running,pending,stopped" "Name=tag:Name,Values=MV-BBDD,MV-Backend,MV-Ingesta" --query "Reservations[*].Instances[*].InstanceId" --output text)
if [ -n "$INSTANCE_IDS" ]; then
    aws ec2 terminate-instances --instance-ids $INSTANCE_IDS >/dev/null
    echo "  -> Instancias mandadas a destruir. Tardarán un par de minutos en borrarse por completo."
fi

echo "[2/6] Eliminando Load Balancer (ALB)..."
ALB_ARN=$(aws elbv2 describe-load-balancers --names cloudeats-alb-final --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null)
if [ -n "$ALB_ARN" ]; then
    aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN
fi

echo "[3/6] Eliminando Target Group..."
TG_ARN=$(aws elbv2 describe-target-groups --names cloudeats-tg-final --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null)
if [ -n "$TG_ARN" ]; then
    aws elbv2 delete-target-group --target-group-arn $TG_ARN
fi

echo "[4/6] Eliminando API Gateway y VPC Link..."
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='CloudEats-API'].ApiId | [0]" --output text 2>/dev/null)
if [ "$API_ID" != "None" ] && [ -n "$API_ID" ]; then
    aws apigatewayv2 delete-api --api-id $API_ID
fi

VPC_LINK_ID=$(aws apigatewayv2 get-vpc-links --query "Items[?Name=='cloudeats-vpc-link'].VpcLinkId | [0]" --output text 2>/dev/null)
if [ "$VPC_LINK_ID" != "None" ] && [ -n "$VPC_LINK_ID" ]; then
    aws apigatewayv2 delete-vpc-link --vpc-link-id $VPC_LINK_ID
fi

echo "[5/6] Eliminando Frontend de AWS Amplify..."
APP_ID=$(aws amplify list-apps --query "apps[?name=='CloudEats-Frontend'].appId | [0]" --output text 2>/dev/null)
if [ "$APP_ID" != "None" ] && [ -n "$APP_ID" ]; then
    aws amplify delete-app --app-id $APP_ID
fi

echo "[6/6] Eliminando Security Groups..."
echo "(NOTA: Los Security Groups pueden demorar en borrarse si las instancias aún están terminándose. Si falla, el script los ignorará)."
aws ec2 delete-security-group --group-name SG-ALB-Final 2>/dev/null || true
aws ec2 delete-security-group --group-name SG-MV-Ingesta-Final 2>/dev/null || true
aws ec2 delete-security-group --group-name SG-MV-Backend-Final 2>/dev/null || true
aws ec2 delete-security-group --group-name SG-MV-BBDD-Final 2>/dev/null || true

echo "========================================================="
echo "✅  ¡LIMPIEZA COMPLETADA!"
echo "Tu cuenta de AWS Academy ha quedado limpia para volver a desplegar."
echo "========================================================="
