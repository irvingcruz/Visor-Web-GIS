export default function PisosPanel({ pisos, pisosVisibles, onToggle, onClose }) {
    console.log('pisos:', pisos)
    console.log('pisosVisibles:', pisosVisibles)
    if (!pisos.length) return null

    return (
        <div style={{
            position: 'absolute',
            top: 80,
            right: 16,
            zIndex: 1000,
            background: 'white',
            borderRadius: 8,
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            padding: '12px 16px',
            minWidth: 160,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>Pisos</strong>
                <button
                    onClick={onClose}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                >×</button>
            </div>

            {pisos.map((piso) => (
                <label key={piso} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer', fontSize: 13, color: 'black' }}>
                    <input
                        type="checkbox"
                        checked={pisosVisibles.includes(piso)}
                        onChange={() => onToggle(piso)}
                    />
                    Piso {piso}
                </label>
            ))}
        </div>
    )
}