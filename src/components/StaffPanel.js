import React from 'react';
import styled from 'styled-components';
import { useGameContext } from '../context/GameContext';
import { STAFF_TYPES } from '../context/GameContext';

const StaffPanel = () => {
  const { gameState, hireStaff } = useGameContext();
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Check if staff is already hired
  const isStaffHired = (staffType) => {
    return gameState.staff.some(s => s.type === staffType);
  };
  
  return (
    <PanelContainer>
      <PanelHeader>
        <h3>Staff Management</h3>
      </PanelHeader>
      
      <StaffList>
        {gameState.staff.length === 0 ? (
          <EmptyState>
            <p>You haven't hired any staff yet. Hire staff to improve your business performance.</p>
          </EmptyState>
        ) : (
          gameState.staff.map(staff => {
            const staffType = STAFF_TYPES.find(type => type.id === staff.type);
            return (
              <StaffCard key={staff.id}>
                <StaffIcon>{staffType.icon}</StaffIcon>
                <StaffDetails>
                  <StaffName>{staffType.name}</StaffName>
                  <StaffEffect>{staffType.description}</StaffEffect>
                  <StaffSalary>Salary: {formatCurrency(staff.salary)} / day</StaffSalary>
                </StaffDetails>
              </StaffCard>
            );
          })
        )}
      </StaffList>
      
      <SectionDivider />
      
      <PanelHeader>
        <h4>Available Staff</h4>
      </PanelHeader>
      
      <AvailableStaffList>
        {STAFF_TYPES.map(staffType => {
          const alreadyHired = isStaffHired(staffType.id);
          const hiringCost = staffType.baseSalary * 3; // Initial hiring cost is 3x salary
          
          return (
            <AvailableStaffCard key={staffType.id} disabled={alreadyHired}>
              <StaffIcon>{staffType.icon}</StaffIcon>
              <StaffDetails>
                <StaffName>{staffType.name}</StaffName>
                <StaffEffect>{staffType.description}</StaffEffect>
                <StaffCost>
                  {alreadyHired ? 'Hired' : `Hiring cost: ${formatCurrency(hiringCost)}`}
                </StaffCost>
                <StaffSalary>
                  {alreadyHired ? '' : `Salary: ${formatCurrency(staffType.baseSalary)} / day`}
                </StaffSalary>
              </StaffDetails>
              <HireButton 
                onClick={() => hireStaff(staffType.id)}
                disabled={alreadyHired || gameState.money < hiringCost}
              >
                {alreadyHired ? 'Hired' : 'Hire'}
              </HireButton>
            </AvailableStaffCard>
          );
        })}
      </AvailableStaffList>
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
  
  h3, h4 {
    margin: 0;
    color: #333;
  }
  
  h3 {
    font-size: 1.25rem;
  }
  
  h4 {
    font-size: 1.125rem;
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

const StaffList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StaffCard = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StaffIcon = styled.div`
  font-size: 2rem;
  margin-right: 1rem;
`;

const StaffDetails = styled.div`
  flex: 1;
`;

const StaffName = styled.div`
  font-weight: 600;
  font-size: 1.125rem;
  color: #333;
`;

const StaffEffect = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
`;

const StaffSalary = styled.div`
  font-size: 0.875rem;
  color: #888;
  margin-top: 0.5rem;
`;

const StaffCost = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4CAF50;
  margin-top: 0.5rem;
`;

const SectionDivider = styled.hr`
  border: none;
  border-top: 1px solid #e9ecef;
  margin: 1.5rem 0;
`;

const AvailableStaffList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AvailableStaffCard = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-3px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  }
`;

const HireButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
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

export default StaffPanel;
