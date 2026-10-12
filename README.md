# ⚡ Electricity Consumption Forecasting System

A professional, full-stack web application designed for tracking daily electricity usage and generating short-to-medium term consumption forecasts using **Moving Average** statistical algorithms.

Built with **React (Vite) + Tailwind CSS**, **Node.js + Express REST API**, and a local **MySQL Server** manageable via **MySQL Workbench**.

---

## 🚀 Key Features

- **🔐 Secure Authentication**: Register and login with **JWT (JSON Web Tokens)** and salted **bcrypt password hashing**.
- **📊 Electricity Consumption Tracking**: Record, search, sort, edit, and delete daily electricity consumption readings (`kWh` / `MWh`) with notes.
- **📈 Data-Driven Moving Average Forecasting**:
  - Choose between **1-Day (24h Ahead)**, **7-Day (Weekly)**, and **30-Day (Monthly)** projection horizons.
  - Automatically computes baseline rolling averages and standard deviation ranges ($\sigma$).
  - Stores all prediction records directly into the MySQL `forecasts` table.
- **📉 Interactive Visualizations (Recharts)**:
  - Dual-series line charts comparing **Historical Actual Consumption** vs. **Projected Forecasts**.
  - Area charts for chronological energy consumption patterns.
  - Bar charts for day-of-the-week usage distribution (identifies weekend vs. weekday load variations).
- **🗃️ Local MySQL & MySQL Workbench Support**:
  - Full schema definition script provided in `database/schema.sql`.
  - Automatic table verification and creation on backend startup.
  - Supports dedicated non-root application database users (`electricity_app`).
- **📥 Data Export**: Quick export of all recorded meter readings to CSV.
- **📱 Fully Responsive UI**: Tailored for desktops, tablets, and mobile screens with dark glassmorphic styling and collapsible navigation.

---

## 📁 Project Architecture & Folder Structure

```
electricity-forecasting-system/
├── database/
│   ├── schema.sql           # MySQL database, user, tables, and index definitions
│   └── seed.sql             # Sample dataset with 30 days of realistic readings
├── backend/
│   ├── config/
│   │   └── db.js            # MySQL connection pool & automatic table initializer
│   ├── controllers/
│   │   ├── authController.js        # Register, login, profile, and JWT issuance
│   │   ├── consumptionController.js # CRUD for electricity consumption readings
│   │   ├── forecastController.js    # Moving average prediction & history APIs
│   │   └── dashboardController.js   # Aggregated metrics & chart data series
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification & route protection
│   │   └── errorMiddleware.js       # Centralized error formatting & HTTP status
│   ├── routes/
│   │   ├── authRoutes.js            # /api/auth endpoints
│   │   ├── consumptionRoutes.js     # /api/consumption endpoints
│   │   ├── forecastRoutes.js        # /api/forecast endpoints
│   │   └── dashboardRoutes.js       # /api/dashboard endpoints
│   ├── services/
│   │   └── forecastService.js       # Core moving average algorithm engine
│   ├── .env.example                 # Example backend environment variables
│   ├── .env                         # Active backend environment variables
│   ├── package.json                 # Backend npm dependencies
│   └── server.js                    # Express app bootstrap & API mounting
├── frontend/
│   ├── public/                      # Static assets & favicons
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Responsive top navigation & brand header
│   │   │   ├── Sidebar.jsx          # Collapsible dashboard sidebar
│   │   │   ├── ProtectedRoute.jsx   # Route guard redirecting to /login
│   │   │   ├── StatCard.jsx         # KPI metric display cards
│   │   │   ├── Loading.jsx          # Polished spinners & loading overlays
│   │   │   ├── Toast.jsx            # Dynamic success / error notifications
│   │   │   └── Footer.jsx           # Public pages footer
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state & token persistence
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Public landing page with live demo preview
│   │   │   ├── About.jsx            # Architecture & algorithm explanation
│   │   │   ├── Contact.jsx          # Contact and feedback form
│   │   │   ├── Login.jsx            # Secure user login form
│   │   │   ├── Register.jsx         # User registration form
│   │   │   ├── Dashboard.jsx        # KPI metrics & Recharts analytics
│   │   │   ├── Consumption.jsx      # Data table, add/edit modal, CSV export
│   │   │   ├── Forecast.jsx         # Interactive forecasting generator & charts
│   │   │   ├── History.jsx          # Prediction run logs & batch deletion
│   │   │   ├── Profile.jsx          # User details & password change
│   │   │   └── Settings.jsx         # Unit preferences & system diagnostics
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance with JWT interceptors
│   │   │   ├── authService.js
│   │   │   ├── consumptionService.js
│   │   │   ├── forecastService.js
│   │   │   └── dashboardService.js
│   │   ├── App.jsx                  # React Router configuration
│   │   ├── main.jsx                 # React root entry point
│   │   └── index.css                # Tailwind CSS and glassmorphic styles
│   ├── index.html
│   ├── package.json                 # Frontend npm dependencies
│   ├── tailwind.config.js           # Tailwind theme & color setup
│   └── vite.config.js               # Vite build configuration
└── README.md
```

