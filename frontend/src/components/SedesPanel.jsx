export default function SedesPanel({ sedes, dptoNombre, onSedeClick }) {
    if (!sedes || sedes.length === 0) return null

    return (
        <div style={{
            position: 'absolute',
            top: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            padding: '12px 8px',
            minWidth: 320,
            maxWidth: 420,
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
        }}>
            <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: 1,
                padding: '0 12px 8px',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: 8,
            }}>
                Sedes en {dptoNombre}
            </div>

            {sedes.map((sede) => (
                <div
                    key={sede.id}
                    onClick={() => onSedeClick(sede)}
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '10px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    {/* Ícono */}
                    <div style={{
                        width: 36, height: 36,
                        borderRadius: 8,
                        background: '#eff6ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, flexShrink: 0,
                    }}>
                        🏢
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontWeight: 600, fontSize: 13,
                            color: '#1e293b',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                            {sede.nombre}
                        </div>
                        <div style={{
                            fontSize: 11, color: '#94a3b8', marginTop: 2,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                            📍 {sede.direccion}
                        </div>
                    </div>

                    {/* Flecha */}
                    <div style={{ color: '#cbd5e1', fontSize: 16, alignSelf: 'center' }}>›</div>
                </div>
            ))}
        </div>
    )
}