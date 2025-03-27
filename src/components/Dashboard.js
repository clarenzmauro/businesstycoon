import React from 'react';
import styled from 'styled-components';
import { useGameContext } from '../context/GameContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { gameState, advanceDay } = useGameContext();
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Prepare chart data
  const chartData = {
    labels: Array.from({ length: 7 }, (_, i) => `Day ${Math.max(1, gameState.day - 6 + i)}`),
    datasets: [
      {
        label: 'Net Worth',
        data: [
          gameState.stats.netWorth * 0.7,
          gameState.stats.netWorth * 0.75,
          gameState.stats.netWorth * 0.8,
          gameState.stats.netWorth * 0.85,
          gameState.stats.netWorth * 0.9,
          gameState.stats.netWorth * 0.95,
          gameState.stats.netWorth
        ],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Financial Growth',
      },
    },
  };
  
  return (
    <DashboardContainer>
      <DashboardHeader>
        <h2>Business Dashboard</h2>
        <DayCounter>
          <span>Day {gameState.day}</span>
          <NextDayButton onClick={advanceDay}>Next Day</NextDayButton>
        </DayCounter>
      </DashboardHeader>
      
      <StatsGrid>
        <StatCard>
          <StatTitle>Cash</StatTitle>
          <StatValue>{formatCurrency(gameState.money)}</StatValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Level</StatTitle>
          <StatValue>{gameState.level}</StatValue>
          <ProgressBar>
            <Progress width={(gameState.experience / gameState.experienceToNextLevel) * 100} />
          </ProgressBar>
          <StatSubtext>
            {gameState.experience} / {gameState.experienceToNextLevel} XP
          </StatSubtext>
        </StatCard>
        
        <StatCard>
          <StatTitle>Businesses</StatTitle>
          <StatValue>{gameState.businesses.length}</StatValue>
        </StatCard>
        
        <StatCard>
          <StatTitle>Staff</StatTitle>
          <StatValue>{gameState.staff.length}</StatValue>
        </StatCard>
      </StatsGrid>
      
      <ChartContainer>
        <Line data={chartData} options={chartOptions} />
      </ChartContainer>
      
      <FinancialSummary>
        <SummaryItem>
          <SummaryLabel>Total Revenue:</SummaryLabel>
          <SummaryValue>{formatCurrency(gameState.stats.totalRevenue)}</SummaryValue>
        </SummaryItem>
        
        <SummaryItem>
          <SummaryLabel>Total Expenses:</SummaryLabel>
          <SummaryValue>{formatCurrency(gameState.stats.totalExpenses)}</SummaryValue>
        </SummaryItem>
        
        <SummaryItem>
          <SummaryLabel>Net Worth:</SummaryLabel>
          <SummaryValue>{formatCurrency(gameState.stats.netWorth)}</SummaryValue>
        </SummaryItem>
      </FinancialSummary>
    </DashboardContainer>
  );
};

// Styled components
const DashboardContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
`;

const DayCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  span {
    font-weight: 600;
    color: #555;
  }
`;

const NextDayButton = styled.button`
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
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatTitle = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
`;

const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.25rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background-color: #4CAF50;
  width: ${props => props.width}%;
  transition: width 0.3s ease;
`;

const ChartContainer = styled.div`
  height: 250px;
  margin-bottom: 1.5rem;
`;

const FinancialSummary = styled.div`
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SummaryLabel = styled.span`
  font-weight: 500;
  color: #555;
`;

const SummaryValue = styled.span`
  font-weight: 600;
  color: #333;
`;

export default Dashboard;
