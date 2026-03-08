# SmartStudy

A comprehensive study management application built with React and Node.js.

## Features

- User Authentication (Register/Login)
- Task Management
- Note Taking
- Goal Setting
- Flashcard Decks
- Study Session Tracking
- Schedule Management
- Analytics Dashboard
- Timer

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB

## Getting Started

### Prerequisites

- Node.js
- MongoDB (local or cloud)

### Installation

```bash
# Install all dependencies
npm run install-all

# Or install separately
npm install
cd client && npm install
cd ../server && npm install
```

### Running the Application

```bash
# Start both client and server
npm start

# Or run separately
npm run server  # Start backend on port 5000
npm run client  # Start frontend on port 3000
```

### Environment Variables

Create a `.env` file in the server directory:

```
MONGODB_URI=mongodb://localhost:27017/smartstudy
PORT=5000
JWT_SECRET=your_jwt_secret
```

## License

MIT

