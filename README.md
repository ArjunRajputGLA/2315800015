# Campus Notifications

A responsive React web application that displays real-time campus notifications and implements a Priority Inbox to surface the most critical updates based on their weight and recency.

## Features

- **All Notifications:** View a feed of all recent notifications.
- **Unread/Viewed Tracking:** Distinct visual indicators for unread vs viewed notifications using local storage.
- **Priority Inbox:** A specialized view that displays the top 'n' most important unread notifications. Priority is determined by a combination of notification weight (Placement > Result > Event) and recency.
- **Logging Middleware:** Integrated custom logging middleware for capturing significant events throughout the application lifecycle.

## Technologies Used

- React (TypeScript)
- Vite
- Material UI (MUI)
- React Router DOM
- Axios

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd notification_app_fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be accessible at `http://localhost:3000`.

## Directory Structure

- `/notification_app_fe`: Contains the React/Vite frontend application.
- `/logging_middleware`: Contains the reusable TypeScript logging package.
- `/notification_app_be`: Reserved for backend code.
