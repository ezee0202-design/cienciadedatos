# 🚀 Análisis de Satisfacción Laboral - Guía de Instalación Rápida

## ⚡ Instalación en 3 pasos

### 1️⃣ Descarga el proyecto
```bash
git clone <url-de-tu-repositorio>
cd CIENCIA_DATOS
```

### 2️⃣ Setup automático
```bash
python setup_complete.py
```

Esto instalará dependencias y entrenará los 5 modelos automáticamente (2-5 minutos).

### 3️⃣ Iniciar la aplicación
```bash
# Windows:
run.bat

# Linux/Mac:
# Terminal 1:
python backend/app.py

# Terminal 2 (en otra terminal):
python frontend/server.py
```

### 4️⃣ Abrir en el navegador
```
http://localhost:8080
```

---

## 📋 Requisitos

- Python 3.8 o superior
- Conexión a internet (para instalar dependencias)
- 500 MB de espacio libre

---

## 🎯 Funcionalidades

✅ **Predicción de Satisfacción Laboral** (3 modelos: Random Forest, Seniority, XGBoost)  
✅ **Predicción de Sueldo Actual** (en USD)  
✅ **Predicción de Sueldo Futuro** (en ARS con variable temporal)  
✅ **Clustering Interactivo** (selecciona cualquier columna del dataset)  
✅ **Visualizaciones** interactivas con Chart.js

---

## ❓ ¿Problemas?

### No tengo Python
Descarga e instala desde: https://www.python.org/downloads/

### Error: "No module named..."
```bash
pip install pandas numpy scikit-learn xgboost flask flask-cors matplotlib
```

### El puerto 5000 está ocupado
En `backend/app.py` cambia:
```python
app.run(debug=True, port=5001)  # Usar otro puerto
```

### Más ayuda
Lee el archivo completo `INSTALL.md` para instrucciones detalladas.

---

## 📦 ¿Qué incluye este proyecto?

- `database.csv` - Dataset con 12,418 registros de empleados
- Scripts de entrenamiento (`generate_*.py`) - Crean los modelos
- `backend/app.py` - API REST con Flask
- `frontend/` - Interfaz web con HTML/CSS/JavaScript
- `setup_complete.py` - Setup automático

---

## 🔐 Nota importante

**Los archivos `.pkl` NO se incluyen en el repositorio** porque son grandes y específicos de cada máquina. El script `setup_complete.py` los genera automáticamente en tu computadora.

---

## 👨‍💻 Para desarrolladores

```bash
# Verificar que todo está OK
python verificar_todo.py

# Re-entrenar un modelo específico
python generate_regression_futuro.py

# Ver análisis completo
python diagnostico_graficas.py
```

---

**¡Listo!** 🎉 En menos de 5 minutos tendrás la aplicación funcionando.

