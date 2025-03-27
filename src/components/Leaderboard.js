import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { leaderboardService } from '../services/api';
import { FaTrophy, FaCoins, FaCalendarAlt, FaChartLine, FaSpinner, FaMedal, FaStar } from 'react-icons/fa';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await leaderboardService.getLeaderboard();
        console.log('Leaderboard data received:', data);
        setLeaderboardData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Failed to load leaderboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    
    // Refresh leaderboard every 5 minutes
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <LeaderboardContainer>
      <LeaderboardHeader>
        <TrophyIcon />
        <h2>Global Leaderboard</h2>
      </LeaderboardHeader>

      {loading ? (
        <LoadingContainer>
          <FaSpinner className="spinner" />
          <p>Loading leaderboard data...</p>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <p>{error}</p>
          <RetryButton onClick={() => window.location.reload()}>
            Retry
          </RetryButton>
        </ErrorContainer>
      ) : leaderboardData.length === 0 ? (
        <EmptyState>
          <p>No leaderboard data available yet. Be the first to make the list!</p>
        </EmptyState>
      ) : (
        <LeaderboardTable>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th><FaCoins /> Net Worth</th>
              <th><FaCalendarAlt /> Days</th>
              <th><FaChartLine /> Revenue</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry, index) => (
              <LeaderboardRow key={entry._id || index} $rank={index + 1}>
                <td>
                  <RankBadge $rank={index + 1}>
                    {index + 1 === 1 ? <FaMedal color="#FFD700" /> : 
                     index + 1 === 2 ? <FaMedal color="#C0C0C0" /> : 
                     index + 1 === 3 ? <FaMedal color="#CD7F32" /> : 
                     index + 1}
                  </RankBadge>
                </td>
                <td>
                  <PlayerName>{entry.userId?.username || 'Unknown Player'}</PlayerName>
                  {index === 0 && <TopPlayerBadge><FaStar /> Top Player</TopPlayerBadge>}
                </td>
                <td>{formatCurrency(entry.money || 0)}</td>
                <td>{entry.day || 0}</td>
                <td>{formatCurrency(entry.stats?.totalRevenue || 0)}</td>
              </LeaderboardRow>
            ))}
          </tbody>
        </LeaderboardTable>
      )}
    </LeaderboardContainer>
  );
};

// Styled components
const LeaderboardContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1.5rem;
  width: 100%;
  margin-bottom: 2rem;
  overflow: auto;
  max-height: 80vh;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const LeaderboardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 1rem;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
    font-weight: 600;
  }
`;

const TrophyIcon = styled(FaTrophy)`
  margin-right: 0.75rem;
  color: #FFD700;
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.2));
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 0.75rem;
    border-bottom: 2px solid #f0f0f0;
    color: #555;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    svg {
      margin-right: 0.25rem;
      vertical-align: middle;
    }
  }
  
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.95rem;
    vertical-align: middle;
  }
`;

const LeaderboardRow = styled.tr`
  background-color: ${props => 
    props.$rank === 1 ? 'rgba(255, 215, 0, 0.1)' : 
    props.$rank === 2 ? 'rgba(192, 192, 192, 0.1)' : 
    props.$rank === 3 ? 'rgba(205, 127, 50, 0.1)' : 
    'transparent'
  };
  
  &:hover {
    background-color: #f9f9f9;
  }
`;

const RankBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.85rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  ${props => {
    if (props.$rank === 1) {
      return `
        background-color: #FFD700;
        color: #333;
      `;
    } else if (props.$rank === 2) {
      return `
        background-color: #C0C0C0;
        color: #333;
      `;
    } else if (props.$rank === 3) {
      return `
        background-color: #CD7F32;
        color: white;
      `;
    } else {
      return `
        background-color: #e9ecef;
        color: #495057;
      `;
    }
  }}
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  
  .spinner {
    animation: spin 1s linear infinite;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #4CAF50;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    color: #666;
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 2rem;
  
  p {
    color: #dc3545;
    margin-bottom: 1rem;
  }
`;

const RetryButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background-color: #45a049;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  
  p {
    color: #666;
    margin: 0;
  }
`;

const PlayerName = styled.div`
  font-weight: 500;
  color: #333;
`;

const TopPlayerBadge = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: #FFD700;
  color: #333;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  margin-top: 0.25rem;
  
  svg {
    margin-right: 0.25rem;
    font-size: 0.7rem;
  }
`;

export default Leaderboard;
