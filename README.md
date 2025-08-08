# IAM-Style Access Control System

This project is a full-stack web application that implements a simplified, yet powerful, Identity and Access Management (IAM) system. Inspired by cloud service providers, it allows for fine-grained control over application resources through a hierarchy of users, groups, and roles.

The core principle of this system is that **users inherit permissions exclusively through their membership in groups**. There are no direct user-to-role or user-to-permission assignments, ensuring a clean and manageable access control structure.

---

## Core Concepts

* **Users:** Individuals who can log in to the system.
* **Groups:** Collections of users. A user can belong to multiple groups.
* **Roles:** Sets of permissions that define what actions can be performed. Roles are assigned to groups.
* **Modules:** Business areas or resources within the application (e.g., "Users", "Billing", "Reports").
* **Permissions:** Specific actions that can be performed on a module (e.g., `create`, `read`, `update`, `delete`).

---

## 🚀 Features

* **User Management:** Full CRUD operations for users.
* **Group Management:** Create, edit, and delete groups, and manage user assignments to groups.
* **Role Management:** Define roles and assign them to groups.
* **Permission Granularity:** Assign specific `create`, `read`, `update`, `delete` permissions for each module to roles.
* **Secure JWT Authentication:** User registration and login with protected API routes.
* **Dynamic Permission Checking:** Middleware to verify user permissions for requested actions in real-time.
* **Permission Simulation:** A dedicated interface to test a user's ability to perform an action on a module.

---

## 💻 Technology Stack

* **Backend:** Node.js, Express.js
* **Database:** SQLite (in-memory for simplicity and portability)
* **Frontend:** React.js
* **State Management:** Redux Toolkit
* **Styling:** Tailwind CSS
* **API Communication:** Axios
* **Authentication:** JSON Web Tokens (JWT)

---

## 🌐 API Endpoints

The backend exposes the following RESTful API endpoints:

| Method | Endpoint                       | Description                                      |
| :----- | :----------------------------- | :----------------------------------------------- |
| `POST` | `/register`                    | Create a new user.                               |
| `POST` | `/login`                       | Authenticate a user and return a JWT.            |
| `GET`  | `/me/permissions`              | Fetch the current user's inherited permissions.  |
| `POST` | `/simulate-action`             | Test if the current user can perform an action.  |
| `CRUD` | `/users`                       | Manage users.                                    |
| `CRUD` | `/groups`                      | Manage groups.                                   |
| `POST` | `/groups/:groupId/users`       | Assign users to a group.                         |
| `CRUD` | `/roles`                       | Manage roles.                                    |
| `POST` | `/groups/:groupId/roles`       | Assign roles to a group.                         |
| `CRUD` | `/modules`                     | Manage modules.                                  |
| `CRUD` | `/permissions`                 | Manage permissions.                              |
| `POST` | `/roles/:roleId/permissions`   | Assign permissions to a role.                    |

*Note: `CRUD` implies `GET`, `POST`, `PUT`, and `DELETE` endpoints are available for that resource.*

---

## 🖥️ Frontend Pages

The React frontend is structured with the following pages for managing the system:

* `/login`: Login screen for user authentication.
* `/dashboard`: Main landing page, shows the current user's permissions and provides an interface to simulate actions.
* `/users`: Manage users (Create, Edit, Delete, View).
* `/groups`: Manage groups and assign users to them.
* `/roles`: Manage roles and assign them to groups.
* `/modules`: Manage application modules.
* `/permissions`: Manage permissions and assign them to roles.

---

## 🛠️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/CJcode6754/IAM-Style_Access_Control_System.git](https://github.com/CJcode6754/IAM-Style_Access_Control_System.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd IAM-Style_Access_Control_System
    ```

3.  **Install backend dependencies:**
    ```bash
    # Navigate to the frontend directory (e.g., /server)
    cd server
    npm install
    ```

4.  **Install frontend dependencies:**
    ```bash
    # Navigate to the frontend directory (e.g., /client)
    cd client
    npm install
    ```

5.  **Set up environment variables:**
    Create a `.env` file in the root directory for the backend server.
    ```
    NODE_ENV=development
    PORT=5000
    JWT_SECRET=your_jwt_secret_token
    JWT_EXPIRES_IN=24h
    CORS_ORIGIN=http:your_origin
    ```

6.  **Run the application:**
    You will need to run the backend and frontend servers concurrently.
    ```bash
    # Run the backend server (from the server directory)
    npm run dev

    # Run the frontend server (from the client directory)
    npm run dev
    ```

---

## 🧑‍💻 Usage

Once the application is running, you can access the frontend at `http://localhost:5173` (or your configured React port). The backend API will be available at `http://localhost:5000`.

### Admin Login

To get started, use the default administrative credentials:

* **Email:** `admin@system.com`
* **Password:** `admin123`

From the dashboard, you can navigate to the different management pages to configure the IAM system.

---
