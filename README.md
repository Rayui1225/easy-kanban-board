# Easy Kanban Board

A simple and effective Kanban board application built with React and Flask, designed to help you manage tasks and workflows efficiently.

## Features

- Drag-and-drop interface for easy task management
- Multiple columns to represent different stages of your workflow
- Real-time updates across the board
- Backend API for data persistence
- Responsive design for desktop and mobile use

## Tech Stack

### Frontend
- React
- react-beautiful-dnd for drag-and-drop functionality
- Axios for API calls

### Backend
- Flask (Python)
- MongoDB for data storage
- Flask-CORS for handling Cross-Origin Resource Sharing
- Flask-Caching for improved performance

## Project Structure
easy-kanban-board/
├── kanban-board/         # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Board.js
│   │   │   ├── Card.js
│   │   │   └── Column.js
│   │   └── ...
│   └── ...
└── python api server/    # Backend Flask application
└── server.py

## API Endpoints

- GET `/api/Cards`: Retrieve all cards
- GET `/api/Columns`: Retrieve all columns
- POST `/api/Cards`: Create a new card
- PUT `/api/Columns/<id>`: Update a specific column
- PUT `/api/Cards/<id>`: Update a specific card
- DELETE `/api/Cards/<id>`: Delete a specific card
