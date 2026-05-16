# Personal Finance Tracker

## Problem Description
Managing personal finances can be overwhelming and confusing. Many people struggle to keep track of their daily expenses, income, and overall budget, leading to poor financial decisions and unexpected debts. Traditional methods like spreadsheets or manual tracking are often tedious and prone to errors. 
For university students juggling daily living costs on a limited budget, this lack of clear financial tracking can be especially stressful.

## Proposed Solution
The Personal Finance Tracker is a comprehensive web application designed to simplify money management. It provides a user-friendly platform where users can easily log their income and expenses, categorize their transactions, and view detailed financial reports. By automating the tracking process and providing visual insights, users can make informed financial decisions and take control of their budget
This is particularly valuable for university students, as it empowers them to track their limited funds efficiently, plan for upcoming semesters, and build healthy financial habits early on.

## Features
- **User Authentication**: Secure signup and login functionality.
- **Transaction Management**: Add, update, view, and delete income and expense transactions.
- **Categorization**: Organize transactions by type (income or expense) and custom categories.
- **Financial Reports**: Generate reports to analyze spending habits and income over time.
- **Responsive Interface**: Accessible on various devices for managing finances on the go.

## Technologies Used
- **Frontend**: React, Vite, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Other Tools**: dotenv, cors, body-parser

## API Endpoints (with examples)

### Users
- `POST /api/users/signup` - Register a new user.
  - Example Body: `{ "username": "johndoe", "password": "password123", "email": "john@example.com" }`
- `POST /api/users/login` - Authenticate an existing user.
  - Example Body: `{ "username": "johndoe", "password": "password123" }`
- `GET /api/users/` - Retrieve all users.
- `GET /api/users/:id` - Retrieve a specific user by ID.
- `PUT /api/users/:id` - Update user information.
- `DELETE /api/users/:id` - Delete a user.

### Transactions
- `POST /api/transactions/` - Create a new transaction.
  - Example Body: `{ "username": "johndoe", "title": "Groceries", "type": "expense", "amount": 50, "category": "Food" }`
- `GET /api/transactions/user/:username` - Get all transactions for a specific user.
- `PUT /api/transactions/:id` - Update a specific transaction by ID.
- `DELETE /api/transactions/:id` - Delete a specific transaction by ID.

### Reports
- `GET /api/reports/user/:username` - Retrieve financial reports/summaries for a specific user.

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd personal-finance-tracker
   ```

2. **Setup the Backend**:
   - Navigate to the Backend directory: 
     ```bash
     cd Backend
     ```
   - Install dependencies: 
     ```bash
     npm install
     ```
   - Create a `.env` file in the `Backend` directory and add your MongoDB connection string and port:
     ```env
     MONGO_URL=your_mongodb_connection_string
     PORT=3000
     FRONTEND_ORIGINS=http://localhost:5173
     ```

3. **Setup the Frontend**:
   - Open a new terminal and navigate to the Frontend directory: 
     ```bash
     cd Frontend
     ```
   - Install dependencies: 
     ```bash
     npm install
     ```

## How to Run the Project

1. **Start the Backend server**:
   - In the `Backend` directory, run the following command:
     ```bash
     npm start
     ```
   - The server should start and you will see a message like `Server is running on port 3000`.

2. **Start the Frontend development server**:
   - In the `Frontend` directory, run the following command:
     ```bash
     npm run dev
     ```
   - The React application will start, typically accessible at `http://localhost:5173` (or another port specified by Vite in the console output). Open this URL in your browser to use the application.

## Optional Setup (Live Deployment)

You can view a live deployed version of the application hosted on Vercel at: **[https://personal-finance-tracker-sepia-gamma.vercel.app](https://personal-finance-tracker-sepia-gamma.vercel.app)**. 

Vercel is a cloud platform tailored for static sites and frontend frameworks like React and Vite. It allows you to deploy the frontend portion of your application seamlessly, providing a publicly accessible URL instantly without the need for manual local setup.
The frontend on Vercel connects with the reliable and scalable backend hosted on Render.
