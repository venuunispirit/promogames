import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const styles = `
/* Franchise Dashboard Styles */
.franchise-dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.dashboard-header p {
  color: #666;
  margin: 0.5rem 0 0;
  font-size: 1rem;
}

.dashboard-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
}

.dashboard-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.dashboard-section h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 1.5rem 0;
}

/* Franchises Grid */
.franchises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.franchise-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.franchise-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.franchise-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.franchise-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.franchise-level {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.franchise-level.parent-franchise {
  background: #e0f2fe;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.franchise-level.child-franchise {
  background: #f3e8ff;
  color: #7c3aed;
  border: 1px solid #e9d5ff;
}

.franchise-info {
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-item .label {
  color: #666;
  font-weight: 500;
}

.info-item .value {
  color: #1a1a2e;
  font-weight: 600;
}

.status-active {
  color: #059669;
  font-weight: 600;
}

.status-inactive {
  color: #dc2626;
  font-weight: 600;
}

.franchise-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  text-align: center;
  flex: 1;
}

.parent-name {
  color: #7c3aed;
  font-style: italic;
}

.action-btn {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #5b21b6;
  transform: translateY(-1px);
}

/* Quick Actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-card:hover {
  border-color: #667eea;
  background: #f8fafc;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.action-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 0.5rem 0;
}

.action-card p {
  color: #666;
  margin: 0;
  font-size: 0.875rem;
}

/* ── Franchise Games Styles ── */
/* Games Grid */
.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1.5rem;
}

.game-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

.game-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.game-card-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.game-card-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.game-meta {
  font-size: 0.75rem;
  color: #666;
  margin: 0.5rem 0 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
  margin-left: 0.5rem;
  text-transform: uppercase;
}

.status-live {
  background: #dcfce7;
  color: #166534;
}

.status-testing {
  background: #fef3c7;
  color: #d97706;
}

.status-development {
  background: #e0f2fe;
  color: #0369a1;
}

/* Access Badges */
.access-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.access-badge.full-access {
  background: #dcfce7;
  color: #166534;
}

.access-badge.view-only {
  background: #fef3c7;
  color: #d97706;
}

.manage-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

/* Game Card Content */
.game-card-content {
  padding: 1.25rem;
  display: flex;
  gap: 1.5rem;
}

.game-logo img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: #f1f5f9;
}

.game-info {
  flex: 1;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-row .label {
  color: #666;
  font-weight: 500;
}

.info-row .value {
  color: #1a1a2e;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  word-break: break-word;
}

.redirect-url {
  font-family: monospace;
  font-size: 0.75rem;
}

/* Game Card Stats */
.game-card-stats {
  padding: 1.25rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.stat-section {
  margin-bottom: 1rem;
}

.stat-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 0.5rem 0;
}

.stat-grid {
  display: flex;
  gap: 1rem;
}

.mini-stat {
  flex: 1;
  text-align: center;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
}

.mini-label {
  display: block;
  font-size: 0.75rem;
  color: #666;
}

.mini-value {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a2e;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.action-buttons button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-buttons .btn-primary {
  background: #667eea;
  color: white;
}

.action-buttons .btn-primary:hover:not(:disabled) {
  background: #5b21b6;
}

.action-buttons .btn-primary:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
  color: #94a3b8;
}

.action-buttons .btn-secondary {
  background: white;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.action-buttons .btn-secondary:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

/* Loading and Error States */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  border-left: 4px solid #dc2626;
}

.error-state h2 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.error-state button {
  padding: 0.75rem 1.5rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.error-state button:hover {
  background: #b91c1c;
}

.empty-state {
  padding: 4rem 2rem;
}

.empty-state h2 {
  color: #64748b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

/* Back to Dashboard */
.back-to-dashboard {
  margin-top: 2rem;
  text-align: center;
}

.back-to-dashboard button {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-to-dashboard button:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .franchise-dashboard-container,
  .franchise-games-container {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
  }

  .dashboard-stats,
  .games-stats {
    width: 100%;
    justify-content: space-between;
  }

  .stat-card {
    flex: 1;
    text-align: center;
  }

  .franchises-grid,
  .games-grid,
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }

  .game-card-content {
    flex-direction: column;
  }

  .game-logo {
    align-self: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons button {
    width: 100%;
  }
}
`;

