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
import sys
import subprocess

# Inicializar Flask
app = Flask(__name__)
CORS(app)

# Configuración
BACKEND_DIR = Path(__file__).parent
MODEL_PATH = BACKEND_DIR / 'random_forest_model.pkl'
FEATURES_PATH = BACKEND_DIR / 'features.json'
RESULTS_PATH = BACKEND_DIR / 'analysis_results.json'

# Paths para modelo de seniority
SENIORITY_MODEL_PATH = BACKEND_DIR / 'seniority_model.pkl'
SENIORITY_FEATURES_PATH = BACKEND_DIR / 'seniority_features.json'
SENIORITY_RESULTS_PATH = BACKEND_DIR / 'seniority_analysis.json'

# Paths para modelo XGBoost
XGBOOST_MODEL_PATH = BACKEND_DIR / 'xgboost_model.pkl'
XGBOOST_FEATURES_PATH = BACKEND_DIR / 'xgboost_features.json'
XGBOOST_RESULTS_PATH = BACKEND_DIR / 'xgboost_analysis.json'

# Paths para modelo de regresión de sueldo
REGRESSION_MODEL_PATH = BACKEND_DIR / 'regression_salary_model.pkl'
REGRESSION_SCALER_PATH = BACKEND_DIR / 'regression_salary_scaler.pkl'
REGRESSION_FEATURES_PATH = BACKEND_DIR / 'regression_salary_features.json'
REGRESSION_RESULTS_PATH = BACKEND_DIR / 'regression_salary_analysis.json'

# Paths para modelo de regresión de sueldo futuro (ARS)
REGRESSION_FUTURO_MODEL_PATH = BACKEND_DIR / 'regression_futuro_model.pkl'
REGRESSION_FUTURO_SCALER_PATH = BACKEND_DIR / 'regression_futuro_scaler.pkl'
REGRESSION_FUTURO_FEATURES_PATH = BACKEND_DIR / 'regression_futuro_features.json'
REGRESSION_FUTURO_RESULTS_PATH = BACKEND_DIR / 'regression_futuro_analysis.json'

FRONTEND_DIR = BACKEND_DIR.parent / 'frontend'

# Variables globales para almacenar modelos y datos
model = None
features = None
analysis_results = None

seniority_model = None
seniority_features = None
seniority_analysis_results = None

xgboost_model = None
xgboost_features = None
xgboost_analysis_results = None

regression_model = None
regression_scaler = None
regression_features = None
regression_analysis_results = None

regression_futuro_model = None
regression_futuro_scaler = None
regression_futuro_features = None
regression_futuro_analysis_results = None

