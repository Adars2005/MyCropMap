import { useSelector, useDispatch } from 'react-redux';
import { clearSelectedPlant } from '../../features/plants/plantSlice';
import { setCurrentView } from '../../features/ui/uiSlice';
import toast from 'react-hot-toast';
import './PlantDetail.css';

const PlantDetail = () => {
    const dispatch = useDispatch();
    const { selectedPlant } = useSelector((state) => state.plants);

    const handleClose = () => {
        dispatch(clearSelectedPlant());
        dispatch(setCurrentView('map'));
    };

    if (!selectedPlant) {
        return (
            <div className="no-selection">
                <div className="no-selection-icon">🌱</div>
                <h3>No Plant Selected</h3>
                <p>Click on a plant marker on the map to view details</p>
                <button
                    className="action-btn secondary"
                    style={{ maxWidth: '200px', marginTop: '1rem' }}
                    onClick={() => dispatch(setCurrentView('map'))}
                >
                    Go to Map
                </button>
            </div>
        );
    }

    return (
        <div className="plant-detail-container">
            <div className="detail-header">
                <h2>🌿 Plant Details</h2>
                <button onClick={handleClose} className="close-btn" title="Close and return to map">
                    ✕
                </button>
            </div>

            <div className="detail-content">
                <div className="image-section">
                    <img
                        src={selectedPlant.imageUrl}
                        alt={selectedPlant.imageName}
                        className="detail-image"
                    />
                </div>

                <div className="info-section">
                    <div className="info-group">
                        <label>📷 Image Name</label>
                        <p>{selectedPlant.imageName}</p>
                    </div>

                    <div className="info-group">
                        <label>📍 Location</label>
                        <div className="location-badges">
                            <span className="badge latitude">
                                Lat: {selectedPlant.latitude.toFixed(6)}
                            </span>
                            <span className="badge longitude">
                                Lon: {selectedPlant.longitude.toFixed(6)}
                            </span>
                        </div>
                    </div>

                    {selectedPlant.timestamp && (
                        <div className="info-group">
                            <label>📅 Upload Date</label>
                            <p>{new Date(selectedPlant.timestamp).toLocaleString()}</p>
                        </div>
                    )}

                    <div className="info-group">
                        <label>🔗 Image URL</label>
                        <a
                            href={selectedPlant.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="url-link"
                        >
                            View Full Image
                        </a>
                    </div>

                    <div className="action-buttons">
                        <button
                            className="action-btn primary"
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    `${selectedPlant.latitude}, ${selectedPlant.longitude}`
                                );
                                toast.success('Coordinates copied to clipboard!');
                            }}
                        >
                            📋 Copy Coordinates
                        </button>
                        <button
                            className="action-btn secondary"
                            onClick={() => {
                                const url = `https://www.google.com/maps?q=${selectedPlant.latitude},${selectedPlant.longitude}`;
                                window.open(url, '_blank');
                            }}
                        >
                            🗺️ Open in Google Maps
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlantDetail;
