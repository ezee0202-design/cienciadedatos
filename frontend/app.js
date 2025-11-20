/**
 * app.js - Lógica principal de la aplicación
 */

let connectionCheckInterval;
let currentModel = null; // Modelo actualmente seleccionado
let listenersSetup = false; // Flag para evitar duplicar listeners

/**
 * Inicializar la aplicación
 */
async function initializeApp() {
    console.log('🚀 Inicializando aplicación...');
    
    // Configurar listeners globales UNA SOLA VEZ
    if (!listenersSetup) {
        setupGlobalListeners();
        listenersSetup = true;
    }

    // Verificar si ya hay un modelo seleccionado
    const savedModel = localStorage.getItem('selectedModel');
    
    if (savedModel) {
        // Si hay modelo guardado, cargar directamente
        await loadModel(savedModel);
    } else {
        // Mostrar pantalla de selección
        showModelSelection();
    }
}

/**
 * Configurar listeners globales (solo una vez)
 */
function setupGlobalListeners() {
    // Botones de selección de modelo
    document.querySelectorAll('.select-model-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const modelType = btn.getAttribute('data-model');
            await loadModel(modelType);
        });
    });
    
    // Botones de navegación
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Predicción
    document.getElementById('predict-btn').addEventListener('click', handlePrediction);
    document.getElementById('clear-prediction-btn').addEventListener('click', clearPrediction);
    
    // Regresión
    document.getElementById('regression-predict-btn').addEventListener('click', handleRegressionPrediction);
    document.getElementById('regression-clear-btn').addEventListener('click', clearRegressionPrediction);
    document.getElementById('regression-back-btn').addEventListener('click', () => {
        document.getElementById('classification-container').style.display = 'block';
        document.getElementById('regression-container').style.display = 'none';
        document.getElementById('model-select').value = 'satisfaction';
        handleModelChange();
    });
    
    // Selector de tipo de regresión (actual vs futuro)
    const regressionTypeSelect = document.getElementById('regression-type-select');
    if (regressionTypeSelect) {
        regressionTypeSelect.addEventListener('change', () => {
            const regressionType = regressionTypeSelect.value;
            const yearGroup = document.getElementById('reg-year-group');
            
            // Mostrar campo de año solo para regresión futura
            if (regressionType === 'futuro') {
                yearGroup.style.display = 'block';
            } else {
                yearGroup.style.display = 'none';
            }
            
            console.log('📊 Tipo de regresión seleccionado:', regressionType);
        });
    }
    
    // Selector de modelo en formulario de predicción
    const modelSelect = document.getElementById('model-select');
    if (modelSelect) {
        modelSelect.addEventListener('change', handleModelChange);
    }

    // Botón cambiar modelo
    document.getElementById('change-model-btn').addEventListener('click', () => {
        localStorage.removeItem('selectedModel');
        currentModel = null;
        if (connectionCheckInterval) {
            clearInterval(connectionCheckInterval);
        }
        showModelSelection();
    });
    
    // Clustering
    document.getElementById('run-clustering-btn').addEventListener('click', handleRunClustering);
    document.getElementById('reset-clustering-btn').addEventListener('click', handleResetClustering);
    document.getElementById('select-all-cols').addEventListener('click', (e) => {
        e.preventDefault();
        selectAllColumns(true);
    });
    document.getElementById('deselect-all-cols').addEventListener('click', (e) => {
        e.preventDefault();
        selectAllColumns(false);
    });

    // Tecla Enter en campos numéricos
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handlePrediction();
            }
        });
    });

    console.log('✓ Listeners globales configurados');
}

/**
 * Mostrar pantalla de selección de modelo
 */
function showModelSelection() {
    document.getElementById('model-selection-screen').style.display = 'flex';
    document.getElementById('main-app').style.display = 'none';
}

/**
 * Cargar modelo seleccionado y mostrar aplicación
 */
