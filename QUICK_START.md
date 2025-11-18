# 🚀 INICIO RÁPIDO - 3 PASOS

## Paso 1: Abrir Dos Terminales

**Terminal 1 - Backend:**
```powershell
cd "e:\TPO - CIENCIA DE DATOS\APP 2\backend"
python app.py
```

**Terminal 2 - Frontend:**
```powershell
cd "e:\TPO - CIENCIA DE DATOS\APP 2\frontend"
python server.py
```

## Paso 2: Abrir Navegador

Abre tu navegador y ve a:
```
http://localhost:8080
```

## Paso 3: ¡Disfruta!

Ya puedes:
- Ver el Dashboard
- Explorar gráficas EDA
- Ver información del modelo
- Hacer predicciones
- Ver la galería completa

---

## 📍 URLs Útiles

| Página | URL |
|--------|-----|
| **Aplicación** | http://localhost:8080 |
| **Monitor de Estado** | http://localhost:8080/monitor.html |
| **API Backend** | http://localhost:5000/api/dashboard |

---

## 🔍 Verificar Estado

```powershell
python diagnostico_graficas.py
```

---

## ⚙️ Troubleshooting

### Las gráficas no cargan
```powershell
python diagnostico_graficas.py
# Si dice que faltan archivos, reinicia los servidores
```

### Puerto 5000 en uso
```powershell
netstat -ano | Select-String "5000"
taskkill /PID <PID> /F
```

### Puerto 8080 en uso
```powershell
netstat -ano | Select-String "8080"
taskkill /PID <PID> /F
```

---

## 📊 Lo que Verás

1. **Dashboard** - Métricas del modelo
2. **EDA** - 3 gráficas de análisis
3. **Modelo** - 3 gráficas de desempeño
4. **Predictor** - Haz predicciones
5. **Galería** - Todas las gráficas

---

**¡Listo para usar!** 🎉

Para más información, lee:
- `README.md`
- `GUIA_USO.md`
- `SUMMARY_FINAL.md`


