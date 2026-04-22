import { useEffect, useRef, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import sedes from '../data/sedes'

const defaultStyle = {
    color: '#FFFFFF',
    weight: 2,
    fillColor: '#A5A5A5',
    fillOpacity: 0.8,
    dashArray: 2
}
const highlightStyle = {
    weight: 2,
    fillOpacity: 0.8,
    fillColor: '#BC1829',
}
const hiddenStyle = {
    color: 'transparent', weight: 0, opacity: 0, fillOpacity: 0,
}

export default function DepartmentLayer({ data, nivel, dptoSeleccionado, onDepartamentoClick }) {
    const map = useMap()
    const layerRef = useRef(null)
    const nivelRef = useRef(nivel)
    const onClickRef = useRef(onDepartamentoClick)

    // Mantiene refs sincronizados sin recrear la capa
    useEffect(() => { nivelRef.current = nivel }, [nivel])
    useEffect(() => { onClickRef.current = onDepartamentoClick }, [onDepartamentoClick])

    // Función para crear la capa — reutilizable
    const crearCapa = useCallback((geoData) => {
        if (layerRef.current) {
            layerRef.current.remove()
            layerRef.current = null
        }

        const geoJsonLayer = L.geoJSON(geoData, {
            style: defaultStyle,
            onEachFeature(feature, layer) {
                const nombre = feature.properties?.nombre || 'Sin nombre'
                const codigo = feature.properties?.codigo || '00'

                layer.bindTooltip(nombre, {
                    permanent: false,
                    direction: 'top',
                    sticky: true,
                    className: 'dept-tooltip',
                })

                layer.on({
                    mouseover(e) {
                        if (nivelRef.current !== 1) return
                        e.target.setStyle(highlightStyle)
                        e.target.bringToFront()
                    },
                    mouseout(e) {
                        if (nivelRef.current !== 1) return
                        geoJsonLayer.resetStyle(e.target)
                    },
                    click(e) {
                        if (nivelRef.current !== 1) return
                        L.DomEvent.stopPropagation(e)
                        const sedesFiltradas = sedes.filter((s) => s.dpto === codigo)
                        onClickRef.current(sedesFiltradas, feature)
                    },
                })
            },
        })

        geoJsonLayer.addTo(map)
        layerRef.current = geoJsonLayer

        return geoJsonLayer
    }, [map])

    // Crea la capa inicial
    useEffect(() => {
        if (!data) return
        const layer = crearCapa(data)
        const bounds = layer.getBounds()
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] })

        return () => {
            if (layerRef.current) {
                layerRef.current.remove()
                layerRef.current = null
            }
        }
    }, [data, map, crearCapa])

    // Reacciona a cambios de nivel
    useEffect(() => {
        if (!data || !layerRef.current) return

        if (nivel === 1) {
            // Recrea la capa con estilos frescos
            const layer = crearCapa(data)
            const bounds = layer.getBounds()
            if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] })

        } else if (nivel >= 2 && dptoSeleccionado) {
            let selectedBounds = null

            layerRef.current.eachLayer((layer) => {
                const esSeleccionado = layer.feature === dptoSeleccionado
                const el = layer.getElement()

                if (esSeleccionado) {
                    layer.setStyle({ ...defaultStyle, color: '#BC1829' })
                    if (el) el.style.pointerEvents = 'none'
                    selectedBounds = layer.getBounds()
                } else {
                    layer.setStyle(hiddenStyle)
                    if (el) el.style.pointerEvents = 'none'
                }
            })

            if (selectedBounds && selectedBounds.isValid()) {
                map.fitBounds(selectedBounds, { padding: [60, 60] })
            }
        }
    }, [nivel, dptoSeleccionado, map, data, crearCapa])

    return null
}