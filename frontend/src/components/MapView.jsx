import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useRef } from "react";
import DepartmentLayer from "./DepartamentLayer";
import SedesLayer from "./SedesLayer";
import SedePoligonosLayer from './SedePoligonosLayer'
import PisosPanel from './PisosPanel'
import SedesPanel from './SedesPanel'

function MapView({ geoData, geoSedes }) {
    const [nivel, setNivel] = useState(1)
    const [dptoSeleccionado, setDptoSeleccionado] = useState(null)
    const [sedesActivas, setSedesActivas] = useState([])
    const [sedeSeleccionada, setSedeSeleccionada] = useState(null)
    const [pisosVisibles, setPisosVisibles] = useState([1])
    const [pisosDisponibles, setPisosDisponibles] = useState([])

    const fotosLayerRef = useRef(null)

    function limpiarFotosLayer() {
        if (fotosLayerRef.current) {
            fotosLayerRef.current.remove()
            fotosLayerRef.current = null
        }
    }

    // Click en departamento → nivel 2
    function handleDepartamentoClick(sedesFiltradas, feature) {
        limpiarFotosLayer()
        setDptoSeleccionado(feature)
        setSedesActivas(sedesFiltradas)
        setSedeSeleccionada(null)
        setPisosDisponibles([])
        setPisosVisibles([])
        setNivel(2)
    }

    // Click en marcador/panel sede → nivel 3
    function handleSedeClick(sede) {
        if (!geoSedes) return

        limpiarFotosLayer()

        const codigoNorm = String(sede.id).padStart(2, '0')
        const pisos = [
            ...new Set(
                geoSedes.features
                    .filter((f) => f.properties.cod_sede === codigoNorm)
                    .map((f) => f.properties.piso)
            ),
        ].sort()

        setSedeSeleccionada(sede)
        setPisosDisponibles(pisos)
        setPisosVisibles(pisos)
        setNivel(3)
    }

    // Botón atrás
    function handleAtras() {
        if (nivel === 3) {
            limpiarFotosLayer()
            setSedeSeleccionada(null)
            setPisosDisponibles([])
            setPisosVisibles([])
            setNivel(2)
        } else if (nivel === 2) {
            limpiarFotosLayer()
            setDptoSeleccionado(null)
            setSedesActivas([])
            setNivel(1)
        }
    }

    function togglePiso(piso) {
        setPisosVisibles((prev) =>
            prev.includes(piso) ? prev.filter((p) => p !== piso) : [...prev, piso]
        )
    }

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%' }}>

            {/* Botón atrás */}
            {nivel > 1 && (
                <button
                    onClick={handleAtras}
                    style={{
                        position: 'absolute',
                        top: 80,
                        left: 10,
                        zIndex: 1000,
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        padding: '4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 13,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                    }}
                >
                    <img src="/arrow_left.png" alt="Sede" title="Atrás" style={{ width: 24, height: 24 }} />
                </button>
            )}

            {/* Breadcrumb */}
            <div style={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                background: 'white',
                borderRadius: 20,
                padding: '6px 16px',
                fontSize: 12,
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#64748b',
            }}>
                <span style={{ color: nivel === 1 ? '#1d4ed8' : '#64748b', fontWeight: nivel === 1 ? 600 : 400 }}>
                    Visor WEB-GIS
                </span>
                {nivel >= 2 && (
                    <>
                        <span>›</span>
                        <span style={{ color: nivel === 2 ? '#1d4ed8' : '#64748b', fontWeight: nivel === 2 ? 600 : 400 }}>
                            {dptoSeleccionado?.properties?.nombre || 'Departamento'}
                        </span>
                    </>
                )}
                {nivel === 3 && (
                    <>
                        <span>›</span>
                        <span style={{ color: '#1d4ed8', fontWeight: 600 }}>
                            {sedeSeleccionada?.nombre}
                        </span>
                    </>
                )}
            </div>

            {/* Panel de sedes — solo en nivel 2 */}
            {nivel === 2 && (
                <SedesPanel
                    sedes={sedesActivas}
                    dptoNombre={dptoSeleccionado?.properties?.nombre || 'Departamento'}
                    onSedeClick={handleSedeClick}
                />
            )}

            <MapContainer
                center={[-9.19, -75.0152]}
                zoom={5}
                // maxZoom={21}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={25}
                    maxNativeZoom={19}
                />

                <DepartmentLayer
                    data={geoData}
                    nivel={nivel}
                    dptoSeleccionado={dptoSeleccionado}
                    onDepartamentoClick={handleDepartamentoClick}
                />

                {nivel >= 2 && (
                    <SedesLayer
                        sedes={sedesActivas}
                        onSedeClick={handleSedeClick}
                        visible={nivel === 2}
                        sedeSeleccionada={sedeSeleccionada}
                    />
                )}

                {nivel === 3 && geoSedes && sedeSeleccionada && (
                    <SedePoligonosLayer
                        geoData={geoSedes}
                        sedeCodigo={sedeSeleccionada.id}
                        pisosVisibles={pisosVisibles}
                        fotosLayerRef={fotosLayerRef}
                    />
                )}
            </MapContainer>

            {nivel === 3 && (
                <PisosPanel
                    pisos={pisosDisponibles}
                    pisosVisibles={pisosVisibles}
                    onToggle={togglePiso}
                    onClose={handleAtras}
                />
            )}
        </div>
    );
}

export default MapView;
