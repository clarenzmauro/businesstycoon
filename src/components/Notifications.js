import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGameContext } from '../context/GameContext';

const Notifications = () => {
  const { gameState, clearNotification } = useGameContext();
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  
  // Auto-dismiss notifications after a timeout
  useEffect(() => {
    // Only show the most recent 3 notifications
    const recentNotifications = [...gameState.notifications].slice(-3);
    setVisibleNotifications(recentNotifications);
    
    // Auto-dismiss non-error notifications after 3 seconds
    const timers = recentNotifications.map(notification => {
      if (notification.type !== 'error') {
        return setTimeout(() => {
          clearNotification(notification.id);
        }, 3000);
      }
      return null;
    }).filter(Boolean);
    
    return () => {
      // Clear all timers on cleanup
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [gameState.notifications, clearNotification]);
  
  // If no notifications, don't render anything
  if (visibleNotifications.length === 0) {
    return null;
  }
  
  return (
    <NotificationsContainer>
      {visibleNotifications.map(notification => (
        <NotificationItem 
          key={notification.id} 
          type={notification.type}
          onClick={() => clearNotification(notification.id)}
        >
          <NotificationMessage>{notification.message}</NotificationMessage>
          <CloseButton onClick={(e) => {
            e.stopPropagation();
            clearNotification(notification.id);
          }}>×</CloseButton>
        </NotificationItem>
      ))}
    </NotificationsContainer>
  );
};

// Styled components
const NotificationsContainer = styled.div`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  width: 300px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NotificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-out 2.7s;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateX(-5px);
  }
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background-color: #d4edda;
          color: #155724;
          border-left: 4px solid #28a745;
        `;
      case 'error':
        return `
          background-color: #f8d7da;
          color: #721c24;
          border-left: 4px solid #dc3545;
        `;
      case 'info':
      default:
        return `
          background-color: #d1ecf1;
          color: #0c5460;
          border-left: 4px solid #17a2b8;
        `;
    }
  }}
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.7;
    }
  }
`;

const NotificationMessage = styled.div`
  flex: 1;
  font-size: 0.875rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  margin-left: 0.5rem;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

export default Notifications;
