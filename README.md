# Business Tycoon Game

A browser-based business simulation game where players build and manage their business empire.

## Features

- Start with a basic business and grow it into an empire
- Invest in different sectors and expand operations
- Hire managers and upgrade facilities
- Experience market fluctuations and random events
- Track progress with financial metrics and achievements

## Tech Stack

- React.js for UI components and state management
- HTML5 & CSS3 with responsive design for all devices
- Local storage for saving game progress
- Chart.js for financial data visualization

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Game Instructions

1. Start with a small business and limited capital
2. Make strategic investments to grow your business
3. Hire staff and upgrade facilities to increase efficiency
4. React to market events and economic changes
5. Unlock new business opportunities as you progress

## Development

This project was bootstrapped with Create React App.

## Deployment to Vercel

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. [Vercel CLI](https://vercel.com/docs/cli) installed globally: `npm i -g vercel`
3. A MongoDB Atlas account for the database

### Deployment Steps

1. **Set up MongoDB Atlas**
   - Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a database user with appropriate permissions
   - Get your connection string

2. **Configure Environment Variables on Vercel**
   - Log in to your Vercel dashboard
   - Create a new project and link it to your GitHub repository
   - Add the following environment variables in the Vercel project settings:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: A secure random string for JWT token generation
     - `REACT_APP_API_URL`: The URL of your deployed API (will be your Vercel deployment URL)

3. **Deploy from the Command Line**
   ```bash
   # Login to Vercel
   vercel login
   
   # Deploy to Vercel
   vercel
   
   # For production deployment
   vercel --prod
   ```

4. **Alternative: Deploy via GitHub Integration**
   - Connect your GitHub repository to Vercel
   - Configure the build settings as needed
   - Vercel will automatically deploy when you push to your repository

### Troubleshooting

- If you encounter CORS issues, check that your API URL is correctly set
- Make sure your MongoDB connection string is correct and the IP address is whitelisted
- Check Vercel logs for any deployment errors

## License

This project is licensed under the MIT License - see the LICENSE file for details.
