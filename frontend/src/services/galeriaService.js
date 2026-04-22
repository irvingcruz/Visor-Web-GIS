const BASE_URL = import.meta.env.VITE_API_URL
// const BASE_URL = 'https://web-6gv79sgknlni.up-de-fra1-k8s-1.apps.run-on-seenode.com'
// const BASE_URL = 'http://localhost:5300'

export async function getGaleria(featureId) {
    const res = await fetch(`${BASE_URL}/api/gis/listGallery/${featureId}`)
    const json = await res.json()
    return json.data || []
}

export async function getGaleriaByPoint(codSede) {
    const res = await fetch(`${BASE_URL}/api/gis/listGalleryPoint/${codSede}`)
    const json = await res.json()
    return (json.data || []).filter((f) => f.lat !== 0 && f.lng !== 0) // solo fotos con coords válidas
}

export async function subirFotos({ files, featureId, latitud, longitud, codSede, codigoPunto }) {
    const formData = new FormData()
    // formData.append('files', file)
    files.forEach((file) => formData.append('files', file)) // múltiples archivos
    formData.append('id', featureId)
    formData.append('latitud', latitud)
    formData.append('longitud', longitud)
    formData.append('codSede', codSede)
    formData.append('codigoPunto', codigoPunto)

    const res = await fetch(`${BASE_URL}/api/gis/registrar`, {
        method: 'POST',
        body: formData,
    })
    return res.json()
}

export function getFotoUrl(name) {
    return `${BASE_URL}/uploads/sedes/${name}`
}