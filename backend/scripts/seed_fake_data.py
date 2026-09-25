import os
import random
from faker import Faker
import psycopg2
import mysql.connector
from pymongo import MongoClient

fake = Faker('es_MX')

DB_HOST = os.getenv("DB_HOST", "localhost")
print(f"Conectando a bases de datos en {DB_HOST} para inyectar Fake Data (20,000+ registros)...")

has_errors = False

# 1. MySQL (Usuarios)
try:
    conn_mysql = mysql.connector.connect(host=DB_HOST, port=3306, user="root", password="utec", database="mydb")
    cursor_mysql = conn_mysql.cursor()
    cursor_mysql.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100), apellido VARCHAR(100), email VARCHAR(100),
            telefono VARCHAR(20), password VARCHAR(100), role VARCHAR(20) DEFAULT 'cliente', restaurant_id VARCHAR(50) DEFAULT NULL
        )
    """)
    # Check if data already exists
    cursor_mysql.execute("SELECT COUNT(*) FROM users")
    if cursor_mysql.fetchone()[0] == 0:
        users_data = []
        print("Generando 5,000 usuarios...")
        for _ in range(5000):
            users_data.append((fake.first_name(), fake.last_name(), fake.unique.email(), fake.phone_number(), "hash123", "cliente"))
        cursor_mysql.executemany("INSERT INTO users (nombre, apellido, email, telefono, password, role) VALUES (%s, %s, %s, %s, %s, %s)", users_data)
        conn_mysql.commit()
        print("✅ 5,000 usuarios insertados en MySQL")
    else:
        print("✅ MySQL ya tenía datos de usuarios.")
    conn_mysql.close()
except Exception as e:
    print("❌ Error MySQL:", e)
    has_errors = True

# 2. MongoDB (Catálogo)
try:
    client = MongoClient(f"mongodb://root:utec@{DB_HOST}:27017/cloudeats_catalogo?authSource=admin")
    db = client.get_database("cloudeats_catalogo")
    collection = db.get_collection("restaurants")
    if collection.count_documents({}) == 0:
        print("Generando 100 restaurantes y platos realistas...")
        platos_reales = ["Lomo Saltado", "Ceviche", "Aji de Gallina", "Arroz con Pollo", "Papa a la Huancaina", "Causa Rellena", "Anticuchos", "Pollo a la Brasa", "Tallarines Verdes", "Seco de Carne", "Chaufa de Pollo", "Sopa a la Minuta", "Rocoto Relleno", "Pisco Sour", "Chicha Morada", "Suspiro a la Limeña", "Picarones", "Tacu Tacu", "Chupe de Camarones", "Aguadito", "Jalea Mixta", "Tiradito", "Arroz Chaufa", "Chicharron", "Maca", "Embutidos", "Pan con Chicharron"]
        nombres_restaurantes = ["El Rincon", "Sabor", "La Taberna", "La Esquina", "Don", "Doña", "Tradición", "El Buen Sabor", "La Casa de", "Picantería", "El Huarique de", "Parrilladas"]
        rest_data = []
        for i in range(100):
            platos = []
            random.shuffle(platos_reales)
            for j in range(random.randint(5, 12)):
                platos.append({
                    "id": j+1,
                    "nombre": platos_reales[j],
                    "precio": round(random.uniform(10.0, 60.0), 2)
                })
            
            rest_nombre = f"{random.choice(nombres_restaurantes)} {fake.first_name()}"
            rest_data.append({
                "id": i+1,
                "nombre": rest_nombre,
                "distrito": random.choice(["Miraflores", "San Isidro", "Surco", "Barranco", "San Borja", "La Molina", "Lima Cercado", "Los Olivos", "San Miguel", "Magdalena"]),
                "img": f"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
                "platos": platos
            })
        collection.insert_many(rest_data)
        print("✅ 100 restaurantes insertados en MongoDB")
    else:
        print("✅ MongoDB ya tenía datos de catálogo.")
except Exception as e:
    print("❌ Error MongoDB:", e)
    has_errors = True

# 3. PostgreSQL (Pedidos)
try:
    conn_pg = psycopg2.connect(host=DB_HOST, port=5432, user="root", password="utec", database="bd_api_orders")
    cursor_pg = conn_pg.cursor()
    cursor_pg.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY, user_id VARCHAR(50), restaurant_id VARCHAR(50), subtotal DECIMAL(10,2), delivery_fee DECIMAL(10,2), total DECIMAL(10,2), address VARCHAR(255), status VARCHAR(50), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY, order_id INT, dish_id VARCHAR(50), name VARCHAR(100), quantity INT, price DECIMAL(10,2), qty INT
        );
    """)
    cursor_pg.execute("SELECT COUNT(*) FROM orders")
    if cursor_pg.fetchone()[0] == 0:
        print("Generando 10,000 pedidos y 20,000 items...")
        orders_data = []
        items_data = []
        platos_reales_pg = ["Lomo Saltado", "Ceviche", "Aji de Gallina", "Arroz con Pollo", "Papa a la Huancaina", "Causa Rellena", "Anticuchos", "Pollo a la Brasa", "Tallarines Verdes", "Seco de Carne", "Chaufa de Pollo", "Sopa a la Minuta", "Rocoto Relleno", "Pisco Sour", "Chicha Morada", "Suspiro a la Limeña", "Picarones", "Tacu Tacu", "Chupe de Camarones", "Aguadito", "Jalea Mixta", "Tiradito", "Arroz Chaufa", "Chicharron", "Maca", "Embutidos", "Pan con Chicharron"]
        
        for i in range(10000):
            o_id = i + 1
            user_id = str(random.randint(1, 5000))
            rest_id = str(random.randint(1, 100))
            subtotal = round(random.uniform(20.0, 500.0), 2)
            delivery_fee = 5.0
            total = subtotal + delivery_fee
            address = fake.street_address()
            status = random.choice(["ENTREGADO", "EN_PREPARACION", "CANCELADO", "EN_CAMINO"])
            orders_data.append((o_id, user_id, rest_id, subtotal, delivery_fee, total, address, status))
            
            # Add 2 items per order on average (20,000 total items)
            for _ in range(random.randint(1, 3)):
                dish_id = str(random.randint(1, 10))
                name = random.choice(platos_reales_pg)
                qty = random.randint(1, 4)
                price = round(random.uniform(10.0, 50.0), 2)
                items_data.append((o_id, dish_id, name, qty, price, qty))
                
        cursor_pg.executemany("INSERT INTO orders (id, user_id, restaurant_id, subtotal, delivery_fee, total, address, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)", orders_data)
        cursor_pg.executemany("INSERT INTO order_items (order_id, dish_id, name, quantity, price, qty) VALUES (%s, %s, %s, %s, %s, %s)", items_data)
        conn_pg.commit()
        print("✅ 10,000 pedidos y múltiples items insertados en PostgreSQL")
    else:
        print("✅ PostgreSQL ya tenía datos de pedidos.")
    conn_pg.close()
except Exception as e:
    print("❌ Error PostgreSQL:", e)
    has_errors = True

if has_errors:
    print("❌ Hubo errores conectándose a las bases de datos. Saliendo con error.")
    import sys
    sys.exit(1)

print("🎉 Inyección de Fake Data (más de 35,000 registros) Finalizada exitosamente.")
