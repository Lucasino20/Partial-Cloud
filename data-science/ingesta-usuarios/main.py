import os
import pandas as pd
import mysql.connector
import boto3
from datetime import datetime

def main():
    print("Iniciando extracción (Pull) de ms-usuarios (MySQL)...")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", 3306)
    db_user = os.getenv("DB_USER", "root")
    db_pass = os.getenv("DB_PASS", "utec")
    db_name = os.getenv("DB_NAME", "mydb")
    s3_bucket = os.getenv("S3_BUCKET")
    
    try:
        conn = mysql.connector.connect(
            host=db_host, port=db_port, user=db_user, password=db_pass, database=db_name
        )
        # Extraer el 100% de la tabla usuarios
        query = "SELECT * FROM users" 
        df = pd.read_sql(query, conn)
        conn.close()
        
        filename = "usuarios.csv"
        df.to_csv(filename, index=False)
        print(f"Extraídos {len(df)} registros. Guardado en {filename}")
        
        if s3_bucket:
            s3 = boto3.client('s3')
            s3.upload_file(filename, s3_bucket, f"raw/usuarios/{filename}")
            print(f"✅ Archivo {filename} subido exitosamente a S3 en s3://{s3_bucket}/raw/usuarios/")
        else:
            print("⚠️ S3_BUCKET no configurado. Archivo generado localmente, no subido a AWS.")
            
    except Exception as e:
        print(f"Error durante la ingesta: {e}")

if __name__ == "__main__":
    main()
