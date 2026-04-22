import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export default function SedesLayer({ sedes, onSedeClick, visible, sedeSeleccionada }) {
    const map = useMap()
    const markersRef = useRef([])

    // Crea marcadores
    useEffect(() => {
        // Limpiar anteriores
        markersRef.current.forEach((m) => m.remove())
        markersRef.current = []

        if (!sedes || sedes.length === 0) return

        sedes.forEach((sede) => {
            var LeafIcon = L.Icon.extend({
                options: {
                    iconSize: [32, 32],
                    shadowSize: [50, 64],
                    iconAnchor: [22, 94],
                    shadowAnchor: [4, 62],
                    popupAnchor: [-3, -76]
                }
            });
            var sedeIcon = new LeafIcon({
                iconUrl: '/sede_icono.png',
                // shadowUrl: 'http://leafletjs.com/examples/custom-icons/leaf-shadow.png'
            })
            const marker = L.marker([sede.latitud, sede.longitud], { icon: sedeIcon })
            marker.sedeData = sede

            marker.bindTooltip(`<b>${sede.nombre}</b><br/>${sede.direccion}`, {
                direction: 'top',
                sticky: false,
                className: 'dept-tooltip',
            })
            marker.on('click', () => {
                // L.DomEvent.stopPropagation(e)  // ← evita que el click llegue al dpto
                // onSedeClick(sede)
            })
            marker.addTo(map)  // ← directo al mapa, no al group
            markersRef.current.push(marker)
        })

        return () => {
            markersRef.current.forEach((m) => m.remove())
            markersRef.current = []
        }
    }, [sedes, map])

    // Mostrar u ocultar según nivel
    useEffect(() => {
        markersRef.current.forEach((marker) => {
            const esSeleccionada = sedeSeleccionada &&
                marker.sedeData.id === sedeSeleccionada.id

            if (visible) {
                // nivel 2: todos visibles
                if (!map.hasLayer(marker)) marker.addTo(map)
            } else {
                // nivel 3: solo el seleccionado
                if (esSeleccionada) {
                    if (!map.hasLayer(marker)) marker.addTo(map)
                } else {
                    marker.remove()
                }
            }
        })
    }, [visible, sedeSeleccionada, map])

    return null
}