export default function FranchiseGames() {
  const { franchiseId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/franchise/dashboard/${franchiseId}/games`);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch games:', err);
        setError('Failed to load franchise games. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [franchiseId]);

  const getGameStatusColor = (status) => {
    const statusColors = {
      'live': 'status-live',
      'testing': 'status-testing',
      'development': 'status-development'
    };
    return statusColors[status] || 'status-default';
  };

  const getAccessBadge = (game) => {
    if (game.can_manage) {
      return <span className="access-badge full-access">Full Access</span>;
    }
    return <span className="access-badge view-only">View Only</span>;
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="franchise-games-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading franchise games...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{styles}</style>
        <div className="franchise-games-container">
          <div className="error-state">
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </>
    );
  }

  if (!data || !data.games || data.games.length === 0) {
    return (
      <>
        <style>{styles}</style>
        <div className="franchise-games-container">
          <div className="empty-state">
            <h2>No Games Found</h2>
            <p>This franchise doesn't have any games assigned yet.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="franchise-games-container">
        <div className="games-header">
          <div>
            <h1>Games for Franchise {data.franchise_id}</h1>
            <p>User Role: {data.user_role || 'Parent'} • Access: {getAccessBadge(data.games[0] || {})}</p>
          </div>
          <div className="games-stats">
            <div className="stat-card">
              <span className="stat-number">{data.games.length}</span>
              <span className="stat-label">Total Games</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{
                data.games.reduce((sum, game) => sum + (game.play_count || 0), 0)
              }</span>
              <span className="stat-label">Total Plays</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{
                data.games.reduce((sum, game) => sum + (game.redemption_count || 0), 0)
              }</span>
              <span className="stat-label">Total Redemptions</span>
            </div>
          </div>
        </div>

        <div className="games-grid">
          {data.games.map((game) => (
            <div key={game.id} className="game-card">
              <div className="game-card-header">
                <div>
                  <h3>{game.name}</h3>
                  <p className="game-meta">
                    Status: <span className={`status-badge ${getGameStatusColor(game.status)}`}>{game.status}</span>
                    {game.can_manage && (
                      <span className="manage-badge">You can manage</span>
                    )}
                  </p>
                </div>
                <span className={`access-badge ${game.can_manage ? 'full-access' : 'view-only'}`}>
                  {game.can_manage ? 'Full Access' : 'View Only'}
                </span>
              </div>

              <div className="game-card-content">
                {game.game_logo_url && (
                  <div className="game-logo">
                    <img src={game.game_logo_url} alt={game.name} />
                  </div>
                )}
                <div className="game-info">
                  <div className="info-row">
                    <span className="label">Game Type:</span>
                    <span className="value">{game.game_type}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Show in Play Page:</span>
                    <span className="value">{game.show_in_play_page ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Show in Hero Page:</span>
                    <span className="value">{game.show_in_hero_page ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Location:</span>
                    <span className="value">{game.location_name || 'Not assigned'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Redirect URL:</span>
                    <span className="value redirect-url" title={game.redirect_url || ''}>
                      {game.redirect_url
                        ? game.redirect_url.length > 40
                          ? game.redirect_url.substring(0, 40) + '...'
                          : game.redirect_url
                        : 'None'}
                    </span>
                  </div>

                  {game.description && (
                    <div className="game-description">
                      <span className="label">Description:</span>
                      <p className="value">{game.description}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="game-card-stats">
                <div className="stat-section">
                  <h4>Engagement</h4>
                  <div className="stat-grid">
                    <div className="mini-stat">
                      <span className="mini-label">Plays:</span>
                      <span className="mini-value">{game.play_count || 0}</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-label">Redemptions:</span>
                      <span className="mini-value">{game.redemption_count || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    onClick={() => {
                      const event = new CustomEvent('navigate-to-game-builder', {
                        detail: { gameId: game.id, franchiseId }
                      });
                      window.dispatchEvent(event);
                    }}
                    className="btn-primary"
                    disabled={!game.can_manage}
                  >
                    🎮 Go to Game Builder
                  </button>
                  <button
                    onClick={() => {
                      const event = new CustomEvent('view-game-responses', {
                        detail: { gameId: game.id, franchiseId }
                      });
                      window.dispatchEvent(event);
                    }}
                    className="btn-secondary"
                  >
                    📊 View Responses
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="back-to-dashboard">
          <button onClick={() => window.location.href="/dashboard/franchise"}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}
