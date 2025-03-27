import React, { useState } from 'react';
import styled from 'styled-components';
import { useGameContext } from '../context/GameContext';
import { BUSINESS_TYPES, UPGRADE_TYPES } from '../context/GameContext';
import { FaCoins, FaMoneyBillWave } from 'react-icons/fa';

const BusinessPanel = () => {
  const { gameState, purchaseBusiness, collectRevenue, collectAllRevenue, sellBusiness } = useGameContext();
  const [expandedBusinessId, setExpandedBusinessId] = useState(null);
  const [showSellConfirm, setShowSellConfirm] = useState(null);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate time since last collection
  const getTimeSinceLastCollection = (lastCollected) => {
    const now = Date.now();
    const diffMs = now - lastCollected;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins === 1) {
      return '1 minute ago';
    } else if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours === 1) {
        return '1 hour ago';
      } else {
        return `${diffHours} hours ago`;
      }
    }
  };
  
  // Calculate actual revenue for a business including all multipliers
  const calculateActualRevenue = (business) => {
    const businessData = BUSINESS_TYPES.find(b => b.id === business.type);
    const baseRevenue = businessData.baseRevenue * business.level;
    let revenueMultiplier = 1;
    
    // Apply staff effects
    gameState.staff.forEach(staff => {
      if (staff.effect.type === 'revenue' || staff.effect.type === 'all') {
        revenueMultiplier += staff.effect.value;
      }
    });
    
    // Apply business upgrades
    business.upgrades.forEach(upgrade => {
      if (upgrade.effect.type === 'revenue' || upgrade.effect.type === 'productivity') {
        revenueMultiplier += upgrade.effect.value;
      }
    });
    
    // Apply active market events
    gameState.marketEvents.forEach(event => {
      if ((event.effect.type === 'revenue' || event.effect.type === 'all') && event.active) {
        revenueMultiplier += event.effect.value;
      }
    });
    
    return Math.round(baseRevenue * revenueMultiplier);
  };
  
  // Toggle expanded view for a business
  const toggleBusinessExpand = (businessId) => {
    if (expandedBusinessId === businessId) {
      setExpandedBusinessId(null);
    } else {
      setExpandedBusinessId(businessId);
    }
  };
  
  // Filter business types by player level
  const availableBusinessTypes = BUSINESS_TYPES.filter(
    business => business.unlockLevel <= gameState.level
  );
  
  return (
    <PanelContainer>
      <PanelHeader>
        <h2>Your Businesses</h2>
        <HeaderActions>
          <BusinessCount>{gameState.businesses.length} businesses</BusinessCount>
          {gameState.businesses.length > 0 && (
            <CollectAllButton onClick={collectAllRevenue}>
              <FaCoins /> Collect All
            </CollectAllButton>
          )}
        </HeaderActions>
      </PanelHeader>
      
      {gameState.businesses.length === 0 ? (
        <EmptyState>
          <p>You don't own any businesses yet. Purchase your first business below!</p>
        </EmptyState>
      ) : (
        <BusinessList>
          {gameState.businesses.map(business => {
            const businessType = BUSINESS_TYPES.find(type => type.id === business.type);
            return (
              <div key={business.id}>
                <BusinessCard onClick={() => toggleBusinessExpand(business.id)}>
                  <BusinessIcon>{businessType.icon}</BusinessIcon>
                  <BusinessDetails>
                    <BusinessName>{businessType.name}</BusinessName>
                    <BusinessLevel>Level {business.level}</BusinessLevel>
                    <BusinessRevenue>
                      {formatCurrency(calculateActualRevenue(business))} / day
                    </BusinessRevenue>
                    <LastCollected>
                      Last collected: {getTimeSinceLastCollection(business.lastCollected)}
                    </LastCollected>
                  </BusinessDetails>
                  <BusinessActions>
                    <CollectButton onClick={(e) => {
                      e.stopPropagation();
                      collectRevenue(business.id);
                    }}>
                      <FaCoins /> Collect
                    </CollectButton>
                    <SellButton onClick={(e) => {
                      e.stopPropagation();
                      setShowSellConfirm(business.id);
                    }}>
                      <FaMoneyBillWave /> Sell
                    </SellButton>
                    {showSellConfirm === business.id && (
                      <SellConfirmOverlay onClick={(e) => e.stopPropagation()}>
                        <SellConfirmBox>
                          <h4>Sell {businessType.name}?</h4>
                          <p>Selling price: {formatCurrency(businessType.basePrice * business.level + 
                            business.upgrades.reduce((total, upgrade) => {
                              const upgradeData = UPGRADE_TYPES.find(u => u.id === upgrade.type);
                              return total + upgradeData.basePrice;
                            }, 0))}</p>
                          <SellConfirmButtons>
                            <ConfirmButton onClick={(e) => {
                              e.stopPropagation();
                              sellBusiness(business.id);
                              setShowSellConfirm(null);
                            }}>Confirm</ConfirmButton>
                            <CancelButton onClick={(e) => {
                              e.stopPropagation();
                              setShowSellConfirm(null);
                            }}>Cancel</CancelButton>
                          </SellConfirmButtons>
                        </SellConfirmBox>
                      </SellConfirmOverlay>
                    )}
                  </BusinessActions>
                  <ExpandIcon>{expandedBusinessId === business.id ? '▲' : '▼'}</ExpandIcon>
                </BusinessCard>
                
                {expandedBusinessId === business.id && (
                  <BusinessExpandedInfo>
                    <UpgradesList>
                      <UpgradesTitle>Upgrades</UpgradesTitle>
                      {business.upgrades.length === 0 ? (
                        <NoUpgrades>No upgrades purchased yet</NoUpgrades>
                      ) : (
                        business.upgrades.map(upgrade => {
                          const upgradeData = UPGRADE_TYPES.find(u => u.id === upgrade.type);
                          return (
                            <UpgradeItem key={upgrade.id}>
                              <UpgradeIcon>{upgradeData.icon}</UpgradeIcon>
                              <UpgradeName>{upgradeData.name}</UpgradeName>
                              <UpgradeEffect>
                                {upgradeData.effect.type === 'revenue' || upgradeData.effect.type === 'productivity' 
                                  ? `+${upgradeData.effect.value * 100}% revenue` 
                                  : upgradeData.description}
                              </UpgradeEffect>
                            </UpgradeItem>
                          );
                        })
                      )}
                    </UpgradesList>
                    <RevenueBreakdown>
                      <BreakdownTitle>Revenue Breakdown</BreakdownTitle>
                      <BreakdownItem>
                        <BreakdownLabel>Base Revenue:</BreakdownLabel>
                        <BreakdownValue>{formatCurrency(businessType.baseRevenue * business.level)}</BreakdownValue>
                      </BreakdownItem>
                      {business.upgrades.length > 0 && (
                        <BreakdownItem>
                          <BreakdownLabel>Upgrades Bonus:</BreakdownLabel>
                          <BreakdownValue>+{business.upgrades.reduce((total, upgrade) => {
                            const upgradeData = UPGRADE_TYPES.find(u => u.id === upgrade.type);
                            if (upgradeData.effect.type === 'revenue' || upgradeData.effect.type === 'productivity') {
                              return total + (upgradeData.effect.value * 100);
                            }
                            return total;
                          }, 0)}%</BreakdownValue>
                        </BreakdownItem>
                      )}
                      <BreakdownItem>
                        <BreakdownLabel>Total Daily Revenue:</BreakdownLabel>
                        <BreakdownValue>{formatCurrency(calculateActualRevenue(business))}</BreakdownValue>
                      </BreakdownItem>
                    </RevenueBreakdown>
                  </BusinessExpandedInfo>
                )}
              </div>
            );
          })}
        </BusinessList>
      )}
      
      <SectionDivider />
      
      <PanelHeader>
        <h3>Available Businesses</h3>
      </PanelHeader>
      
      <BusinessGrid>
        {availableBusinessTypes.map(business => (
          <BusinessPurchaseCard key={business.id}>
            <BusinessTypeIcon>{business.icon}</BusinessTypeIcon>
            <BusinessTypeDetails>
              <BusinessTypeName>{business.name}</BusinessTypeName>
              <BusinessTypeRevenue>
                Earns {formatCurrency(business.baseRevenue)} / day
              </BusinessTypeRevenue>
              <BusinessTypeDescription>
                {business.description}
              </BusinessTypeDescription>
            </BusinessTypeDetails>
            <PurchaseButton 
              onClick={() => purchaseBusiness(business.id)}
              disabled={gameState.money < business.basePrice}
            >
              Buy for {formatCurrency(business.basePrice)}
            </PurchaseButton>
          </BusinessPurchaseCard>
        ))}
      </BusinessGrid>
      
      {BUSINESS_TYPES.some(business => business.unlockLevel > gameState.level) && (
        <LockedBusinessesInfo>
          <h4>Locked Businesses</h4>
          <LockedList>
            {BUSINESS_TYPES
              .filter(business => business.unlockLevel > gameState.level)
              .map(business => (
                <LockedItem key={business.id}>
                  <LockedIcon>{business.icon}</LockedIcon>
                  <LockedDetails>
                    <LockedName>{business.name}</LockedName>
                    <LockedRequirement>
                      Unlocks at level {business.unlockLevel}
                    </LockedRequirement>
                  </LockedDetails>
                </LockedItem>
              ))}
          </LockedList>
        </LockedBusinessesInfo>
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
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2, h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  
  h3 {
    font-size: 1.25rem;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

const BusinessCount = styled.span`
  background-color: #e9ecef;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  color: #555;
  
  @media (max-width: 768px) {
    padding: 0.25rem 0.5rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  
  p {
    color: #666;
    margin: 0;
  }
`;

const BusinessList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const BusinessCard = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.75rem;
  }
`;

const BusinessIcon = styled.div`
  font-size: 2rem;
  margin-right: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
    margin-right: 0.75rem;
    order: 0;
  }
`;

const BusinessDetails = styled.div`
  flex: 1;
  
  @media (max-width: 768px) {
    flex: 1 0 60%;
    order: 1;
  }
`;

const BusinessName = styled.div`
  font-weight: 600;
  font-size: 1.125rem;
  color: #333;
`;

const BusinessLevel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
`;

const BusinessRevenue = styled.div`
  font-weight: 500;
  color: #4CAF50;
  margin-top: 0.5rem;
`;

const LastCollected = styled.div`
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.25rem;
`;

const CollectButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3e8e41;
  }
  
  @media (max-width: 768px) {
    flex: 1;
    padding: 0.5rem;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }
`;

const SectionDivider = styled.hr`
  border: none;
  border-top: 1px solid #e9ecef;
  margin: 1.5rem 0;
`;

const BusinessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BusinessPurchaseCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const BusinessTypeIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const BusinessTypeDetails = styled.div`
  flex: 1;
`;

const BusinessTypeName = styled.div`
  font-weight: 600;
  font-size: 1.125rem;
  color: #333;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const BusinessTypeRevenue = styled.div`
  font-weight: 500;
  color: #4CAF50;
  text-align: center;
  margin-bottom: 0.5rem;
`;

const BusinessTypeDescription = styled.div`
  font-size: 0.875rem;
  color: #666;
  text-align: center;
  margin-bottom: 1rem;
`;

const PurchaseButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  font-weight: 600;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #3e8e41;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const LockedBusinessesInfo = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  
  h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1rem;
    color: #555;
  }
`;

const LockedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const LockedItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.05);
`;

const LockedIcon = styled.div`
  font-size: 1.5rem;
  margin-right: 1rem;
  opacity: 0.5;
