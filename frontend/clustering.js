/**
 * clustering.js - Funciones para clustering interactivo
 */

let clusteringChart = null;
let availableColumns = [];

/**
 * Cargar columnas disponibles para clustering
 */
async function loadClusteringColumns() {
    try {
        const response = await fetch('http://localhost:5000/api/clustering/available-columns');
        const data = await response.json();
        
        if (data.status === 'success') {
            availableColumns = data.columns;
            renderColumnSelector(data.columns);
        } else {
            console.error('Error al cargar columnas:', data.message);
            document.getElementById('column-selector').innerHTML = 
                '<p class="error-text">❌ Error al cargar columnas</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('column-selector').innerHTML = 
            '<p class="error-text">❌ Error de conexión con el servidor</p>';
    }
}

/**
 * Renderizar selector de columnas
 */
function renderColumnSelector(columns) {
    const container = document.getElementById('column-selector');
    container.innerHTML = '';
    
    columns.forEach((col, index) => {
        const div = document.createElement('div');
        div.className = 'column-item';
        div.innerHTML = `
            <input type="checkbox" id="col-${index}" value="${col.name}" onchange="updateSelectedCount()">
            <div class="column-item-info">
                <span class="column-item-name">${col.name}</span>
                <span class="column-item-type ${col.type}">${col.type}</span>
            </div>
        `;
        container.appendChild(div);
    });
    
    updateSelectedCount();
}

/**
 * Actualizar contador de columnas seleccionadas
 */
function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('#column-selector input[type="checkbox"]');
    const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
    document.getElementById('selected-count').textContent = selectedCount;
    
    // Habilitar/deshabilitar botón de ejecutar
    const runBtn = document.getElementById('run-clustering-btn');
    runBtn.disabled = selectedCount === 0;
}

/**
 * Seleccionar/deseleccionar todas las columnas
 */
function selectAllColumns(select) {
    const checkboxes = document.querySelectorAll('#column-selector input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = select);
    updateSelectedCount();
}

/**
 * Ejecutar clustering
 */
async function handleRunClustering() {
    try {
        // Obtener columnas seleccionadas
        const checkboxes = document.querySelectorAll('#column-selector input[type="checkbox"]:checked');
        const selectedColumns = Array.from(checkboxes).map(cb => cb.value);
        
        if (selectedColumns.length === 0) {
            alert('Debes seleccionar al menos una columna');
            return;
        }
        
        // Obtener k clusters
        const kValue = document.getElementById('num-clusters').value;
        const kClusters = kValue === 'auto' ? null : parseInt(kValue);
        
        // Mostrar loading
        const runBtn = document.getElementById('run-clustering-btn');
        const originalText = runBtn.textContent;
        runBtn.textContent = '⏳ Procesando...';
        runBtn.disabled = true;
        
        // Ocultar placeholder
        document.getElementById('clustering-placeholder').style.display = 'none';
        
        // Llamar API
        const response = await fetch('http://localhost:5000/api/clustering/perform', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                columns: selectedColumns,
                k_clusters: kClusters
            })
        });
        
        const data = await response.json();
        
        // Restaurar botón
        runBtn.textContent = originalText;
        runBtn.disabled = false;
        
        if (data.status === 'success') {
            displayClusteringResults(data.clustering);
        } else {
            alert('Error: ' + data.message);
            document.getElementById('clustering-placeholder').style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al realizar clustering: ' + error.message);
        document.getElementById('run-clustering-btn').disabled = false;
        document.getElementById('clustering-placeholder').style.display = 'block';
    }
}

/**
 * Mostrar resultados de clustering
 */
function displayClusteringResults(clustering) {
    // Mostrar panel de resultados
    document.getElementById('clustering-results').style.display = 'block';
    
    // Actualizar métricas
    document.getElementById('clusters-found').textContent = clustering.n_clusters;
    document.getElementById('silhouette-score').textContent = clustering.silhouette_score.toFixed(3);
    document.getElementById('variance-explained').textContent = 
        (clustering.pca_variance_explained * 100).toFixed(1) + '%';
    document.getElementById('samples-analyzed').textContent = clustering.n_samples.toLocaleString();
    
    // Crear visualización
    createClusteringChart(clustering.visualization_data, clustering.n_clusters);
    
    // Crear tabla de estadísticas
    createClusterStatsTable(clustering.cluster_stats, clustering.numeric_columns);
}

/**
 * Crear gráfico de clustering
 */
function createClusteringChart(vizData, nClusters) {
    const canvas = document.getElementById('clustering-chart');
    const ctx = canvas.getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (clusteringChart) {
        clusteringChart.destroy();
    }
    
    // Preparar datos por cluster
    const datasets = [];
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
    
    for (let i = 0; i < nClusters; i++) {
        const clusterPoints = vizData.x
            .map((x, idx) => ({
                x: x,
                y: vizData.y[idx],
                label: vizData.labels[idx]
            }))
            .filter(point => point.label === i);
        
        datasets.push({
            label: `Cluster ${i + 1}`,
            data: clusterPoints,
            backgroundColor: colors[i % colors.length],
            pointRadius: 4,
            pointHoverRadius: 6
        });
    }
    
    // Crear gráfico
    clusteringChart = new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.6,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Proyección PCA de Clusters (2D)'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'PCA Componente 1'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'PCA Componente 2'
                    }
                }
            }
        }
    });
}

/**
 * Crear tabla de estadísticas por cluster
 */
function createClusterStatsTable(clusterStats, numericColumns) {
    const container = document.getElementById('cluster-stats-table');
    
    // Crear tabla
    let tableHTML = '<table class="cluster-stats-table">';
    
    // Header
    tableHTML += '<thead><tr>';
    tableHTML += '<th>Cluster</th>';
    tableHTML += '<th>Tamaño</th>';
    tableHTML += '<th>Porcentaje</th>';
    
    // Agregar columnas numéricas (media)
    numericColumns.forEach(col => {
        tableHTML += `<th>${col} (media)</th>`;
    });
    
    tableHTML += '</tr></thead>';
    
    // Body
    tableHTML += '<tbody>';
    clusterStats.forEach(stat => {
        tableHTML += '<tr>';
        tableHTML += `<td>Cluster ${stat.cluster_id}</td>`;
        tableHTML += `<td>${stat.size.toLocaleString()}</td>`;
        tableHTML += `<td>${stat.percentage.toFixed(1)}%</td>`;
        
        numericColumns.forEach(col => {
            const meanValue = stat[`${col}_mean`];
            if (meanValue !== undefined) {
                tableHTML += `<td>${meanValue.toFixed(2)}</td>`;
            } else {
                tableHTML += '<td>-</td>';
            }
        });
        
        tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    
    container.innerHTML = tableHTML;
}

/**
 * Reiniciar clustering
 */
function handleResetClustering() {
    // Limpiar selección
    selectAllColumns(false);
    
    // Resetear dropdown
    document.getElementById('num-clusters').value = 'auto';
    
    // Ocultar resultados
    document.getElementById('clustering-results').style.display = 'none';
    document.getElementById('clustering-placeholder').style.display = 'block';
    
    // Destruir gráfico
    if (clusteringChart) {
        clusteringChart.destroy();
        clusteringChart = null;
    }
}
