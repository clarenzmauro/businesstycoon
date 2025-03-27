import React, { useState } from 'react';
import styled from 'styled-components';
import Login from './Login';
import Register from './Register';
import { useAuth } from '../../context/AuthContext';

const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  if (isAuthenticated) {
    return null; // Don't render if user is already authenticated
  }

  return (
    <AuthOverlay>
      <AuthWrapper>
        <LogoSection>
          <GameLogo>Business Tycoon</GameLogo>
          <GameTagline>Build your business empire!</GameTagline>
        </LogoSection>
        
        {isLogin ? (
          <Login onToggleForm={toggleForm} />
        ) : (
          <Register onToggleForm={toggleForm} />
        )}
      </AuthWrapper>
    </AuthOverlay>
  );
};

// Styled components
const AuthOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const AuthWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const GameLogo = styled.h1`
  color: white;
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const GameTagline = styled.p`
  color: #ddd;
  font-size: 1.1rem;
  margin-top: 0.5rem;
`;

export default AuthContainer;
