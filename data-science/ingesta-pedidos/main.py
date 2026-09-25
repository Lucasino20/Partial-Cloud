import os
import pandas as pd
import psycopg2
import boto3
from datetime import datetime

def main():
    print("Iniciando extracción (Pull) de ms-pedidos (PostgreSQL)...")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", 5432)
    db_user = os.getenv("DB_USER", "root")
    db_pass = os.getenv("DB_PASS", "utec")
    db_name = os.getenv("DB_NAME", "bd_api_orders")
    s3_bucket = os.getenv("S3_BUCKET")
    
    try:
        conn = psycopg2.connect(
            host=db_host, port=db_port, user=db_user, password=db_pass, database=db_name
        )
        
        # Extraer el 100% de la tabla orders
        query_orders = "SELECT * FROM orders"
        df_orders = pd.read_sql(query_orders, conn)
        
        # Extraer el 100% de la tabla order_items
        query_items = "SELECT * FROM order_items"
        df_items = pd.read_sql(query_items, conn)
        
        conn.close()
        
        # Usar nombres fijos para sobreescribir archivos antiguos en S3
        file_orders = "orders.csv"
        file_items = "order_items.csv"
        
        df_orders.to_csv(file_orders, index=False)
        df_items.to_csv(file_items, index=False)
        
        print(f"Extraídos {len(df_orders)} pedidos y {len(df_items)} items.")
        
        if s3_bucket:
            s3 = boto3.client('s3')
            s3.upload_file(file_orders, s3_bucket, f"raw/orders/{file_orders}")
            s3.upload_file(file_items, s3_bucket, f"raw/order_items/{file_items}")
            print(f"✅ Archivos subidos exitosamente a S3 en s3://{s3_bucket}/raw/")
        else:
            print("⚠️ S3_BUCKET no configurado. Archivos generados localmente.")

    except Exception as e:
        print(f"Error durante la ingesta: {e}")

if __name__ == "__main__":
    main()
