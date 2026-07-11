import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import './FranchiseGames.css';

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
      <div className="franchise-games-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading franchise games...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="franchise-games-container">
        <div className="error-state">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!data || !data.games || data.games.length === 0) {
    return (
      <div className="franchise-games-container">
        <div className="empty-state">
          <h2>No Games Found</h2>
          <p>This franchise doesn't have any games assigned yet.</p>
        </div>
      </div>
    );
  }

  return (
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
                    <p classnName="value">{game.description}</p>
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
  );
}
