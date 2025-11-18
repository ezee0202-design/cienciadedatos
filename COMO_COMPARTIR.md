# 📤 GUÍA PARA COMPARTIR TU PROYECTO

## ✅ Lo que DEBES compartir

### 1. Código fuente y scripts
```
✅ setup_complete.py
✅ generate_models.py
✅ generate_seniority_model.py
✅ generate_xgboost_model.py
✅ generate_regression_model.py
✅ generate_regression_futuro.py
✅ verificar_todo.py
✅ run.bat
✅ backend/app.py
✅ backend/requirements.txt
✅ frontend/*.html
✅ frontend/*.js
✅ frontend/*.css
✅ frontend/server.py
✅ .gitignore
✅ INSTALL.md
✅ LEEME.md
✅ README.md
```

### 2. Dataset
```
✅ database.csv (12,418 registros)
```

### 3. Archivos de documentación
```
✅ INSTALL.md - Instrucciones detalladas
✅ LEEME.md - Guía rápida en español
✅ README.md - Documentación del proyecto
✅ COMO_COMPARTIR.md - Este archivo
```

---

## ❌ Lo que NO debes compartir

### Archivos generados automáticamente (.pkl)
```
❌ backend/random_forest_model.pkl
❌ backend/seniority_model.pkl
❌ backend/xgboost_model.pkl
❌ backend/regression_salary_model.pkl
❌ backend/regression_salary_scaler.pkl
❌ backend/regression_futuro_model.pkl
❌ backend/regression_futuro_scaler.pkl
❌ backend/*.json (features, analysis)
```

**¿Por qué?**
- Son archivos grandes (1-2 MB cada uno)
- Se generan automáticamente con `setup_complete.py`
- Son específicos de cada máquina/versión de scikit-learn
- GitHub los rechaza si son muy grandes

---

## 🔧 Cómo compartir el proyecto

### Opción 1: GitHub (Recomendado)

#### Paso 1: Crear repositorio
```bash
# En la carpeta del proyecto:
git init
git add .
git commit -m "Initial commit - Proyecto de Análisis Laboral"
```

#### Paso 2: Subir a GitHub
```bash
# Crear repo en github.com, luego:
git remote add origin https://github.com/tu-usuario/tu-repo.git
git branch -M main
git push -u origin main
```

#### Paso 3: Verificar .gitignore
Asegúrate de que `.gitignore` incluya:
```
*.pkl
backend/*.pkl
backend/*.json
```

#### Paso 4: Actualizar README
En GitHub, el archivo `LEEME.md` se mostrará primero. Incluye:
```markdown
# Instrucciones de instalación
Ver archivo INSTALL.md para instrucciones completas.

## Inicio rápido:
1. `python setup_complete.py`
2. `run.bat` (Windows) o `python backend/app.py` + `python frontend/server.py`
3. Abrir http://localhost:8000
```

---

### Opción 2: Archivo ZIP

#### Paso 1: Limpiar archivos generados
```bash
# Windows PowerShell:
Remove-Item backend\*.pkl -Force
Remove-Item backend\*.json -Force

# Linux/Mac:
rm backend/*.pkl
rm backend/*.json
```

#### Paso 2: Crear ZIP
Comprime la carpeta **sin incluir**:
- `backend/*.pkl`
- `backend/*.json`
- `__pycache__/`
- `.ipynb_checkpoints/`

#### Paso 3: Compartir
Sube el ZIP a:
- Google Drive
- Dropbox
- OneDrive
- WeTransfer

---

### Opción 3: Google Colab (para notebooks)

Si quieres compartir solo el análisis:

1. Sube `data_analysis.ipynb` a Google Colab
2. Sube `database.csv` a tu Drive
3. Modifica la ruta en el notebook:
```python
# Montar Drive
from google.colab import drive
drive.mount('/content/drive')

# Cargar dataset
df = pd.read_csv('/content/drive/MyDrive/database.csv')
```

4. Comparte el enlace del Colab

---

## 📋 Checklist antes de compartir

```
✅ Verificar que .gitignore incluye *.pkl
✅ Eliminar archivos .pkl del repo (si ya estaban)
✅ Probar setup_complete.py en una carpeta limpia
✅ Verificar que database.csv esté incluido
✅ Actualizar INSTALL.md con instrucciones claras
✅ Agregar tu información de contacto en README.md
✅ Probar que run.bat funciona
✅ Verificar que todos los scripts generate_*.py existen
✅ Documentar requisitos de sistema (Python 3.8+)
✅ Incluir capturas de pantalla (opcional)
```

---

## 📝 Mensaje para usuarios nuevos

Cuando compartas el proyecto, incluye este mensaje:

```
🚀 PROYECTO: Análisis de Satisfacción Laboral

📦 INSTALACIÓN RÁPIDA:
1. Descarga/clona el repositorio
2. Ejecuta: python setup_complete.py
3. Inicia: run.bat (Windows) o sigue INSTALL.md
4. Abre: http://localhost:8000

⏱️ TIEMPO: 5 minutos
📋 REQUISITOS: Python 3.8+, 500 MB espacio

📖 DOCUMENTACIÓN:
- LEEME.md → Guía rápida
- INSTALL.md → Instrucciones detalladas
- README.md → Documentación técnica

❓ PROBLEMAS: Ver sección "Solución de Problemas" en INSTALL.md

⚠️ NOTA: Los archivos .pkl se generan automáticamente.
No están incluidos en el repo (son grandes y específicos de cada PC).
```

---

## 🔍 Verificación final

Antes de compartir, prueba en una carpeta nueva:

```bash
# 1. Clonar/extraer en carpeta nueva
cd /ruta/nueva

# 2. Verificar archivos
ls -la  # Linux/Mac
dir     # Windows

# 3. Ejecutar setup
python setup_complete.py

# 4. Verificar modelos
python verificar_todo.py

# 5. Iniciar app
python backend/app.py
python frontend/server.py

# 6. Probar en navegador
# http://localhost:8000
```

Si todo funciona → **¡Listo para compartir!** 🎉

---

## 🆘 Soporte

Incluye en tu README:

```markdown
## Soporte

Si tienes problemas:
1. Lee INSTALL.md completamente
2. Ejecuta `python verificar_todo.py`
3. Verifica que tengas Python 3.8+
4. Revisa que database.csv tenga 12,418 filas
5. Abre un issue en GitHub (si usas GitHub)
```

---

## 💡 Tips adicionales

### Para repositorios públicos:
- ✅ Agrega LICENSE (MIT es común)
- ✅ Incluye capturas de pantalla en README
- ✅ Documenta las tecnologías usadas
- ✅ Agrega badges (Python, Flask, scikit-learn)

### Para entregas académicas:
- ✅ Incluye PDF con resultados
- ✅ Documenta metodología en DOCUMENTO_TECNICO_FINAL.md
- ✅ Agrega sección "Referencias"
- ✅ Incluye gráficas de resultados

### Para portafolio:
- ✅ Deploy en Heroku/Render (backend)
- ✅ Deploy en Netlify/Vercel (frontend)
- ✅ Agrega demo en vivo
- ✅ Video explicativo (opcional)

---

**¡Éxito!** 🎊 Con estas instrucciones, cualquiera podrá usar tu proyecto sin problemas.
