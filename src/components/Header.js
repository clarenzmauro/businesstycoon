import React from 'react';
import styled from 'styled-components';
import { useGameContext } from '../context/GameContext';

const Header = () => {
  const { gameState } = useGameContext();
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <HeaderContainer>
      <Logo>Business Tycoon</Logo>
      
      <PlayerStats>
        <StatItem>
          <StatLabel>Cash:</StatLabel>
          <StatValue>{formatCurrency(gameState.money)}</StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>Level:</StatLabel>
          <StatValue>{gameState.level}</StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>Day:</StatLabel>
          <StatValue>{gameState.day}</StatValue>
        </StatItem>
      </PlayerStats>
    </HeaderContainer>
  );
};

// Styled components
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;
`;

const Logo = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PlayerStats = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatLabel = styled.span`
  font-size: 0.875rem;
  color: #666;
`;

const StatValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
`;

export default Header;
