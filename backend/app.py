"""
Backend Flask para la Aplicación de Análisis de Datos
Proporciona endpoints API para:
- Obtener información del análisis
- Realizar predicciones con el modelo Random Forest
- Acceder a estadísticas y gráficas
"""

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import pickle
import json
import pandas as pd
import numpy as np
import os
import base64
from pathlib import Path

# Inicializar Flask
app = Flask(__name__)
CORS(app)

# Configuración
BACKEND_DIR = Path(__file__).parent
MODEL_PATH = BACKEND_DIR / 'random_forest_model.pkl'
FEATURES_PATH = BACKEND_DIR / 'features.json'
RESULTS_PATH = BACKEND_DIR / 'analysis_results.json'
FRONTEND_DIR = BACKEND_DIR.parent / 'frontend'

# Variables globales para almacenar modelo y datos
model = None
features = None
analysis_results = None

def load_model():
    """Cargar el modelo entrenado"""
    global model, features, analysis_results
    
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        print("✓ Modelo cargado correctamente")
    except Exception as e:
        print(f"❌ Error al cargar modelo: {e}")
        return False
    
    try:
        with open(FEATURES_PATH, 'r') as f:
            features = json.load(f)['features']
        print("✓ Features cargadas correctamente")
    except Exception as e:
        print(f"❌ Error al cargar features: {e}")
        return False
    
    try:
        with open(RESULTS_PATH, 'r', encoding='utf-8') as f:
            analysis_results = json.load(f)
        print("✓ Resultados del análisis cargados correctamente")
    except Exception as e:
        print(f"❌ Error al cargar resultados: {e}")
        return False
    
    return True

# ============================================================================
# RUTAS DE LA API
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health():
    """Endpoint de salud - verifica que el servidor esté funcionando"""
    return jsonify({
        'status': 'success',
        'message': 'Servidor backend funcionando correctamente'
    }), 200

@app.route('/api/analysis-info', methods=['GET'])
def get_analysis_info():
    """Obtener información general del análisis"""
    if analysis_results is None:
        return jsonify({'error': 'Datos de análisis no disponibles'}), 500
    
    return jsonify({
        'status': 'success',
        'data': analysis_results
    }), 200

@app.route('/api/model-metrics', methods=['GET'])
def get_model_metrics():
    """Obtener métricas del modelo"""
    if analysis_results is None:
        return jsonify({'error': 'Datos no disponibles'}), 500
    
    metrics = analysis_results.get('model_metrics', {})
    return jsonify({
        'status': 'success',
        'metrics': metrics
    }), 200

@app.route('/api/feature-importance', methods=['GET'])
def get_feature_importance():
    """Obtener importancia de features"""
    if analysis_results is None:
        return jsonify({'error': 'Datos no disponibles'}), 500
    
    importance = analysis_results.get('feature_importance', [])
    return jsonify({
        'status': 'success',
        'features': importance
    }), 200

