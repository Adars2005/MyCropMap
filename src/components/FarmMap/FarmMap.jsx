import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { fetchPlants, selectPlant } from '../../features/plants/plantSlice';
import { setCurrentView } from '../../features/ui/uiSlice';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import './FarmMap.css';

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom plant marker icon
const createPlantIcon = (imageUrl) => {
    return L.divIcon({
        className: 'custom-plant-marker',
        html: `<div class="marker-pin">
            <img src="${imageUrl}" alt="plant" class="marker-image" />
            <div class="marker-dot">🌱</div>
           </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });
};

// Component to recenter map when plants change
function MapBounds({ plants }) {
    const map = useMap();

    useEffect(() => {
        if (plants.length > 0) {
            const bounds = plants
                .filter(p => p.latitude && p.longitude)
                .map(p => [p.latitude, p.longitude]);

            if (bounds.length > 0) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [plants, map]);

    return null;
}

const FarmMap = () => {
    const dispatch = useDispatch();
    const { plants, loading } = useSelector((state) => state.plants);
    const [sortBy, setSortBy] = useState('date');
    const [filterText, setFilterText] = useState('');

    useEffect(() => {
        // Load plants on mount
        dispatch(fetchPlants())
            .unwrap()
            .catch(() => {
                toast.error('Failed to load plant data');
            });
    }, [dispatch]);

    const handleMarkerClick = (plant) => {
        dispatch(selectPlant(plant));
    };

    const handleViewDetails = (plant) => {
        dispatch(selectPlant(plant));
        dispatch(setCurrentView('detail'));
    };

    // Filter and sort plants
    const filteredPlants = plants
        .filter(plant =>
            plant.latitude &&
            plant.longitude &&
            (plant.imageName?.toLowerCase().includes(filterText.toLowerCase()) || !filterText)
        )
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
            }
            if (sortBy === 'name') {
                return (a.imageName || '').localeCompare(b.imageName || '');
            }
            return 0;
        });

    const defaultCenter = filteredPlants.length > 0
        ? [filteredPlants[0].latitude, filteredPlants[0].longitude]
        : [20.5937, 78.9629]; // Center of India as default

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading farm map...</p>
            </div>
        );
    }

    return (
        <div className="farm-map-container">
            <div className="map-header">
                <div className="header-content">
                    <h2>🗺️ Farm Crop Visualization</h2>
                    <p className="plant-count">{filteredPlants.length} plants mapped</p>
                </div>

                <div className="map-controls">
                    <input
                        type="text"
                        placeholder="🔍 Search plants..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="search-input"
                    />

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                    </select>
                </div>
            </div>

            {filteredPlants.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🌾</div>
                    <h3>No Plants Mapped Yet</h3>
                    <p>Upload geo-tagged plant images to see them on the map</p>
                </div>
            ) : (
                <div className="map-wrapper">
                    <MapContainer
                        center={defaultCenter}
                        zoom={13}
                        className="leaflet-map"
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <MapBounds plants={filteredPlants} />

                        {filteredPlants.map((plant, index) => (
                            <Marker
                                key={index}
                                position={[plant.latitude, plant.longitude]}
                                icon={createPlantIcon(plant.imageUrl)}
                                eventHandlers={{
                                    click: () => handleMarkerClick(plant),
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div className="popup-content">
                                        <img
                                            src={plant.imageUrl}
                                            alt={plant.imageName}
                                            className="popup-image"
                                        />
                                        <h4>{plant.imageName}</h4>
                                        <div className="popup-details">
                                            <p>📍 {plant.latitude.toFixed(4)}, {plant.longitude.toFixed(4)}</p>
                                            {plant.timestamp && (
                                                <p>📅 {new Date(plant.timestamp).toLocaleDateString()}</p>
                                            )}
                                            <button
                                                className="popup-btn"
                                                onClick={() => handleViewDetails(plant)}
                                            >
                                                View Full Details
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            )}

            {filteredPlants.length > 0 && (
                <div className="plants-sidebar">
                    <h3>📋 Plant List</h3>
                    <div className="plants-list">
                        {filteredPlants.map((plant, index) => (
                            <div
                                key={index}
                                className="plant-card"
                                onClick={() => handleViewDetails(plant)}
                            >
                                <img src={plant.imageUrl} alt={plant.imageName} />
                                <div className="plant-info">
                                    <h4>{plant.imageName}</h4>
                                    <p className="coordinates">
                                        {plant.latitude.toFixed(4)}, {plant.longitude.toFixed(4)}
                                    </p>
                                    {plant.timestamp && (
                                        <p className="timestamp">
                                            {new Date(plant.timestamp).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmMap;
