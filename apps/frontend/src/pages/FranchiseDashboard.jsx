import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './FranchiseDashboard.css';

export default function FranchiseDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/franchise/dashboard');
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleFranchiseClick = (franchiseId) => {
    navigate(`/dashboard/franchise/${franchiseId}/games`);
  };

  const getFranchiseLevel = (franchise) => {
    if (!franchise.parent_id) return 'Parent Franchise';
    return 'Child Franchise';
  };

  const getGameStatusColor = (status) => {
    const statusColors = {
      'live': 'status-live',
      'testing': 'status-testing',
      'development': 'status-development'
    };
    return statusColors[status] || 'status-default';
  };

  if (loading) {
    return (
      <div className="franchise-dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading franchise dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="franchise-dashboard-container">
        <div className="error-state">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="franchise-dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Franchise Dashboard</h1>
          <p>Manage your franchise network and game access</p>
        </div>
        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-number">{data?.franchises?.length || 0}</span>
            <span className="stat-label">Total Franchises</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{data?.games?.length || 0}</span>
            <span className="stat-label">Total Games</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{data?.child_franchises?.length || 0}</span>
            <span className="stat-label">Child Franchises</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Franchises Section */}
        <section className="dashboard-section">
          <h2>Franchises</h2>
          <div className="franchises-grid">
            {data?.franchises?.map((franchise) => (
              <div
                key={franchise.id}
                className="franchise-card"
                onClick={() => handleFranchiseClick(franchise.id)}
              >
                <div className="franchise-header">
                  <h3>{franchise.business_name}</h3>
                  <span className={`franchise-level ${getFranchiseLevel(franchise).toLowerCase().replace(' ', '-')}`}>
                    {getFranchiseLevel(franchise)}
                  </span>
                </div>
                <div className="franchise-info">
                  <div className="info-item">
                    <span className="label">Email:</span>
                    <span className="value">{franchise.business_email}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Phone:</span>
                    <span className="value">{franchise.phone}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Status:</span>
                    <span className={`value status-${franchise.is_active ? 'active' : 'inactive'}`}>{
                      franchise.is_active ? 'Active' : 'Inactive'
                    }</span>
                  </div>
                </div>
                <div className="franchise-stats">
                  <div className="stat">
                    <span className="stat-value">{franchise.game_count || 0}</span>
                    <span className="stat-label">Games</span>
                  </div>
                  {franchise.parent_name && (
                    <div className="stat">
                      <span className="stat-value parent-name">{franchise.parent_name}</span>
                      <span className="stat-label">Parent</span>
                    </div>
                  )}
                </div>
                <div className="franchise-footer">
                  <button className="action-btn">View Details →</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Games Section */}
        <section className="dashboard-section">
          <h2>Games</h2>
          <div className="games-grid">
            {data?.games?.map((game) => (
              <div key={game.id} className="game-card">
                <div className="game-header">
                  <div>
                    <h3>{game.name}</h3>
                    <p className="franchise-name">Franchise: {game.franchise_name}</p>
                  </div>
                  <span className={`game-status ${getGameStatusColor(game.status)}`}>{game.status}</span>
                </div>
                <div className="game-stats">
                  <div className="stat-row">
                    <span className="stat-label">Plays:</span>
                    <span className="stat-value">{game.play_count || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Redemptions:</span>
                    <span className="stat-value">{game.redemption_count || 0}</span>
                  </div>
                </div>
                <div className="game-footer">
                  <button
                    onClick={() => navigate(`/dashboard/franchise/${game.franchise_id}/games#${game.id}`)}
                    className="action-btn secondary"
                  >
                    Manage Game
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <div className="action-card" onClick={() => navigate('/api/franchise/franchises')}
            >
              <div className="action-icon">🏢</div>
              <h3>Manage Franchises</h3>
              <p>View and manage all franchises</p>
            </div>
            <div className="action-card" onClick={() => navigate('/dashboard/franchise/new')}
            >
              <div className="action-icon">➕</div>
              <h3>Add Franchise</h3>
              <p>Create a new franchise</p>
            </div>
            <div className="action-card" onClick={() => navigate('/dashboard/business')}
            >
              <div className="action-icon">🎮</div>
              <h3>Business Dashboard</h3>
              <p>Return to main dashboard</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
