# 🔧 Solución de Problemas: Backend No Inicia

## 🎯 Problema: El backend genera los modelos pero no inicia el servidor

### Síntomas:
- ✅ Todos los modelos se generan correctamente
- ✅ Muestra "Modelos cargados exitosamente en memoria"
- ✅ Muestra "Iniciando servidor Flask..."
- ❌ Pero el servidor nunca arranca
- ❌ El navegador muestra "ERR_CONNECTION_REFUSED"

---

## 🔍 Diagnóstico

### Causa 1: Debugger de VS Code Interfiriendo
Si hay un debugger activo en VS Code, puede estar bloqueando el servidor.

**Solución:**
1. Cierra todas las ventanas de PowerShell/CMD
2. En VS Code, presiona `Shift + F5` para detener el debugger
3. Cierra VS Code completamente
4. Abre una nueva terminal CMD o PowerShell FUERA de VS Code
5. Ejecuta el script

### Causa 2: Puerto 5000 Ocupado
Otro proceso puede estar usando el puerto 5000.

**Solución:**
```powershell
# Ver qué está usando el puerto 5000
netstat -ano | findstr :5000

# Si encuentras un proceso, elimínalo (reemplaza PID con el número real)
taskkill /F /PID [PID]
```

### Causa 3: Flask en Modo Debug con Reloader
El reloader de Flask puede causar problemas.

**Solución:**
Ya se agregó `use_reloader=False` en el código. Si aún falla, usa el script simple:
```bash
python start_backend_simple.py
```

### Causa 4: Múltiples Instancias
Ya hay una instancia del backend corriendo en segundo plano.

**Solución:**
```powershell
# Matar todos los procesos de Python
taskkill /F /IM python.exe /T

# Luego reinicia
python backend\app.py
```

---

## 🚀 Soluciones Paso a Paso

### Opción 1: Script Simple (RECOMENDADO)

Usa el script simple que no tiene el reloader problemático:

```bash
python start_backend_simple.py
```

Este script:
- ✅ No usa debug mode
- ✅ No usa reloader
- ✅ Muestra más información de debug
- ✅ Espera un Enter antes de cerrar si hay error

### Opción 2: Iniciar Backend Manualmente

```bash
# Paso 1: Ir a la carpeta del proyecto
cd C:\UADE\GIT\CienciaDatos\cienciadedatos

# Paso 2: Limpiar procesos
taskkill /F /IM python.exe /T

# Paso 3: Esperar 2 segundos
timeout /t 2

# Paso 4: Iniciar backend
python backend\app.py
```

### Opción 3: Sin Debug Mode

Si el problema persiste, modifica temporalmente `backend/app.py`:

Busca la línea:
```python
app.run(debug=True, port=5000, host='0.0.0.0', use_reloader=False)
```

Cámbiala por:
```python
app.run(debug=False, port=5000, host='0.0.0.0')
```

### Opción 4: Cambiar Puerto

Si el puerto 5000 está causando problemas, usa otro:

1. En `backend/app.py`, cambia el puerto:
```python
app.run(debug=False, port=5001, host='0.0.0.0')
```

2. En `frontend/api.js`, actualiza la URL base:
```javascript
const API_BASE_URL = 'http://localhost:5001/api';
```

---

## 📋 Checklist de Verificación

Antes de iniciar el backend, verifica:

- [ ] No hay debugger activo en VS Code
- [ ] No hay otras terminales con Python corriendo
- [ ] El puerto 5000 está libre (`netstat -ano | findstr :5000`)
- [ ] Estás en el directorio correcto del proyecto
- [ ] `database.csv` existe en la raíz
- [ ] Todos los `.pkl` existen en `backend/`

---

## 🧪 Test de Conectividad

Una vez que el backend esté corriendo, prueba:

### En el navegador:
```
http://localhost:5000/api/health
```

**Respuesta esperada:**
```json
{
  "status": "success",
  "message": "Servidor backend funcionando correctamente"
}
```

### En PowerShell:
```powershell
curl http://localhost:5000/api/health
```

Si esto funciona, el backend está OK y el problema es del frontend.

---

## 🆘 Si Nada Funciona

### Última Opción: Reinstalar Dependencias

```bash
# 1. Crear nuevo entorno virtual
python -m venv venv_nuevo

# 2. Activar
venv_nuevo\Scripts\activate

# 3. Instalar dependencias
pip install -r backend\requirements.txt

# 4. Probar
python start_backend_simple.py
```

---

## 📞 Información para Debugging

Si necesitas ayuda, proporciona:

1. **Versión de Python:**
```bash
python --version
```

2. **Procesos en puerto 5000:**
```bash
netstat -ano | findstr :5000
```

3. **Últimas líneas de la terminal:**
(Captura las últimas 20 líneas)

4. **Archivos .pkl existentes:**
```bash
dir backend\*.pkl
```

5. **Mensaje de error completo:**
(Si hay alguno)

---

## ✅ Solución Probada

**Para tu caso específico (con debugger activo):**

1. **Detén el debugger:** `Shift + F5` en VS Code
2. **Cierra todas las terminales**
3. **Abre CMD FUERA de VS Code**
4. **Ejecuta:**
```bash
cd C:\UADE\GIT\CienciaDatos\cienciadedatos
python start_backend_simple.py
```

5. **Espera a ver:** "Servidor: http://localhost:5000"
6. **Prueba en navegador:** http://localhost:5000/api/health

---

**Última actualización:** Noviembre 2025
