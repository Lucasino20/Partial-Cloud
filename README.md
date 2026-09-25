# Proyecto Parcial - Cloud Computing
**CS2032 - Ciclo 2026-2**

Este repositorio contiene la arquitectura completa para el despliegue del proyecto en **AWS Academy**, estructurado para facilitar la automatización y el trabajo en equipo.

## Arquitectura del Proyecto

El proyecto está dividido en tres áreas principales organizadas en carpetas:

### 1. `backend/` (Microservicios)
Contiene 5 microservicios dockerizados y un API Gateway (Nginx). Cumple con el requisito de usar 3 lenguajes de programación distintos:
- **`ms-usuarios`**: Python (FastAPI) + MySQL. Gestiona autenticación y perfiles de usuario.
- **`ms-pedidos`**: Node.js (Express) + PostgreSQL. Gestiona la creación de órdenes de comida.
- **`ms-catalogo`**: Java (Spring Boot) + MongoDB. Administra los restaurantes y platos (reescrito para cumplir rúbrica de 3 lenguajes).
- **`ms-historial`**: Python (FastAPI). No tiene base de datos. Consume datos de los otros microservicios mediante HTTPX para armar un dashboard general.
- **`ms-consultas`**: Python (FastAPI). Microservicio analítico que consulta a AWS Athena mediante la librería `boto3`.
- **`nginx/`**: Reverse Proxy que actúa como API Gateway interno exponiendo todos los servicios únicamente por el puerto 80.

### 2. `frontend/` (AWS Amplify)
Aplicación Single-Page Application (SPA) construida en **React + Vite**.
- Diseño moderno estilo "App de Comida" (Rappi/PedidosYa).
- Cumple la rúbrica al consumir los 5 microservicios mediante llamadas reales `fetch()` (mínimo 2 endpoints por servicio).
- Se configura automáticamente para entornos locales o producción mediante la variable de entorno `VITE_API_URL`.

### 3. `data-science/` (Ingesta y Analytics)
Contiene scripts en Python diseñados para ejecutarse en contenedores Docker bajo la estrategia *Pull*. Se conectan a las 3 bases de datos (SQL y NoSQL), extraen el 100% de la información y la suben a un **Bucket S3** en formato CSV o JSON. Esta data será catalogada en AWS Glue y consultada desde AWS Athena por `ms-consultas`. *(Pendiente de completar la codificación de los contenedores).*

---

## Guía de Despliegue en AWS Academy

Para este proyecto levantarás Máquinas Virtuales (MVs) en AWS EC2 usando la AMI **`Cloud9Ubuntu22`**. No tienes que modificar código; simplemente clona el repositorio y ejecuta los scripts de bash proporcionados.

### Paso 1: MV Bases de Datos (Privada)
1. Crea la instancia y asígnale su Security Group (ver reglas abajo).
2. Clona este repositorio y entra a la carpeta: `cd mv-categorias`
3. Ejecuta el script de despliegue:
   ```bash
   bash deploy-dbs.sh
   ```
   *Este script instalará Docker automáticamente y levantará los contenedores de Postgres, MySQL y MongoDB.*

### Paso 2: MVs Producción Backend (Repetir en 2 máquinas distintas)
1. Crea las dos instancias EC2 que irán detrás del Balanceador de Carga.
2. En cada máquina, clona el repositorio y entra a la carpeta: `cd mv-categorias`
3. Ejecuta el script de despliegue pasando la IP Privada de la MV de Bases de Datos como parámetro:
   ```bash
   bash deploy-apps.sh <IP_PRIVADA_MV_BBDD>
   ```
   *Ejemplo: `bash deploy-apps.sh 172.31.10.5`*
   *El script configurará las variables de entorno, instalará Docker y levantará Nginx junto con los 5 microservicios.*

### Paso 3: AWS Amplify (Frontend)
1. Ve a la consola de AWS Amplify y conecta la rama `setup-parcial` de tu GitHub, apuntando a la carpeta raíz `frontend/`.
2. En las configuraciones de Amplify, añade una variable de entorno:
   - `VITE_API_URL` = El DNS público de tu Load Balancer (Ej: `http://mi-loadbalancer-123.us-east-1.elb.amazonaws.com`).

### Paso 4: MV Ingesta (Data Science)
1. Crea la instancia en EC2.
2. Clona el repositorio y ejecuta:
   ```bash
   bash deploy-ingesta.sh
   ```
   *(Próximamente este script iniciará los trabajos de extracción hacia S3).*

---

## Security Groups (Reglas de Acceso Inbound)

Para que la arquitectura funcione de manera segura y sin bloqueos de firewall en AWS, debes abrir exactamente estos puertos en la consola de EC2:

#### 1. Security Group: "SG-MV-BBDD" (MV Bases de Datos)
- **SSH (22)**: Desde tu IP personal (para entrar a correr el script).
- **PostgreSQL (5432)**: Desde el SG de MVs-Backend y SG de MV-Ingesta.
- **MySQL (3306)**: Desde el SG de MVs-Backend y SG de MV-Ingesta.
- **MongoDB (27017)**: Desde el SG de MVs-Backend y SG de MV-Ingesta.

#### 2. Security Group: "SG-MV-Backend" (MVs de Producción)
- **SSH (22)**: Desde tu IP personal.
- **HTTP (80)**: Desde el Security Group del Load Balancer. 
  *(No necesitas abrir 8000, 3002 ni 3005; Nginx se encarga internamente de todo).*

#### 3. Security Group: "SG-LoadBalancer" (Balanceador de Carga)
- **HTTP (80)**: Desde cualquier lugar (`0.0.0.0/0`).

#### 4. Security Group: "SG-MV-Ingesta" (Máquina de Data Science)
- **SSH (22)**: Desde tu IP personal.
- *(Solo requiere salida a internet, no necesita recibir tráfico de otros servicios).*

---
> **Tip para Pruebas Locales:** Si deseas probar el proyecto en tu propia computadora sin gastar créditos de AWS, simplemente usa `bash deploy-apps.sh host.docker.internal` (o tu IP local) después de haber levantado las DBs, y corre `npm run dev` dentro de la carpeta `frontend/`.