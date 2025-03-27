import React, { useState } from 'react';
import styled from 'styled-components';
import { useGameContext } from '../context/GameContext';

const Tutorial = () => {
  const { closeTutorial, permanentlyDisableTutorial } = useGameContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  const tutorialSteps = [
    {
      title: "Welcome to Business Tycoon!",
      content: "In this game, you'll build your business empire from scratch. Let's get you started with the basics.",
      image: "👋"
    },
    {
      title: "Starting Your First Business",
      content: "Begin by purchasing your first business from the 'Available Businesses' section. Each business generates revenue over time.",
      image: "🏪"
    },
    {
      title: "Collecting Revenue",
      content: "Businesses generate revenue automatically. Click the 'Collect' button to add the revenue to your cash balance.",
      image: "💰"
    },
    {
      title: "Hiring Staff",
      content: "Staff members can improve your business performance. Hire managers, marketers, and other specialists to boost your empire.",
      image: "👨‍💼"
    },
    {
      title: "Purchasing Upgrades",
      content: "Invest in upgrades to make your businesses more efficient and profitable.",
      image: "🔧"
    },
    {
      title: "Market Events",
      content: "Keep an eye on market events that can affect your businesses. These events can either boost or reduce your performance.",
      image: "📈"
    },
    {
      title: "Advancing Days",
      content: "Click the 'Next Day' button to advance time. Your businesses will generate revenue, and market conditions may change.",
      image: "📅"
    },
    {
      title: "You're Ready!",
      content: "Now you have all the basics to start building your business empire. Good luck!",
      image: "🚀"
    }
  ];
  
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (dontShowAgain) {
        permanentlyDisableTutorial();
      } else {
        closeTutorial();
      }
    }
  };
  
  const handleSkip = () => {
    if (dontShowAgain) {
      permanentlyDisableTutorial();
    } else {
      closeTutorial();
    }
  };
  
  const currentTutorial = tutorialSteps[currentStep];
  
  return (
    <TutorialOverlay>
      <TutorialContainer>
        <TutorialImage>{currentTutorial.image}</TutorialImage>
        <TutorialTitle>{currentTutorial.title}</TutorialTitle>
        <TutorialContent>{currentTutorial.content}</TutorialContent>
        
        <StepIndicator>
          {tutorialSteps.map((_, index) => (
            <StepDot key={index} $active={index === currentStep} />
          ))}
        </StepIndicator>
        
        <DontShowAgainContainer>
          <DontShowCheckbox 
            type="checkbox" 
            id="dontShowAgain" 
            checked={dontShowAgain} 
            onChange={(e) => setDontShowAgain(e.target.checked)} 
          />
          <DontShowLabel htmlFor="dontShowAgain">Don't show again</DontShowLabel>
        </DontShowAgainContainer>
        
        <ButtonContainer>
          <SkipButton onClick={handleSkip}>Skip Tutorial</SkipButton>
          <NextButton onClick={handleNext}>
            {currentStep === tutorialSteps.length - 1 ? 'Start Playing' : 'Next'}
          </NextButton>
        </ButtonContainer>
      </TutorialContainer>
    </TutorialOverlay>
  );
};

// Styled components
const TutorialOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const TutorialContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
`;

const TutorialImage = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const TutorialTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const TutorialContent = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const StepDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.$active ? '#4CAF50' : '#e9ecef'};
  transition: background-color 0.3s;
`;

const DontShowAgainContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const DontShowCheckbox = styled.input`
  margin-right: 0.5rem;
  cursor: pointer;
`;

const DontShowLabel = styled.label`
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const SkipButton = styled.button`
  background-color: transparent;
  color: #888;
  border: none;
  padding: 0.75rem 1rem;
  font-weight: 500;
  transition: color 0.2s;
  
  &:hover {
    color: #555;
  }
`;

const NextButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3e8e41;
  }
`;

export default Tutorial;
