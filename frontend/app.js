/**
 * app.js - Lógica principal de la aplicación
 */

let connectionCheckInterval;

/**
 * Inicializar la aplicación
 */
async function initializeApp() {
    console.log('🚀 Inicializando aplicación...');

    // Verificar conexión inicial
    await checkAndUpdateConnection();

    // Verificar conexión periódicamente
    connectionCheckInterval = setInterval(checkAndUpdateConnection, 3000);

    // Cargar datos cuando esté disponible
    await loadAppData();

    // Configurar event listeners
    setupEventListeners();

    console.log('✓ Aplicación inicializada');
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
async function loadAppData() {
    try {
        console.log('📡 Cargando datos...');

        // Cargar información del análisis
        const analysisInfo = await getAnalysisInfo();
        updateDashboard(analysisInfo);

        // Cargar información del modelo
        const modelInfo = await getModelInfo();
        updateModelInfo(modelInfo);

        // Cargar gráficas
        loadEdaGraphics();
        loadModelGraphics();
        loadGraphicsGallery();

        console.log('✓ Datos cargados correctamente');
    } catch (error) {
        console.error('Error cargando datos:', error);
        showError('No se pudieron cargar los datos. ¿El backend está corriendo?');
    }
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
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

    // Tecla Enter en campos numéricos
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handlePrediction();
            }
        });
    });

    console.log('✓ Event listeners configurados');
}

/**
 * Manejar predicción
 */
async function handlePrediction() {
    try {
        // Validar que los campos estén llenos
        const fields = {
            'tengo_edad': parseFloat(document.getElementById('pred-edad').value),
            'Años de experiencia': parseFloat(document.getElementById('pred-exp').value),
            'antiguedad_en_la_empresa_actual': parseFloat(document.getElementById('pred-antig').value),
            'Años en el puesto actual': parseFloat(document.getElementById('pred-puesto').value),
            'cuantas_personas_tenes_a_cargo': parseFloat(document.getElementById('pred-cargo').value),
            'ultimo_salario_mensual_o_retiro_bruto_en_pesos_argentinos': parseFloat(document.getElementById('pred-bruto').value),
            'ultimo_salario_mensual_o_retiro_neto_en_pesos_argentinos': parseFloat(document.getElementById('pred-neto').value),
            'sueldo_bruto_en_dolares': parseFloat(document.getElementById('pred-bruto-usd').value),
            'sueldo_neto_en_dolares': parseFloat(document.getElementById('pred-neto-usd').value)
        };

        // Validar valores
        for (const [key, value] of Object.entries(fields)) {
            if (isNaN(value)) {
                showError(`Por favor, ingresa un valor válido para: ${key}`);
                return;
            }
        }

        // Mostrar cargando
        const btn = document.getElementById('predict-btn');
        const originalText = btn.textContent;
        btn.textContent = '⏳ Realizando predicción...';
        btn.disabled = true;

        // Realizar predicción
        const result = await makePrediction(fields);

        // Restaurar botón
        btn.textContent = originalText;
        btn.disabled = false;

        // Mostrar resultado
        showPredictionResult(result);

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
    
    // Limpiar campos o establecer valores por defecto
    document.getElementById('pred-edad').value = 30;
    document.getElementById('pred-exp').value = 5;
    document.getElementById('pred-antig').value = 2;
    document.getElementById('pred-puesto').value = 2;
    document.getElementById('pred-cargo').value = 0;
    document.getElementById('pred-bruto').value = 1000000;
    document.getElementById('pred-neto').value = 850000;
    document.getElementById('pred-bruto-usd').value = 1000;
    document.getElementById('pred-neto-usd').value = 850;
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
