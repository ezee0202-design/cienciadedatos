# 🎯 Nueva Funcionalidad: Selección de Modelo al Inicio

## 📋 Resumen

La aplicación ahora muestra una **pantalla de selección de modelo** antes de iniciar. El usuario elige qué tipo de análisis quiere realizar, y **toda la aplicación** se configura automáticamente según ese modelo (dashboard, gráficas, métricas, predicciones).

---

## ✨ Características Principales

### 1. **Pantalla de Bienvenida**
Al abrir la aplicación (`http://localhost:8080`), el usuario ve:
- **Fondo degradado** llamativo (morado/azul)
- **2 tarjetas** con información de cada modelo
- **Animaciones suaves** al cargar

### 2. **Información por Modelo**

#### Modelo 1: Satisfacción Salarial 😊
- **Target**: Predice si estás conforme con tu salario (1-2 vs 3-4)
- **Accuracy**: 69.5%
- **Features**: 10 variables
- **Top predictor**: Sueldo bruto en USD
- **Uso**: Medir satisfacción subjetiva del trabajador

#### Modelo 2: Bien Pagado 💰
- **Target**: Predice si ganas más que el promedio de tu grupo
- **Accuracy**: 68.4%
- **Features**: 16 variables (bloque 9)
- **Top predictor**: Edad
- **Uso**: Comparación objetiva vs promedio (rol + seniority)

### 3. **Carga Dinámica de Datos**

Una vez seleccionado el modelo, la aplicación carga:
- ✅ Dashboard con métricas del modelo elegido
- ✅ Gráficas específicas del modelo:
  - `feature_importance.png` o `seniority_feature_importance.png`
  - `confusion_matrix.png` o `seniority_confusion_matrix.png`
  - `model_metrics.png` o `seniority_model_metrics.png`
- ✅ Análisis EDA (común para ambos modelos)
- ✅ Predicciones configuradas para el modelo seleccionado

### 4. **Botón "Cambiar Modelo"**

En el navbar hay un botón **"🔄 Cambiar Modelo"** que:
- Permite volver a la pantalla de selección
- Limpia el almacenamiento local
- Recarga la aplicación con el nuevo modelo

### 5. **Persistencia de Selección**

La aplicación guarda tu elección en `localStorage`:
- Si recargas la página, **mantiene el mismo modelo**
- No tienes que volver a elegir cada vez
- Para cambiar, usa el botón "Cambiar Modelo"

---

## 🔧 Implementación Técnica

### Frontend

#### `index.html`
```html
<!-- Pantalla de selección (visible al inicio) -->
<div id="model-selection-screen" class="model-selection-screen">
  <div class="model-cards">
    <div class="model-card" data-model="satisfaction">
      <h2>Satisfacción Salarial</h2>
      <button class="select-model-btn" data-model="satisfaction">
        Usar este modelo →
      </button>
    </div>
    <div class="model-card" data-model="seniority">
      <h2>Bien Pagado vs Promedio</h2>
      <button class="select-model-btn" data-model="seniority">
        Usar este modelo →
      </button>
    </div>
  </div>
</div>

<!-- Aplicación principal (oculta al inicio) -->
<div id="main-app" class="main-app" style="display: none;">
  <!-- navbar, sidebar, dashboard, etc. -->
</div>
```

#### `app.js`
```javascript
let currentModel = null;

async function initializeApp() {
    const savedModel = localStorage.getItem('selectedModel');
    
    if (savedModel) {
        await loadModel(savedModel); // Cargar directamente
    } else {
        showModelSelection(); // Mostrar pantalla de selección
    }
}

async function loadModel(modelType) {
    currentModel = modelType;
    localStorage.setItem('selectedModel', modelType);
    
    // Ocultar selección, mostrar app
    document.getElementById('model-selection-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    // Cargar datos según modelo
    await loadAppData(modelType);
}
```

#### `ui.js`
```javascript
async function loadModelGraphics(modelType = 'satisfaction') {
    const prefix = modelType === 'seniority' ? 'seniority_' : '';
    
    // Cargar gráficas con prefijo correcto
    element.src = `/${prefix}feature_importance.png?t=${Date.now()}`;
}
```

### Backend

#### `app.py`
```python
@app.route('/api/analysis-info', methods=['GET'])
def get_analysis_info():
    model_type = request.args.get('model', 'satisfaction')
    
    if model_type == 'seniority':
        return jsonify({'status': 'success', 'data': seniority_analysis_results})
    else:
        return jsonify({'status': 'success', 'data': analysis_results})
```

**Endpoints actualizados**:
- `/api/analysis-info?model=satisfaction` o `?model=seniority`
- `/api/model-metrics?model=...`
- `/api/feature-importance?model=...`
- `/api/model-info?model=...`

---

## 📊 Flujo de Usuario

```
1. Usuario abre http://localhost:8080
   ↓
2. Ve pantalla de selección con 2 opciones
   ↓
3. Hace clic en "Usar este modelo →"
   ↓
4. Aplicación carga modelo seleccionado
   ↓
5. Dashboard muestra métricas del modelo elegido
   ↓
6. Gráficas se cargan según el modelo
   ↓
7. Predicciones usan el modelo correcto
   ↓
8. Si recarga página: mantiene mismo modelo
   ↓
9. Para cambiar: clic en "🔄 Cambiar Modelo"
```

