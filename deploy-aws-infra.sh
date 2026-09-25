#!/bin/bash
# deploy-aws-infra.sh - Automatización total de Infraestructura en AWS (IaC con AWS CLI)
# ATENCIÓN: Este script requiere que tengas el AWS CLI configurado (por ejemplo, ejecutándolo desde AWS Cloud9).

echo "========================================================="
echo "☁️  Iniciando creación de Infraestructura en AWS..."
echo "========================================================="

# 1. Obtener VPC por defecto y Subnets
echo "[1/6] Obteniendo VPC y Subredes por defecto..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text)
SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[0:2].SubnetId" --output text)
SUBNET_1=$(echo $SUBNETS | awk '{print $1}')
SUBNET_2=$(echo $SUBNETS | awk '{print $2}')

# 2. Crear Security Groups
echo "[2/6] Creando Security Groups..."
SG_BBDD=$(aws ec2 create-security-group --group-name SG-MV-BBDD --description "SG Base de Datos" --vpc-id $VPC_ID --query 'GroupId' --output text)
SG_BACK=$(aws ec2 create-security-group --group-name SG-MV-Backend --description "SG Backend" --vpc-id $VPC_ID --query 'GroupId' --output text)
SG_INGE=$(aws ec2 create-security-group --group-name SG-MV-Ingesta --description "SG Ingesta" --vpc-id $VPC_ID --query 'GroupId' --output text)
SG_ALB=$(aws ec2 create-security-group --group-name SG-LoadBalancer --description "SG ALB" --vpc-id $VPC_ID --query 'GroupId' --output text)

# Esperar unos segundos para propagación
sleep 3

# 3. Asignar Reglas a los Security Groups
echo "[3/6] Inyectando reglas de Firewall a los Security Groups..."
# ALB: Recibe de internet
aws ec2 authorize-security-group-ingress --group-id $SG_ALB --protocol tcp --port 80 --cidr 0.0.0.0/0
# Backend: Recibe SSH de ti, y HTTP solo del ALB
aws ec2 authorize-security-group-ingress --group-id $SG_BACK --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_BACK --protocol tcp --port 80 --source-group $SG_ALB
# BBDD: Recibe peticiones de los Backends y de Ingesta
aws ec2 authorize-security-group-ingress --group-id $SG_BBDD --protocol tcp --port 22 --cidr 0.0.0.0/0
for port in 5432 3306 27017; do
    aws ec2 authorize-security-group-ingress --group-id $SG_BBDD --protocol tcp --port $port --source-group $SG_BACK
    aws ec2 authorize-security-group-ingress --group-id $SG_BBDD --protocol tcp --port $port --source-group $SG_INGE
done
# Ingesta: Solo salida y SSH
aws ec2 authorize-security-group-ingress --group-id $SG_INGE --protocol tcp --port 22 --cidr 0.0.0.0/0

# 4. Obtener AMI de Cloud9
echo "[4/6] Buscando AMI solicitada (Cloud9Ubuntu22)..."
AMI_ID=$(aws ec2 describe-images --filters "Name=name,Values=*Cloud9Ubuntu22*" "Name=state,Values=available" --query "Images[0].ImageId" --output text)
if [ "$AMI_ID" == "None" ] || [ -z "$AMI_ID" ]; then
  echo "⚠️ AMI Cloud9 no encontrada. Usando Ubuntu 22.04 LTS por defecto..."
  AMI_ID=$(aws ec2 describe-images --owners amazon --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" "Name=state,Values=available" --query "sort_by(Images, &CreationDate)[-1].ImageId" --output text)
fi

# 5. Crear Load Balancer y Target Group
echo "[5/6] Creando Load Balancer (ALB) y Target Group..."
ALB_ARN=$(aws elbv2 create-load-balancer --name cloudeats-alb --subnets $SUBNET_1 $SUBNET_2 --security-groups $SG_ALB --query 'LoadBalancers[0].LoadBalancerArn' --output text)
TG_ARN=$(aws elbv2 create-target-group --name cloudeats-tg --protocol HTTP --port 80 --vpc-id $VPC_ID --query 'TargetGroups[0].TargetGroupArn' --output text)
aws elbv2 create-listener --load-balancer-arn $ALB_ARN --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=$TG_ARN

# 6. Crear Máquinas Virtuales (EC2)
echo "[6/6] Lanzando Máquinas Virtuales (EC2)..."
# Usamos vockey y LabInstanceProfile (Estándar de AWS Academy)
KEY_NAME="vockey"

# DB (1 Máquina)
aws ec2 run-instances --image-id $AMI_ID --count 1 --instance-type t2.medium --key-name $KEY_NAME --security-group-ids $SG_BBDD --subnet-id $SUBNET_1 --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=MV-BBDD}]' --iam-instance-profile Name=LabInstanceProfile > /dev/null

# Ingesta (1 Máquina)
aws ec2 run-instances --image-id $AMI_ID --count 1 --instance-type t2.medium --key-name $KEY_NAME --security-group-ids $SG_INGE --subnet-id $SUBNET_1 --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=MV-Ingesta}]' --iam-instance-profile Name=LabInstanceProfile > /dev/null

# Backend (2 Máquinas)
BACKEND_IDS=$(aws ec2 run-instances --image-id $AMI_ID --count 2 --instance-type t2.medium --key-name $KEY_NAME --security-group-ids $SG_BACK --subnet-id $SUBNET_1 --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=MV-Backend}]' --iam-instance-profile Name=LabInstanceProfile --query "Instances[*].InstanceId" --output text)

echo "Añadiendo instancias Backend al Load Balancer..."
for ID in $BACKEND_IDS; do
    aws elbv2 register-targets --target-group-arn $TG_ARN --targets Id=$ID
done

echo "========================================================="
echo "✅ ¡INFRAESTRUCTURA CREADA CON ÉXITO!"
echo "AWS está levantando 4 máquinas virtuales, 4 grupos de seguridad, y 1 balanceador."
echo "Puedes ir a la consola web de AWS EC2 para confirmar."
echo "========================================================="