---

## 🛠️ Step-by-Step Setup & Installation Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (version 8.0+)
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)

---

### Step 1: Database Initialization in MySQL Workbench

1. Open **MySQL Workbench** and connect to your local MySQL Server instance.
2. Open the SQL query tab and open `database/schema.sql` (or copy/paste its contents):
   ```sql
   CREATE DATABASE IF NOT EXISTS electricity_forecasting
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;

   USE electricity_forecasting;
   ```
3. Click the **Execute (⚡)** button in MySQL Workbench to run the script. This creates the database and all 3 tables: `users`, `electricity_readings`, and `forecasts`.
4. *(Optional)* To populate 30 days of realistic sample consumption readings for instant demo forecasting, execute `database/seed.sql`.

---

### Step 2: Configure Environment Variables

Navigate to the `backend/` folder and ensure your `.env` file matches your local MySQL password:

```env
# backend/.env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=electricity_forecasting

PORT=5000

JWT_SECRET=super_secret_jwt_key_electricity_forecasting_2026_change_in_prod
CLIENT_URL=http://localhost:5173
```

> **Note:** If you prefer using a dedicated application user instead of `root`, you can run the user creation query provided in `database/schema.sql` and set `DB_USER=electricity_app` and `DB_PASSWORD=Electricity@1234`.
>
> On Render, `CLIENT_URL` is configured as `https://electricity-consumption-forecasting.onrender.com` (the frontend origin, without `/api`). The local `localhost:5173` value is for development.

---

### Step 3: Start the Backend Server

Open a terminal in the project directory:

```bash
cd backend
npm install
npm run dev
```

The backend server will start at:
👉 **`http://localhost:5000`**

*(Backend health check endpoint: `http://localhost:5000/api/health`)*

---

### Step 4: Start the Frontend Application

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```

The React + Vite frontend will start at:
👉 **`http://localhost:5173`**

In production, the frontend uses `https://electricity-consumption-forecasting.onrender.com/api` for API requests by default. To use a different API server, set `VITE_API_URL` in the frontend build environment.

---

## 📡 REST API Endpoint Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch current user details & counts | Yes (Bearer Token) |
| `PUT` | `/api/auth/profile` | Update user name or change password | Yes (Bearer Token) |

### ⚡ Electricity Consumption (`/api/consumption`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/consumption` | Add a new electricity reading | Yes (Bearer Token) |
| `GET` | `/api/consumption` | Get user readings (with search & sort) | Yes (Bearer Token) |
| `GET` | `/api/consumption/:id` | Get single reading by ID | Yes (Bearer Token) |
| `PUT` | `/api/consumption/:id` | Update an existing reading | Yes (Bearer Token) |
| `DELETE` | `/api/consumption/:id` | Delete a reading | Yes (Bearer Token) |

