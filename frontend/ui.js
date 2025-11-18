/**
 * ui.js - Funciones para actualizar la interfaz de usuario
 */

/**
 * Actualizar el estado de conexión
 */
function updateConnectionStatus(connected) {
    const statusDot = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    
    if (connected) {
        statusDot.classList.add('connected');
        statusDot.classList.remove('error');
        statusText.textContent = 'Conectado';
    } else {
        statusDot.classList.remove('connected');
        statusDot.classList.add('error');
        statusText.textContent = 'Desconectado';
    }
}

/**
 * Actualizar dashboard con datos del análisis
 */
function updateDashboard(analysisData) {
    if (!analysisData || !analysisData.data) return;

    const data = analysisData.data;
    const metrics = data.model_metrics || {};
    const datasetInfo = data.dataset_info || {};
    const seniorityDist = data.seniority_distribution || {};

    // Actualizar cards
    document.getElementById('total-records').textContent = datasetInfo.total_rows || '-';
    document.getElementById('accuracy-value').textContent = 
        formatPercent(metrics.accuracy || 0);
    document.getElementById('f1-value').textContent = 
        formatDecimal(metrics.f1_score || 0, 3);
    document.getElementById('trees-value').textContent = '200';

    // Actualizar tabla de métricas
    document.getElementById('metric-accuracy').textContent = 
        formatPercent(metrics.accuracy || 0);
    document.getElementById('metric-precision').textContent = 
        formatDecimal(metrics.precision || 0, 3);
    document.getElementById('metric-recall').textContent = 
        formatDecimal(metrics.recall || 0, 3);
    document.getElementById('metric-f1').textContent = 
        formatDecimal(metrics.f1_score || 0, 3);

    // Actualizar tabla de dataset
    document.getElementById('data-rows').textContent = datasetInfo.total_rows || '-';
    document.getElementById('data-cols').textContent = datasetInfo.total_columns || '-';
    document.getElementById('data-train').textContent = datasetInfo.train_size || '-';
    document.getElementById('data-test').textContent = datasetInfo.test_size || '-';

    // Actualizar distribución de seniority
    updateSeniorityDistribution(seniorityDist);
}

/**
 * Actualizar gráfico de distribución de seniority
 */
function updateSeniorityDistribution(seniorityDist) {
    const container = document.getElementById('seniority-dist');
    container.innerHTML = '';

    const total = Object.values(seniorityDist).reduce((a, b) => a + b, 0);

    for (const [seniority, count] of Object.entries(seniorityDist)) {
        const percentage = (count / total) * 100;
        
        const item = document.createElement('div');
        item.className = 'seniority-item';
        item.innerHTML = `
            <div class="seniority-label">${seniority}</div>
            <div class="seniority-bar">
                <div class="seniority-fill" style="width: ${percentage}%">
                    ${Math.round(percentage)}%
                </div>
            </div>
            <div class="seniority-label">${count}</div>
        `;
        container.appendChild(item);
    }
}

/**
 * Actualizar información del modelo
 */
function updateModelInfo(modelInfo) {
    if (!modelInfo || !modelInfo.model_info) return;

    const info = modelInfo.model_info;

    document.getElementById('model-type').textContent = info.type || '-';
    document.getElementById('model-trees').textContent = info.n_estimators || '-';
    document.getElementById('model-depth').textContent = info.max_depth || '-';
    document.getElementById('model-features').textContent = info.n_features || '-';
    document.getElementById('model-classes').textContent = info.n_classes || '-';
    document.getElementById('model-class-names').textContent = 
        (info.classes || []).join(', ') || '-';
}

/**
 * Cargar gráficas de EDA
 */
