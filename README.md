#Proyecto Intermodular/Integrador - Test Yourself


---

## Requisitos Previos

Antes de empezar, necesitas tener instalado:

* **Python 3.8 o superior** (para el backend)
* **Node.js 16 o superior** (para el frontend)
* **npm** (incluido con Node.js) o **yarn**

---

## Instalación Completa

### 1. Clonar o descargar el proyecto


git clone 

O descarga el proyecto en formato ZIP y descomprímelo.

---

# Backend (Django)

### 2. Ir al directorio del backend

```bash
cd backend_tests
```

### 3. Crear y activar entorno virtual (opcional)

**Windows**

```bash
python -m venv venv
venv\Scripts\activate
```


### 4. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 5. Aplicar migraciones

```bash
python manage.py migrate
```

### 6. Crear superusuario (opcional)

```bash
python manage.py createsuperuser
```

### 7. Iniciar servidor backend

```bash
python manage.py runserver
```

El backend estará disponible en:

```text
http://localhost:8000
```

---

# Frontend (React)

### 8. Abrir una nueva terminal

### 9. Ir al directorio del frontend

```bash
cd front_end_tests
```

### 10. Instalar dependencias

```bash
npm install
```

### 11. Iniciar servidor frontend

```bash
npm run dev
```

Si el proyecto usa Create React App:

```bash
npm start
```

El frontend estará disponible normalmente en:

```text
http://localhost:5173
```

---

## 🚀 Tecnologías Utilizadas

### Backend

* Django 4.2.7
* Django REST Framework
* dj-rest-auth
* django-allauth
* django-cors-headers
* Python Dotenv
...

### Frontend

* React 18
* React Router DOM
* Axios
* Tailwind CSS
* Google OAuth

---

## 📌 Notas

Si únicamente quieres utilizar la aplicación, puedes acceder directamente a las versiones desplegadas:

* Frontend: https://testyourselfcambridge.netlify.app/
* Backend: https://manelgram112.pythonanywhere.com/swagger
