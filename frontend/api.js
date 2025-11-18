/**
 * api.js - Funciones para comunicarse con el backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Realizar una petición GET a la API
 */
async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en GET ${endpoint}:`, error);
        throw error;
    }
}

/**
 * Realizar una petición POST a la API
 */
async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            // Si el servidor devuelve un mensaje de error, usarlo
            const errorMessage = responseData.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }
        
        return responseData;
    } catch (error) {
        console.error(`Error en POST ${endpoint}:`, error);
        console.error('Datos enviados:', data);
        throw error;
    }
}

/**
 * Verificar conexión con el backend
 */
async function checkBackendConnection() {
    try {
        const response = await apiGet('/health');
        return response.status === 'success';
    } catch (error) {
        return false;
    }
}

/**
 * Obtener información del análisis
 */
async function getAnalysisInfo(modelType = 'satisfaction') {
    return await apiGet(`/analysis-info?model=${modelType}`);
}

/**
 * Obtener métricas del modelo
 */
async function getModelMetrics(modelType = 'satisfaction') {
    return await apiGet(`/model-metrics?model=${modelType}`);
}

/**
 * Obtener importancia de features
 */
async function getFeatureImportance(modelType = 'satisfaction') {
    return await apiGet(`/feature-importance?model=${modelType}`);
}

/**
 * Obtener información del dataset
 */
async function getDatasetInfo(modelType = 'satisfaction') {
    return await apiGet(`/dataset-info?model=${modelType}`);
}

/**
 * Obtener información del modelo
 */
async function getModelInfo(modelType = 'satisfaction') {
    return await apiGet(`/model-info?model=${modelType}`);
}

/**
 * Realizar predicción
 */
async function makePrediction(data, modelType = 'satisfaction') {
    // Para regresión de sueldo futuro (ARS), usar endpoint especial
    if (modelType === 'regression-futuro') {
        return await apiPost('/predict-salary-futuro', data);
    }
    
    // Para regresión de sueldo actual (USD), usar endpoint especial
    if (modelType === 'regression') {
        return await apiPost('/predict-salary', data);
    }
    
    // Para clasificación, usar endpoint estándar
    return await apiPost('/predict', { 
        ...data, 
        model_type: modelType 
    });
}

/**
 * Obtener lista de gráficas disponibles
 */
async function getAvailableGraphics() {
    return await apiGet('/available-graphics');
}

/**
 * Obtener URL de una gráfica
 */
function getGraphicUrl(filename) {
    return `${API_BASE_URL}/graphics/${filename}`;
}

/**
 * Obtener gráfica como base64 (más confiable)
 */
async function getGraphicBase64(filename) {
    try {
        const response = await apiGet(`/graphics-base64/${filename}`);
        if (response.status === 'success' && response.data) {
            return `data:image/png;base64,${response.data}`;
        }
        return null;
    } catch (error) {
        console.error(`Error obteniendo base64 de ${filename}:`, error);
        return null;
    }
}