async function loadModel(modelType) {
    console.log('📦 Cargando modelo:', modelType);
    
    // Guardar selección
    currentModel = modelType;
    localStorage.setItem('selectedModel', modelType);
    
    // Ocultar pantalla de selección
    document.getElementById('model-selection-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    // Actualizar títulos según modelo
    updateTitlesForModel(modelType);
    
    // Verificar conexión inicial
    await checkAndUpdateConnection();

    // Verificar conexión periódicamente
    connectionCheckInterval = setInterval(checkAndUpdateConnection, 3000);

    // Cargar datos cuando esté disponible
    await loadAppData(modelType);
    
    // Sincronizar dropdown con modelo actual
    const modelSelect = document.getElementById('model-select');
    if (modelSelect) {
        modelSelect.value = modelType;
        handleModelChange();
    }

    console.log('✓ Aplicación inicializada con modelo:', modelType);
}

/**
 * Actualizar títulos según el modelo seleccionado
 */
function updateTitlesForModel(modelType) {
    const titleElement = document.getElementById('app-title');
    const subtitleElement = document.getElementById('model-subtitle');
    
    if (modelType === 'satisfaction') {
        titleElement.textContent = '😊 Modelo: Satisfacción Salarial';
        subtitleElement.textContent = 'Predice si estás conforme con tu salario';
    } else if (modelType === 'seniority') {
        titleElement.textContent = '💰 Modelo: Bien Pagado';
        subtitleElement.textContent = 'Predice si ganas más que el promedio de tu grupo';
    } else if (modelType === 'xgboost') {
        titleElement.textContent = '🔍 Modelo: Búsqueda de Trabajo';
        subtitleElement.textContent = 'Predice si estás buscando empleo activamente';
    } else if (modelType === 'regression') {
        titleElement.textContent = '💵 Modelo: Predicción de Sueldo';
        subtitleElement.textContent = 'Estima el sueldo en USD según tu perfil';
    }
}

/**
 * Verificar y actualizar estado de conexión
 */
async function checkAndUpdateConnection() {
    const connected = await checkBackendConnection();
    updateConnectionStatus(connected);

    if (!connected) {
        console.warn('⚠️ Backend no disponible');
    }
}

/**
 * Cargar todos los datos de la aplicación
 */
async function loadAppData(modelType) {
    try {
        console.log('📡 Cargando datos para modelo:', modelType);

        // Cargar información del análisis según el modelo
        const analysisInfo = await getAnalysisInfo(modelType);
        updateDashboard(analysisInfo);

        // Cargar información del modelo
        const modelInfo = await getModelInfo(modelType);
        updateModelInfo(modelInfo);

        // Cargar gráficas según el modelo
        loadEdaGraphics();
        loadModelGraphics(modelType);
        loadGraphicsGallery(modelType);

        console.log('✓ Datos cargados correctamente');
    } catch (error) {
        console.error('Error cargando datos:', error);
        showError('No se pudieron cargar los datos. ¿El backend está corriendo?');
    }
}

/**
 * Manejar cambio de modelo
 */
function handleModelChange() {
    const modelType = document.getElementById('model-select').value;
    const descriptionBox = document.getElementById('model-description');
    
    // Verificar si es regresión
    if (modelType === 'regression' || modelType === 'regression-futuro') {
        // Mostrar vista de regresión
        document.getElementById('classification-container').style.display = 'none';
        document.getElementById('regression-container').style.display = 'block';
        
        // Configurar tipo de regresión según el modelo seleccionado
        const regressionTypeSelect = document.getElementById('regression-type-select');
        if (modelType === 'regression-futuro') {
            regressionTypeSelect.value = 'futuro';
            document.getElementById('reg-year-group').style.display = 'block';
        } else {
            regressionTypeSelect.value = 'actual';
            document.getElementById('reg-year-group').style.display = 'none';
        }
        
        return;
    }
    
    // Para modelos de clasificación, asegurar que classification-container esté visible
    document.getElementById('classification-container').style.display = 'block';
    document.getElementById('regression-container').style.display = 'none';
    
    // Actualizar descripción
    if (modelType === 'satisfaction') {
        descriptionBox.innerHTML = '<p><strong>Modelo de Satisfacción:</strong> Predice si estás conforme con tus ingresos laborales basado en tus características.</p>';
    } else if (modelType === 'seniority') {
        descriptionBox.innerHTML = '<p><strong>Modelo Bien Pagado:</strong> Predice si ganas más que el promedio de personas con tu mismo rol y seniority.</p>';
    } else if (modelType === 'xgboost') {
        descriptionBox.innerHTML = '<p><strong>Modelo Búsqueda de Trabajo:</strong> Predice si estás buscando activamente un nuevo empleo basado en tus características laborales.</p>';
    }
    
    // Mostrar/ocultar campos según el modelo
    document.querySelectorAll('.model-field').forEach(field => {
        const models = field.getAttribute('data-models');
        if (models) {
            if (models.includes(modelType)) {
                field.style.display = 'block';
            } else {
                field.style.display = 'none';
            }
        }
    });
    
    console.log('📊 Modelo seleccionado:', modelType);
}

/**
 * Manejar predicción
 */
async function handlePrediction() {
    try {
        // Leer modelo del dropdown
        const modelSelect = document.getElementById('model-select');
        const modelType = modelSelect ? modelSelect.value : currentModel;
        
        // Recopilar datos según el modelo
        let fields = {};
        
        if (modelType === 'satisfaction') {
            // Features para modelo de satisfacción
            fields = {
                'tengo_edad': parseFloat(document.getElementById('pred-edad').value),
                'anos_de_experiencia': parseFloat(document.getElementById('pred-exp').value),
                'anos_en_el_puesto_actual': parseFloat(document.getElementById('pred-puesto').value),
                'cuantas_personas_tenes_a_cargo': parseFloat(document.getElementById('pred-cargo').value),
                'cantidad_de_personas_en_tu_organizacion': document.getElementById('pred-org').value,
                'trabajo_de': document.getElementById('pred-trabajo').value,
                'sueldo_bruto_en_dolares': parseFloat(document.getElementById('pred-bruto-usd').value),
                'dedicacion': document.getElementById('pred-dedicacion').value,
                'recibio_actualizacion_de_ingresos': document.getElementById('pred-ajuste').value,
                'de_que_fue_el_ajuste_total_acumulado': parseFloat(document.getElementById('pred-ajuste-porcentaje').value)
            };
        } else if (modelType === 'seniority') {
            // Features para modelo seniority (bien pagado)
            fields = {
                'year': parseFloat(document.getElementById('pred-year').value),
                'genero': document.getElementById('pred-genero').value,
                'tengo_edad': parseFloat(document.getElementById('pred-edad').value),
                'donde_estas_trabajando': document.getElementById('pred-donde-trabajando').value,
                'anos_de_experiencia': parseFloat(document.getElementById('pred-exp').value),
                'antiguedad_en_la_empresa_actual': parseFloat(document.getElementById('pred-antiguedad-empresa').value),
                'anos_en_el_puesto_actual': parseFloat(document.getElementById('pred-puesto').value),
                'cuantas_personas_tenes_a_cargo': parseFloat(document.getElementById('pred-cargo').value),
                'trabajo_de': document.getElementById('pred-trabajo').value,
                'dedicacion': document.getElementById('pred-dedicacion').value,
                'recibis_algun_tipo_de_bono': document.getElementById('pred-bono').value,
                'cantidad_de_personas_en_tu_organizacion': document.getElementById('pred-org').value,
                'modalidad_de_trabajo': document.getElementById('pred-modalidad').value,
                'dias_a_la_semana_vas_a_la_oficina': parseFloat(document.getElementById('pred-dias-oficina').value),
                'uso_de_ia_para_trabajo': parseFloat(document.getElementById('pred-ia').value),
                'seniority': document.getElementById('pred-seniority').value
            };
        } else if (modelType === 'xgboost') {
            // Features para modelo XGBoost (búsqueda de trabajo)
            fields = {
                'tengo_edad': parseFloat(document.getElementById('pred-edad').value),
                'anos_de_experiencia': parseFloat(document.getElementById('pred-exp').value),
                'anos_en_el_puesto_actual': parseFloat(document.getElementById('pred-puesto').value),
                'cuantas_personas_tenes_a_cargo': parseFloat(document.getElementById('pred-cargo').value),
                'cantidad_de_personas_en_tu_organizacion': document.getElementById('pred-org').value,
                'trabajo_de': document.getElementById('pred-trabajo').value,
                'sueldo_bruto_en_dolares': parseFloat(document.getElementById('pred-bruto-usd').value),
                'estudios_estado': document.getElementById('pred-estudios').value,
                'dedicacion': document.getElementById('pred-dedicacion').value,
                'recibio_actualizacion_de_ingresos': document.getElementById('pred-ajuste').value,
                'de_que_fue_el_ajuste_total_acumulado': parseFloat(document.getElementById('pred-ajuste-porcentaje').value)
            };
        } else if (modelType === 'regression') {
            // Features para modelo de regresión de sueldo (simplificado)
            fields = {
                'anos_experiencia': parseFloat(document.getElementById('pred-exp').value),
                'antiguedad_empresa': parseFloat(document.getElementById('pred-antiguedad-empresa')?.value || document.getElementById('pred-puesto').value),
                'anos_puesto': parseFloat(document.getElementById('pred-puesto').value),
                'personas_cargo': parseFloat(document.getElementById('pred-cargo').value),
                'edad': parseFloat(document.getElementById('pred-edad').value),
                'trabajo_de': document.getElementById('pred-trabajo').value,
                'seniority': document.getElementById('pred-seniority')?.value || 'Semi-Senior',
                'dedicacion': document.getElementById('pred-dedicacion').value,
                'donde_trabajando': document.getElementById('pred-donde-trabajando')?.value || 'Buenos Aires',
                'modalidad': document.getElementById('pred-modalidad')?.value || 'Remoto',
                'tamano_org': document.getElementById('pred-org').value,
                'estudios': document.getElementById('pred-estudios')?.value || 'universitario incompleto_encurso',
                'genero': document.getElementById('pred-genero')?.value || 'Masculino',
                'uso_ia': '3', // Valor por defecto
                'recibe_bono': document.getElementById('pred-bono')?.value || 'No'
            };
        }

        // Validar valores numéricos
        for (const [key, value] of Object.entries(fields)) {
            if (typeof value === 'number' && isNaN(value)) {
                showError(`Por favor, ingresa un valor numérico válido para: ${key}`);
                return;
            }
        }

        console.log('📤 Enviando datos:', fields);

        // Mostrar cargando
        const btn = document.getElementById('predict-btn');
        const originalText = btn.textContent;
        btn.textContent = '⏳ Realizando predicción...';
        btn.disabled = true;

        // Realizar predicción según modelo seleccionado
        const result = await makePrediction(fields, modelType);

        // Restaurar botón
        btn.textContent = originalText;
        btn.disabled = false;

        // Mostrar resultado
        showPredictionResult(result, modelType);

    } catch (error) {
        console.error('Error en predicción:', error);
        showError('Error al realizar la predicción: ' + error.message);
        document.getElementById('predict-btn').disabled = false;
    }
}

/**
 * Limpiar predicción
 */
function clearPrediction() {
    document.getElementById('predict-result').style.display = 'none';
    
    // Restablecer valores por defecto
    document.getElementById('pred-edad').value = 30;
    document.getElementById('pred-exp').value = 5;
    document.getElementById('pred-puesto').value = 2;
    document.getElementById('pred-cargo').value = 0;
    document.getElementById('pred-org').value = '11-50';
    document.getElementById('pred-trabajo').value = 'Developer';
    document.getElementById('pred-bruto-usd').value = 1000;
    document.getElementById('pred-dedicacion').value = 'Full-Time';
    document.getElementById('pred-ajuste').value = 'Si';
    document.getElementById('pred-ajuste-porcentaje').value = 15;
}

/**
 * Manejar predicción de regresión
 */
async function handleRegressionPrediction() {
    try {
        // Detectar tipo de regresión seleccionado
        const regressionType = document.getElementById('regression-type-select').value;
        
        // Recopilar datos del formulario de regresión
        const data = {
            anos_experiencia: parseFloat(document.getElementById('reg-exp').value),
            antiguedad_empresa: parseFloat(document.getElementById('reg-antiguedad').value),
            anos_puesto: parseFloat(document.getElementById('reg-puesto').value),
            personas_cargo: parseFloat(document.getElementById('reg-cargo').value),
            edad: parseFloat(document.getElementById('reg-edad').value),
            trabajo_de: document.getElementById('reg-trabajo').value,
            seniority: document.getElementById('reg-seniority').value,
            dedicacion: document.getElementById('reg-dedicacion').value,
            donde_trabajando: document.getElementById('reg-pais').value,
            modalidad: document.getElementById('reg-modalidad').value,
            tamano_org: document.getElementById('reg-org').value,
            estudios: document.getElementById('reg-estudios').value,
            genero: document.getElementById('reg-genero').value,
            uso_ia: '3',
            recibe_bono: document.getElementById('reg-bono').value
        };
        
        // Agregar año si es predicción futura
        if (regressionType === 'futuro') {
            data.year = parseFloat(document.getElementById('reg-year').value);
        }

        console.log('📤 Enviando datos de regresión (' + regressionType + '):', data);

        // Mostrar cargando
        const btn = document.getElementById('regression-predict-btn');
        const originalText = btn.textContent;
        btn.textContent = '⏳ Calculando...';
        btn.disabled = true;

        // Realizar predicción al endpoint correcto
        const endpoint = regressionType === 'futuro' ? 'regression-futuro' : 'regression';
        const result = await makePrediction(data, endpoint);

        // Restaurar botón
        btn.textContent = originalText;
        btn.disabled = false;

        // Mostrar resultado
        showRegressionResult(result, regressionType);

    } catch (error) {
        console.error('Error en predicción de regresión:', error);
        alert('Error al realizar la predicción: ' + error.message);
        document.getElementById('regression-predict-btn').disabled = false;
    }
}

/**
 * Mostrar resultado de regresión
 */
function showRegressionResult(result, regressionType = 'actual') {
    if (result.status !== 'success') {
        alert('Error en la predicción: ' + (result.message || 'Error desconocido'));
        return;
    }

    const prediction = result.prediction;
    const isARS = regressionType === 'futuro';
    const currency = isARS ? 'ARS' : 'USD';
    
    // Ocultar placeholder y mostrar resultados
    document.getElementById('regression-placeholder').style.display = 'none';
    document.getElementById('regression-results').style.display = 'block';

    // Mostrar sueldo estimado
    const salary = isARS ? prediction.salary_ars : prediction.salary_usd;
    const formattedSalary = isARS 
        ? `$${salary.toLocaleString('es-AR', {maximumFractionDigits: 0})}` 
        : `$${salary.toLocaleString('en-US', {maximumFractionDigits: 0})}`;
    
    document.getElementById('reg-salary-value').textContent = formattedSalary;
    
    // Actualizar texto de moneda
    const currencyEl = document.querySelector('.salary-currency');
    if (currencyEl) {
        currencyEl.textContent = isARS ? 'ARS/mes (neto)' : 'USD/mes (neto)';
    }

    // Mostrar rango
    const ci = prediction.confidence_interval;
    const minFormatted = isARS 
        ? `$${Math.round(ci.lower).toLocaleString('es-AR')}` 
        : `$${Math.round(ci.lower).toLocaleString('en-US')}`;
    const maxFormatted = isARS 
        ? `$${Math.round(ci.upper).toLocaleString('es-AR')}` 
        : `$${Math.round(ci.upper).toLocaleString('en-US')}`;
        
    document.getElementById('reg-min-value').textContent = minFormatted;
    document.getElementById('reg-max-value').textContent = maxFormatted;

    // Métricas del modelo
    const modelInfo = prediction.model_info;
    document.getElementById('reg-r2').textContent = `${(modelInfo.r2_score * 100).toFixed(1)}%`;
    
    const maeFormatted = isARS 
        ? `$${Math.round(modelInfo.mae).toLocaleString('es-AR')}` 
        : `$${Math.round(modelInfo.mae).toLocaleString('en-US')}`;
    document.getElementById('reg-mae').textContent = maeFormatted;
    
    const rmseFormatted = isARS 
        ? `$${Math.round(ci.upper - salary).toLocaleString('es-AR')}` 
        : `$${Math.round(ci.upper - salary).toLocaleString('en-US')}`;
    document.getElementById('reg-rmse').textContent = rmseFormatted;

    // Coeficientes (si están disponibles)
    const coefficientsDiv = document.getElementById('reg-coefficients');
    coefficientsDiv.innerHTML = '';
    
    if (result.coefficients && result.coefficients.length > 0) {
        result.coefficients.slice(0, 10).forEach(coef => {
            const item = document.createElement('div');
            item.className = `coefficient-item ${coef.value >= 0 ? 'positive' : 'negative'}`;
            item.innerHTML = `
                <span class="coefficient-name">${coef.feature}</span>
                <span class="coefficient-value ${coef.value >= 0 ? 'positive' : 'negative'}">
                    ${coef.value >= 0 ? '+' : ''}$${Math.round(coef.value)}
                </span>
            `;
            coefficientsDiv.appendChild(item);
        });
    } else {
        coefficientsDiv.innerHTML = '<p style="color: #7f8c8d; text-align: center;">Coeficientes no disponibles</p>';
    }

    // Scroll suave
    document.getElementById('regression-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Limpiar predicción de regresión
 */
function clearRegressionPrediction() {
    document.getElementById('regression-results').style.display = 'none';
    document.getElementById('regression-placeholder').style.display = 'block';
    
    // Restablecer valores
    document.getElementById('reg-exp').value = 5;
    document.getElementById('reg-antiguedad').value = 2;
    document.getElementById('reg-puesto').value = 1.5;
    document.getElementById('reg-cargo').value = 0;
    document.getElementById('reg-edad').value = 28;
    document.getElementById('reg-trabajo').value = 'Developer';
    document.getElementById('reg-seniority').value = 'Semi-Senior';
    document.getElementById('reg-dedicacion').value = 'Full-Time';
    document.getElementById('reg-pais').value = 'Buenos Aires';
    document.getElementById('reg-modalidad').value = 'Remoto';
    document.getElementById('reg-org').value = '11-50';
    document.getElementById('reg-estudios').value = 'universitario incompleto_encurso';
    document.getElementById('reg-genero').value = 'Masculino';
    document.getElementById('reg-bono').value = 'No';
}

/**
 * Ejecutar cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado');
    initializeApp();
});

/**
 * Limpiar cuando se cierre la página
 */
window.addEventListener('beforeunload', () => {
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
    }
});