---

## 🎨 Estilos CSS

### Pantalla de Selección
```css
.model-selection-screen {
    position: fixed;
    width: 100%;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: 9999;
    animation: fadeIn 0.5s ease-in;
}

.model-card {
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    transition: transform 0.3s ease;
}

.model-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 50px rgba(0,0,0,0.3);
}
```

### Animaciones
- **fadeIn**: Entrada suave de la pantalla
- **slideDown**: Encabezado desciende
- **scaleIn**: Tarjetas crecen con retraso escalonado

---

## 📁 Archivos Modificados

### Frontend
- ✅ `index.html` - Pantalla de selección + wrapper de main-app
- ✅ `styles.css` - Estilos para `.model-selection-screen`
- ✅ `app.js` - Lógica de selección y persistencia
- ✅ `ui.js` - Carga dinámica de gráficas según modelo
- ✅ `api.js` - Envío de parámetro `model` a endpoints

### Backend
- ✅ `app.py` - Endpoints con parámetro `?model=`

---

## 🚀 Cómo Usar

### 1. Iniciar aplicación
```bash
cd C:\Users\User\Desktop\CIENCIA_DATOS
.\start_app.bat
```

### 2. Abrir navegador
```
http://localhost:8080
```

### 3. Seleccionar modelo
- Leer descripción de ambos modelos
- Hacer clic en "Usar este modelo →"

### 4. Explorar aplicación
- Dashboard actualizado con métricas del modelo
- Gráficas específicas del modelo
- Realizar predicciones

### 5. Cambiar de modelo (opcional)
- Clic en "🔄 Cambiar Modelo" en navbar
- Vuelve a pantalla de selección
- Elige otro modelo

---

## 🔄 Cambios vs Versión Anterior

| Aspecto | Versión Anterior | Versión Nueva |
|---------|-----------------|---------------|
| **Selección** | Dropdown dentro de formulario | Pantalla dedicada al inicio |
| **Métricas** | Mezcladas ambos modelos | Específicas del modelo elegido |
| **Gráficas** | Siempre del mismo modelo | Cambian según selección |
| **Persistencia** | No guardaba elección | Guarda en localStorage |
| **Cambio** | Manual en dropdown | Botón dedicado en navbar |
| **UX** | Confuso qué modelo se usa | Claro desde el inicio |

---

## 💡 Ventajas del Nuevo Enfoque

1. **Claridad**: Usuario sabe exactamente qué modelo está usando
2. **Consistencia**: Todos los datos (dashboard, gráficas) corresponden al modelo elegido
3. **Educativo**: Muestra características de cada modelo antes de elegir
4. **Profesional**: Pantalla de bienvenida atractiva
5. **Persistente**: No pierde la selección al recargar
6. **Flexible**: Fácil cambiar de modelo cuando se necesite

---

## 🎓 Casos de Uso

### Caso 1: Análisis de Satisfacción
**Pregunta**: ¿Mi equipo está conforme con sus salarios?
**Modelo**: Satisfacción Salarial
**Resultado**: Predicción de conformidad (1-2 vs 3-4)

### Caso 2: Benchmarking Salarial
**Pregunta**: ¿Mis empleados ganan más o menos que el mercado?
**Modelo**: Bien Pagado
**Resultado**: Comparación vs promedio del grupo (rol + seniority)

---

## 🐛 Debugging

### Ver modelo actualmente seleccionado
```javascript
console.log('Modelo actual:', localStorage.getItem('selectedModel'));
```

### Forzar re-selección
```javascript
localStorage.removeItem('selectedModel');
location.reload();
```

### Verificar carga de gráficas
```javascript
// En consola del navegador
document.getElementById('graphic-importance').src
// Debe mostrar: /feature_importance.png o /seniority_feature_importance.png
```

---

## ✅ Checklist de Funcionalidad

- [x] Pantalla de selección aparece al inicio
- [x] 2 modelos claramente descritos
- [x] Al seleccionar, carga el modelo correcto
- [x] Dashboard muestra métricas del modelo elegido
- [x] Gráficas cambian según modelo (prefijo `seniority_`)
- [x] Predicciones usan el modelo correcto
- [x] Botón "Cambiar Modelo" funciona
- [x] Persistencia en localStorage
- [x] Backend sirve datos según parámetro `?model=`
- [x] Animaciones suaves en transiciones

---

## 📝 Notas Técnicas

- **localStorage**: Guarda string `'satisfaction'` o `'seniority'`
- **Prefijo de archivos**: Modelo seniority usa `seniority_*.png`
- **Cache busting**: Usa `?t=${Date.now()}` para evitar cache
- **Fallback**: Si falta modelo seniority, usa satisfaction
- **Default**: Si no hay selección guardada, muestra pantalla

---

## 🎉 Resultado Final

Una aplicación web profesional que:
1. **Pregunta qué quieres analizar** antes de empezar
2. **Adapta toda la interfaz** al modelo elegido
3. **Mantiene consistencia** en datos mostrados
4. **Permite cambiar fácilmente** de modelo
5. **Guarda tu preferencia** para próximas visitas

¡Ahora la aplicación es **verdaderamente multi-modelo**! 🚀
