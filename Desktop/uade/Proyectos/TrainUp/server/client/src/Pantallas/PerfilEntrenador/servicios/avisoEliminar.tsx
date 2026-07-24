import React from 'react';

interface DeleteServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

const DeleteServiceModal: React.FC<DeleteServiceModalProps> = ({ isOpen, onClose, onConfirmDelete }) => {
  if (!isOpen) {
    return null;
  }

  // Estilos en línea para el componente
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    width: '90%',
    maxWidth: '400px',
  };

  const titleStyle: React.CSSProperties = {
    color: '#333333',
    marginBottom: '15px',
    fontSize: '1.5em',
  };

  const messageStyle: React.CSSProperties = {
    color: '#555555',
    marginBottom: '25px',
    fontSize: '1em',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    backgroundColor: '#0000ff', // Azul para los botones
    color: '#ffffff',
    
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <h2 style={titleStyle}>Eliminar Servicio</h2>
        <p style={messageStyle}>
          ¿Estás seguro de que quieres eliminar este servicio?
        </p>
        <div style={actionsStyle}>
          <button style={buttonStyle} onClick={onConfirmDelete}>
            Eliminar
          </button>
          <button style={buttonStyle} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteServiceModal;