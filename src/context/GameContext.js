import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import { gameStateService } from '../services/api';
import { useAuth } from './AuthContext';

// Check if tutorial should be disabled based on user preference
const shouldDisableTutorial = () => {
  return localStorage.getItem('businessTycoonDisableTutorial') === 'true';
};

// Initial game state
const initialState = {
  initialized: false,
  showTutorial: !shouldDisableTutorial(),
  money: 10000,
  businesses: [],
  staff: [],
  upgrades: [],
  level: 1,
  experience: 0,
  experienceToNextLevel: 1000,
  day: 1,
  marketEvents: [],
  specialEvents: [],
  activeSpecialEvents: [],
  completedSpecialEvents: [],
  specialEventRewards: [],
  gameOver: false,
  stats: {
    totalRevenue: 0,
    totalExpenses: 0,
    netWorth: 10000
  },
  notifications: []
};

// Business types available in the game
export const BUSINESS_TYPES = [
  {
    id: 'coffee_shop',
    name: 'Coffee Shop',
    basePrice: 5000,
    baseRevenue: 500,
    description: 'A small coffee shop serving hot beverages and pastries.',
    unlockLevel: 1,
    icon: '☕'
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    basePrice: 25000,
    baseRevenue: 2000,
    description: 'A mid-sized restaurant offering full meals and drinks.',
    unlockLevel: 3,
    icon: '🍽️'
  },
  {
    id: 'retail_store',
    name: 'Retail Store',
    basePrice: 50000,
    baseRevenue: 3500,
    description: 'A retail store selling various consumer goods.',
    unlockLevel: 5,
    icon: '🛍️'
  },
  {
    id: 'tech_startup',
    name: 'Tech Startup',
    basePrice: 100000,
    baseRevenue: 8000,
    description: 'A technology startup developing innovative products.',
    unlockLevel: 8,
    icon: '💻'
  },
  {
    id: 'factory',
    name: 'Factory',
    basePrice: 250000,
    baseRevenue: 15000,
    description: 'A manufacturing facility producing goods at scale.',
    unlockLevel: 10,
    icon: '🏭'
  },
  {
    id: 'food_delivery',
    name: 'Food Delivery Service',
    basePrice: 60000,
    baseRevenue: 4500,
    description: 'Connect restaurants with hungry customers for a percentage of each order.',
    unlockLevel: 4,
    icon: '🚚'
  },
  {
    id: 'fitness_center',
    name: 'Fitness Center',
    basePrice: 80000,
    baseRevenue: 6000,
    description: 'Offer membership-based fitness services with recurring revenue.',
    unlockLevel: 5,
    icon: '💪'
  },
  {
    id: 'ecommerce_platform',
    name: 'E-commerce Platform',
    basePrice: 120000,
    baseRevenue: 9000,
    description: 'Sell products online with lower overhead than traditional retail.',
    unlockLevel: 6,
    icon: '🛒'
  },
  {
    id: 'real_estate_agency',
    name: 'Real Estate Agency',
    basePrice: 75000,
    baseRevenue: 5000,
    description: 'Buy and sell properties for clients, earning substantial commissions.',
    unlockLevel: 7,
    icon: '🏠'
  },
  {
    id: 'entertainment_venue',
    name: 'Entertainment Venue',
    basePrice: 150000,
    baseRevenue: 10000,
    description: 'Host events, concerts, and shows that draw large crowds.',
    unlockLevel: 8,
    icon: '🎭'
  },
  {
    id: 'educational_institute',
    name: 'Educational Institute',
    basePrice: 175000,
    baseRevenue: 10500,
    description: 'Provide valuable education services with steady enrollment-based income.',
    unlockLevel: 8,
    icon: '🎓'
  },
  {
    id: 'hotel_chain',
    name: 'Hotel Chain',
    basePrice: 200000,
    baseRevenue: 12000,
    description: 'Provide luxury accommodations with high margins but significant overhead.',
    unlockLevel: 9,
    icon: '🏨'
  },
  {
    id: 'mobile_app_studio',
    name: 'Mobile App Studio',
    basePrice: 180000,
    baseRevenue: 11000,
    description: 'Develop and monetize mobile applications with potential viral growth.',
    unlockLevel: 9,
    icon: '📱'
  },
  {
    id: 'healthcare_clinic',
    name: 'Healthcare Clinic',
    basePrice: 300000,
    baseRevenue: 18000,
    description: 'Provide essential medical services with stable, recession-resistant income.',
    unlockLevel: 12,
    icon: '🏥'
  },
  {
    id: 'renewable_energy',
    name: 'Renewable Energy Farm',
    basePrice: 400000,
    baseRevenue: 22000,
    description: 'Generate clean energy with high initial costs but excellent long-term returns.',
    unlockLevel: 15,
    icon: '♻️'
  }
];

// Staff types
export const STAFF_TYPES = [
  {
    id: 'manager',
    name: 'Manager',
    baseSalary: 1000,
    description: 'Increases business efficiency by 10%',
    effect: { type: 'efficiency', value: 0.1 },
    icon: '👨‍💼'
  },
  {
    id: 'marketer',
    name: 'Marketing Specialist',
    baseSalary: 1200,
    description: 'Increases revenue by 15%',
    effect: { type: 'revenue', value: 0.15 },
    icon: '📊'
  },
  {
    id: 'accountant',
    name: 'Accountant',
    baseSalary: 1100,
    description: 'Reduces expenses by 10%',
    effect: { type: 'expenses', value: -0.1 },
    icon: '📝'
  },
  {
    id: 'consultant',
    name: 'Business Consultant',
    baseSalary: 2000,
    description: 'Provides strategic advice, increasing all metrics by 5%',
    effect: { type: 'all', value: 0.05 },
    icon: '🧠'
  }
];

// Upgrade types
export const UPGRADE_TYPES = [
  {
    id: 'equipment',
    name: 'Better Equipment',
    basePrice: 5000,
    description: 'Upgrade equipment to increase productivity by 20%',
    effect: { type: 'productivity', value: 0.2 },
    icon: '🔧'
  },
  {
    id: 'training',
    name: 'Staff Training',
    basePrice: 3000,
    description: 'Train staff to improve efficiency by 15%',
    effect: { type: 'efficiency', value: 0.15 },
    icon: '📚'
  },
  {
    id: 'marketing',
    name: 'Marketing Campaign',
    basePrice: 8000,
    description: 'Launch a marketing campaign to increase revenue by 25%',
    effect: { type: 'revenue', value: 0.25 },
    icon: '📣'
  },
  {
    id: 'automation',
    name: 'Automation Systems',
    basePrice: 15000,
    description: 'Implement automation to reduce costs by 20%',
    effect: { type: 'expenses', value: -0.2 },
    icon: '🤖'
  }
];

// Market events that can occur
export const MARKET_EVENTS = [
  {
    id: 'economic_boom',
    name: 'Economic Boom',
    description: 'The economy is thriving! All businesses generate 30% more revenue.',
    effect: { type: 'revenue', value: 0.3, duration: 5 },
    probability: 0.1,
    icon: '📈'
  },
  {
    id: 'recession',
    name: 'Economic Recession',
    description: 'Economic downturn! All businesses generate 25% less revenue.',
    effect: { type: 'revenue', value: -0.25, duration: 5 },
    probability: 0.1,
    icon: '📉'
  },
  {
    id: 'tax_cut',
    name: 'Tax Cut',
    description: 'Government reduces taxes! Your expenses decrease by 15%.',
    effect: { type: 'expenses', value: -0.15, duration: 3 },
    probability: 0.15,
    icon: '💰'
  },
  {
    id: 'tax_increase',
    name: 'Tax Increase',
    description: 'Government increases taxes! Your expenses increase by 15%.',
    effect: { type: 'expenses', value: 0.15, duration: 3 },
    probability: 0.15,
    icon: '💸'
  },
  {
    id: 'new_trend',
    name: 'New Market Trend',
    description: 'A new trend emerges! One random business type gets a 40% revenue boost.',
    effect: { type: 'specific_business', value: 0.4, duration: 4 },
    probability: 0.2,
    icon: '🌟'
  }
];

// Special events (limited-time challenges with unique rewards)
export const SPECIAL_EVENTS = [
  {
    id: 'black_friday_rush',
    name: 'Black Friday Rush',
    description: 'The biggest shopping day of the year! Can your retail businesses handle the rush?',
    instructions: 'Own at least 3 Retail Stores and generate $50,000 in revenue within 5 days.',
    duration: 5, // Days the event is active
    targetBusinessTypes: ['retail_store', 'ecommerce_platform'],
    requirements: {
      businessCount: { type: 'retail_store', count: 3 },
      revenueTarget: 50000
    },
    rewards: [
      { type: 'money', value: 25000, description: 'Cash Bonus: $25,000' },
      { type: 'upgrade', id: 'premium_inventory', description: 'Premium Inventory: +30% revenue for all retail businesses' }
    ],
    icon: '🛍️',
    rarity: 'common',
    seasonalTiming: { month: 11 } // November
  },
  {
    id: 'summer_tourism_boom',
    name: 'Summer Tourism Boom',
    description: 'Tourist season is here! Hotels and entertainment venues are seeing unprecedented demand.',
    instructions: 'Own at least 2 Hotel Chains and 1 Entertainment Venue, then collect $100,000 in revenue during the event.',
    duration: 7,
    targetBusinessTypes: ['hotel_chain', 'entertainment_venue', 'restaurant'],
    requirements: {
      businessCount: [
        { type: 'hotel_chain', count: 2 },
        { type: 'entertainment_venue', count: 1 }
      ],
      revenueTarget: 100000
    },
    rewards: [
      { type: 'money', value: 50000, description: 'Tourism Grant: $50,000' },
      { type: 'staff', id: 'tourism_director', description: 'Tourism Director: +25% revenue for hotels and entertainment venues' }
    ],
    icon: '🏖️',
    rarity: 'uncommon',
    seasonalTiming: { month: 6 } // June
  },
  {
    id: 'tech_innovation_expo',
    name: 'Tech Innovation Expo',
    description: 'The world\'s biggest tech expo is happening! Showcase your tech startups and mobile apps.',
    instructions: 'Own at least 2 Tech Startups and 1 Mobile App Studio, then invest $200,000 in upgrades during the event.',
    duration: 10,
    targetBusinessTypes: ['tech_startup', 'mobile_app_studio'],
    requirements: {
      businessCount: [
        { type: 'tech_startup', count: 2 },
        { type: 'mobile_app_studio', count: 1 }
      ],
      investmentTarget: 200000
    },
    rewards: [
      { type: 'money', value: 100000, description: 'Innovation Grant: $100,000' },
      { type: 'upgrade', id: 'breakthrough_technology', description: 'Breakthrough Technology: +40% revenue for all tech businesses' },
      { type: 'experience', value: 5000, description: 'Industry Recognition: +5,000 XP' }
    ],
    icon: '💻',
    rarity: 'rare',
    seasonalTiming: { month: 3 } // March
  },
  {
    id: 'health_awareness_week',
    name: 'Health Awareness Week',
    description: 'A nationwide focus on health and wellness is driving customers to health-related businesses.',
    instructions: 'Own at least 2 Healthcare Clinics and 2 Fitness Centers, then serve 1,000 customers during the event.',
    duration: 7,
    targetBusinessTypes: ['healthcare_clinic', 'fitness_center'],
    requirements: {
      businessCount: [
        { type: 'healthcare_clinic', count: 2 },
        { type: 'fitness_center', count: 2 }
      ],
      customerTarget: 1000
    },
    rewards: [
      { type: 'money', value: 75000, description: 'Health Initiative Grant: $75,000' },
      { type: 'upgrade', id: 'wellness_certification', description: 'Wellness Certification: +35% revenue for health and fitness businesses' }
    ],
    icon: '❤️',
    rarity: 'uncommon',
    seasonalTiming: { month: 1 } // January
  },
  {
    id: 'global_sustainability_summit',
    name: 'Global Sustainability Summit',
    description: 'The world is focusing on sustainable business practices. Showcase your commitment to green energy!',
    instructions: 'Own at least 3 Renewable Energy Farms and invest $500,000 in green upgrades during the event.',
    duration: 14,
    targetBusinessTypes: ['renewable_energy'],
    requirements: {
      businessCount: { type: 'renewable_energy', count: 3 },
      greenInvestmentTarget: 500000
    },
    rewards: [
      { type: 'money', value: 250000, description: 'Sustainability Grant: $250,000' },
      { type: 'upgrade', id: 'carbon_neutral_certification', description: 'Carbon Neutral Certification: +50% revenue for renewable energy businesses' },
      { type: 'special_business', id: 'advanced_research_lab', description: 'Unlock Advanced Research Lab business type' },
      { type: 'experience', value: 10000, description: 'Global Recognition: +10,000 XP' }
    ],
    icon: '🌍',
    rarity: 'legendary',
    seasonalTiming: { month: 4 } // April (Earth Month)
  },
  {
    id: 'food_festival_frenzy',
    name: 'Food Festival Frenzy',
    description: 'The annual food festival is bringing foodies from around the world to your city!',
    instructions: 'Own at least 3 Restaurants and 2 Food Delivery Services, then generate $75,000 in food-related revenue.',
    duration: 5,
    targetBusinessTypes: ['restaurant', 'food_delivery', 'coffee_shop'],
    requirements: {
      businessCount: [
        { type: 'restaurant', count: 3 },
        { type: 'food_delivery', count: 2 }
      ],
      revenueTarget: 75000
    },
    rewards: [
      { type: 'money', value: 40000, description: 'Culinary Award: $40,000' },
      { type: 'upgrade', id: 'michelin_star', description: 'Michelin Star Recognition: +45% revenue for all food businesses' }
    ],
    icon: '🍽️',
    rarity: 'uncommon',
    seasonalTiming: { month: 8 } // August
  },
  {
    id: 'education_innovation_challenge',
    name: 'Education Innovation Challenge',
    description: 'Transform the future of education by implementing cutting-edge teaching methods!',
    instructions: 'Own at least 3 Educational Institutes and hire 10 specialized staff during the event.',
    duration: 10,
    targetBusinessTypes: ['educational_institute'],
    requirements: {
      businessCount: { type: 'educational_institute', count: 3 },
      staffHiringTarget: 10
    },
    rewards: [
      { type: 'money', value: 60000, description: 'Education Grant: $60,000' },
      { type: 'staff', id: 'education_visionary', description: 'Education Visionary: +30% efficiency for all educational businesses' },
      { type: 'experience', value: 3000, description: 'Academic Recognition: +3,000 XP' }
    ],
    icon: '🎓',
    rarity: 'rare',
    seasonalTiming: { month: 9 } // September (Back to School)
  },
  {
    id: 'real_estate_boom',
    name: 'Real Estate Boom',
    description: 'Property values are skyrocketing! Can your real estate agency capitalize on this opportunity?',
    instructions: 'Own at least 4 Real Estate Agencies and close $150,000 worth of deals during the event.',
    duration: 7,
    targetBusinessTypes: ['real_estate_agency'],
    requirements: {
      businessCount: { type: 'real_estate_agency', count: 4 },
      salesTarget: 150000
    },
    rewards: [
      { type: 'money', value: 80000, description: 'Property Tycoon Bonus: $80,000' },
      { type: 'upgrade', id: 'premium_listings', description: 'Premium Listings Access: +40% revenue for all real estate businesses' }
    ],
    icon: '🏘️',
    rarity: 'rare',
    seasonalTiming: { month: 5 } // May
  }
];

