import boto3
import time
import os

bucket_name = os.getenv('S3_BUCKET', '').lower()
region = os.getenv('AWS_REGION', 'us-east-1')

print("Configurando AWS Glue y Athena automáticamente...")

# Boto3 automáticamente tomará las credenciales del LabRole de EC2 o de Cloud9
athena = boto3.client('athena', region_name=region)
db_name = "cloudeats_glue_db"
s3_output = f"s3://{bucket_name}/athena-results/"

def execute_query(query, wait=True):
    print(f"Ejecutando Query: {query.strip().split(chr(10))[0]}...")
    try:
        res = athena.start_query_execution(
            QueryString=query,
            ResultConfiguration={'OutputLocation': s3_output}
        )
        qid = res['QueryExecutionId']
        if wait:
            while True:
                status = athena.get_query_execution(QueryExecutionId=qid)['QueryExecution']['Status']['State']
                if status in ['SUCCEEDED', 'FAILED', 'CANCELLED']:
                    if status != 'SUCCEEDED':
                        print(f"Error en consulta: {status}")
                    break
                time.sleep(2)
        return qid
    except Exception as e:
        print(f"Fallo al ejecutar query en Athena: {e}")
        return None

# 1. Crear base de datos en Glue Catalog
execute_query(f"CREATE DATABASE IF NOT EXISTS {db_name}")

# 2. Crear las 4 tablas (SQL) apuntando directamente a S3 (Reemplaza a los crawlers de Glue)
query_users = f"""
CREATE EXTERNAL TABLE IF NOT EXISTS {db_name}.usuarios (
  id int, nombre string, apellido string, email string, password string, created_at string
) ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' STORED AS TEXTFILE
LOCATION 's3://{bucket_name}/raw/usuarios/' tblproperties ("skip.header.line.count"="1");
"""
execute_query(query_users)

query_orders = f"""
CREATE EXTERNAL TABLE IF NOT EXISTS {db_name}.pedidos (
  id int, user_id int, restaurant_id int, total double, status string, created_at string
) ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' STORED AS TEXTFILE
LOCATION 's3://{bucket_name}/raw/orders/' tblproperties ("skip.header.line.count"="1");
"""
execute_query(query_orders)

query_items = f"""
CREATE EXTERNAL TABLE IF NOT EXISTS {db_name}.order_items (
  id int, order_id int, dish_id int, quantity int, price double
) ROW FORMAT DELIMITED FIELDS TERMINATED BY ',' STORED AS TEXTFILE
LOCATION 's3://{bucket_name}/raw/order_items/' tblproperties ("skip.header.line.count"="1");
"""
execute_query(query_items)

query_catalogo = f"""
CREATE EXTERNAL TABLE IF NOT EXISTS {db_name}.catalogo (
  id int, nombre string, distrito string, platos array<struct<id:int, nombre:string, precio:double>>
) ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
LOCATION 's3://{bucket_name}/raw/catalogo/';
"""
execute_query(query_catalogo)

# 3. Crear 2 Vistas requeridas por la rúbrica (Queries con JOIN entre multiples tablas)
view_1 = f"""
CREATE OR REPLACE VIEW {db_name}.vista_ventas_restaurante AS
SELECT c.nombre AS restaurante, SUM(p.total) AS total_ventas, COUNT(p.id) AS total_pedidos
FROM {db_name}.pedidos p
JOIN {db_name}.catalogo c ON p.restaurant_id = c.id
GROUP BY c.nombre;
"""
execute_query(view_1)

view_2 = f"""
CREATE OR REPLACE VIEW {db_name}.vista_usuarios_frecuentes AS
SELECT u.nombre, u.email, COUNT(p.id) AS numero_pedidos
FROM {db_name}.usuarios u
JOIN {db_name}.pedidos p ON u.id = p.user_id
GROUP BY u.nombre, u.email
ORDER BY numero_pedidos DESC;
"""
execute_query(view_2)

print("✅ ¡AWS Glue Data Catalog, Tablas, y las 2 Vistas de Athena creadas exitosamente!")
