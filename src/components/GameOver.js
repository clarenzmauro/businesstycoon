import React from 'react';
import styled from 'styled-components';
import { useGameContext } from '../context/GameContext';

const GameOver = () => {
  const { gameState } = useGameContext();
  
  const handleRestart = () => {
    // Reset the game by clearing localStorage and reinitializing
    localStorage.removeItem('businessTycoonSave');
    window.location.reload(); // Force a complete refresh of the application
  };
  
  return (
    <GameOverOverlay>
      <GameOverContainer>
        <GameOverIcon>💸</GameOverIcon>
        <GameOverTitle>GAME OVER</GameOverTitle>
        <GameOverMessage>
          You are bankrupt! Your net worth has fallen below zero.
        </GameOverMessage>
        <GameStats>
          <StatItem>
            <StatLabel>Days Survived:</StatLabel>
            <StatValue>{gameState.day}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Level Reached:</StatLabel>
            <StatValue>{gameState.level}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Total Revenue:</StatLabel>
            <StatValue>${gameState.stats.totalRevenue.toLocaleString()}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Total Expenses:</StatLabel>
            <StatValue>${gameState.stats.totalExpenses.toLocaleString()}</StatValue>
          </StatItem>
        </GameStats>
        <RestartButton onClick={handleRestart}>
          Start New Game
        </RestartButton>
      </GameOverContainer>
    </GameOverOverlay>
  );
};

// Styled components
const GameOverOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const GameOverContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  animation: fadeIn 0.5s;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const GameOverIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const GameOverTitle = styled.h1`
  font-size: 2rem;
  color: #dc3545;
  margin-bottom: 1rem;
`;

const GameOverMessage = styled.p`
  font-size: 1.125rem;
  color: #333;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const GameStats = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  font-weight: 500;
  color: #555;
`;

const StatValue = styled.span`
  font-weight: 600;
  color: #333;
`;

const RestartButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3e8e41;
  }
`;

export default GameOver;
