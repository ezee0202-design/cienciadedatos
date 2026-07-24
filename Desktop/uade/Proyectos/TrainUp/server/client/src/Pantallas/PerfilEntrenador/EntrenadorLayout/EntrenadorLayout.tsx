// EntrenadorLayout.tsx

import React from 'react';
import { Outlet } from 'react-router-dom'; 
import BarraUsuarioEntrenador from '../../../Componentes/BarraUsuarioEntrenador';

const EntrenadorLayout: React.FC = () => {
    return (
        <div style={styles.pageContainer}>
            <div style={styles.topBar}>
                <BarraUsuarioEntrenador />
            </div>
            <main style={styles.content}>
            <Outlet />
            </main>
        </div>
    );
};


const styles: { [key: string]: React.CSSProperties } = {
    pageContainer: {
        width: '100%',
    },
    topBar: {
        paddingTop: '30px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'center',
    },
    content: {
        display: 'flex',
        justifyContent: 'center',
        padding: '0 20px 40px 20px'
    },
};

export default EntrenadorLayout;