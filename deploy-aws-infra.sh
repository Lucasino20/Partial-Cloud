#!/bin/bash
# deploy-aws-infra.sh - Automatización TOTAL (Infraestructura + Software) usando EC2 UserData
# Uso: bash deploy-aws-infra.sh <URL_DE_TU_REPOSITORIO> <NOMBRE_S3_BUCKET>

REPO_URL=$1
S3_BUCKET=$2

if [ -z "$REPO_URL" ] || [ -z "$S3_BUCKET" ]; then
    echo "ERROR: Faltan argumentos."
    echo "Uso: bash deploy-aws-infra.sh <URL_GITHUB_REPO> <NOMBRE_S3_BUCKET>"
    echo "Ejemplo: bash deploy-aws-infra.sh https://github.com/FernandoEspi/mv-categorias.git cloudeats-data-lake"
    exit 1
fi

echo "========================================================="
echo "☁️  Iniciando creación 100% Autónoma (Infraestructura + Código)"
echo "========================================================="

echo "[1/7] Obteniendo VPC y Subredes..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text)
SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[0:2].SubnetId" --output text)
SUBNET_1=$(echo $SUBNETS | awk '{print $1}')
SUBNET_2=$(echo $SUBNETS | awk '{print $2}')

echo "[2/7] Creando Security Groups y Firewall..."
SG_BBDD=$(aws ec2 create-security-group --group-name SG-MV-BBDD-Final --description "SG BBDD" --vpc-id $VPC_ID --query 'GroupId' --output text)
SG_BACK=$(aws ec2 create-security-group --group-name SG-MV-Backend-Final --description "SG Backend" --vpc-id $VPC_ID --query 'GroupId' --output text)
SG_INGE=$(aws ec2 create-security-group --group-name SG-MV-Ingesta-Final --description "SG Ingesta" --vpc-id $VPC_ID --query 'GroupId' --output text)
SG_ALB=$(aws ec2 create-security-group --group-name SG-ALB-Final --description "SG ALB" --vpc-id $VPC_ID --query 'GroupId' --output text)

sleep 3

# Reglas
aws ec2 authorize-security-group-ingress --group-id $SG_ALB --protocol tcp --port 80 --cidr 0.0.0.0/0 >/dev/null
aws ec2 authorize-security-group-ingress --group-id $SG_BACK --protocol tcp --port 22 --cidr 0.0.0.0/0 >/dev/null
aws ec2 authorize-security-group-ingress --group-id $SG_BACK --protocol tcp --port 80 --source-group $SG_ALB >/dev/null

aws ec2 authorize-security-group-ingress --group-id $SG_BBDD --protocol tcp --port 22 --cidr 0.0.0.0/0 >/dev/null
for port in 5432 3306 27017; do
    aws ec2 authorize-security-group-ingress --group-id $SG_BBDD --protocol tcp --port $port --source-group $SG_BACK >/dev/null
    aws ec2 authorize-security-group-ingress --group-id $SG_BBDD --protocol tcp --port $port --source-group $SG_INGE >/dev/null
done
aws ec2 authorize-security-group-ingress --group-id $SG_INGE --protocol tcp --port 22 --cidr 0.0.0.0/0 >/dev/null

echo "[3/7] Buscando AMI Ubuntu..."
AMI_ID=$(aws ec2 describe-images --filters "Name=name,Values=*Cloud9Ubuntu22*" "Name=state,Values=available" --query "Images[0].ImageId" --output text)
if [ "$AMI_ID" == "None" ] || [ -z "$AMI_ID" ]; then
  AMI_ID=$(aws ec2 describe-images --owners amazon --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" "Name=state,Values=available" --query "sort_by(Images, &CreationDate)[-1].ImageId" --output text)
fi

KEY_NAME="vockey"

echo "[4/7] Lanzando Base de Datos e instalando código (UserData)..."
cat <<EOF > userdata_db.sh
#!/bin/bash
cd /home/ubuntu
git clone $REPO_URL app
cd app
bash deploy-dbs.sh
EOF

DB_OUTPUT=$(aws ec2 run-instances --image-id $AMI_ID --count 1 --instance-type t2.medium --key-name $KEY_NAME --security-group-ids $SG_BBDD --subnet-id $SUBNET_1 --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=MV-BBDD}]' --iam-instance-profile Name=LabInstanceProfile --user-data file://userdata_db.sh --query "Instances[0].[InstanceId,PrivateIpAddress]" --output text)
DB_ID=$(echo $DB_OUTPUT | awk '{print $1}')
DB_IP=$(echo $DB_OUTPUT | awk '{print $2}')

echo "IP Privada de la BD obtenida automáticamente: $DB_IP"

echo "[5/7] Lanzando 2 Backends e Ingesta con despliegue automático..."
cat <<EOF > userdata_backend.sh
#!/bin/bash
cd /home/ubuntu
git clone $REPO_URL app
cd app
bash deploy-apps.sh $DB_IP
EOF

cat <<EOF > userdata_ingesta.sh
#!/bin/bash
cd /home/ubuntu
git clone $REPO_URL app
cd app
bash deploy-ingesta.sh $DB_IP $S3_BUCKET
EOF

BACKEND_IDS=$(aws ec2 run-instances --image-id $AMI_ID --count 2 --instance-type t2.medium --key-name $KEY_NAME --security-group-ids $SG_BACK --subnet-id $SUBNET_1 --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=MV-Backend}]' --iam-instance-profile Name=LabInstanceProfile --user-data file://userdata_backend.sh --query "Instances[*].InstanceId" --output text)

aws ec2 run-instances --image-id $AMI_ID --count 1 --instance-type t2.medium --key-name $KEY_NAME --security-group-ids $SG_INGE --subnet-id $SUBNET_1 --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=MV-Ingesta}]' --iam-instance-profile Name=LabInstanceProfile --user-data file://userdata_ingesta.sh >/dev/null

echo "[6/7] Creando Load Balancer y enlazando Backends..."
ALB_ARN=$(aws elbv2 create-load-balancer --name cloudeats-alb-final --subnets $SUBNET_1 $SUBNET_2 --security-groups $SG_ALB --query 'LoadBalancers[0].LoadBalancerArn' --output text)
ALB_DNS=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --query 'LoadBalancers[0].DNSName' --output text)

TG_ARN=$(aws elbv2 create-target-group --name cloudeats-tg-final --protocol HTTP --port 80 --vpc-id $VPC_ID --query 'TargetGroups[0].TargetGroupArn' --output text)
aws elbv2 create-listener --load-balancer-arn $ALB_ARN --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=$TG_ARN >/dev/null

for ID in $BACKEND_IDS; do
    aws elbv2 register-targets --target-group-arn $TG_ARN --targets Id=$ID
done

echo "[7/7] Compilando Frontend localmente inyectando el Load Balancer..."
bash deploy-frontend.sh http://$ALB_DNS

echo "========================================================="
echo "🚀 ¡MAGIA PURA! TODO FUE DESPLEGADO AUTOMÁTICAMENTE."
echo "========================================================="
echo "AWS está levantando las máquinas. Al prender, ejecutarán tus scripts de BBDD, Backend y Data Science solas."
echo "Tu DNS del Load Balancer es: http://$ALB_DNS"
echo "La carpeta frontend/dist/ ya fue compilada y está lista para que la arrastres a AWS Amplify."
echo "========================================================="
