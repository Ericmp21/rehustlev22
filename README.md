# RE Hustle V2

A Next.js SaaS application designed to empower real estate investors with advanced property investment analysis tools and seamless CRM integrations.

## Deployment to Vercel

### Prerequisites
- Node.js 18+ installed
- Vercel account
- MongoDB Atlas account
- Stripe account (for payments)

### Environment Variables
Make sure to set up the following environment variables in Vercel:

```
MONGODB_URI=<your-mongodb-connection-string>
NEXTAUTH_SECRET=<random-secure-string>
NEXTAUTH_URL=<your-deployment-url>
STRIPE_SECRET_KEY=<your-stripe-secret-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
```

### Deployment Steps
1. Import the project to Vercel
2. Configure environment variables
3. Deploy the application

## Tech Stack
- Next.js (Pages Router)
- MongoDB with Mongoose
- NextAuth.js for authentication
- Tailwind CSS for styling
- Stripe for payment processing

## Development
1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env.local` file based on `.env.example`
4. Run the development server with `npm run dev`