// Game reducer to handle state updates
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'START_SPECIAL_EVENT':
      const { eventId } = action.payload;
      const eventToStart = SPECIAL_EVENTS.find(event => event.id === eventId);
      
      if (!eventToStart) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), type: 'error', message: 'Event not found!' }
          ]
        };
      }
      
      // Check if the event is already active
      if (state.activeSpecialEvents.some(event => event.id === eventId)) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), type: 'info', message: `${eventToStart.name} is already active!` }
          ]
        };
      }
      
      // Add the event to active events with start time and progress tracking
      const newActiveEvent = {
        ...eventToStart,
        startDay: state.day,
        endDay: state.day + eventToStart.duration,
        progress: {
          revenue: 0,
          investment: 0,
          greenInvestment: 0,
          customers: 0,
          sales: 0,
          staffHired: 0,
          completed: false
        }
      };
      
      return {
        ...state,
        activeSpecialEvents: [...state.activeSpecialEvents, newActiveEvent],
        notifications: [
          ...state.notifications,
          { id: Date.now(), type: 'success', message: `Special Event Started: ${eventToStart.name}! Complete the challenge for unique rewards.` }
        ]
      };
      
    case 'UPDATE_SPECIAL_EVENT_PROGRESS':
      const { eventId: eventToUpdate, progressType, amount } = action.payload;
      
      // Find the active event
      const activeEventIndex = state.activeSpecialEvents.findIndex(event => event.id === eventToUpdate);
      
      if (activeEventIndex === -1) {
        return state; // Event not found, no changes
      }
      
      // Create a copy of active events
      const updatedActiveEvents = [...state.activeSpecialEvents];
      const activeEvent = updatedActiveEvents[activeEventIndex];
      
      // Update the specific progress type
      updatedActiveEvents[activeEventIndex] = {
        ...activeEvent,
        progress: {
          ...activeEvent.progress,
          [progressType]: activeEvent.progress[progressType] + amount
        }
      };
      
      return {
        ...state,
        activeSpecialEvents: updatedActiveEvents
      };
      
    case 'COMPLETE_SPECIAL_EVENT':
      const { eventId: completedEventId } = action.payload;
      
      // Find the active event
      const eventToCompleteIndex = state.activeSpecialEvents.findIndex(event => event.id === completedEventId);
      
      if (eventToCompleteIndex === -1) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), type: 'error', message: 'Event not found or already completed!' }
          ]
        };
      }
      
      const completedEvent = state.activeSpecialEvents[eventToCompleteIndex];
      
      // Mark as completed and move to completed events
      const updatedActiveEventsAfterCompletion = state.activeSpecialEvents.filter(event => event.id !== completedEventId);
      
      // Process rewards
      let updatedMoney = state.money;
      let updatedExperience = state.experience;
      let updatedSpecialEventRewards = [...state.specialEventRewards];
      
      // Apply rewards
      completedEvent.rewards.forEach(reward => {
        switch (reward.type) {
          case 'money':
            updatedMoney += reward.value;
            break;
          case 'experience':
            updatedExperience += reward.value;
            break;
          case 'upgrade':
          case 'staff':
          case 'special_business':
            updatedSpecialEventRewards.push({
              id: reward.id,
              type: reward.type,
              description: reward.description,
              fromEvent: completedEvent.id,
              dateAwarded: Date.now()
            });
            break;
          default:
            break;
        }
      });
      
      // Create reward notification text
      const rewardText = completedEvent.rewards.map(reward => reward.description).join(', ');
      
      return {
        ...state,
        money: updatedMoney,
        experience: updatedExperience,
        activeSpecialEvents: updatedActiveEventsAfterCompletion,
        completedSpecialEvents: [...state.completedSpecialEvents, {
          ...completedEvent,
          completedDay: state.day,
          progress: {
            ...completedEvent.progress,
            completed: true
          }
        }],
        specialEventRewards: updatedSpecialEventRewards,
        notifications: [
          ...state.notifications,
          { id: Date.now(), type: 'success', message: `Congratulations! You completed the ${completedEvent.name} challenge!` },
          { id: Date.now() + 1, type: 'success', message: `Rewards earned: ${rewardText}` }
        ]
      };
      
    case 'CHECK_SPECIAL_EVENTS_PROGRESS':
      // This action is dispatched regularly to check if any active events have been completed
      if (state.activeSpecialEvents.length === 0) {
        return state; // No active events to check
      }
      
      const eventsToUpdate = [...state.activeSpecialEvents];
      const completedEvents = [];
      const expiredEvents = [];
      
      // Check each active event
      eventsToUpdate.forEach(event => {
        // Check if event has expired
        if (state.day > event.endDay) {
          expiredEvents.push(event.id);
          return;
        }
        
        // Check if event requirements have been met
        let requirementsMet = true;
        
        // Check business count requirements
        if (event.requirements.businessCount) {
          if (Array.isArray(event.requirements.businessCount)) {
            // Multiple business type requirements
            event.requirements.businessCount.forEach(req => {
              const count = state.businesses.filter(b => b.type === req.type).length;
              if (count < req.count) {
                requirementsMet = false;
              }
            });
          } else {
            // Single business type requirement
            const count = state.businesses.filter(b => b.type === event.requirements.businessCount.type).length;
            if (count < event.requirements.businessCount.count) {
              requirementsMet = false;
            }
          }
        }
        
        // Check revenue target if applicable
        if (requirementsMet && event.requirements.revenueTarget && event.progress.revenue < event.requirements.revenueTarget) {
          requirementsMet = false;
        }
        
        // Check investment target if applicable
        if (requirementsMet && event.requirements.investmentTarget && event.progress.investment < event.requirements.investmentTarget) {
          requirementsMet = false;
        }
        
        // Check green investment target if applicable
        if (requirementsMet && event.requirements.greenInvestmentTarget && event.progress.greenInvestment < event.requirements.greenInvestmentTarget) {
          requirementsMet = false;
        }
        
        // Check customer target if applicable
        if (requirementsMet && event.requirements.customerTarget && event.progress.customers < event.requirements.customerTarget) {
          requirementsMet = false;
        }
        
        // Check sales target if applicable
        if (requirementsMet && event.requirements.salesTarget && event.progress.sales < event.requirements.salesTarget) {
          requirementsMet = false;
        }
        
        // Check staff hiring target if applicable
        if (requirementsMet && event.requirements.staffHiringTarget && event.progress.staffHired < event.requirements.staffHiringTarget) {
          requirementsMet = false;
        }
        
        // If all requirements are met, mark for completion
        if (requirementsMet) {
          completedEvents.push(event.id);
        }
      });
      
      // If no events were completed or expired, return state unchanged
      if (completedEvents.length === 0 && expiredEvents.length === 0) {
        return state;
      }
      
      // Process completed events
      let updatedState = { ...state };
      
      // Handle completed events
      completedEvents.forEach(eventId => {
        // Dispatch completion action for each completed event
        // This is a recursive call to the reducer
        updatedState = gameReducer(updatedState, { 
          type: 'COMPLETE_SPECIAL_EVENT', 
          payload: { eventId } 
        });
      });
      
      // Handle expired events
      if (expiredEvents.length > 0) {
        const remainingActiveEvents = updatedState.activeSpecialEvents.filter(
          event => !expiredEvents.includes(event.id)
        );
        
        // Add expired events to notifications
        const expiredNotifications = expiredEvents.map(eventId => {
          const event = state.activeSpecialEvents.find(e => e.id === eventId);
          return { 
            id: Date.now() + Math.random(), 
            type: 'info', 
            message: `The ${event.name} special event has ended without completion.` 
          };
        });
        
        updatedState = {
          ...updatedState,
          activeSpecialEvents: remainingActiveEvents,
          notifications: [...updatedState.notifications, ...expiredNotifications]
        };
      }
      
      return updatedState;
      
    case 'TRIGGER_SEASONAL_EVENTS':
      // Check for seasonal events based on the current month
      const currentMonth = new Date().getMonth(); // 0-11 for Jan-Dec
      
      // Find events that should trigger this month
      const eligibleEvents = SPECIAL_EVENTS.filter(event => 
        event.seasonalTiming && 
        event.seasonalTiming.month === currentMonth + 1 && // Convert 0-11 to 1-12
        !state.activeSpecialEvents.some(active => active.id === event.id) &&
        !state.completedSpecialEvents.some(completed => 
          completed.id === event.id && 
          // Only allow one completion per year
          new Date(completed.completedDay).getFullYear() === new Date().getFullYear()
        )
      );
      
      if (eligibleEvents.length === 0) {
        return state; // No eligible events to trigger
      }
      
      // Trigger each eligible event
      let seasonalState = { ...state };
      
      eligibleEvents.forEach(event => {
        seasonalState = gameReducer(seasonalState, {
          type: 'START_SPECIAL_EVENT',
          payload: { eventId: event.id }
        });
      });
      
      return seasonalState;
    case 'LOAD_SAVED_GAME':
      // Ensure all market events have unique IDs
      const uniqueMarketEvents = action.payload.marketEvents.map(event => ({
        ...event,
        id: `${event.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Ensure truly unique IDs
      }));
      
      return {
        ...action.payload,
        marketEvents: uniqueMarketEvents,
        notifications: [
          ...state.notifications,
          { id: Date.now(), type: 'info', message: 'Game loaded successfully!' }
        ]
      };
      
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { id: Date.now(), type: action.payload.type, message: action.payload.message }
        ]
      };
      
    case 'INITIALIZE_GAME':
      // Try to load saved game from localStorage
      const savedGame = localStorage.getItem('businessTycoonSave');
      if (savedGame) {
        try {
          const parsedSave = JSON.parse(savedGame);
          return { ...parsedSave, initialized: true };
        } catch (error) {
          console.error('Error loading saved game:', error);
        }
      }
      // If no save or error loading, return fresh state
      return { ...initialState, initialized: true };
      
    case 'PURCHASE_BUSINESS':
      const { businessType } = action.payload;
      const businessTypeData = BUSINESS_TYPES.find(b => b.id === businessType);
      
      // Check if player has enough money
      if (state.money < businessTypeData.basePrice) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), type: 'error', message: 'Not enough money to purchase this business!' }
          ]
        };
      }
      
      // Add the new business
      const newBusiness = {
        id: `${businessType}_${Date.now()}`,
        type: businessType,
        level: 1,
        revenue: businessTypeData.baseRevenue,
        lastCollected: Date.now(),
        lastCollectedDay: state.day, // Set to current day so it can't be collected until the next day
        purchasedOnDay: state.day, // Track which day it was purchased
        upgrades: []
      };
      
      return {
        ...state,
        money: state.money - businessTypeData.basePrice,
        businesses: [...state.businesses, newBusiness],
        notifications: [
          ...state.notifications,
          { id: Date.now(), type: 'success', message: `Purchased a new ${businessTypeData.name}!` }
        ]
      };
      
    case 'COLLECT_REVENUE':
      const { businessId } = action.payload;
      const business = state.businesses.find(b => b.id === businessId);
      const businessData = BUSINESS_TYPES.find(b => b.id === business.type);
      
      // Check if business was purchased today
      if (business.purchasedOnDay === state.day) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), type: 'error', message: `This business was just purchased today! You can collect revenue starting tomorrow.` }
          ]
        };
      }
      
      // Check if already collected today (prevent multiple collections per day)
      // Compare with the current day counter instead of real date
      if (business.lastCollectedDay === state.day) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), type: 'error', message: `You've already collected revenue from this business today!` }
          ]
        };
      }
      
      // Calculate revenue based on time passed, upgrades, staff, etc.
      const baseRevenue = businessData.baseRevenue * business.level;
      let revenueMultiplier = 1;
      
      // Apply staff effects
      state.staff.forEach(staff => {
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
      state.marketEvents.forEach(event => {
        if ((event.effect.type === 'revenue' || event.effect.type === 'all') && event.active) {
          revenueMultiplier += event.effect.value;
        }
      });
      
      const collectedRevenue = Math.round(baseRevenue * revenueMultiplier);
      
      // Update the business and player money
      const updatedBusinesses = state.businesses.map(b => 
        b.id === businessId 
          ? { ...b, lastCollected: Date.now(), lastCollectedDay: state.day } 
          : b
      );
      
      return {
        ...state,
        money: state.money + collectedRevenue,
        businesses: updatedBusinesses,
        stats: {
          ...state.stats,
          totalRevenue: state.stats.totalRevenue + collectedRevenue
        },
        notifications: [
          ...state.notifications,
          { id: Date.now(), type: 'info', message: `Collected $${collectedRevenue} from ${businessData.name}!` }
        ]
      };
      
    case 'HIRE_STAFF':
      const { staffType } = action.payload;
      const staffTypeData = STAFF_TYPES.find(s => s.id === staffType);
      
      // Check if player has enough money
      if (state.money < staffTypeData.baseSalary * 3) { // Initial hiring cost is 3x salary
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), type: 'error', message: 'Not enough money to hire this staff member!' }
          ]
        };
      }
      
      // Add the new staff member
      const newStaff = {
        id: `${staffType}_${Date.now()}`,
        type: staffType,
        level: 1,
        salary: staffTypeData.baseSalary,
        effect: { ...staffTypeData.effect },
        hiredAt: Date.now()
      };
      
      return {
        ...state,
        money: state.money - (staffTypeData.baseSalary * 3),
        staff: [...state.staff, newStaff],
        stats: {
          ...state.stats,
          totalExpenses: state.stats.totalExpenses + (staffTypeData.baseSalary * 3)
        },
        notifications: [
          ...state.notifications,
          { id: Date.now(), type: 'success', message: `Hired a new ${staffTypeData.name}!` }
        ]
      };
      
    case 'PURCHASE_UPGRADE':
      const { upgradeType, businessId: targetBusinessId } = action.payload;
      const upgradeTypeData = UPGRADE_TYPES.find(u => u.id === upgradeType);
      
      // Check if player has enough money
      if (state.money < upgradeTypeData.basePrice) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), type: 'error', message: 'Not enough money for this upgrade!' }
          ]
        };
      }
      
      // Add the upgrade to the specified business
      const updatedBusinessesWithUpgrade = state.businesses.map(b => 
        b.id === targetBusinessId 
          ? { 
              ...b, 
              upgrades: [...b.upgrades, { 
                id: `${upgradeType}_${Date.now()}`, 
                type: upgradeType,
                effect: { ...upgradeTypeData.effect } 
              }] 
            } 
          : b
      );
      
      return {
        ...state,
        money: state.money - upgradeTypeData.basePrice,
        businesses: updatedBusinessesWithUpgrade,
        stats: {
          ...state.stats,
          totalExpenses: state.stats.totalExpenses + upgradeTypeData.basePrice
        },
        notifications: [
          ...state.notifications,
          { id: Date.now(), type: 'success', message: `Purchased ${upgradeTypeData.name} upgrade!` }
        ]
      };
      
    case 'ADVANCE_DAY':
      // Process daily operations
      let newMoney = state.money;
      let newExperience = state.experience;
      
      // Clear non-critical notifications when advancing day
      const importantNotifications = state.notifications.filter(n => n.type === 'error');
      let newTotalRevenue = state.stats.totalRevenue;
      let newTotalExpenses = state.stats.totalExpenses;
      
      // Process staff salaries
      state.staff.forEach(staff => {
        newMoney -= staff.salary;
        newTotalExpenses += staff.salary;
      });
      
      // Generate random market events
      let activeMarketEvents = [...state.marketEvents];
      
      // Update duration of existing events
      activeMarketEvents = activeMarketEvents
        .map(event => {
          if (event.active) {
            return {
              ...event,
              remainingDays: event.remainingDays - 1,
              active: event.remainingDays > 1
            };
          }
          return event;
        })
        .filter(event => !event.active || event.remainingDays > 0);
      
      // Possibly add new event
      const eventRoll = Math.random();
      let eventAdded = false;
      
      MARKET_EVENTS.forEach(eventType => {
        if (!eventAdded && eventRoll <= eventType.probability) {
          const newEvent = {
            ...eventType,
            id: `${eventType.id}_${Date.now()}`, // Generate a unique ID for each event instance
            active: true,
            remainingDays: eventType.effect.duration,
            startedAt: state.day
          };
          activeMarketEvents.push(newEvent);
          eventAdded = true;
        }
      });
      
      // Add experience for the day - only if player has at least one business
      if (state.businesses.length > 0) {
        newExperience += 100 + (state.businesses.length * 50);
      }
      
      // Check for level up
      let newLevel = state.level;
      let newExperienceToNextLevel = state.experienceToNextLevel;
      
      if (newExperience >= state.experienceToNextLevel) {
        newLevel += 1;
        newExperience -= state.experienceToNextLevel;
        newExperienceToNextLevel = Math.floor(state.experienceToNextLevel * 1.5);
      }
      
      // Calculate net worth
      const businessValue = state.businesses.reduce((total, business) => {
        const businessType = BUSINESS_TYPES.find(b => b.id === business.type);
        return total + (businessType.basePrice * business.level);
      }, 0);
      
      const netWorth = newMoney + businessValue;
      
      // Check for bankruptcy (game over)
      let isGameOver = false;
      if (netWorth < 0 || (newMoney <= 0 && state.businesses.length === 0)) {
        isGameOver = true;
        // Add bankruptcy notification
        activeMarketEvents = [];
      }
      
      return {
        ...state,
        money: newMoney,
        day: state.day + 1,
        experience: newExperience,
        level: newLevel,
        experienceToNextLevel: newExperienceToNextLevel,
        marketEvents: activeMarketEvents,
        gameOver: isGameOver,
        stats: {
          ...state.stats,
          totalRevenue: newTotalRevenue,
          totalExpenses: newTotalExpenses,
          netWorth
        },
        notifications: isGameOver ? [
          { id: Date.now(), type: 'error', message: 'GAME OVER: You are bankrupt! Your net worth has fallen below zero.' }
        ] : importantNotifications
      };
      
    case 'CLOSE_TUTORIAL':
      return {
        ...state,
        showTutorial: false
      };
      
    case 'PERMANENTLY_DISABLE_TUTORIAL':
      // Save the preference to localStorage
      localStorage.setItem('businessTycoonDisableTutorial', 'true');
      return {
        ...state,
        showTutorial: false
      };
      
    case 'CLEAR_NOTIFICATION':
      const { notificationId } = action.payload;
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== notificationId)
      };
      
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
      
    case 'COLLECT_ALL_REVENUE':
      // Check if there are any businesses to collect from
      if (state.businesses.length === 0) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), type: 'error', message: 'You don\'t own any businesses to collect revenue from!' }
          ]
        };
      }
      
      let totalRevenue = 0;
      let collectedCount = 0;
      let allUpdatedBusinesses = [...state.businesses];
      
      // Try to collect from each business
      state.businesses.forEach(business => {
        // Skip if already collected today or purchased today
        if (business.lastCollectedDay === state.day || business.purchasedOnDay === state.day) {
          return;
        }
        
        // Calculate revenue for this business
        const businessData = BUSINESS_TYPES.find(b => b.id === business.type);
        const baseRevenue = businessData.baseRevenue * business.level;
        let revenueMultiplier = 1;
        
        // Apply staff effects
        state.staff.forEach(staff => {
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
        state.marketEvents.forEach(event => {
          if ((event.effect.type === 'revenue' || event.effect.type === 'all') && event.active) {
            revenueMultiplier += event.effect.value;
          }
        });
        
        const collectedRevenue = Math.round(baseRevenue * revenueMultiplier);
        totalRevenue += collectedRevenue;
        collectedCount++;
        
        // Update the business in our updated array
        const index = allUpdatedBusinesses.findIndex(b => b.id === business.id);
        if (index !== -1) {
          allUpdatedBusinesses[index] = {
            ...business,
            lastCollected: Date.now(),
            lastCollectedDay: state.day
          };
        }
      });
      
      // If no revenue was collected
      if (collectedCount === 0) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), type: 'info', message: 'No revenue to collect! You\'ve already collected from all your businesses today.' }
          ]
        };
      }
      
      return {
        ...state,
        money: state.money + totalRevenue,
        businesses: allUpdatedBusinesses,
        stats: {
          ...state.stats,
          totalRevenue: state.stats.totalRevenue + totalRevenue
        },
        notifications: [
          ...state.notifications,
          { id: Date.now(), type: 'success', message: `Collected $${totalRevenue} from ${collectedCount} businesses!` }
        ]
      };
      
    case 'SELL_BUSINESS':
      const { businessToSellId } = action.payload;
      const businessToSell = state.businesses.find(b => b.id === businessToSellId);
      
      if (!businessToSell) {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), type: 'error', message: 'Business not found!' }
          ]
        };
      }
      
      // Calculate business value based on type, level, and upgrades
      const businessTypeToSell = BUSINESS_TYPES.find(b => b.id === businessToSell.type);
      let sellValue = businessTypeToSell.basePrice * businessToSell.level;
      
      // Add value of upgrades
      businessToSell.upgrades.forEach(upgrade => {
        const upgradeData = UPGRADE_TYPES.find(u => u.id === upgrade.type);
        sellValue += upgradeData.basePrice;
      });
      
      // Remove the business from the list
      const updatedBusinessesAfterSale = state.businesses.filter(b => b.id !== businessToSellId);
      
      return {
        ...state,
        money: state.money + sellValue,
        businesses: updatedBusinessesAfterSale,
        notifications: [
          ...state.notifications,
          { id: Date.now(), type: 'success', message: `Sold ${businessTypeToSell.name} for $${sellValue}!` }
        ]
      };
      
    case 'RESET_GAME':
      // Reset the game state to initial values
      return {
        ...initialState,
        initialized: false,
        showTutorial: !shouldDisableTutorial() // Preserve tutorial preference
      };
      
    default:
      return state;
  }
};

