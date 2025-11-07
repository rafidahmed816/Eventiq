<!-- vscode-markdown-toc -->

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc --><p align="center">
  <img src="./src/assets/images/eventiq-banner.png" alt="Eventiq Banner" />
</p>

<h1 align="center">Eventiq</h1>

<p align="center">
  <strong>Organized Group Travel, Simplified.</strong>
</p>

## Table of Contents

- 1. [📜 Problem Statement](#ProblemStatement)
- 2. [✨ Our Solution](#OurSolution)
- 3. [🚀 Features](#Features)
  - 3.1. [For Organizers 💼](#ForOrganizers)
  - 3.2. [For Travelers ✈️](#ForTravelers)
- 4. [🛠️ Tech Stack](#TechStack)
- 5. [📊 Project Presentation](#ProjectPresentation)
- 6. [🏁 Getting Started](#GettingStarted)
  - 6.1. [Prerequisites](#Prerequisites)
  - 6.2. [Installation](#Installation)

---

## 1. <a name='ProblemStatement'></a>📜 Problem Statement

In Bangladesh, the rise of Facebook travel groups has made it easier for people to find and join group tours. However, this process is plagued with disorganization. Organizers struggle to manage bookings, payments, and communication, while travelers face a confusing and often untrustworthy booking experience. Key issues include:

- **Manual Booking & Payment:** Organizers manually track bookings via spreadsheets and collect payments through various mobile banking apps, which is time-consuming and error-prone.
- **Scattered Communication:** Important trip details are spread across Facebook posts, comments, and Messenger chats, leading to confusion and missed information.
- **Lack of Trust:** Travelers have little to no way of verifying the credibility of an organizer, and there is no standardized system for reviews or ratings.
- **Inefficient Management:** Organizers lack dedicated tools to manage attendees, view booking statistics, or handle cancellations efficiently.

This chaotic ecosystem creates a frustrating experience for both organizers and travelers, hindering the potential for a thriving group travel community.

## 2. <a name='OurSolution'></a>✨ Our Solution

Eventiq is a mobile platform designed to bring structure and efficiency to the group travel landscape. We provide a centralized hub where organizers can seamlessly manage their events and travelers can discover, book, and review tours with confidence.

Our platform addresses the core problems by:

- **Automating Event Management:** Organizers can create, publish, and manage events through a dedicated dashboard. This includes tracking bookings, viewing attendee information, and monitoring event performance.
- **Streamlining the Traveler Experience:** Travelers can browse a feed of upcoming trips, filter by category, and book their spot in just a few taps. All booking and trip information is stored in one place.
- **Building a Trusted Community:** A built-in review and rating system allows travelers to share their experiences and helps others choose credible organizers.
- **Centralizing Communication:** Integrated chat functionality allows for direct and organized communication between travelers and organizers, ensuring everyone stays informed.

By digitizing and organizing the entire process, Eventiq empowers organizers to grow their businesses and provides travelers with a secure and user-friendly way to explore new adventures.

## 3. <a name='Features'></a>🚀 Features

Eventiq is divided into two main roles, each with a tailored set of features:

### 3.1. <a name='ForOrganizers'></a>For Organizers 💼

- **Dashboard:** Get a quick overview of stats like total earnings, upcoming events, and recent bookings.
- **Event Management:** Create, update, and manage all your travel events. Add details like itinerary, location, price, and available spots.
- **Attendee Management:** View a list of attendees for each event, along with their booking details.
- **Profile Management:** Build your reputation by showcasing your organizer profile and past events.
- **Real-time Chat:** Communicate directly with travelers who have booked your events.

### 3.2. <a name='ForTravelers'></a>For Travelers ✈️

- **Event Discovery:** Browse a feed of events, with options to search and filter by category.
- **Seamless Booking:** Book a spot on a trip with a simple and secure booking process.
- **Booking Management:** Keep track of all your upcoming and past bookings in one place.
- **Review System:** Rate and review organizers after a trip to help build a transparent community.
- **Direct Communication:** Chat with organizers to ask questions or get updates about your trip.

## 4. <a name='TechStack'></a>🛠️ Tech Stack

Eventiq is built with a modern, cross-platform tech stack:

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
</p>

- **Frontend:** React Native with Expo
- **Language:** TypeScript
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)
- **Routing:** Expo Router
- **State Management:** React Context API

## 5. <a name='ProjectPresentation'></a>📊 Project Presentation

For a deeper insight into the project's architecture, features, and development process, you can view our project presentation.

- **[View the Presentation PDF](./src/docs/Eventiq.pdf)**


## 6. <a name='GettingStarted'></a>🏁 Getting Started

Follow these steps to get the project up and running on your local machine.

### 6.1. <a name='Prerequisites'></a>Prerequisites

- Node.js (LTS version recommended)
- Expo Go app on your mobile device or an Android/iOS emulator

### 6.2. <a name='Installation'></a>Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/rafidahmed816/Eventiq.git
   cd Eventiq
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root of the project and add your Supabase credentials:

   ```
   EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

4. **Start the development server:**

   ```bash
   npx expo start
   ```

5. **Run the app:**
   - Scan the QR code with the Expo Go app on your phone.
   - Or, press `a` to run on an Android emulator or `i` to run on an iOS simulator.

---

