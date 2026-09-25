import os
import pandas as pd
from pymongo import MongoClient
import boto3
from datetime import datetime
import json

def main():
    print("Iniciando extracción (Pull) de ms-catalogo (MongoDB)...")
    mongo_uri = os.getenv("MONGO_URI", "mongodb://root:utec@localhost:27017/cloudeats_catalogo?authSource=admin")
    s3_bucket = os.getenv("S3_BUCKET")
    
    try:
        client = MongoClient(mongo_uri)
        db = client.get_database("cloudeats_catalogo")
        collection = db.get_collection("restaurants")
        
        # MongoDB pull 100% de la tabla (colección) excluyendo _id
        data = list(collection.find({}, {'_id': False}))
        
        # Usamos un nombre fijo para sobreescribir el archivo viejo en S3 y que Athena no lea basura
        filename = "catalogo.json"
        
        with open(filename, 'w') as f:
            for record in data:
                f.write(json.dumps(record) + '\n')
            
        print(f"Extraídos {len(data)} restaurantes. Guardado en {filename}")
            
        if s3_bucket:
            s3 = boto3.client('s3')
            s3.upload_file(filename, s3_bucket, f"raw/catalogo/{filename}")
            print(f"✅ Archivo {filename} subido exitosamente a S3 en s3://{s3_bucket}/raw/catalogo/")
        else:
            print("⚠️ S3_BUCKET no configurado. Archivo generado localmente.")

    except Exception as e:
        print(f"Error durante la ingesta: {e}")

if __name__ == "__main__":
    main()
