# Eventiq - Event Management Platform 🎉

<div align="center">
  <img src="\src\assets\images\splash-icon.png" alt="Eventiq Logo" width="200"/>
</div>

Eventiq is a comprehensive mobile application built with React Native and Expo, designed to streamline event management and booking processes. The platform connects event organizers with travelers/attendees through an intuitive interface, providing a seamless experience for event discovery, booking, and management.

## 🎯 Overview

Eventiq addresses the challenges in event management by providing:

- **Seamless Booking System**: Easy-to-use interface for event booking and management
- **Real-time Updates**: Live tracking of seat availability and booking status
- **Direct Communication**: Built-in chat system between organizers and attendees
- **Automated Handling**: Smart waitlist management and cancellation processing

## 🌟 Features

### For Travelers

- **Event Discovery & Booking**

  - Browse upcoming events with detailed information
  - Real-time seat availability tracking
  - Flexible booking system with waitlist support
  - View event locations, dates, and pricing

- **Booking Management**

  - View upcoming, past, and cancelled bookings
  - Cancel bookings with automatic refund policy enforcement
  - Track booking status (confirmed, waitlist, cancelled)

- **Communication**
  - Direct messaging with event organizers
  - Real-time chat functionality
  - Booking confirmation notifications

### For Organizers

- **Event Management**

  - Create and manage events
  - Set event capacity and pricing
  - Upload multiple event images
  - Define cancellation policies

- **Booking Administration**

  - Track bookings and attendees
  - Manage waitlists
  - View booking statistics
  - Process cancellations

- **Communication Center**
  - Chat with attendees
  - Send updates and notifications
  - Manage conversations

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/eventiq.git
   cd eventiq
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Install additional packages

   ```bash
   npm install libphonenumber-js
   ```

4. Start the development server

   ```bash
   npx expo start
   ```

## 🔧 Technical Stack

### Frontend Technologies

- **React Native**: Core framework for mobile development

  - Version: 0.71.8
  - Cross-platform compatibility
  - Native performance

- **Expo**: Development framework and platform

  - SDK Version: 48.0.0
  - Easy deployment and testing
  - Access to native APIs

- **Navigation**:
  - Expo Router with file-based routing
  - Type-safe navigation
  - Deep linking support

### State Management

- **React Context API**: Global state management
  - Auth context for user management
  - Booking context for reservation state
  - Chat context for messaging state

### Backend Infrastructure

- **Supabase**: Backend-as-a-Service
  - PostgreSQL Database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Built-in Authentication

### Storage Solutions

- **Supabase Storage**: File storage system
  - Image upload and management
  - Secure file access
  - CDN integration

### Additional Libraries

- **libphonenumber-js**: Phone number validation
- **@expo/vector-icons**: Icon components
- **react-native-safe-area-context**: Safe area handling
- **@react-native-community/datetimepicker**: Date and time selection

## 📚 API Documentation

### Authentication API

- `POST /auth/register`

  - Register new user
  - Required fields: email, password, full_name, phone
  - Returns: user token and profile data

- `POST /auth/login`

  - User login
  - Required fields: email, password
  - Returns: session token

- `GET /auth/profile`
  - Get user profile
  - Authentication: Required
  - Returns: user profile details

### Events API

- `GET /events`

  - List all events
  - Query parameters:
    - `status`: active, past, cancelled
    - `category`: event category
    - `limit`: number of events to return
    - `offset`: pagination offset

- `GET /events/:id`

  - Get event details
  - Returns: Complete event information including:
    - Event details
    - Organizer information
    - Available seats
    - Booking status
    - Images

- `POST /events` (Organizer only)

  - Create new event
  - Required fields:
    - title
    - description
    - start_time
    - end_time
    - total_seats
    - budget_per_person
    - cancellation_policy

- `PUT /events/:id` (Organizer only)

  - Update event details
  - Modifiable fields: all except id and created_at

- `DELETE /events/:id` (Organizer only)
  - Delete event
  - Automatically cancels all associated bookings

### Bookings API

- `GET /bookings`

  - List user's bookings
  - Query parameters:
    - `status`: confirmed, waitlist, cancelled
    - `event_id`: filter by event

- `POST /bookings`

  - Create new booking
  - Required fields:
    - event_id
    - seats_requested
  - Returns: Booking confirmation with status

- `PUT /bookings/:id`

  - Update booking status
  - Allowed status changes:
    - reserved → confirmed
    - waitlist → confirmed
    - confirmed → cancelled

- `DELETE /bookings/:id`
  - Cancel booking
  - Triggers automatic waitlist processing
  - Updates event seat availability

### Chat API

- `GET /conversations`

  - List user's conversations
  - Includes:
    - Last message
    - Unread count
    - Participant details

- `POST /conversations`

  - Start new conversation
  - Required:
    - participant_id
    - initial_message

- `GET /messages/:conversationId`

  - Get conversation messages
  - Query parameters:
    - `limit`: messages per page
    - `before`: timestamp for pagination
  - Returns: Ordered message list

- `POST /messages`
  - Send new message
  - Supports:
    - Text messages
    - System notifications
    - Booking updates

## 🔐 Environment Setup

### 1. Supabase Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Additional Configuration
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_STORAGE_URL=your_storage_url
```

### 2. Database Setup

1. Create required tables in Supabase:

   - profiles
   - events
   - bookings
   - conversations
   - messages

2. Set up Row Level Security (RLS):

   ```sql
   -- Example RLS policy for events
   CREATE POLICY "Public events are viewable by everyone"
   ON events FOR SELECT
   USING (true);
   ```

### 3. Storage Setup

1. Create the following storage buckets:

   - event-images
   - profile-images

2. Configure CORS and security policies

## 📱 Running the App

### Development Environment Setup

1. Install development tools:

   ```bash
   npm install -g expo-cli eas-cli
   ```

2. Install project dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npx expo start
   ```

### Running on Devices

#### Android

1. Setup Android development environment:

   - Install Android Studio
   - Configure Android SDK
   - Create/setup Android emulator

2. Run on Android:

   ```bash
   # Development build
   npx expo run:android

   # Start Metro bundler
   npm run android
   ```
   ```
## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License

## 👥 Team

- Muntasir Hossain
- Rafid Ahmed
- Abdul Muqtadir

## 📞 Support

For support, email [muntasir21@iut-dhaka.edu] or join our Slack channel.
