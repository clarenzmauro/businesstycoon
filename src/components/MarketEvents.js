import React from 'react';
import styled from 'styled-components';
import { useGameContext } from '../context/GameContext';

const MarketEvents = () => {
  const { gameState } = useGameContext();
  
  // Filter only active market events
  const activeEvents = gameState.marketEvents.filter(event => event.active);
  
  return (
    <EventsContainer>
      <EventsHeader>
        <h2>Market Events</h2>
        <EventCount>{activeEvents.length} active</EventCount>
      </EventsHeader>
      
      {activeEvents.length === 0 ? (
        <EmptyState>
          <p>No active market events. Events occur randomly each day and can affect your businesses.</p>
        </EmptyState>
      ) : (
        <EventsList>
          {activeEvents.map(event => (
            <EventCard key={event.id}>
              <EventIcon>{event.icon}</EventIcon>
              <EventDetails>
                <EventName>{event.name}</EventName>
                <EventDescription>{event.description}</EventDescription>
                <EventDuration>
                  {event.remainingDays} day{event.remainingDays !== 1 ? 's' : ''} remaining
                </EventDuration>
              </EventDetails>
            </EventCard>
          ))}
        </EventsList>
      )}
    </EventsContainer>
  );
};

// Styled components
const EventsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const EventsHeader = styled.div`
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

const EventCount = styled.span`
  background-color: #e9ecef;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  color: #555;
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

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EventCard = styled.div`
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

const EventIcon = styled.div`
  font-size: 2rem;
  margin-right: 1rem;
`;

const EventDetails = styled.div`
  flex: 1;
`;

const EventName = styled.div`
  font-weight: 600;
  font-size: 1.125rem;
  color: #333;
`;

const EventDescription = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
`;

const EventDuration = styled.div`
  font-size: 0.75rem;
  color: #888;
  margin-top: 0.5rem;
  font-weight: 500;
`;

export default MarketEvents;
