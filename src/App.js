import React, { useEffect, useState } from 'react';
import { useGameContext } from './context/GameContext';
import { useAuth } from './context/AuthContext';
import styled from 'styled-components';
import './App.css';
import { FaSignOutAlt, FaTrophy, FaQuestionCircle, FaCoins, FaCalendarDay } from 'react-icons/fa';

// Components
import Dashboard from './components/Dashboard';
import BusinessPanel from './components/BusinessPanel';
import MarketEvents from './components/MarketEvents';
import UpgradesPanel from './components/UpgradesPanel';
import StaffPanel from './components/StaffPanel';
import Header from './components/Header';
import Tutorial from './components/Tutorial';
import Notifications from './components/Notifications';
import GameOver from './components/GameOver';
import AuthContainer from './components/Auth/AuthContainer';
import Leaderboard from './components/Leaderboard';

const App = () => {
  const { gameState, initializeGame, saveStatus, resetGame, advanceDay, collectAllRevenue } = useGameContext();
  const { isAuthenticated, user, logout } = useAuth();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Initialize game on first load - only runs once
  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save is now handled after each Next Day click
  
  const handleLogout = () => {
    // First reset the game state
    resetGame();
    // Then logout the user
    logout();
  };
  
  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };
  
  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };
  
  // Mobile navigation functionality removed
  
  // Initialize leaderboard visibility from saved preference
  useEffect(() => {
    if (isAuthenticated) {
      const savedPreference = localStorage.getItem('showLeaderboard');
      if (savedPreference !== null) {
        setShowLeaderboard(savedPreference === 'true');
      }
    }
  }, [isAuthenticated]);
  
  return (
    <AppContainer>
      <Header />
      
      {/* Auth Container - Only shown when not authenticated */}
      {!isAuthenticated && <AuthContainer />}
      
      {/* User Controls - Only shown when authenticated */}
      {isAuthenticated && (
        <UserControls>
          <UserInfo>
            <PlayerInfo>
              <UserAvatar>{user?.username?.charAt(0).toUpperCase() || 'P'}</UserAvatar>
              <UserName>{user?.username}</UserName>
            </PlayerInfo>
            {saveStatus.lastSaved && (
              <SaveStatus>
                Last saved: {saveStatus.lastSaved}
                {saveStatus.error && (
                  <SaveError>{saveStatus.error}</SaveError>
                )}
              </SaveStatus>
            )}
          </UserInfo>
          <ControlButtons>
            <LeaderboardButton onClick={toggleLeaderboard}>
              <FaTrophy /> {showLeaderboard ? 'Hide Leaderboard' : 'Leaderboard'}
            </LeaderboardButton>
            <HelpButton onClick={toggleHelp}>
              <FaQuestionCircle /> Help
            </HelpButton>
            <ControlButton onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </ControlButton>
          </ControlButtons>
        </UserControls>
      )}
      
      {isAuthenticated && gameState.showTutorial && <Tutorial />}
      {gameState.gameOver && <GameOver />}
      {showHelp && <HelpOverlay onClose={toggleHelp} />}
      
      {/* Mobile navigation removed as requested */}
      
      {/* Leaderboard Panel - Shown when leaderboard button is clicked */}
      {showLeaderboard && (
        <LeaderboardPanel>
          <LeaderboardWrapper>
            <Leaderboard />
          </LeaderboardWrapper>
        </LeaderboardPanel>
      )}
      
      <MainContent>
        <LeftPanel>
          <Dashboard />
          <MarketEventsWrapper>
            <MarketEvents />
          </MarketEventsWrapper>
        </LeftPanel>
        
        <RightPanel>
          <BusinessPanel />
          <PanelContainer>
            <UpgradesPanel />
            <StaffPanel />
          </PanelContainer>
        </RightPanel>
      </MainContent>
      
      <Notifications />
      
      {/* Mobile Action Bar - Only visible on mobile */}
      {isAuthenticated && (
        <MobileActionBar>
          <ActionButton onClick={collectAllRevenue}>
            <FaCoins />
            <span>Collect All</span>
          </ActionButton>
          <ActionButton onClick={advanceDay}>
            <FaCalendarDay />
            <span>Next Day</span>
          </ActionButton>
        </MobileActionBar>
      )}
    </AppContainer>
  );
};

// Styled components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 1rem;
  background-color: #f5f7fa;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const MainContent = styled.main`
  display: flex;
  flex: 1;
  gap: 1.5rem;
  margin-top: 1rem;
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
  
  @media (max-width: 768px) {
    /* Show all panels on mobile in a stacked layout */
    > div {
      display: flex;
      flex-direction: column;
      width: 100%;
      margin-bottom: 1.5rem;
    }
  }
`;

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PanelContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;



const UserControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0.75rem 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 50;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
`;

const SaveStatus = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
`;

const SaveError = styled.div`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  
  &:hover:not(:disabled) {
    background-color: #45a049;
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  svg {
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
`;

// Leaderboard panel that appears below the controls
const LeaderboardPanel = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  margin-bottom: 1.5rem;
  overflow: hidden;
  animation: slideDown 0.3s ease-out;
  
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Animation wrappers for smooth transitions
const LeaderboardWrapper = styled.div`
  width: 100%;
  padding: 1rem;
  max-height: 500px;
  overflow-y: auto;
`;

const MarketEventsWrapper = styled.div`
  width: 100%;
  animation: fadeIn 0.3s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Mobile navigation bar for essential actions
const MobileActionBar = styled.nav`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-around;
    padding: 0.5rem;
  }
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  flex: 1;
  margin: 0 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3e8e41;
  }
  
  svg {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }
  
  span {
    font-size: 0.8rem;
  }
`;

const HelpButton = styled(ControlButton)`
  background-color: #2196F3;
  
  &:hover:not(:disabled) {
    background-color: #0b7dda;
  }
`;

// Help overlay component
const HelpOverlay = ({ onClose }) => (
  <HelpOverlayContainer>
    <HelpContent>
      <HelpHeader>
        <h2>Game Help</h2>
        <CloseButton onClick={onClose}>×</CloseButton>
      </HelpHeader>
      <HelpSection>
        <h3>Getting Started</h3>
        <p>Welcome to Business Tycoon! Your goal is to build a business empire and increase your net worth.</p>
        <ul>
          <li><strong>Dashboard:</strong> View your financial stats and progress</li>
          <li><strong>Businesses:</strong> Purchase and manage your businesses</li>
          <li><strong>Upgrades:</strong> Improve your businesses for better returns</li>
          <li><strong>Staff:</strong> Hire employees to boost your performance</li>
        </ul>
      </HelpSection>
      <HelpSection>
        <h3>Tips for Success</h3>
        <ul>
          <li>Start with small businesses and reinvest profits</li>
          <li>Collect revenue regularly from your businesses</li>
          <li>Watch for market events that affect your businesses</li>
          <li>Hire staff to maximize your income</li>
          <li>Upgrade businesses to increase their revenue</li>
        </ul>
      </HelpSection>
    </HelpContent>
  </HelpOverlayContainer>
);

const HelpOverlayContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const HelpContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const HelpHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  
  h2 {
    margin: 0;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const HelpSection = styled.div`
  padding: 1rem 1.5rem;
  
  h3 {
    color: #4CAF50;
    margin-top: 0;
  }
  
  ul {
    padding-left: 1.5rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
`;



const LeaderboardButton = styled(ControlButton)`
  background-color: #ff9800;
  
  &:hover:not(:disabled) {
    background-color: #e68a00;
  }
`;

export default App;