async function loadEdaGraphics() {
    try {
        // Cargar directamente desde el frontend (más simple y confiable)
        const edaGraphics = {
            'distributions.png': 'eda-distributions',
            'correlation_matrix.png': 'eda-correlation',
            'missing_values.png': 'eda-missing'
        };

        for (const [filename, elementId] of Object.entries(edaGraphics)) {
            const element = document.getElementById(elementId);
            if (element) {
                // Cargar directamente desde el servidor frontend
                element.src = `/${filename}?t=${Date.now()}`;
                console.log(`✓ Cargando gráfica EDA: ${filename}`);
                
                element.onerror = () => {
                    console.error(`❌ Error cargando: ${filename}`);
                    element.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999"%3EGráfica no disponible%3C/text%3E%3C/svg%3E';
                };
                
                element.onload = () => {
                    console.log(`✅ Gráfica EDA cargada exitosamente: ${filename}`);
                };
            }
        }
    } catch (error) {
        console.error('Error cargando gráficas EDA:', error);
    }
}

/**
 * Cargar gráficas del modelo
 */
async function loadModelGraphics(modelType = 'satisfaction') {
    try {
        // Determinar prefijo según modelo
        const prefix = modelType === 'seniority' ? 'seniority_' : 
                       modelType === 'xgboost' ? 'xgboost_' : '';
        
        // Cargar directamente desde el frontend (más simple y confiable)
        const modelGraphics = {
            [`${prefix}feature_importance.png`]: 'graphic-importance',
            [`${prefix}confusion_matrix.png`]: 'graphic-confusion',
            [`${prefix}model_metrics.png`]: 'graphic-metrics'
        };

        for (const [filename, elementId] of Object.entries(modelGraphics)) {
            const element = document.getElementById(elementId);
            if (element) {
                // Cargar directamente desde el servidor frontend
                element.src = `/${filename}?t=${Date.now()}`;
                console.log(`✓ Cargando gráfica: ${filename}`);
                
                element.onerror = () => {
                    console.error(`❌ Error cargando: ${filename}`);
                    element.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999"%3EGráfica no disponible%3C/text%3E%3C/svg%3E';
                };
                
                element.onload = () => {
                    console.log(`✅ Gráfica cargada exitosamente: ${filename}`);
                };
            }
        }
    } catch (error) {
        console.error('Error cargando gráficas del modelo:', error);
    }
}

/**
 * Cargar galería de gráficas
 */
async function loadGraphicsGallery(modelType = 'satisfaction') {
    try {
        // Determinar prefijo según modelo
        const prefix = modelType === 'seniority' ? 'seniority_' : 
                       modelType === 'xgboost' ? 'xgboost_' : '';
        
        const graphics = await getAvailableGraphics();
        if (!graphics.data) return;

        const graphicsList = graphics.data.graphics || [];
        const gallery = document.getElementById('graphics-gallery');
        gallery.innerHTML = '';

        if (graphicsList.length === 0) {
            gallery.innerHTML = '<p>No hay gráficas disponibles</p>';
            return;
        }

        for (const filename of graphicsList) {
            const item = document.createElement('div');
            item.className = 'graphic-item';
            
            const title = filename
                .replace(/_/g, ' ')
                .replace('.png', '')
                .replace(/\b\w/g, l => l.toUpperCase());
            
            // Obtener imagen en base64
            const base64Url = await getGraphicBase64(filename);
            const imgSrc = base64Url || getGraphicUrl(filename);
            
            item.innerHTML = `
                <h4>${title}</h4>
                <img src="${imgSrc}" alt="${title}" style="min-height: 300px;">
            `;
            
            gallery.appendChild(item);
        }
    } catch (error) {
        console.error('Error cargando galería:', error);
        document.getElementById('graphics-gallery').innerHTML = 
            '<p>Error al cargar las gráficas</p>';
    }
}

/**
 * Mostrar resultado de predicción
 */
