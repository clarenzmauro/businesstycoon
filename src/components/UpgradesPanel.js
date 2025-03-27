import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGameContext } from '../context/GameContext';
import { UPGRADE_TYPES, BUSINESS_TYPES } from '../context/GameContext';

const UpgradesPanel = () => {
  const { gameState, purchaseUpgrade } = useGameContext();
  const [selectedBusiness, setSelectedBusiness] = useState('');
  
  // Update selected business when businesses change
  useEffect(() => {
    if (gameState.businesses.length > 0 && !selectedBusiness) {
      setSelectedBusiness(gameState.businesses[0].id);
    } else if (gameState.businesses.length > 0) {
      // Check if the currently selected business still exists
      const businessExists = gameState.businesses.some(b => b.id === selectedBusiness);
      if (!businessExists) {
        setSelectedBusiness(gameState.businesses[0].id);
      }
    } else {
      setSelectedBusiness('');
    }
  }, [gameState.businesses, selectedBusiness]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Handle business selection change
  const handleBusinessChange = (e) => {
    setSelectedBusiness(e.target.value);
  };
  
  // Check if business already has an upgrade
  const hasUpgrade = (businessId, upgradeType) => {
    if (!businessId) return false;
    const business = gameState.businesses.find(b => b.id === businessId);
    return business && business.upgrades.some(u => u.type === upgradeType);
  };
  
  return (
    <PanelContainer>
      <PanelHeader>
        <h3>Business Upgrades</h3>
      </PanelHeader>
      
      {gameState.businesses.length === 0 ? (
        <EmptyState>
          <p>You need to own a business before purchasing upgrades.</p>
        </EmptyState>
      ) : (
        <>
          <BusinessSelector>
            <label htmlFor="business-select">Select business:</label>
            <select 
              id="business-select" 
              value={selectedBusiness} 
              onChange={handleBusinessChange}
            >
              {gameState.businesses.map(business => {
                const businessType = BUSINESS_TYPES.find(type => type.id === business.type);
                return (
                  <option key={business.id} value={business.id}>
                    {businessType.name} (Level {business.level})
                  </option>
                );
              })}
            </select>
          </BusinessSelector>
          
          <UpgradesList>
            {UPGRADE_TYPES.map(upgrade => {
              // Force re-evaluation of these conditions on every render
              const alreadyHasUpgrade = hasUpgrade(selectedBusiness, upgrade.id);
              const canAfford = gameState.money >= upgrade.basePrice;
              const isDisabled = !selectedBusiness || alreadyHasUpgrade || !canAfford;
              
              return (
                <UpgradeCard key={upgrade.id} disabled={alreadyHasUpgrade}>
                  <UpgradeIcon>{upgrade.icon}</UpgradeIcon>
                  <UpgradeDetails>
                    <UpgradeName>{upgrade.name}</UpgradeName>
                    <UpgradeDescription>{upgrade.description}</UpgradeDescription>
                    <UpgradePrice>
                      {alreadyHasUpgrade ? 'Purchased' : formatCurrency(upgrade.basePrice)}
                    </UpgradePrice>
                  </UpgradeDetails>
                  <PurchaseButton 
                    onClick={() => selectedBusiness && purchaseUpgrade(upgrade.id, selectedBusiness)}
                    disabled={isDisabled}
                    $canAfford={canAfford && !alreadyHasUpgrade}
                    data-testid={`upgrade-button-${upgrade.id}`}
                  >
                    {alreadyHasUpgrade ? 'Owned' : !canAfford ? `Need ${formatCurrency(upgrade.basePrice - gameState.money)} more` : 'Buy'}
                  </PurchaseButton>
                </UpgradeCard>
              );
            })}
          </UpgradesList>
        </>
      )}
    </PanelContainer>
  );
};

// Styled components
const PanelContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  flex: 1;
`;

const PanelHeader = styled.div`
  margin-bottom: 1.5rem;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #333;
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

const BusinessSelector = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: #555;
  }
  
  select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    background-color: white;
  }
`;

const UpgradesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const UpgradeCard = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.disabled ? '#f8f9fa' : 'white'};
  border-radius: 6px;
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  opacity: ${props => props.disabled ? 0.7 : 1};
  border: 1px solid #eee;
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-3px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }
`;

const UpgradeIcon = styled.div`
  font-size: 2rem;
  margin-right: 1rem;
`;

const UpgradeDetails = styled.div`
  flex: 1;
`;

const UpgradeName = styled.div`
  font-weight: 600;
  font-size: 1.125rem;
  color: #333;
`;

const UpgradeDescription = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
`;

const UpgradePrice = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4CAF50;
  margin-top: 0.5rem;
`;

const PurchaseButton = styled.button`
  background-color: ${props => props.$canAfford ? '#4CAF50' : '#cccccc'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  transition: background-color 0.2s, transform 0.1s;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$canAfford ? '#3e8e41' : '#cccccc'};
    transform: ${props => props.$canAfford ? 'translateY(-2px)' : 'none'};
  }
  
  &:active:not(:disabled) {
    transform: ${props => props.$canAfford ? 'translateY(0)' : 'none'};
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    opacity: 0.8;
  }
`;

export default UpgradesPanel;
