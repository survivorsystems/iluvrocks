import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Doc } from '../../convex/_generated/dataModel';
import { Link } from '@tanstack/react-router';
import { Navigation, Heart, ArrowRight } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

// Leaflet is imported dynamically
let L: any = null;

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface MapProps {
  locations: Doc<'locations'>[];
  filters: {
    mineral: string;
    difficulty: string;
    access: string;
    landStatus: string;
    region: string;
  };
  searchQuery: string;
}

const FIND_COLORS: Record<string, string> = {
  'Agate': '#3D6B6B', // Mineral Teal
  'Jasper': '#B85A5A', // Error/Reddish
  'Quartz': '#D6D2C4', // Light Surface
  'Amethyst': '#6B7F5E', // Forest Green
  'Geodes': '#B87333', // Copper
  'Petrified Wood': '#78350f', 
  'Garnets': '#b91c1c', 
  'Jade': '#065f46', 
  'Obsidian': '#171717', 
  'Fossils': '#71717a', 
  'Gold': '#B87333', // Copper
};

export default function RockhoundMap({ locations, filters, searchQuery }: MapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Doc<'locations'> | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([47.45, -120.75]); // WA Center
  const [mapZoom, setMapZoom] = useState(7);
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !L) {
        L = (await import('leaflet')).default;
        
        // Fix Leaflet icon issue
        const DefaultIcon = L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        });
        L.Marker.prototype.options.icon = DefaultIcon;
        setIsLeafletLoaded(true);
      } else if (L) {
        setIsLeafletLoaded(true);
      }
    };
    loadLeaflet();
  }, []);

  const getMarkerIcon = (finds: string[]) => {
    if (!L) return null;
    const primaryFind = finds[0] || 'Mixed';
    const color = FIND_COLORS[primaryFind] || '#3D6B6B'; 
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid #1B2632; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.5);">
              <div style="transform: rotate(45deg); width: 8px; height: 8px; background: #F5F3EE; border-radius: 50%;"></div>
            </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      if (filters.mineral && !loc.typicalFinds.includes(filters.mineral)) return false;
      if (filters.difficulty && loc.difficulty.toString() !== filters.difficulty) return false;
      if (filters.landStatus && loc.landStatus !== filters.landStatus) return false;
      if (filters.region && loc.region !== filters.region) return false;
      if (filters.access && loc.accessType !== filters.access) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          loc.name.toLowerCase().includes(query) ||
          loc.typicalFinds.some(f => f.toLowerCase().includes(query)) ||
          loc.region?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [locations, filters, searchQuery]);

  const handleLocateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setMapZoom(10);
      });
    }
  };

  if (!isLeafletLoaded || typeof window === 'undefined') {
    return (
      <div className="w-full h-full bg-earth-950 flex items-center justify-center animate-pulse">
        <div className="w-12 h-12 border-4 border-mineral-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        
        {filteredLocations.map((loc) => (
          <Marker 
            key={loc._id} 
            position={[loc.coordinates.lat, loc.coordinates.lng]}
            icon={getMarkerIcon(loc.typicalFinds)}
            eventHandlers={{
              click: () => setSelectedLocation(loc),
            }}
          />
        ))}
      </MapContainer>

      {/* Locate Button */}
      <button 
        onClick={handleLocateUser}
        className="absolute bottom-32 right-6 z-[1000] bg-earth-900 p-4 rounded-2xl shadow-2xl border border-earth-700 text-earth-50 hover:bg-earth-800 transition-colors"
      >
        <Navigation className="w-6 h-6" />
      </button>

      {/* Preview Card */}
      {selectedLocation && (
        <div className="absolute bottom-28 left-6 right-6 z-[1000] md:left-auto md:right-6 md:w-96 animate-in slide-in-from-bottom duration-300">
          <div className="bg-earth-900 rounded-[2.5rem] shadow-2xl border border-earth-700 overflow-hidden">
            <div className="relative h-40">
              <img 
                src={selectedLocation.photos[0]} 
                alt={selectedLocation.name}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 bg-earth-950/40 backdrop-blur-md text-earth-50 p-2 rounded-full hover:bg-earth-950/60 transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-mineral-teal text-earth-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {selectedLocation.landStatus}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black text-earth-50 uppercase italic leading-tight mb-1">{selectedLocation.name}</h3>
                  <p className="text-earth-400 text-xs font-bold uppercase tracking-widest">{selectedLocation.region}</p>
                </div>
                <div className="flex gap-2">
                   <button className="text-earth-700 hover:text-mineral-copper transition-colors">
                     <Heart className="w-6 h-6" />
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 bg-earth-950 px-3 py-2 rounded-xl border border-earth-700">
                  <span className="text-[10px] font-black text-earth-400 uppercase">Difficulty</span>
                  <span className="text-xs font-black text-earth-50">{selectedLocation.difficulty}/5</span>
                </div>
                <div className="flex items-center gap-2 bg-earth-950 px-3 py-2 rounded-xl border border-earth-700">
                  <span className="text-[10px] font-black text-earth-400 uppercase">Access</span>
                  <span className="text-xs font-black text-earth-50">{selectedLocation.accessType || 'Varies'}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedLocation.typicalFinds.slice(0, 3).map(find => (
                  <span key={find} className="bg-earth-800 text-earth-400 text-[9px] font-black uppercase px-2 py-1 rounded-lg border border-earth-700">
                    {find}
                  </span>
                ))}
              </div>

              <Link 
                to="/locations/$locationId"
                params={{ locationId: selectedLocation._id }}
                className="w-full bg-mineral-teal text-earth-50 py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-xs hover:bg-mineral-teal-hover transition-all shadow-xl"
              >
                Full Details <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