// Create the context
const GameContext = createContext();

// Game provider component
export const GameProvider = ({ children }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const { isAuthenticated, user } = useAuth();
  const [saveStatus, setSaveStatus] = useState({ loading: false, error: null, lastSaved: null });
  const [specialEventsChecked, setSpecialEventsChecked] = useState(false);
  
  // Load game state from server when user logs in
  useEffect(() => {
    const loadGameState = async () => {
      if (isAuthenticated && user) {
        try {
          const savedState = await gameStateService.loadGameState();
          if (savedState) {
            // Load the saved game state
            dispatch({ type: 'LOAD_SAVED_GAME', payload: savedState });
            console.log('Loaded saved game from server');
          } else {
            // No saved game found - this is normal for new users
            console.log('No saved game found - starting new game');
            // Initialize a new game for the user
            dispatch({ type: 'INITIALIZE_GAME' });
            
            // Add a welcome notification for new users
            dispatch({ 
              type: 'ADD_NOTIFICATION', 
              payload: { 
                type: 'info', 
                message: 'Welcome to Business Tycoon! Start by purchasing your first business.' 
              } 
            });
          }
        } catch (error) {
          console.error('Failed to load game state:', error);
          // If there's an error loading the game, initialize a new game
          dispatch({ type: 'INITIALIZE_GAME' });
        }
      }
    };
    
    loadGameState();
  }, [isAuthenticated, user]);
  
  // Auto-save game state every 5 minutes and when important actions occur
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    const saveCurrentState = async () => {
      try {
        setSaveStatus(prev => ({ ...prev, loading: true, error: null }));
        await gameStateService.saveGameState(gameState);
        setSaveStatus(prev => ({ 
          ...prev, 
          loading: false, 
          lastSaved: new Date().toLocaleTimeString() 
        }));
      } catch (error) {
        console.error('Failed to save game state:', error);
        setSaveStatus(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to save game. Your progress may be lost if you leave the game.' 
        }));
      }
    };
    
    // Set up auto-save interval
    const autoSaveInterval = setInterval(saveCurrentState, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      clearInterval(autoSaveInterval);
    };
  }, [gameState, isAuthenticated, user]);
  
  // Initialize game
  const initializeGame = () => {
    dispatch({ type: 'INITIALIZE_GAME' });
  };
  
  // Special events functions
  const startSpecialEvent = (eventId) => {
    dispatch({ type: 'START_SPECIAL_EVENT', payload: { eventId } });
  };
  
  const updateSpecialEventProgress = (eventId, progressType, amount) => {
    dispatch({ 
      type: 'UPDATE_SPECIAL_EVENT_PROGRESS', 
      payload: { eventId, progressType, amount } 
    });
  };
  
  const checkSpecialEventsProgress = () => {
    dispatch({ type: 'CHECK_SPECIAL_EVENTS_PROGRESS' });
  };
  
  const triggerSeasonalEvents = () => {
    dispatch({ type: 'TRIGGER_SEASONAL_EVENTS' });
  };
  
  // Check for special events periodically
  useEffect(() => {
    if (!gameState.initialized) return;
    
    // Check for special events once per day (game time)
    const checkInterval = setInterval(() => {
      // Check progress of active events
      if (gameState.activeSpecialEvents.length > 0) {
        checkSpecialEventsProgress();
      }
      
      // Check for seasonal events once per real-time day
      if (!specialEventsChecked) {
        triggerSeasonalEvents();
        setSpecialEventsChecked(true);
        
        // Reset the check flag at midnight
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeUntilMidnight = tomorrow - now;
        setTimeout(() => setSpecialEventsChecked(false), timeUntilMidnight);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(checkInterval);
  }, [gameState.initialized, gameState.activeSpecialEvents, specialEventsChecked]);
  
  // Manual save game function - only called explicitly, not automatically
  const saveGame = async () => {
    if (!isAuthenticated) {
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'error', 
          message: 'You must be logged in to save your game' 
        } 
      });
      return { success: false, message: 'You must be logged in to save your game' };
    }
    
    try {
      setSaveStatus(prev => ({ ...prev, loading: true, error: null }));
      await gameStateService.saveGameState(gameState);
      setSaveStatus(prev => ({ 
        ...prev, 
        loading: false, 
        lastSaved: new Date().toLocaleTimeString() 
      }));
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'success', 
          message: 'Game saved successfully!' 
        } 
      });
      
      // Also save to localStorage as a backup
      localStorage.setItem('businessTycoonSave', JSON.stringify(gameState));
      console.log('Game saved to database and localStorage');
      
      return { success: true, message: 'Game saved successfully!' };
    } catch (error) {
      console.error('Error saving game:', error);
      
      // Try to save to localStorage as fallback
      try {
        localStorage.setItem('businessTycoonSave', JSON.stringify(gameState));
        console.log('Game saved to localStorage (fallback)');
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
      }
      
      setSaveStatus(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to save game' 
      }));
      
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { 
          type: 'error', 
          message: 'Failed to save game. Please try again.' 
        } 
      });
      
      return { success: false, message: 'Failed to save game. Please try again.' };
    }
  };
  
  // Purchase a new business
  const purchaseBusiness = (businessType) => {
    dispatch({ 
      type: 'PURCHASE_BUSINESS', 
      payload: { businessType } 
    });
  };
  
  // Collect revenue from a business
  const collectRevenue = (businessId) => {
    dispatch({
      type: 'COLLECT_REVENUE',
      payload: { businessId }
    });
  };
  
  // Hire staff
  const hireStaff = (staffType) => {
    dispatch({
      type: 'HIRE_STAFF',
      payload: { staffType }
    });
  };
  
  // Purchase upgrade for a business
  const purchaseUpgrade = (upgradeType, businessId) => {
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: { upgradeType, businessId }
    });
  };
  
  // Advance to next day and auto-save
  const advanceDay = async () => {
    // First advance the day
    dispatch({ type: 'ADVANCE_DAY' });
    
    // Then auto-save the game if user is authenticated
    if (isAuthenticated && user) {
      try {
        // Use setTimeout to ensure the state has been updated before saving
        setTimeout(async () => {
          try {
            // Don't show loading state for auto-save to avoid UI disruption
            await gameStateService.saveGameState(gameState);
            
            // Update last saved time silently
            setSaveStatus(prev => ({
              ...prev,
              lastSaved: new Date().toLocaleTimeString(),
              error: null
            }));
            
            // Also save to localStorage as a backup
            localStorage.setItem('businessTycoonSave', JSON.stringify(gameState));
            console.log('Game auto-saved after advancing day');
          } catch (error) {
            console.error('Auto-save error:', error);
            
            // Try to save to localStorage as fallback
            try {
              localStorage.setItem('businessTycoonSave', JSON.stringify(gameState));
              console.log('Game saved to localStorage (auto-save fallback)');
            } catch (localError) {
              console.error('Failed to save to localStorage:', localError);
            }
          }
        }, 100); // Small delay to ensure state is updated
      } catch (error) {
        console.error('Error in advanceDay auto-save:', error);
      }
    } else {
      // If not authenticated, just save to localStorage
      try {
        localStorage.setItem('businessTycoonSave', JSON.stringify(gameState));
        console.log('Game saved to localStorage (not authenticated)');
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  };
  
  // Close tutorial for this session only
  const closeTutorial = () => {
    dispatch({ type: 'CLOSE_TUTORIAL' });
  };
  
  // Permanently disable tutorial for future sessions
  const permanentlyDisableTutorial = () => {
    dispatch({ type: 'PERMANENTLY_DISABLE_TUTORIAL' });
  };
  
  // Clear notification
  const clearNotification = (notificationId) => {
    dispatch({
      type: 'CLEAR_NOTIFICATION',
      payload: { notificationId }
    });
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  };
  
  // Collect revenue from all businesses
  const collectAllRevenue = () => {
    dispatch({ type: 'COLLECT_ALL_REVENUE' });
  };
  
  // Sell a business
  const sellBusiness = (businessToSellId) => {
    dispatch({
      type: 'SELL_BUSINESS',
      payload: { businessToSellId }
    });
  };
  
  // Reset game state (used when logging out)
  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
    // Also clear any local storage game data
    localStorage.removeItem('businessTycoonSave');
  };
  
  // Add an effect to handle auto-save when game state changes due to bankruptcy
  useEffect(() => {
    // If the game is over due to bankruptcy, save the state
    if (gameState.gameOver && isAuthenticated && user) {
      const autoSaveBankruptcy = async () => {
        try {
          await gameStateService.saveGameState(gameState);
          console.log('Game state auto-saved after bankruptcy');
          
          // Also save to localStorage
          localStorage.setItem('businessTycoonSave', JSON.stringify(gameState));
        } catch (error) {
          console.error('Failed to auto-save after bankruptcy:', error);
          
          // Try localStorage as fallback
          try {
            localStorage.setItem('businessTycoonSave', JSON.stringify(gameState));
          } catch (localError) {
            console.error('Failed to save to localStorage after bankruptcy:', localError);
          }
        }
      };
      
      autoSaveBankruptcy();
    }
  }, [gameState.gameOver, isAuthenticated, user, gameState]);
  
  // Value object to be provided to consumers
  const value = {
    gameState,
    initializeGame,
    saveGame,
    purchaseBusiness,
    collectRevenue,
    collectAllRevenue,
    hireStaff,
    purchaseUpgrade,
    advanceDay,
    closeTutorial,
    permanentlyDisableTutorial,
    clearNotification,
    clearAllNotifications,
    sellBusiness,
    resetGame,
    saveStatus,
    // Special event functions
    startSpecialEvent,
    updateSpecialEventProgress,
    checkSpecialEventsProgress,
    triggerSeasonalEvents
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook for using the game context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
