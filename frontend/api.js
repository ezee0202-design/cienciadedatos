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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error en POST ${endpoint}:`, error);
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
async function getAnalysisInfo() {
    return await apiGet('/analysis-info');
}

/**
 * Obtener métricas del modelo
 */
async function getModelMetrics() {
    return await apiGet('/model-metrics');
}

/**
 * Obtener importancia de features
 */
async function getFeatureImportance() {
    return await apiGet('/feature-importance');
}

/**
 * Obtener información del dataset
 */
async function getDatasetInfo() {
    return await apiGet('/dataset-info');
}

/**
 * Obtener información del modelo
 */
async function getModelInfo() {
    return await apiGet('/model-info');
}

/**
 * Realizar predicción
 */
async function makePrediction(data) {
    return await apiPost('/predict', data);
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
