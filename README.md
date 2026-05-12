# SmartPark - Vehicle Management System

SmartPark is a modern, full-stack vehicle management and parking reservation system designed to digitize and automate parking facilities. Whether it's managing a single garage or a multi-location city parking network, SmartPark simplifies the entire lifecycle of a parking session—from advanced reservations to live check-ins and automated fee calculations.

It provides a cohesive dual-portal interface:
- A **User Portal** for drivers to easily find available slots tailored to their vehicle type (Two-Wheeler, Four-Wheeler, or Heavy Vehicle), reserve spaces in advance, and manage their active parking sessions.
- A powerful **Admin Dashboard** allowing facility managers to track real-time occupancy, monitor revenue streams, and dynamically manage physical infrastructure like lots and individual parking slots.

Built with a sleek, minimalist "beige and black" design aesthetic, it prioritizes an exceptional user experience while maintaining a robust relational database architecture under the hood.

## 🚀 Features

- **User Portal (Drivers)**
  - View available parking lots and individual slots in real-time.
  - Register personal vehicles securely.
  - Reserve parking slots in advance or "Check-In" on arrival.
  - View comprehensive entry/exit history and auto-calculated parking fees.

- **Admin Dashboard**
  - Track real-time system metrics (Total Revenue, Active Slots, Occupancy).
  - Manage Parking Locations and individually assign slots.
  - Oversee and manage drivers, registered vehicles, and reservations.
  - Automatically track entry/exit logs with built-in fee computation (minimum 1 hour base rate).

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide React (Icons).
- **Backend:** Node.js, Express.js.
- **Database:** MySQL.

---

## 💻 Local Setup Instructions

Follow these steps to get the project running on your local machine.

### 1. Database Configuration
1. Ensure you have **MySQL** installed and running on your machine.
2. Execute the `schema.sql` file located in the root directory to automatically create the `smart_parking` database, required tables, and sample data.

### 2. Backend Setup
1. Open a terminal in the **root directory**.
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=smart_parking
   PORT=3000
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a **second terminal** and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install the React dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 4. Access the Application
- Open your browser and navigate to `http://localhost:5173` (or the port Vite provides).
- You can log in using the sample user phone number: `9876543210`.
- To access the **Admin Portal**, log in with the admin phone number: `admin` (or update a user's role to `'admin'` in the database).

---
*Built with a focus on modern, responsive, and sleek UI/UX design conventions.*
