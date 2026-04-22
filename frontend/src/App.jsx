import './App.css'
import MapView from './components/MapView'
import { useGeoJSON } from './hooks/useGeoJSON'

function App() {

  const { data, loading, error } = useGeoJSON('/geo_dpto.geojson')
  const { data: dataSedes, loading: loadingSedes, error: errorSedes } = useGeoJSON('/geo_sedes.geojson')

  if (loading || loadingSedes) return <p style={{ padding: 20 }}>Cargando mapa...</p>
  if (error || errorSedes) return <p style={{ padding: 20, color: 'red' }}>Error: {error || errorSedes}</p>

  return (
    <>
      <MapView geoData={data} geoSedes={dataSedes} />
    </>
  )
}

export default App
