# User Management System Backend

This backend API is built using **Node.js** and **Express.js**. It provides the necessary endpoints for managing users, including adding, viewing, updating, and deleting users. Deleted users are marked as `Inactive` instead of being permanently removed.

## Features

1. **User CRUD Operations**
   - **Add User**: Create a new user with required fields.
   - **View Users**: Fetch all users or a single user by ID.
   - **Update User**: Update user details, including status.
   - **Delete User**: Mark a user as `Inactive` instead of permanent deletion.

2. **Field Validation**
   - **Required Fields**: `Name`, `Email`, and `Role`.
   - **Email Validation**: Ensures a valid email format.

3. **User Status Management**
   - Users have a `Status` field (`Active`/`Inactive`).

## Setup and Installation

### Prerequisites

- Node.js
- MongoDB (Ensure MongoDB service is running locally or remotely)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd user-management-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and configure the following variables:
   ```env
   MONGO_URI=mongodb://<username>:<password>@<host>:<port>/<database>
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm start
   ```

   The server will run on `http://localhost:3000` by default.

## API Endpoints

### 1. Add User
- **URL**: `/api/users/add`
- **Method**: `POST`
- **Description**: Add a new user.
- **Request Body**:
  ```json
  {
    "name": "Chandan Kumar",
    "email": "chandan@gmail.com",
    "role": "Admin"
  }
  ```
- **Response**:
  - **201**: User created successfully.
  - **400**: Missing required fields.
  - **500**: Server error.

### 2. Get All Users
- **URL**: `/api/users/list`
- **Method**: `GET`
- **Description**: Fetch all users.
- **Response**:
  - **200**: List of users.
  - **500**: Server error.

### 3. Get User by ID
- **URL**: `/api/users/list/:id`
- **Method**: `GET`
- **Description**: Fetch a single user by their ID.
- **Response**:
  - **200**: User details.
  - **404**: User not found.
  - **500**: Server error.

### 4. Update User
- **URL**: `/api/users/update/:id`
- **Method**: `PUT`
- **Description**: Update user details.
- **Request Body**:
  ```json
  {
    "name": "Chandan Kumar",
    "email": "c@gmail.com",
    "role": "Editor"
  }
  ```
- **Response**:
  - **200**: User updated successfully.
  - **404**: User not found.
  - **500**: Server error.

### 5. Delete User (Mark as Inactive)
- **URL**: `/api/users/delete/:id`
- **Method**: `DELETE`
- **Description**: Mark a user as `Inactive`.
- **Response**:
  - **200**: User status updated to `Inactive`.
  - **404**: User not found.
  - **500**: Server error.

### 6. Update User Status
- **URL**: `/api/users/update-status/:id`
- **Method**: `PUT`
- **Description**: Change the status of a user to `Inactive`.
- **Response**:
  - **200**: User status updated successfully.
  - **404**: User not found.
  - **500**: Server error.

## Directory Structure
```
project-root/
  models/
    user.js         # User schema definition
  routes/
    userRoutes.js   # API routes
  .env              # Environment variables
  server.js         # Server entry point
```

## User Model

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email'],
  },
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'Editor', 'Viewer'],
  },
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Inactive'],
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

## Error Handling
- **400**: Bad Request (e.g., missing or invalid fields).
- **404**: Resource not found (e.g., user not found).
- **500**: Internal Server Error.

## Further Improvements
- Add authentication and authorization.
- Implement logging and monitoring.
- Add unit and integration tests.

## License
This project is licensed under the MIT License.