function showPredictionResult(result, modelType = 'satisfaction') {
    const resultDiv = document.getElementById('predict-result');
    
    if (result.status !== 'success') {
        alert('Error en la predicción: ' + (result.message || 'Error desconocido'));
        return;
    }

    // Si es regresión, mostrar formato diferente
    if (modelType === 'regression') {
        const prediction = result.prediction;
        document.getElementById('result-seniority').textContent = 
            `💵 Sueldo estimado: $${prediction.salary_usd.toLocaleString()} USD`;
        
        // Mostrar intervalo de confianza
        const confidenceInterval = prediction.confidence_interval;
        document.getElementById('result-confidence').textContent = 
            `Rango: $${Math.round(confidenceInterval.lower).toLocaleString()} - $${Math.round(confidenceInterval.upper).toLocaleString()} USD`;
        
        // Mostrar barra al 100% para regresión
        const confidenceBar = document.getElementById('result-confidence-bar');
        confidenceBar.style.width = '100%';
        
        // Mostrar métricas del modelo
        const probContainer = document.getElementById('result-probabilities');
        probContainer.innerHTML = `
            <div class="probability-item">
                <span class="probability-label">📊 R² Score</span>
                <span class="probability-value">${(prediction.model_info.r2_score * 100).toFixed(1)}%</span>
            </div>
            <div class="probability-item">
                <span class="probability-label">📉 Error Promedio (MAE)</span>
                <span class="probability-value">$${Math.round(prediction.model_info.mae)} USD</span>
            </div>
        `;
        
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
    }

    // Mapeo de clases para modelos de clasificación
    let classDescriptions = {};
    
    if (modelType === 'satisfaction') {
        classDescriptions = {
            '0': '1-2: Mal Pago / Insatisfecho',
            '1': '3-4: Bien Pago / Satisfecho',
            '1_2': 'Mal Pago / Insatisfecho (valores 1-2)',
            '3_4': 'Bien Pago / Satisfecho (valores 3-4)'
        };
    } else if (modelType === 'seniority') {
        classDescriptions = {
            '0': 'Mal Pagado (gana menos que el promedio de su grupo)',
            '1': 'Bien Pagado (gana más que el promedio de su grupo)'
        };
    } else if (modelType === 'xgboost') {
        classDescriptions = {
            '0': 'No busca trabajo (conforme con su empleo actual)',
            '1': 'Sí busca trabajo (activamente buscando empleo)'
        };
    }

    // Mostrar predicción con descripción
    const predictionText = classDescriptions[result.prediction] || result.prediction;
    document.getElementById('result-seniority').textContent = predictionText;

    // Mostrar confianza
    const confidence = result.confidence * 100;
    document.getElementById('result-confidence').textContent = formatPercent(result.confidence);
    
    const confidenceBar = document.getElementById('result-confidence-bar');
    confidenceBar.style.width = confidence + '%';

    // Mostrar probabilidades
    const probContainer = document.getElementById('result-probabilities');
    probContainer.innerHTML = '';

    const probabilities = result.probabilities || {};
    for (const [className, prob] of Object.entries(probabilities)) {
        const classLabel = classDescriptions[className] || className;
        const item = document.createElement('div');
        item.className = 'probability-item';
        item.innerHTML = `
            <span class="probability-label">${classLabel}</span>
            <span class="probability-value">${formatPercent(prob)}</span>
        `;
        probContainer.appendChild(item);
    }

    // Mostrar resultado
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Cambiar de sección
 */
function switchSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar sección seleccionada
    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.add('active');
    }

    // Actualizar botón activo
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Cargar columnas si es la sección de clustering
    if (sectionName === 'clustering' && typeof loadClusteringColumns === 'function') {
        loadClusteringColumns();
    }
}

/**
 * Funciones de formateo
 */
function formatPercent(value) {
    return (value * 100).toFixed(2) + '%';
}

function formatDecimal(value, decimals = 3) {
    return value.toFixed(decimals);
}

/**
 * Mostrar mensaje de error
 */
function showError(message) {
    alert('❌ ' + message);
}

/**
 * Mostrar mensaje de éxito
 */
function showSuccess(message) {
    alert('✓ ' + message);
}
