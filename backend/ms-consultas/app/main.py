import os
import time
import boto3
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Analitica Service API",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuracion de AWS Athena desde Variables de Entorno
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_OUTPUT = os.getenv("ATHENA_S3_OUTPUT") or "s3://cloudeats-datalake-lucas2026/athena-results/"
ATHENA_DATABASE = os.getenv("ATHENA_DATABASE") or "cloudeats_glue_db"

def get_athena_client():
    """Inicializa el cliente boto3 para Athena"""
    kwargs = {'region_name': AWS_REGION}
    access_key = os.getenv("AWS_ACCESS_KEY_ID")
    if access_key:
        kwargs['aws_access_key_id'] = access_key
        kwargs['aws_secret_access_key'] = os.getenv("AWS_SECRET_ACCESS_KEY")
        session_token = os.getenv("AWS_SESSION_TOKEN")
        if session_token:
            kwargs['aws_session_token'] = session_token
    return boto3.client('athena', **kwargs)

def run_athena_query(query: str):
    """Ejecuta una consulta SQL en Athena y mapea la respuesta a JSON"""
    try:
        client = get_athena_client()
        
        # 1. Iniciar la ejecucion de la consulta SQL
        response = client.start_query_execution(
            QueryString=query,
            QueryExecutionContext={'Database': ATHENA_DATABASE},
            ResultConfiguration={'OutputLocation': S3_OUTPUT}
        )
        execution_id = response['QueryExecutionId']

        # 2. Esperar a que la consulta finalice
        while True:
            status_resp = client.get_query_execution(QueryExecutionId=execution_id)
            status = status_resp['QueryExecution']['Status']['State']
            if status in ['SUCCEEDED', 'FAILED', 'CANCELLED']:
                break
            time.sleep(0.5)

        if status != 'SUCCEEDED':
            reason = status_resp['QueryExecution']['Status'].get('StateChangeReason', 'Error desconocido')
            raise Exception(f"Athena query fallo con estado: {status}. Razon: {reason}")

        # 3. Obtener y procesar los resultados
        results = client.get_query_results(QueryExecutionId=execution_id)
        rows = results['ResultSet']['Rows']
        
        if not rows:
            return []

        # Extraer encabezados y filas
        headers = [col['VarCharValue'] for col in rows[0]['Data']]
        parsed_data = []

        for row in rows[1:]:
            values = [col.get('VarCharValue', None) for col in row['Data']]
            parsed_data.append(dict(zip(headers, values)))

        return parsed_data

    except Exception as e:
        print(f"Advertencia: No se pudo conectar con AWS Athena ({str(e)}).")
        return []

@app.get("/health")
def health_check():
    return {"status": "UP"}

@app.get("/api/analitica/ventas-restaurante")
def obtener_ventas_restaurante(limit: int = Query(default=10, ge=1, le=50)):
    """
    Método REST 1: Ventas por Restaurante (vista_ventas_restaurante)
    """
    query = f"""
    SELECT *
    FROM {ATHENA_DATABASE}.vista_ventas_restaurante
    ORDER BY total_ventas DESC
    LIMIT {limit};
    """
    return {
        "reporte": "Ventas por Restaurante",
        "data": run_athena_query(query)
    }

@app.get("/api/analitica/usuarios-frecuentes")
def obtener_usuarios_frecuentes(limit: int = Query(default=10, ge=1, le=50)):
    """
    Método REST 2: Usuarios Frecuentes (vista_usuarios_frecuentes)
    """
    query = f"""
    SELECT *
    FROM {ATHENA_DATABASE}.vista_usuarios_frecuentes
    ORDER BY numero_pedidos DESC
    LIMIT {limit};
    """
    return {
        "reporte": "Usuarios Frecuentes",
        "data": run_athena_query(query)
    }