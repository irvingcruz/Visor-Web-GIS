import { getFotoUrl } from '../services/galeriaService'
import { useState } from 'react'

export default function FotoPuntoModal({ fotos, coordenadas, onClose }) {
    const [fotoSeleccionada, setFotoSeleccionada] = useState(null)

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <div>
                        <div style={styles.headerTitle}>📍 Fotos del punto</div>
                        <div style={styles.headerSub}>
                            Lat: {coordenadas?.lat?.toFixed(6)} — Lng: {coordenadas?.lng?.toFixed(6)}
                        </div>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                <div style={styles.body}>
                    {fotos.length === 0 ? (
                        <p style={styles.msg}>No hay fotos en este punto</p>
                    ) : (
                        <div style={styles.grid}>
                            {fotos.map((foto) => (
                                <div key={foto.id} style={styles.gridItem} onClick={() => setFotoSeleccionada(foto)}>
                                    <img src={getFotoUrl(foto.name)} alt={foto.name} style={styles.thumb} />
                                    <div style={styles.thumbInfo}>{foto.size}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {fotoSeleccionada && (
                <div style={styles.lightbox} onClick={() => setFotoSeleccionada(null)}>
                    <img
                        src={getFotoUrl(fotoSeleccionada.name)}
                        alt={fotoSeleccionada.name}
                        style={styles.lightboxImg}
                    />
                    <div style={styles.lightboxInfo}>{fotoSeleccionada.name} — {fotoSeleccionada.size}</div>
                    <button style={styles.lightboxClose} onClick={() => setFotoSeleccionada(null)}>✕</button>
                </div>
            )}
        </div>
    )
}

const styles = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    modal: {
        background: 'white', borderRadius: 12,
        width: '90%', maxWidth: 560, maxHeight: '80vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc',
    },
    headerTitle: { fontWeight: 700, fontSize: 15, color: '#1e293b' },
    headerSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
    closeBtn: {
        background: 'none', border: 'none', fontSize: 18,
        cursor: 'pointer', color: '#64748b', padding: '4px 8px',
    },
    body: { flex: 1, overflowY: 'auto', padding: 20 },
    msg: { textAlign: 'center', color: '#94a3b8', padding: 40 },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 12,
    },
    gridItem: {
        borderRadius: 8, overflow: 'hidden',
        border: '1px solid #e2e8f0', cursor: 'pointer',
    },
    thumb: { width: '100%', height: 120, objectFit: 'cover', display: 'block' },
    thumbInfo: { padding: '4px 8px', fontSize: 11, color: '#94a3b8', background: '#f8fafc' },
    lightbox: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
        zIndex: 3000, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: 12,
    },
    lightboxImg: { maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 },
    lightboxInfo: { color: 'white', fontSize: 12 },
    lightboxClose: {
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(255,255,255,0.2)', border: 'none',
        color: 'white', fontSize: 20, cursor: 'pointer',
        borderRadius: 8, padding: '6px 12px',
    },
}