def check_and_generate_models():
    """
    Verifica que todos los archivos .pkl necesarios existan.
    Si alguno falta, ejecuta los scripts de generación correspondientes.
    Esta función se ejecuta ANTES de iniciar el servidor Flask.
    """
    print("\n" + "="*80)
    print("🔍 VERIFICANDO MODELOS NECESARIOS")
    print("="*80)
    
    ROOT_DIR = BACKEND_DIR.parent
    models_to_check = [
        {
            'name': 'Modelo de Satisfacción (Random Forest)',
            'files': [MODEL_PATH, FEATURES_PATH, RESULTS_PATH],
            'script': ROOT_DIR / 'generate_models.py',
            'required': True
        },
        {
            'name': 'Modelo de Seniority/Bien Pagado',
            'files': [SENIORITY_MODEL_PATH, SENIORITY_FEATURES_PATH, SENIORITY_RESULTS_PATH],
            'script': ROOT_DIR / 'generate_seniority_model.py',
            'required': False
        },
        {
            'name': 'Modelo XGBoost (Búsqueda de Trabajo)',
            'files': [XGBOOST_MODEL_PATH, XGBOOST_FEATURES_PATH, XGBOOST_RESULTS_PATH],
            'script': ROOT_DIR / 'generate_xgboost_model.py',
            'required': False
        },
        {
            'name': 'Modelo de Regresión de Sueldo (USD)',
            'files': [REGRESSION_MODEL_PATH, REGRESSION_SCALER_PATH, REGRESSION_FEATURES_PATH, REGRESSION_RESULTS_PATH],
            'script': ROOT_DIR / 'generate_regression_model.py',
            'required': False
        },
        {
            'name': 'Modelo de Regresión de Sueldo Futuro (ARS)',
            'files': [REGRESSION_FUTURO_MODEL_PATH, REGRESSION_FUTURO_SCALER_PATH, REGRESSION_FUTURO_FEATURES_PATH, REGRESSION_FUTURO_RESULTS_PATH],
            'script': ROOT_DIR / 'generate_regression_futuro.py',
            'required': False
        }
    ]
    
    missing_models = []
    
    for model_info in models_to_check:
        model_name = model_info['name']
        files = model_info['files']
        script = model_info['script']
        required = model_info['required']
        
        # Verificar si todos los archivos existen
        files_missing = [f for f in files if not f.exists()]
        
        if files_missing:
            print(f"\n⚠️  {model_name}: FALTAN ARCHIVOS")
            for f in files_missing:
                print(f"   - {f.name}")
            
            if script.exists():
                print(f"   🔄 Ejecutando: {script.name}")
                try:
                    # Ejecutar el script de generación
                    result = subprocess.run(
                        [sys.executable, str(script)],
                        capture_output=True,
                        text=True,
                        cwd=str(ROOT_DIR),
                        timeout=300  # 5 minutos timeout
                    )
                    
                    if result.returncode == 0:
                        print(f"   ✅ {model_name} generado exitosamente")
                        
                        # Verificar nuevamente que se crearon los archivos
                        still_missing = [f for f in files if not f.exists()]
                        if still_missing:
                            print(f"   ⚠️  Advertencia: Algunos archivos siguen sin existir:")
                            for f in still_missing:
                                print(f"      - {f.name}")
                            if required:
                                missing_models.append(model_name)
                    else:
                        print(f"   ❌ Error al generar {model_name}")
                        print(f"   Error: {result.stderr[:500]}")
                        if required:
                            missing_models.append(model_name)
                        
                except subprocess.TimeoutExpired:
                    print(f"   ❌ Timeout al generar {model_name} (>5 min)")
                    if required:
                        missing_models.append(model_name)
                except Exception as e:
                    print(f"   ❌ Error inesperado: {e}")
                    if required:
                        missing_models.append(model_name)
            else:
                print(f"   ❌ Script de generación no encontrado: {script.name}")
                if required:
                    missing_models.append(model_name)
        else:
            print(f"\n✅ {model_name}: Todos los archivos presentes")
    
    print("\n" + "="*80)
    
    if missing_models:
        print(f"❌ FALTAN MODELOS CRÍTICOS: {', '.join(missing_models)}")
        print("❌ No se puede iniciar el servidor sin estos modelos")
        return False
    else:
        print("✅ TODOS LOS MODELOS ESTÁN DISPONIBLES")
        return True

