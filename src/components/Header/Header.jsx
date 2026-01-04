import { useDispatch, useSelector } from 'react-redux';
import { setCurrentView, toggleTheme } from '../../features/ui/uiSlice';
import { downloadCSV } from '../../utils/export';
import toast from 'react-hot-toast';
import './Header.css';

const Header = () => {
    const dispatch = useDispatch();
    const { currentView, theme } = useSelector((state) => state.ui);
    const { plants } = useSelector((state) => state.plants);

    const navItems = [
        { id: 'upload', label: 'Upload', icon: '📤' },
        { id: 'map', label: 'Farm Map', icon: '🗺️' },
        { id: 'detail', label: 'Details', icon: '📋' },
    ];

    const handleExport = () => {
        if (plants.length === 0) {
            toast.error('No data to export');
            return;
        }

        // Format data for export
        const exportData = plants.map(p => ({
            ImageName: p.imageName,
            Latitude: p.latitude,
            Longitude: p.longitude,
            Date: new Date(p.timestamp).toLocaleString(),
            ImageUrl: p.imageUrl
        }));

        downloadCSV(exportData, `farm-data-${new Date().toISOString().split('T')[0]}.csv`);
        toast.success('Data exported successfully');
    };

    return (
        <header className="app-header">
            <div className="header-container">
                <div className="logo-section">
                    <div className="logo">🌾</div>
                    <div className="app-title">
                        <h1>FarmViz</h1>
                        <p>Crop Location Tracker</p>
                    </div>
                </div>

                <nav className="nav-menu">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                            onClick={() => dispatch(setCurrentView(item.id))}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="header-actions">
                    <button
                        className="action-icon-btn"
                        onClick={handleExport}
                        title="Export Data"
                    >
                        📥
                    </button>

                    <div className="stats-badge">
                        <span className="stats-icon">🌱</span>
                        <span className="stats-count">{plants.length}</span>
                    </div>

                    <button
                        className="theme-toggle"
                        onClick={() => dispatch(toggleTheme())}
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
