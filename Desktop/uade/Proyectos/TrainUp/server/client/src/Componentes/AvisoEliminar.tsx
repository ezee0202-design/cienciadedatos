import React from 'react';

interface DeleteServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

const DeleteServiceModal: React.FC<DeleteServiceModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={styles.title}>¿Estás seguro que querés eliminar este servicio?</h3>
        <p>Esta acción no se puede deshacer.</p>
        <div style={styles.buttons}>
          <button style={styles.cancelButton} onClick={onClose}>
            Cancelar
          </button>
          <button style={styles.confirmButton} onClick={onConfirmDelete}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '30px',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  buttons: {
    marginTop: '25px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#d9534f',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default DeleteServiceModal;