def load_model():
    """Cargar los modelos entrenados"""
    global model, features, analysis_results
    global seniority_model, seniority_features, seniority_analysis_results
    global xgboost_model, xgboost_features, xgboost_analysis_results
    global regression_model, regression_scaler, regression_features, regression_analysis_results
    global regression_futuro_model, regression_futuro_scaler, regression_futuro_features, regression_futuro_analysis_results
    
    # Cargar modelo de satisfacción
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        print("✓ Modelo de satisfacción cargado correctamente")
    except Exception as e:
        print(f"❌ Error al cargar modelo de satisfacción: {e}")
        return False
    
    try:
        with open(FEATURES_PATH, 'r') as f:
            features = json.load(f)['features']
        print("✓ Features de satisfacción cargadas correctamente")
    except Exception as e:
        print(f"❌ Error al cargar features de satisfacción: {e}")
        return False
    
    try:
        with open(RESULTS_PATH, 'r', encoding='utf-8') as f:
            analysis_results = json.load(f)
        print("✓ Resultados del análisis de satisfacción cargados correctamente")
    except Exception as e:
        print(f"❌ Error al cargar resultados de satisfacción: {e}")
        return False
    
    # Cargar modelo de seniority/bien_pagado
    try:
        with open(SENIORITY_MODEL_PATH, 'rb') as f:
            seniority_model = pickle.load(f)
        print("✓ Modelo de seniority cargado correctamente")
    except Exception as e:
        print(f"❌ Error al cargar modelo de seniority: {e}")
        # No es crítico si falta este modelo
    
    try:
        with open(SENIORITY_FEATURES_PATH, 'r') as f:
            seniority_features = json.load(f)['features']
        print("✓ Features de seniority cargadas correctamente")
    except Exception as e:
        print(f"❌ Error al cargar features de seniority: {e}")
    
    try:
        with open(SENIORITY_RESULTS_PATH, 'r', encoding='utf-8') as f:
            seniority_analysis_results = json.load(f)
        print("✓ Resultados del análisis de seniority cargados correctamente")
    except Exception as e:
        print(f"❌ Error al cargar resultados de seniority: {e}")
    
    # Cargar modelo XGBoost
    try:
        with open(XGBOOST_MODEL_PATH, 'rb') as f:
            xgboost_model = pickle.load(f)
        print("✓ Modelo XGBoost cargado correctamente")
    except Exception as e:
        print(f"❌ Error al cargar modelo XGBoost: {e}")
    
    try:
        with open(XGBOOST_FEATURES_PATH, 'r') as f:
            xgboost_features = json.load(f)['features']
        print("✓ Features de XGBoost cargadas correctamente")
    except Exception as e:
        print(f"❌ Error al cargar features de XGBoost: {e}")
    
    try:
        with open(XGBOOST_RESULTS_PATH, 'r', encoding='utf-8') as f:
            xgboost_analysis_results = json.load(f)
        print("✓ Resultados del análisis de XGBoost cargados correctamente")
    except Exception as e:
        print(f"❌ Error al cargar resultados de XGBoost: {e}")
    
    # Cargar modelo de regresión de sueldo
    try:
        with open(REGRESSION_MODEL_PATH, 'rb') as f:
            regression_model = pickle.load(f)
        print("✓ Modelo de regresión de sueldo cargado correctamente")
    except Exception as e:
        print(f"❌ Error al cargar modelo de regresión: {e}")
    
    try:
        with open(REGRESSION_SCALER_PATH, 'rb') as f:
            regression_scaler = pickle.load(f)
        print("✓ Scaler de regresión cargado correctamente")
    except Exception as e:
        print(f"❌ Error al cargar scaler de regresión: {e}")
    
    try:
        with open(REGRESSION_FEATURES_PATH, 'r') as f:
            regression_features = json.load(f)['features']
        print("✓ Features de regresión cargadas correctamente")
    except Exception as e:
        print(f"❌ Error al cargar features de regresión: {e}")
    
    try:
        with open(REGRESSION_RESULTS_PATH, 'r', encoding='utf-8') as f:
            regression_analysis_results = json.load(f)
        print("✓ Resultados del análisis de regresión cargados correctamente")
    except Exception as e:
        print(f"❌ Error al cargar resultados de regresión: {e}")
    
    # Cargar modelo de regresión de sueldo futuro (ARS)
    try:
        with open(REGRESSION_FUTURO_MODEL_PATH, 'rb') as f:
            regression_futuro_model = pickle.load(f)
        print("✓ Modelo de regresión de sueldo futuro cargado correctamente")
    except Exception as e:
        print(f"❌ Error al cargar modelo de regresión futuro: {e}")
    
    try:
        with open(REGRESSION_FUTURO_SCALER_PATH, 'rb') as f:
            regression_futuro_scaler = pickle.load(f)
        print("✓ Scaler de regresión futuro cargado correctamente")
    except Exception as e:
        print(f"❌ Error al cargar scaler de regresión futuro: {e}")
    
    try:
        with open(REGRESSION_FUTURO_FEATURES_PATH, 'r') as f:
            regression_futuro_features = json.load(f)['features']
        print("✓ Features de regresión futuro cargadas correctamente")
    except Exception as e:
        print(f"❌ Error al cargar features de regresión futuro: {e}")
    
    try:
        with open(REGRESSION_FUTURO_RESULTS_PATH, 'r', encoding='utf-8') as f:
            regression_futuro_analysis_results = json.load(f)
        print("✓ Resultados del análisis de regresión futuro cargados correctamente")
    except Exception as e:
        print(f"❌ Error al cargar resultados de regresión futuro: {e}")
    
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
    """Obtener información general del análisis según el modelo"""
    model_type = request.args.get('model', 'satisfaction')
    
    if model_type == 'seniority':
        if seniority_analysis_results is None:
            return jsonify({'error': 'Datos de análisis seniority no disponibles'}), 500
        return jsonify({
            'status': 'success',
            'data': seniority_analysis_results
        }), 200
    elif model_type == 'xgboost':
        if xgboost_analysis_results is None:
            return jsonify({'error': 'Datos de análisis XGBoost no disponibles'}), 500
        return jsonify({
            'status': 'success',
            'data': xgboost_analysis_results
        }), 200
    else:
        if analysis_results is None:
            return jsonify({'error': 'Datos de análisis no disponibles'}), 500
        return jsonify({
            'status': 'success',
            'data': analysis_results
        }), 200

