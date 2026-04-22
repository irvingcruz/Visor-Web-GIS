import { useEffect, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import GaleriaModal from './GaleriaModal'
import { createPortal } from 'react-dom'
import FotoPuntoModal from './FotoPuntoModal'
import { getGaleriaByPoint } from '../services/galeriaService'

const COLORES_PISO = {
    1: { color: '#1d4ed8', fillColor: '#3b82f6' },
    2: { color: '#15803d', fillColor: '#22c55e' },
    3: { color: '#b45309', fillColor: '#f59e0b' },
    4: { color: '#7c3aed', fillColor: '#a78bfa' },
}

function getEstilo(piso) {
    const c = COLORES_PISO[piso] || { color: '#374151', fillColor: '#9ca3af' }
    return { ...c, weight: 1.5, opacity: 1, fillOpacity: 0.4 }
}

function getEstiloHover(piso) {
    const c = COLORES_PISO[piso] || { color: '#374151', fillColor: '#9ca3af' }
    return { ...c, weight: 2.5, opacity: 1, fillOpacity: 0.7 }
}

const fotoIcon = L.divIcon({
    className: '',
    html: `<div style="
        width:28px; height:28px; border-radius:50%;
        background:#1d4ed8; border:2px solid white;
        display:flex; align-items:center; justify-content:center;
        font-size:14px; box-shadow:0 2px 6px rgba(0,0,0,0.3);
    ">📷</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
})

export default function SedePoligonosLayer({ geoData, sedeCodigo, pisosVisibles, fotosLayerRef }) {
    const map = useMap()
    const layersRef = useRef({})
    const cargarRef = useRef(null)
    const fotosDataRef = useRef([]) // guarda los puntos con piso para filtrar
    const [modalData, setModalData] = useState(null)
    const [puntoModal, setPuntoModal] = useState(null)

    // Renderiza marcadores de fotos filtrando por pisosVisibles
    function renderizarMarcadores(puntos, pisosActivos) {
        if (fotosLayerRef.current) {
            fotosLayerRef.current.remove()
            fotosLayerRef.current = null
        }

        if (!puntos.length) return

        const group = L.layerGroup()

        puntos
            .filter((p) => pisosActivos.includes(p.piso)) // ← filtra por piso visible
            .forEach(({ lat, lng, piso, codigo, fotos }) => {
                const marker = L.marker([lat, lng], { icon: fotoIcon })
                marker.bindTooltip(
                    `📷 ${fotos.length} foto(s)<br/>Piso ${piso} — ${codigo}`,
                    { direction: 'top', className: 'dept-tooltip' }
                )
                marker.on('click', (e) => {
                    L.DomEvent.stopPropagation(e)
                    setPuntoModal({ fotos, coordenadas: { lat, lng }, piso, codigo })
                })
                group.addLayer(marker)
            })

        group.addTo(map)
        fotosLayerRef.current = group
    }

    // Crea polígonos y carga marcadores de fotos
    useEffect(() => {
        let cancelled = false

        Object.values(layersRef.current).forEach((l) => l.remove())
        layersRef.current = {}
        fotosDataRef.current = []

        if (!geoData || !sedeCodigo) return

        const codigoNorm = String(sedeCodigo)
        const features = geoData.features.filter(
            (f) => f.properties.cod_sede === codigoNorm
        )
        if (!features.length) return

        const porPiso = features.reduce((acc, f) => {
            const p = f.properties.piso
            if (!acc[p]) acc[p] = []
            acc[p].push(f)
            return acc
        }, {})

        Object.entries(porPiso).forEach(([piso, feats]) => {
            const pisoNum = Number(piso)
            const layer = L.geoJSON(
                { type: 'FeatureCollection', features: feats },
                {
                    style: getEstilo(pisoNum),
                    onEachFeature(feature, layer) {
                        layer.bindTooltip(`Ambiente: ${feature.properties.codigo}`, {
                            direction: 'top', sticky: true, className: 'dept-tooltip',
                        })
                        layer.on({
                            mouseover(e) {
                                e.target.setStyle(getEstiloHover(pisoNum))
                                e.target.bringToFront()
                            },
                            mouseout(e) {
                                e.target.setStyle(getEstilo(pisoNum))
                            },
                            click(e) {
                                L.DomEvent.stopPropagation(e)
                                setModalData({ feature, clickLatLng: e.latlng })
                            },
                        })
                    },
                }
            )
            layersRef.current[pisoNum] = layer
        })

        Object.entries(layersRef.current).forEach(([piso, layer]) => {
            if (pisosVisibles.includes(Number(piso))) layer.addTo(map)
        })

        const bounds = L.featureGroup(Object.values(layersRef.current)).getBounds()
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] })

        // Carga fotos con flag de cancelación
        async function cargarFotos(pisosActivos) {
            if (fotosLayerRef.current) {
                fotosLayerRef.current.remove()
                fotosLayerRef.current = null
            }

            const fotos = await getGaleriaByPoint(sedeCodigo)
            if (cancelled) return  // ← componente desmontado antes de que terminara

            // Cruza cada foto con su feature para obtener piso y codigo
            const fotosConMeta = fotos.map((foto) => {
                const feature = geoData.features.find(
                    (f) => f.properties.id === foto.id
                )
                return {
                    ...foto,
                    piso: feature?.properties?.piso ?? null,
                    codigo: feature?.properties?.codigo ?? null,
                }
            }).filter((f) => f.lat !== 0 && f.lng !== 0 && f.piso !== null)

            // Agrupa por coordenada exacta
            const porPunto = fotosConMeta.reduce((acc, foto) => {
                const key = `${foto.lat},${foto.lng}`
                if (!acc[key]) {
                    acc[key] = {
                        lat: foto.lat,
                        lng: foto.lng,
                        piso: foto.piso,
                        codigo: foto.codigo,
                        fotos: []
                    }
                }
                acc[key].fotos.push(foto)
                return acc
            }, {})

            if (cancelled) return  // ← doble check antes de tocar el mapa

            fotosDataRef.current = Object.values(porPunto)
            renderizarMarcadores(fotosDataRef.current, pisosActivos)
        }

        cargarFotos(pisosVisibles)

        // Actualiza cargarRef para usarlo desde el modal al subir fotos
        cargarRef.current = () => cargarFotos(pisosVisibles)

        return () => {
            cancelled = true  // ← cancela fetch pendiente
            Object.values(layersRef.current).forEach((l) => l.remove())
        }
    }, [geoData, sedeCodigo])

    // Cuando cambian los pisos visibles → re-renderiza polígonos Y marcadores
    useEffect(() => {
        Object.entries(layersRef.current).forEach(([piso, layer]) => {
            if (pisosVisibles.includes(Number(piso))) {
                layer.addTo(map)
            } else {
                layer.remove()
            }
        })

        // Re-renderiza marcadores de fotos según pisos visibles
        if (fotosDataRef.current.length) {
            renderizarMarcadores(fotosDataRef.current, pisosVisibles)
        }

        // Actualiza cargarRef con los pisos actuales
        cargarRef.current = () => {
            getGaleriaByPoint(sedeCodigo).then((fotos) => {
                const fotosConMeta = fotos.map((foto) => {
                    const feature = geoData?.features.find(
                        (f) => f.properties.id === foto.id
                    )
                    return {
                        ...foto,
                        piso: feature?.properties?.piso ?? null,
                        codigo: feature?.properties?.codigo ?? null,
                    }
                }).filter((f) => f.lat !== 0 && f.lng !== 0 && f.piso !== null)

                const porPunto = fotosConMeta.reduce((acc, foto) => {
                    const key = `${foto.lat},${foto.lng}`
                    if (!acc[key]) {
                        acc[key] = {
                            lat: foto.lat,
                            lng: foto.lng,
                            piso: foto.piso,
                            codigo: foto.codigo,
                            fotos: []
                        }
                    }
                    acc[key].fotos.push(foto)
                    return acc
                }, {})

                fotosDataRef.current = Object.values(porPunto)
                renderizarMarcadores(fotosDataRef.current, pisosVisibles)
            })
        }
    }, [pisosVisibles])

    return (
        <>
            {modalData && createPortal(
                <GaleriaModal
                    feature={modalData.feature}
                    clickLatLng={modalData.clickLatLng}
                    onClose={() => setModalData(null)}
                    onFotosSubidas={() => cargarRef.current?.()}
                />,
                document.body
            )}
            {puntoModal && createPortal(
                <FotoPuntoModal
                    fotos={puntoModal.fotos}
                    coordenadas={puntoModal.coordenadas}
                    piso={puntoModal.piso}
                    codigo={puntoModal.codigo}
                    onClose={() => setPuntoModal(null)}
                />,
                document.body
            )}
        </>
    )
}