@app.route('/api/dataset-info', methods=['GET'])
def get_dataset_info():
    """Obtener información del dataset"""
    if analysis_results is None:
        return jsonify({'error': 'Datos no disponibles'}), 500
    
    info = analysis_results.get('dataset_info', {})
    seniority_dist = analysis_results.get('seniority_distribution', {})
    
    return jsonify({
        'status': 'success',
        'dataset_info': info,
        'seniority_distribution': seniority_dist
    }), 200

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Realizar predicción con el modelo Random Forest
    
    Esperado JSON:
    {
        "tengo_edad": 30,
        "Años de experiencia": 5,
        "antiguedad_en_la_empresa_actual": 2,
        "Años en el puesto actual": 2,
        "cuantas_personas_tenes_a_cargo": 0,
        "ultimo_salario_mensual_o_retiro_bruto_en_pesos_argentinos": 1000000,
        "ultimo_salario_mensual_o_retiro_neto_en_pesos_argentinos": 850000,
        "sueldo_bruto_en_dolares": 1000,
        "sueldo_neto_en_dolares": 850
    }
    """
    if model is None or features is None:
        return jsonify({
            'status': 'error',
            'message': 'Modelo no cargado'
        }), 500
    
    try:
        data = request.json
        
        # Validar que todos los features están presentes
        missing_features = [f for f in features if f not in data]
        if missing_features:
            return jsonify({
                'status': 'error',
                'message': f'Faltan features: {missing_features}'
            }), 400
        
        # Preparar datos para predicción
        input_data = np.array([[data[f] for f in features]])
        
        # Realizar predicción
        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]
        
        # Crear respuesta
        prob_dict = {class_label: float(prob) 
                    for class_label, prob in zip(model.classes_, probabilities)}
        
        return jsonify({
            'status': 'success',
            'prediction': str(prediction),
            'probabilities': prob_dict,
            'confidence': float(max(probabilities))
        }), 200
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/api/graphics/<filename>', methods=['GET'])
def get_graphic(filename):
    """Obtener gráficas generadas - servir como file o data URL"""
    try:
        # Sanitizar el nombre del archivo (seguridad)
        if '..' in filename or '/' in filename or '\\' in filename:
            return jsonify({
                'status': 'error',
                'message': 'Nombre de archivo inválido'
            }), 400
        
        file_path = FRONTEND_DIR / filename
        
        # Verificar que existe
        if not file_path.exists():
            print(f"⚠️ Archivo no encontrado: {file_path}")
            return jsonify({
                'status': 'error',
                'message': f'Archivo no encontrado: {filename}',
                'path': str(file_path)
            }), 404
        
        # Enviar archivo
        print(f"✓ Sirviendo gráfica: {filename}")
        return send_file(file_path, mimetype='image/png')
        
    except Exception as e:
        print(f"❌ Error sirviendo gráfica: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error al servir gráfica: {str(e)}'
        }), 500

@app.route('/api/available-graphics', methods=['GET'])
def get_available_graphics():
    """Obtener lista de gráficas disponibles"""
    try:
        graphics = []
        if FRONTEND_DIR.exists():
            graphics = [f.name for f in FRONTEND_DIR.glob('*.png')]
        
        return jsonify({
            'status': 'success',
            'graphics': sorted(graphics)
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/graphics-base64/<filename>', methods=['GET'])
def get_graphic_base64(filename):
    """Obtener gráficas como base64 (alternativa más confiable)"""
    try:
        # Sanitizar el nombre del archivo (seguridad)
        if '..' in filename or '/' in filename or '\\' in filename:
            return jsonify({
                'status': 'error',
                'message': 'Nombre de archivo inválido'
            }), 400
        
        file_path = FRONTEND_DIR / filename
        
        # Verificar que existe
        if not file_path.exists():
            print(f"⚠️ Archivo no encontrado para base64: {file_path}")
            return jsonify({
                'status': 'error',
                'message': f'Archivo no encontrado: {filename}'
            }), 404
        
        # Leer archivo y convertir a base64
        with open(file_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        print(f"✓ Sirviendo gráfica en base64: {filename}")
        return jsonify({
            'status': 'success',
            'filename': filename,
            'data': image_data,
            'mimetype': 'image/png'
        }), 200
        
    except Exception as e:
        print(f"❌ Error sirviendo gráfica base64: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/model-info', methods=['GET'])
def get_model_info():
    """Obtener información del modelo"""
    if model is None:
        return jsonify({
            'status': 'error',
            'message': 'Modelo no disponible'
        }), 500
    
    return jsonify({
        'status': 'success',
        'model_info': {
            'type': 'Random Forest Classifier',
            'n_estimators': model.n_estimators,
            'max_depth': model.max_depth,
            'n_features': model.n_features_in_,
            'n_classes': len(model.classes_),
            'classes': list(model.classes_)
        }
    }), 200


# Alias endpoints and compatibility routes expected by the frontend
@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    """Compatibility alias for dashboard — return analysis results"""
    if analysis_results is None:
        return jsonify({'status': 'error', 'message': 'Datos de análisis no disponibles'}), 500
    return jsonify({'status': 'success', 'data': analysis_results}), 200


@app.route('/api/analysis', methods=['GET'])
def analysis_alias():
    """Alias for older /api/analysis path"""
    return dashboard()


@app.route('/api/features', methods=['GET'])
def get_features():
    """Return list of feature names used by the model"""
    if features is None:
        return jsonify({'status': 'error', 'message': 'Features no disponibles'}), 500
    return jsonify({'status': 'success', 'features': features}), 200

# ============================================================================
# MANEJO DE ERRORES
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'status': 'error',
        'message': 'Endpoint no encontrado'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'status': 'error',
        'message': 'Error interno del servidor'
    }), 500

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("=" * 80)
    print("INICIANDO SERVIDOR BACKEND")
    print("=" * 80)
    
    # Cargar modelo
    if load_model():
        print("\n✓ Modelo cargado exitosamente")
        print("✓ Iniciando servidor Flask...")
        print("\n📍 Servidor disponible en: http://localhost:5000")
        print("📍 Frontend disponible en: http://localhost:8000")
        print("\n💡 Para detener: Presiona Ctrl+C")
        print("=" * 80 + "\n")
        
        app.run(debug=True, port=5000, host='0.0.0.0')
    else:
        print("\n❌ No se pudo cargar el modelo")
        print("❌ Asegúrate de haber ejecutado el notebook de análisis primero")
