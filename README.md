# RE Hustle V2

A real estate investment analysis application built with Next.js and MongoDB.

## Features

- 🔒 Secure authentication with NextAuth.js
- 💰 Dynamic property value analysis
- 📊 Comprehensive deal scoring system
- 📱 Responsive, mobile-friendly UI
- 💾 MongoDB data persistence
- 🔌 CRM integration capabilities

## Setup

1. Clone the repository
2. Set up the required environment variables (see below)
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server

## Environment Variables

The application requires these environment variables to be set:

- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth.js session encryption
- `NEXTAUTH_URL` - Full URL where your app is hosted (in production)

## Property Analysis

The application can analyze various types of real estate investments:

- **Land**: Evaluates based on market value, seller motivation, road access, utilities, etc.
- **Residential**: Calculates after-repair value (ARV), repair costs, market factors, etc.
- **Multi-Family**: Evaluates cash flow, cap rate, vacancy rates, and stabilization timeframes
- **Commercial**: Analyzes NOI, cap rates, vacancy rates, and lease terms

## Data Storage

All deal data is stored in MongoDB with the following structure:

- User accounts: Authentication data, preferences
- Saved deals: Property information, analysis results, timestamps

## CRM Integration

The application can integrate with:

- GoHighLevel
- Podio
- Notion
- REI Reply

To set up CRM integration, go to the Account settings page and configure your CRM credentials.

## Troubleshooting

If you experience any database connectivity issues, you can:

1. Visit `/db-status` to check the MongoDB connection status
2. Ensure your MongoDB URI is correctly formatted
3. Check for any SSL/TLS certificate issues

## Deployment

The application is designed to be deployed on any platform that supports Node.js.