`;

const LockedDetails = styled.div`
  flex: 1;
`;

const LockedName = styled.div`
  font-weight: 500;
  color: #888;
`;

const LockedRequirement = styled.div`
  font-size: 0.75rem;
  color: #aaa;
`;

const BusinessExpandedInfo = styled.div`
  background-color: #f0f4f8;
  border-radius: 0 0 6px 6px;
  padding: 1rem;
  margin-top: -5px;
  margin-bottom: 1rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const UpgradesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const UpgradesTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #333;
`;

const NoUpgrades = styled.div`
  font-style: italic;
  color: #777;
  font-size: 0.9rem;
  padding: 0.5rem 0;
`;

const UpgradeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: white;
  padding: 0.5rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const UpgradeIcon = styled.div`
  font-size: 1.25rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e9ecef;
  border-radius: 50%;
`;

const UpgradeName = styled.div`
  font-weight: 500;
  font-size: 0.9rem;
`;

const UpgradeEffect = styled.div`
  font-size: 0.8rem;
  color: #666;
  margin-left: auto;
`;

const RevenueBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: white;
  padding: 0.75rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const BreakdownTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #333;
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  padding: 0.25rem 0;
  
  &:last-child {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e9ecef;
    font-weight: 600;
  }
`;

const BreakdownLabel = styled.div`
  color: #555;
`;

const BreakdownValue = styled.div`
  color: #333;
`;

const ExpandIcon = styled.div`
  font-size: 0.8rem;
  color: #777;
  margin-left: 0.5rem;
  
  @media (max-width: 768px) {
    order: 2;
    margin-left: auto;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const CollectAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #45a049;
  }
  
  svg {
    font-size: 1rem;
  }
`;

const BusinessActions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
    order: 3;
    margin-top: 0.5rem;
  }
`;

const SellButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e68a00;
  }
  
  svg {
    font-size: 0.9rem;
  }
`;

const SellConfirmOverlay = styled.div`
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
`;

const SellConfirmBox = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  
  h4 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    color: #333;
  }
  
  p {
    margin: 0 0 1.5rem 0;
    color: #555;
  }
`;

const SellConfirmButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const ConfirmButton = styled.button`
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e68a00;
  }
`;

const CancelButton = styled.button`
  background-color: #e9ecef;
  color: #495057;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #dee2e6;
  }
`;

export default BusinessPanel;