### 📈 Forecasting Engine (`/api/forecast`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/forecast` | Generate moving average forecast (1, 7, 30 days) | Yes (Bearer Token) |
| `GET` | `/api/forecast` | Retrieve all past forecast records | Yes (Bearer Token) |
| `GET` | `/api/forecast/:id` | Get single forecast entry by ID | Yes (Bearer Token) |
| `DELETE` | `/api/forecast/:id` | Delete a forecast entry | Yes (Bearer Token) |
| `DELETE` | `/api/forecast` | Clear all forecast history for user | Yes (Bearer Token) |

### 📊 Dashboard Summary (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/dashboard/summary` | Get aggregated stats & Recharts data series | Yes (Bearer Token) |

---

## 🗄️ Database Tables Schema

1. **`users`**:
   - `id` (INT, Primary Key, Auto Increment)
   - `name` (VARCHAR(100))
   - `email` (VARCHAR(150), Unique)
   - `password` (VARCHAR(255) - bcrypt hashed)
   - `created_at` (TIMESTAMP)

2. **`electricity_readings`**:
   - `id` (INT, Primary Key, Auto Increment)
   - `user_id` (INT, Foreign Key $\rightarrow$ `users.id` ON DELETE CASCADE)
   - `reading_date` (DATE)
   - `consumption` (DECIMAL(10,2))
   - `units` (VARCHAR(20), Default: `'kWh'`)
   - `notes` (VARCHAR(255))
   - `created_at` (TIMESTAMP)

3. **`forecasts`**:
   - `id` (INT, Primary Key, Auto Increment)
   - `user_id` (INT, Foreign Key $\rightarrow$ `users.id` ON DELETE CASCADE)
   - `forecast_date` (DATE)
   - `predicted_consumption` (DECIMAL(10,2))
   - `model_name` (VARCHAR(100), Default: `'Moving Average'`)
   - `horizon_days` (INT, Default: `1`)
   - `created_at` (TIMESTAMP)

---

## 🧪 Testing the Application

1. **Registration / Login**:
   - Navigate to `http://localhost:5173/register` and create an account.
   - Or run `database/seed.sql` and log in with `demo@example.com` / `password123`.
2. **Add Consumption Readings**:
   - Go to the **Consumption** page.
   - Click **Add Consumption** and record readings (e.g. 14.50 kWh, 15.20 kWh, 16.80 kWh).
   - Check in **MySQL Workbench** by running `SELECT * FROM electricity_readings;` to see your records immediately.
3. **Generate Forecast**:
   - Go to the **Forecast** page.
   - Choose a horizon (e.g., **7 Days**).
   - Click **Generate Forecast**.
   - View the dual-series chart comparing historical readings with future predictions.
   - Check in **MySQL Workbench** by running `SELECT * FROM forecasts;` to verify saved predictions.
4. **Inspect Dashboard & History**:
   - View the updated KPI statistics and weekday usage distributions on the **Dashboard**.
   - Manage past runs and delete individual records on the **Prediction History** page.

---

## 🔧 Troubleshooting Guide

- **Error: `ECONNREFUSED 127.0.0.1:3306`**:
  - Make sure your local MySQL Server service is running (e.g., via Windows Services or MySQL Workbench).
  - Verify that `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_PASSWORD` in `backend/.env` match your local MySQL configuration.
- **Error: `ER_ACCESS_DENIED_ERROR`**:
  - The password in `backend/.env` does not match the MySQL password for the specified user. Update `DB_PASSWORD` in `backend/.env` and restart the backend.
- **CORS Errors**:
  - The backend allows the configured `CLIENT_URL` and local development origins. Render sets `CLIENT_URL` to `https://electricity-consumption-forecasting.onrender.com`; frontend API requests use the `/api` path separately.