@app.route('/api/model-metrics', methods=['GET'])
def get_model_metrics():
    """Obtener métricas del modelo según tipo"""
    model_type = request.args.get('model', 'satisfaction')
    
    if model_type == 'seniority':
        if seniority_analysis_results is None:
            return jsonify({'error': 'Datos no disponibles'}), 500
        metrics = seniority_analysis_results.get('model_metrics', {})
    elif model_type == 'xgboost':
        if xgboost_analysis_results is None:
            return jsonify({'error': 'Datos no disponibles'}), 500
        metrics = xgboost_analysis_results.get('model_metrics', {})
    else:
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
    Soporta tres tipos de modelos: 'satisfaction', 'seniority' o 'xgboost'
    
    Esperado JSON:
    {
        "model_type": "satisfaction" | "seniority" | "xgboost",  // opcional, default "satisfaction"
        "tengo_edad": 30,
        "anos_de_experiencia": 5,
        ... otros campos
    }
    """
    try:
        data = request.json
        
        # Determinar qué modelo usar
        model_type = data.get('model_type', 'satisfaction')
        
        # Seleccionar modelo y features correspondientes
        if model_type == 'seniority':
            if seniority_model is None or seniority_features is None:
                return jsonify({
                    'status': 'error',
                    'message': 'Modelo de seniority no disponible'
                }), 500
            selected_model = seniority_model
            selected_features = seniority_features
            
        elif model_type == 'xgboost':
            if xgboost_model is None or xgboost_features is None:
                return jsonify({
                    'status': 'error',
                    'message': 'Modelo XGBoost no disponible'
                }), 500
            selected_model = xgboost_model
            selected_features = xgboost_features
            
        else:
            if model is None or features is None:
                return jsonify({
                    'status': 'error',
                    'message': 'Modelo de satisfacción no cargado'
                }), 500
            selected_model = model
            selected_features = features
        
        # Validar que todos los features están presentes
        missing_features = [f for f in selected_features if f not in data]
        if missing_features:
            return jsonify({
                'status': 'error',
                'message': f'Faltan features: {missing_features}'
            }), 400
        
        # Preparar datos como DataFrame
        input_df = pd.DataFrame([data], columns=selected_features)
        
        # Para modelos que no usan Pipeline (seniority y xgboost): encodear categóricas
        if model_type == 'seniority':
            # Cargar info de features categóricas
            with open(SENIORITY_FEATURES_PATH, 'r') as f:
                seniority_features_info = json.load(f)
            
            categorical_cols = seniority_features_info.get('categorical_features', [])
            
            # Factorizar cada columna categórica
            for col in categorical_cols:
                if col in input_df.columns:
                    input_df[col] = pd.factorize(input_df[col].astype(str))[0]
        
        elif model_type == 'xgboost':
            # Cargar info de features categóricas
            with open(XGBOOST_FEATURES_PATH, 'r') as f:
                xgb_features_info = json.load(f)
            
            categorical_cols = xgb_features_info.get('categorical_features', [])
            
            # Factorizar cada columna categórica
            for col in categorical_cols:
                if col in input_df.columns:
                    input_df[col] = pd.factorize(input_df[col].astype(str))[0]
        
        # Realizar predicción
        prediction = selected_model.predict(input_df)[0]
        probabilities = selected_model.predict_proba(input_df)[0]
        
        # Crear respuesta con conversión explícita a tipos Python nativos
        prob_dict = {str(class_label): float(prob) 
                    for class_label, prob in zip(selected_model.classes_, probabilities)}
        
        return jsonify({
            'status': 'success',
            'prediction': str(prediction),
            'probabilities': prob_dict,
            'confidence': float(max(probabilities)),
            'model_type': model_type
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
    
    # Si es un Pipeline, obtener el RandomForest del pipeline
    if hasattr(model, 'named_steps'):
        rf_model = model.named_steps.get('rf', model)
    else:
        rf_model = model
    
    return jsonify({
        'status': 'success',
        'model_info': {
            'type': 'Random Forest Classifier (Pipeline)',
            'n_estimators': int(rf_model.n_estimators),
            'max_depth': int(rf_model.max_depth) if rf_model.max_depth else None,
            'n_features': int(rf_model.n_features_in_),
            'n_classes': int(len(rf_model.classes_)),
            'classes': [str(c) for c in rf_model.classes_]
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
# ENDPOINT DE REGRESIÓN DE SUELDO
# ============================================================================

@app.route('/api/predict-salary', methods=['POST'])
def predict_salary():
    """Predecir sueldo usando el modelo de regresión lineal"""
    try:
        # Validar que el modelo esté cargado
        if regression_model is None or regression_scaler is None:
            return jsonify({
                'status': 'error',
                'message': 'Modelo de regresión no disponible'
            }), 500
        
        # Obtener datos del request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No se recibieron datos'
            }), 400
        
        # Crear DataFrame con los datos base (15 features originales del modelo)
        base_features = {
            'anos_de_experiencia': float(data.get('anos_experiencia', 5)),
            'antiguedad_en_la_empresa_actual': float(data.get('antiguedad_empresa', 2)),
            'anos_en_el_puesto_actual': float(data.get('anos_puesto', 1.5)),
            'cuantas_personas_tenes_a_cargo': float(data.get('personas_cargo', 0)),
            'tengo_edad': float(data.get('edad', 28)),
        }
        
        # Factorizar categorías
        categorical_features = {
            'trabajo_de': data.get('trabajo_de', 'Developer'),
            'seniority': data.get('seniority', 'Semi-Senior'),
            'dedicacion': data.get('dedicacion', 'Full-Time'),
            'donde_estas_trabajando': data.get('donde_trabajando', 'Argentina'),
            'modalidad_de_trabajo': data.get('modalidad', 'Remoto'),
            'cantidad_de_personas_en_tu_organizacion': data.get('tamano_org', '11-50'),
            'estudios_estado': data.get('estudios', 'Universitario en curso'),
            'genero': data.get('genero', 'Masculino'),
            'que_tanto_estas_usando_copilotchatgpt_u_otras_herramientas_de_ia_para_tu_trabajo': data.get('uso_ia', '3')
        }
        
        # Factorizar las categóricas
        for key, value in categorical_features.items():
            base_features[key] = float(pd.factorize([str(value)])[0][0])
        
        # Bono (binario)
        base_features['recibis_algun_tipo_de_bono'] = 1.0 if data.get('recibe_bono', 'No') == 'Sí' else 0.0
        
        # Crear DataFrame
        input_df = pd.DataFrame([base_features])
        
        # Feature Engineering (igual que en generate_regression_model.py)
        # Ratios
        input_df['ratio_exp_edad'] = input_df['anos_de_experiencia'] / (input_df['tengo_edad'] + 1)
        input_df['ratio_puesto_exp'] = input_df['anos_en_el_puesto_actual'] / (input_df['anos_de_experiencia'] + 1)
        input_df['ratio_antiguedad_exp'] = input_df['antiguedad_en_la_empresa_actual'] / (input_df['tengo_edad'] + 1)
        
        # Indicadores booleanos de seniority
        seniority_val = str(data.get('seniority', 'Semi-Senior')).lower()
        input_df['es_senior'] = 1.0 if 'senior' in seniority_val and 'semi' not in seniority_val else 0.0
        input_df['es_junior'] = 1.0 if 'junior' in seniority_val else 0.0
        
        trabajo_val = str(data.get('trabajo_de', 'Developer')).lower()
        input_df['es_manager'] = 1.0 if 'manager' in trabajo_val or 'lead' in trabajo_val else 0.0
        input_df['es_developer'] = 1.0 if 'developer' in trabajo_val or 'dev' in trabajo_val else 0.0
        
        # Polinomios
        input_df['exp_squared'] = input_df['anos_de_experiencia'] ** 2
        input_df['edad_squared'] = input_df['tengo_edad'] ** 2
        
        # Asegurar que las columnas estén en el mismo orden que el modelo
        input_df = input_df[regression_features]
        
        # Escalar
        input_scaled = regression_scaler.transform(input_df)
        
        # Predecir
        prediction = regression_model.predict(input_scaled)[0]
        
        # Calcular intervalo de confianza (basado en RMSE del modelo)
        rmse = regression_analysis_results.get('model_comparison', {}).get('Ridge', {}).get('rmse', 1217)
        confidence_interval = {
            'lower': max(0, prediction - rmse),
            'upper': prediction + rmse
        }
        
        # Obtener coeficientes del modelo para mostrar en frontend
        coefficients_data = []
        try:
            coef_values = regression_model.coef_
            feature_names = regression_features
            
            # Crear lista de coeficientes con nombres
            for i, (fname, coef_val) in enumerate(zip(feature_names, coef_values)):
                coefficients_data.append({
                    'feature': fname,
                    'value': float(coef_val)
                })
            
            # Ordenar por valor absoluto (más influyentes primero)
            coefficients_data.sort(key=lambda x: abs(x['value']), reverse=True)
        except Exception as e:
            print(f"⚠️ No se pudieron obtener coeficientes: {e}")
        
        return jsonify({
            'status': 'success',
            'prediction': {
                'salary_usd': round(prediction, 2),
                'confidence_interval': confidence_interval,
                'model_info': {
                    'type': 'Ridge Regression',
                    'r2_score': regression_analysis_results.get('model_comparison', {}).get('Ridge', {}).get('r2_test', 0.29),
                    'mae': regression_analysis_results.get('model_comparison', {}).get('Ridge', {}).get('mae', 831)
                }
            },
            'coefficients': coefficients_data[:15]  # Top 15 coeficientes
        }), 200
        
    except Exception as e:
        print(f"❌ Error en predict_salary: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': f'Error al predecir: {str(e)}'
        }), 500

@app.route('/api/predict-salary-futuro', methods=['POST'])
def predict_salary_futuro():
    """Predecir sueldo futuro (ARS) usando el modelo de regresión lineal con variable temporal"""
    try:
        # Validar que el modelo esté cargado
        if regression_futuro_model is None or regression_futuro_scaler is None:
            return jsonify({
                'status': 'error',
                'message': 'Modelo de regresión futuro no disponible'
            }), 500
        
        # Obtener datos del request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No se recibieron datos'
            }), 400
        
        # Crear DataFrame con los datos base
        base_features = {
            'year': float(data.get('year', 2025)),  # ⭐ Variable temporal
            'anos_de_experiencia': float(data.get('anos_experiencia', 5)),
            'antiguedad_en_la_empresa_actual': float(data.get('antiguedad_empresa', 2)),
            'anos_en_el_puesto_actual': float(data.get('anos_puesto', 1.5)),
            'cuantas_personas_tenes_a_cargo': float(data.get('personas_cargo', 0)),
            'tengo_edad': float(data.get('edad', 28)),
        }
        
        # Factorizar categorías
        categorical_features = {
            'trabajo_de': data.get('trabajo_de', 'Developer'),
            'seniority': data.get('seniority', 'Semi-Senior'),
            'dedicacion': data.get('dedicacion', 'Full-Time'),
            'donde_estas_trabajando': data.get('donde_trabajando', 'Argentina'),
            'modalidad_de_trabajo': data.get('modalidad', 'Remoto'),
            'cantidad_de_personas_en_tu_organizacion': data.get('tamano_org', '11-50'),
            'estudios_estado': data.get('estudios', 'Universitario en curso'),
            'genero': data.get('genero', 'Masculino'),
            'que_tanto_estas_usando_copilotchatgpt_u_otras_herramientas_de_ia_para_tu_trabajo': data.get('uso_ia', '3')
        }
        
        # Factorizar las categóricas
        for key, value in categorical_features.items():
            base_features[key] = float(pd.factorize([str(value)])[0][0])
        
        # Bono (binario)
        base_features['recibis_algun_tipo_de_bono'] = 1.0 if data.get('recibe_bono', 'No') == 'Sí' else 0.0
        
        # Crear DataFrame
        input_df = pd.DataFrame([base_features])
        
        # Feature Engineering (igual que en generate_regression_futuro.py)
        # Ratios
        input_df['ratio_exp_edad'] = input_df['anos_de_experiencia'] / (input_df['tengo_edad'] + 1)
        input_df['ratio_puesto_exp'] = input_df['anos_en_el_puesto_actual'] / (input_df['anos_de_experiencia'] + 1)
        input_df['ratio_antiguedad_exp'] = input_df['antiguedad_en_la_empresa_actual'] / (input_df['tengo_edad'] + 1)
        
        # Indicadores booleanos de seniority
        seniority_val = str(data.get('seniority', 'Semi-Senior')).lower()
        input_df['es_senior'] = 1.0 if 'senior' in seniority_val and 'semi' not in seniority_val else 0.0
        input_df['es_junior'] = 1.0 if 'junior' in seniority_val else 0.0
        
        trabajo_val = str(data.get('trabajo_de', 'Developer')).lower()
        input_df['es_manager'] = 1.0 if 'manager' in trabajo_val or 'lead' in trabajo_val else 0.0
        input_df['es_developer'] = 1.0 if 'developer' in trabajo_val or 'dev' in trabajo_val else 0.0
        
        # Polinomios
        input_df['exp_squared'] = input_df['anos_de_experiencia'] ** 2
        input_df['edad_squared'] = input_df['tengo_edad'] ** 2
        
        # Asegurar que las columnas estén en el mismo orden que el modelo
        input_df = input_df[regression_futuro_features]
        
        # Escalar
        input_scaled = regression_futuro_scaler.transform(input_df)
        
        # Predecir
        prediction = regression_futuro_model.predict(input_scaled)[0]
        
        # Calcular intervalo de confianza (basado en RMSE del modelo)
        rmse = regression_futuro_analysis_results.get('model_comparison', {}).get('Ridge', {}).get('rmse', 1219453)
        confidence_interval = {
            'lower': max(0, prediction - rmse),
            'upper': prediction + rmse
        }
        
        # Obtener coeficientes del modelo para mostrar en frontend
        coefficients_data = []
        try:
            coef_values = regression_futuro_model.coef_
            feature_names = regression_futuro_features
            
            # Crear lista de coeficientes con nombres
            for i, (fname, coef_val) in enumerate(zip(feature_names, coef_values)):
                coefficients_data.append({
                    'feature': fname,
                    'value': float(coef_val)
                })
            
            # Ordenar por valor absoluto (más influyentes primero)
            coefficients_data.sort(key=lambda x: abs(x['value']), reverse=True)
        except Exception as e:
            print(f"⚠️ No se pudieron obtener coeficientes: {e}")
        
        return jsonify({
            'status': 'success',
            'prediction': {
                'salary_ars': round(prediction, 2),
                'confidence_interval': confidence_interval,
                'model_info': {
                    'type': 'Ridge Regression',
                    'r2_score': regression_futuro_analysis_results.get('model_comparison', {}).get('Ridge', {}).get('r2_test', 0.33),
                    'mae': regression_futuro_analysis_results.get('model_comparison', {}).get('Ridge', {}).get('mae', 850076),
                    'includes_year': True  # Indicador de que incluye tendencia temporal
                }
            },
            'coefficients': coefficients_data[:15]  # Top 15 coeficientes
        }), 200
        
    except Exception as e:
        print(f"❌ Error en predict_salary_futuro: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': f'Error al predecir: {str(e)}'
        }), 500

@app.route('/api/clustering/available-columns', methods=['GET'])
def get_available_columns():
    """Obtener columnas disponibles para clustering"""
    try:
        # Leer database.csv para obtener columnas
        data_path = BACKEND_DIR.parent / 'database.csv'
        
        if not data_path.exists():
            return jsonify({
                'status': 'error',
                'message': 'No se encontró database.csv'
            }), 404
        
        # Leer solo las primeras filas para obtener columnas
        df_sample = pd.read_csv(data_path, nrows=100)
        
        # Obtener info de columnas
        columns_info = []
        for col in df_sample.columns:
            # Detectar tipo de columna
            sample_data = df_sample[col].dropna()
            if len(sample_data) == 0:
                continue
                
            # Intentar detectar si es numérica
            try:
                numeric_conversion = pd.to_numeric(
                    sample_data.astype(str).str.replace(r'[$€£\s,]', '', regex=True),
                    errors='coerce'
                )
                is_numeric = numeric_conversion.notna().sum() / len(sample_data) > 0.3
            except:
                is_numeric = False
            
            columns_info.append({
                'name': col,
                'type': 'numeric' if is_numeric else 'categorical',
                'sample_values': sample_data.head(3).tolist()
            })
        
        return jsonify({
            'status': 'success',
            'columns': columns_info,
            'total_columns': len(columns_info)
        }), 200
        
    except Exception as e:
        print(f"❌ Error en get_available_columns: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/clustering/perform', methods=['POST'])
def perform_clustering():
    """Realizar clustering con columnas seleccionadas"""
    try:
        from sklearn.preprocessing import StandardScaler, OneHotEncoder
        from sklearn.decomposition import PCA
        from sklearn.cluster import KMeans
        from sklearn.metrics import silhouette_score
        
        # Obtener parámetros
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No se recibieron datos'
            }), 400
        
        selected_columns = data.get('columns', [])
        k_clusters = data.get('k_clusters', None)  # None = auto-detect
        
        if not selected_columns:
            return jsonify({
                'status': 'error',
                'message': 'Debes seleccionar al menos una columna'
            }), 400
        
        # Leer datos
        data_path = BACKEND_DIR.parent / 'database.csv'
        df = pd.read_csv(data_path, dtype=object)
        
        # Filtrar columnas seleccionadas
        df_selected = df[selected_columns].copy()
        
        # Detectar columnas numéricas y categóricas
        numeric_cols = []
        cat_cols = []
        
        for col in selected_columns:
            sample = df_selected[col].astype(str).str.replace(r'[$€£\s,]', '', regex=True)
            numeric_conversion = pd.to_numeric(sample, errors='coerce')
            
            if numeric_conversion.notna().sum() / len(df_selected) > 0.3:
                numeric_cols.append(col)
            else:
                cat_cols.append(col)
        
        # Procesar numéricas
        X_num = pd.DataFrame(index=df_selected.index)
        for col in numeric_cols:
            s = df_selected[col].astype(str).str.replace(r'[$€£\s,]', '', regex=True)
            X_num[col] = pd.to_numeric(s, errors='coerce')
        X_num = X_num.fillna(X_num.median())
        
        # Procesar categóricas con One-Hot
        if cat_cols:
            encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
            X_cat = encoder.fit_transform(df_selected[cat_cols].astype(str))
            X_cat = pd.DataFrame(
                X_cat, 
                columns=encoder.get_feature_names_out(cat_cols),
                index=df_selected.index
            )
            X_full = pd.concat([X_num, X_cat], axis=1)
        else:
            X_full = X_num.copy()
        
        X_full.columns = X_full.columns.astype(str)
        
        # Estandarizar
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_full)
        
        # PCA para reducción
        n_components = min(10, X_scaled.shape[1])
        pca = PCA(n_components=n_components)
        X_pca = pca.fit_transform(X_scaled)
        
        if X_pca.shape[1] == 1:
            X_pca = np.hstack([X_pca, np.zeros((X_pca.shape[0], 1))])
        
        # KMeans
        if k_clusters:
            # K especificado por usuario
            km = KMeans(n_clusters=int(k_clusters), random_state=42, n_init=10)
            labels = km.fit_predict(X_pca)
            silhouette = silhouette_score(X_pca, labels)
            best_k = int(k_clusters)
            best_score = silhouette
        else:
            # Buscar mejor K
            best_k, best_score, labels = None, -1.0, None
            scores = {}
            
            for k in range(2, min(11, X_pca.shape[0]//2)):
                km = KMeans(n_clusters=k, random_state=42, n_init=10)
                temp_labels = km.fit_predict(X_pca)
                try:
                    score = silhouette_score(X_pca, temp_labels)
                    scores[k] = score
                    if score > best_score:
                        best_score, best_k, labels = score, k, temp_labels
                except:
                    pass
        
        # Calcular estadísticas por cluster
        cluster_stats = []
        for cluster_id in range(best_k):
            mask = labels == cluster_id
            cluster_data = X_num[mask]
            
            stats = {
                'cluster_id': int(cluster_id + 1),
                'size': int(mask.sum()),
                'percentage': float(mask.sum() / len(labels) * 100)
            }
            
            # Estadísticas por variable numérica
            for col in numeric_cols:
                if col in cluster_data.columns:
                    stats[f'{col}_mean'] = float(cluster_data[col].mean())
                    stats[f'{col}_median'] = float(cluster_data[col].median())
            
            cluster_stats.append(stats)
        
        # Preparar datos para visualización (primeras 1000 muestras)
        sample_size = min(1000, len(X_pca))
        sample_indices = np.random.choice(len(X_pca), sample_size, replace=False)
        
        visualization_data = {
            'x': X_pca[sample_indices, 0].tolist(),
            'y': X_pca[sample_indices, 1].tolist(),
            'labels': labels[sample_indices].tolist()
        }
        
        return jsonify({
            'status': 'success',
            'clustering': {
                'n_clusters': best_k,
                'silhouette_score': float(best_score),
                'pca_variance_explained': float(pca.explained_variance_ratio_.sum()),
                'n_samples': len(labels),
                'cluster_stats': cluster_stats,
                'visualization_data': visualization_data,
                'numeric_columns': numeric_cols,
                'categorical_columns': cat_cols
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Error en perform_clustering: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'status': 'error',
            'message': f'Error al realizar clustering: {str(e)}'
        }), 500

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
    
    # Verificar y generar modelos si es necesario
    if not check_and_generate_models():
        print("\n❌ No se puede iniciar el servidor sin los modelos necesarios")
        print("💡 Revisa los errores arriba y asegúrate de que database.csv esté disponible")
        sys.exit(1)
    
    # Cargar modelos en memoria
    try:
        if load_model():
            print("\n✓ Modelos cargados exitosamente en memoria")
            print("✓ Iniciando servidor Flask...")
            print("\n📍 Servidor disponible en: http://localhost:5000")
            print("📍 Frontend disponible en: http://localhost:8080")
            print("\n💡 Para detener: Presiona Ctrl+C")
            print("=" * 80 + "\n")
            
            # Iniciar servidor Flask
            app.run(debug=True, port=5000, host='0.0.0.0', use_reloader=False)
        else:
            print("\n❌ No se pudo cargar los modelos en memoria")
            print("❌ Los archivos .pkl existen pero hay un error al cargarlos")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error al iniciar el servidor Flask: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

