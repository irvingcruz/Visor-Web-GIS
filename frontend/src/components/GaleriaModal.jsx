import { useState, useEffect } from 'react'
import { getGaleria, subirFotos, getFotoUrl } from '../services/galeriaService'

export default function GaleriaModal({ feature, clickLatLng, onClose, onFotosSubidas }) {
    const [tab, setTab] = useState('galeria')
    const [fotos, setFotos] = useState([])
    const [loading, setLoading] = useState(false)
    const [fotoSeleccionada, setFotoSeleccionada] = useState(null)
    const [files, setFiles] = useState([])       // hasta 4 fotos
    const [previews, setPreviews] = useState([]) // previews de cada foto
    const [subiendo, setSubiendo] = useState(false)
    const [mensaje, setMensaje] = useState(null)

    const featureId = feature?.properties?.id
    const codigo = feature?.properties?.codigo
    const codSede = feature?.properties?.cod_sede

    useEffect(() => {
        if (!featureId) return
        setLoading(true)
        getGaleria(featureId)
            .then(setFotos)
            .finally(() => setLoading(false))
    }, [featureId])

    function handleFileChange(e) {
        const selected = Array.from(e.target.files).slice(0, 4) // máx 4
        setFiles(selected)
        setPreviews(selected.map((f) => URL.createObjectURL(f)))
    }

    function removeFile(index) {
        const newFiles = files.filter((_, i) => i !== index)
        const newPreviews = previews.filter((_, i) => i !== index)
        setFiles(newFiles)
        setPreviews(newPreviews)
    }

    async function handleSubir() {
        if (!files.length) return
        setSubiendo(true)
        setMensaje(null)
        try {
            const codigoPunto = `${Math.round(Math.random() * 1e9)}`
            await subirFotos({
                files,
                featureId,
                latitud: clickLatLng?.lat,
                longitud: clickLatLng?.lng,
                codSede,
                codigoPunto
            })
            setMensaje({ tipo: 'ok', texto: `${files.length} foto(s) subida(s) correctamente` })
            setFiles([])
            setPreviews([])
            const nuevasFotos = await getGaleria(featureId)
            setFotos(nuevasFotos)
            onFotosSubidas?.() // notifica al padre para refrescar marcadores
            setTab('galeria')
        } catch (error) {
            console.error("Error al subir las fotos:", error)
            setMensaje({ tipo: 'error', texto: 'Error al subir las fotos' })
        } finally {
            setSubiendo(false)
        }
    }

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <div style={styles.headerTitle}>Ambiente: {codigo}</div>
                        <div style={styles.headerSub}>ID: {featureId}</div>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>✕</button>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    <button
                        style={{ ...styles.tab, ...(tab === 'galeria' ? styles.tabActive : {}) }}
                        onClick={() => setTab('galeria')}
                    >
                        📷 Galería {fotos.length > 0 && `(${fotos.length})`}
                    </button>
                    <button
                        style={{ ...styles.tab, ...(tab === 'subir' ? styles.tabActive : {}) }}
                        onClick={() => setTab('subir')}
                    >
                        ⬆️ Subir fotos
                    </button>
                </div>

                <div style={styles.body}>

                    {/* TAB GALERÍA */}
                    {tab === 'galeria' && (
                        <>
                            {loading && <p style={styles.msg}>Cargando fotos...</p>}
                            {!loading && fotos.length === 0 && (
                                <div style={styles.emptyState}>
                                    <div style={{ fontSize: 48 }}>📭</div>
                                    <p>No hay fotos para este ambiente</p>
                                    <button style={styles.btnPrimary} onClick={() => setTab('subir')}>
                                        Subir primera foto
                                    </button>
                                </div>
                            )}
                            {!loading && fotos.length > 0 && (
                                <div style={styles.grid}>
                                    {fotos.map((foto) => (
                                        <div key={foto.id} style={styles.gridItem} onClick={() => setFotoSeleccionada(foto)}>
                                            <img src={getFotoUrl(foto.name)} alt={foto.name} style={styles.thumb} />
                                            <div style={styles.thumbInfo}>{foto.size}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* TAB SUBIR */}
                    {tab === 'subir' && (
                        <div style={styles.uploadArea}>
                            <div style={styles.coordInfo}>
                                📍 Coordenadas: <strong>Lat</strong> {clickLatLng?.lat?.toFixed(8)} —{' '}
                                <strong>Lng</strong> {clickLatLng?.lng?.toFixed(8)}
                            </div>

                            {/* Selector de fotos */}
                            <label style={styles.fileLabel}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                {previews.length === 0 ? (
                                    <div style={styles.filePlaceholder}>
                                        <div style={{ fontSize: 40 }}>🖼️</div>
                                        <p>Haz click para seleccionar hasta <strong>4 fotos</strong></p>
                                    </div>
                                ) : (
                                    <div style={styles.previewGrid}>
                                        {previews.map((src, i) => (
                                            <div key={i} style={styles.previewItem}>
                                                <img src={src} alt={`preview-${i}`} style={styles.previewImg} />
                                                <button
                                                    style={styles.removeBtn}
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFile(i) }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        {/* Slot para agregar más si hay menos de 4 */}
                                        {previews.length < 4 && (
                                            <div style={styles.addMore}>
                                                <span style={{ fontSize: 24, color: '#94a3b8' }}>+</span>
                                                <span style={{ fontSize: 11, color: '#94a3b8' }}>Agregar</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </label>

                            {files.length > 0 && (
                                <div style={styles.fileCount}>
                                    {files.length} foto(s) seleccionada(s) — máx. 4
                                </div>
                            )}

                            {mensaje && (
                                <div style={{
                                    ...styles.mensaje,
                                    background: mensaje.tipo === 'ok' ? '#dcfce7' : '#fee2e2',
                                    color: mensaje.tipo === 'ok' ? '#166534' : '#991b1b',
                                }}>
                                    {mensaje.texto}
                                </div>
                            )}

                            <div style={styles.uploadActions}>
                                {files.length > 0 && (
                                    <button style={styles.btnSecondary} onClick={() => { setFiles([]); setPreviews([]) }}>
                                        Limpiar
                                    </button>
                                )}
                                <button
                                    style={{ ...styles.btnPrimary, opacity: (!files.length || subiendo) ? 0.6 : 1 }}
                                    onClick={handleSubir}
                                    disabled={!files.length || subiendo}
                                >
                                    {subiendo ? 'Subiendo...' : `Subir ${files.length || ''} foto(s)`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
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
        width: '90%', maxWidth: 680, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    header: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc',
    },
    headerTitle: { fontWeight: 700, fontSize: 16, color: '#1e293b' },
    headerSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    closeBtn: {
        background: 'none', border: 'none', fontSize: 18,
        cursor: 'pointer', color: '#64748b', padding: '4px 8px', borderRadius: 6,
    },
    tabs: { display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' },
    tab: {
        flex: 1, padding: '12px 16px', background: 'none', border: 'none',
        cursor: 'pointer', fontSize: 13, fontWeight: 500,
        color: '#64748b', borderBottom: '2px solid transparent',
    },
    tabActive: { color: '#1d4ed8', borderBottom: '2px solid #1d4ed8', background: 'white' },
    body: { flex: 1, overflowY: 'auto', padding: 20 },
    msg: { textAlign: 'center', color: '#94a3b8', padding: 40 },
    emptyState: {
        textAlign: 'center', padding: 40, color: '#64748b',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    },
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
    uploadArea: { display: 'flex', flexDirection: 'column', gap: 16 },
    coordInfo: {
        background: '#f0f9ff', border: '1px solid #bae6fd',
        borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#0369a1',
    },
    fileLabel: {
        cursor: 'pointer', display: 'block',
        border: '2px dashed #cbd5e1', borderRadius: 10,
        overflow: 'hidden', minHeight: 160,
    },
    filePlaceholder: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 160, color: '#94a3b8', gap: 8,
    },
    previewGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8, padding: 12,
    },
    previewItem: { position: 'relative', borderRadius: 8, overflow: 'hidden' },
    previewImg: { width: '100%', height: 100, objectFit: 'cover', display: 'block' },
    removeBtn: {
        position: 'absolute', top: 4, right: 4,
        background: 'rgba(0,0,0,0.6)', color: 'white',
        border: 'none', borderRadius: 4, cursor: 'pointer',
        fontSize: 11, padding: '2px 5px', lineHeight: 1,
    },
    addMore: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: 100, border: '2px dashed #e2e8f0',
        borderRadius: 8, gap: 4,
    },
    fileCount: { fontSize: 12, color: '#64748b', textAlign: 'center' },
    mensaje: { borderRadius: 8, padding: '10px 14px', fontSize: 13 },
    uploadActions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
    btnPrimary: {
        background: '#1d4ed8', color: 'white', border: 'none',
        borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
    },
    btnSecondary: {
        background: 'white', color: '#64748b', border: '1px solid #e2e8f0',
        borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: 13,
    },
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