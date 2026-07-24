import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './finalizarCompra.css';
import axios from 'axios';

const FinalizarCompraPage: React.FC = () => {
  const { state } = useLocation();
  const navigate   = useNavigate();
  const servicio   = state?.servicio;

  /* ——— estados ——— */
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [loading , setLoading]    = useState(true);
  const [newTime , setNewTime]    = useState('');
  const [formData, setFormData]   = useState({
    fechaPreferida   : '',
    nombreTarjeta    : '',
    numeroTarjeta    : '',
    fechaVencimiento : '',
    cvv              : '',
  });

  /* ——— utils de formateo ——— */
  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();

  const formatExpiry = (value: string) => {
  // 1) eliminamos todo lo que no sea dígito y limitamos a 4
  const cleaned = value.replace(/\D/g, '').slice(0, 4); // MMYY

  if (cleaned.length === 0) return '';

  /* ── Caso mientras escribe ─────────────────────────── */
  // • 1 dígito → mostramos tal cual (ej: "1")
  if (cleaned.length === 1) return cleaned;

  /* ── Ya tenemos al menos 2 dígitos (MM) ────────────── */
  let month = cleaned.slice(0, 2);
  const rest  = cleaned.slice(2); // YY (0-2 dígitos)

  // Normalizamos mes: '00'→'01', '13'→'12'
  let monthNum = parseInt(month, 10);
  if (monthNum < 1)  monthNum = 1;
  if (monthNum > 12) monthNum = 12;
  month = monthNum.toString().padStart(2, '0'); // vuelve a '01'-'12'

  /* ── Devolvemos con barra si hay año ──────────────── */
  return rest ? `${month}/${rest}` : month;
};

  const formatCvv = (v: string) => v.replace(/\D/g, '').slice(0, 3);

  /* ——— cliente logueado ——— */
  useEffect(() => {
    const fetchClienteId = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/LoginSesion'); return; }
      try {
        const res = await axios.get('http://localhost:5000/api/usuarios/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClienteId(res.data._id);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchClienteId();
  }, [navigate]);

  /* ——— submit ——— */
  const handleSubmit = async () => {
    if (!clienteId)              return alert('No se pudo confirmar la identidad.');
    if (!servicio)               return alert('Servicio no encontrado.');
    if (!servicio.entrenador)    return alert('No se encontró el entrenador del servicio.');
    if (!newTime)                return alert('Elegí un horario.');
    if (formData.numeroTarjeta.replace(/\s/g, '').length !== 16)
      return alert('Ingresá los 16 dígitos de la tarjeta.');
    if (!/^\d{2}\/\d{2}$/.test(formData.fechaVencimiento))
      return alert('Fecha de vencimiento inválida.');
    if (formData.cvv.length !== 3)
      return alert('CVV inválido.');

    /* ——— verificar que la tarjeta no esté vencida ——— */
    const [mm, aa] = formData.fechaVencimiento.split('/');
    const expDate = new Date(Number(`20${aa}`), Number(mm), 1); // 1 = primer día mes sig.
    const today   = new Date();
    if (expDate <= today) return alert('La tarjeta está vencida.');

    try {
      await axios.post('http://localhost:5000/api/reservas', {
        servicioId      : servicio._id,
        entrenadorId    : servicio.entrenador,
        clienteId,
        fechaPreferida  : new Date(formData.fechaPreferida),
        duracionMinutos : servicio.duracion,
        zona            : servicio.zona,
        precioTotal     : servicio.precio,
        horarioDeseado  : newTime,
        nombreTarjeta   : formData.nombreTarjeta,
        fechaVencimiento: formData.fechaVencimiento,
        tokenPago       : 'tok_visa',
      });

await axios.post('http://localhost:5000/api/interacciones', {
  servicioId: servicio._id,
  tipo: 'compra',
});


      alert('✅ Reserva realizada con éxito');
      // navigate('/mis-reservas');
    } catch (error: any) {
      alert(`❌ Error: ${error?.response?.data?.error || ''}`);
    }
  };

  /* ——— render condicional ——— */
  if (!servicio)  return <p>No se encontró el servicio.</p>;
  if (loading)    return <p>Cargando usuario...</p>;
  if (!clienteId) return <p>No se pudo obtener información del usuario.</p>;

  /* ——— JSX ——— */
  return (
    <div className="containerFC">
      <div className="headerFC">
        <h2 className="titleFC">{servicio.categoria} x 1 sesión</h2>
        <span className="priceFC">ARS ${servicio.precio.toLocaleString()}</span>
      </div>

      <div className="tagContainerFC"><span className="tagFC">{servicio.categoria}</span></div>

      <p className="detailsFC">Duración: {servicio.duracion} min | Zona: {servicio.zona}</p>
      <p className="descriptionFC">{servicio.descripcion}</p>

      {/* ——— fecha / hora ——— */}
      <div className="inputRowFC">
        <div className="inputGroupFC">
          <label className="labelFC">Fecha preferida</label>
          <input
            type="date"
            name="fechaPreferida"
            className="inputFC"
            onChange={(e) => setFormData({ ...formData, fechaPreferida: e.target.value })}
          />
        </div>
        <div className="inputGroupFC">
          <label htmlFor="hora" className="labelFC">Horario deseado</label>
          <input
            type="time"
            id="hora"
            className="inputFC"
            step="1800"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
          />
        </div>
      </div>

      <div className="totalContainerFC">
        <h3 className="totalLabelFC">Total a pagar</h3>
        <span className="totalPriceFC">ARS ${servicio.precio.toLocaleString()}</span>
      </div>

      {/* ——— datos tarjeta ——— */}
      <h3 className="paymentLabelFC">Datos de la tarjeta</h3>

      <input
        type="text"
        name="nombreTarjeta"
        className="inputFC"
         maxLength={50}
        placeholder="Nombre en la tarjeta"
        value={formData.nombreTarjeta}
        onChange={(e) => setFormData({ ...formData, nombreTarjeta: e.target.value })}
      />

      <input
        type="tel"
        name="numeroTarjeta"
        className="inputFC"
        placeholder="1111 2222 3333 4444"
        value={formData.numeroTarjeta}
        onChange={(e) =>
          setFormData({ ...formData, numeroTarjeta: formatCardNumber(e.target.value) })
        }
      />

      <div className="inputRowFC">
        <div className="inputGroupFC">
          <label className="labelFC">Fecha venc. (MM/AA)</label>
          <input
            type="tel"
            name="fechaVencimiento"
            className="inputFC"
            placeholder="MM/AA"
            value={formData.fechaVencimiento}
            onChange={(e) =>
              setFormData({ ...formData, fechaVencimiento: formatExpiry(e.target.value) })
            }
          />
        </div>
        <div className="inputGroupFC">
          <label className="labelFC">CVV</label>
          <input
            type="tel"
            name="cvv"
            className="inputFC"
            placeholder="CVV"
            value={formData.cvv}
            onChange={(e) => setFormData({ ...formData, cvv: formatCvv(e.target.value) })}
          />
        </div>
      </div>

      <button className="confirmButtonFC" onClick={handleSubmit}>
        Confirmar compra
      </button>
    </div>
  );
};

export default FinalizarCompraPage;
