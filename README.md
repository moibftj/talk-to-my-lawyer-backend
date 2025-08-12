
Built by https://www.blackbox.ai

---

# Talk To My Lawyer Backend

## Project Overview
The "Talk To My Lawyer" project is a comprehensive backend application developed using Node.js and Next.js. It implements an authentication system, user management, and various functionalities catering to legal documentation and services. The project also includes thorough testing scripts to ensure the proper functioning of the API endpoints.

## Installation
To set up this project locally, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/talk-to-my-lawyer.git
   cd talk-to-my-lawyer
   ```

2. **Install Dependencies:**
   Ensure you have Node.js installed (version 14.x or higher recommended).
   Then, install the required dependencies using npm:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**
   Create a `.env` file in the project root and define the necessary environment variables (like database connection strings).

4. **Run Migrations:**
   If applicable, run migration scripts to set up your database schema.

5. **Start the Application:**
   ```bash
   npm run dev
   ```

## Usage
- The backend will run at `http://localhost:3000` or on the specified port in your environment variables.
- Use tools like Postman or curl to interact with the API endpoints.
- API documentation is available within the project or can be generated with tools like Swagger.

## Features
- Comprehensive authentication system with role management (user, contractor, admin)
- User registration and login functionalities
- Generation and retrieval of legal letters
- Subscription management and payment integration
- Role-based access control (RBAC)
- Referral code functionalities
- Completely automated test suite leveraging Python for backend validation

## Dependencies
The project uses several key dependencies. The most notable in `package.json` include:

- **Node.js Modules:**
  - `next`: A React framework for server-rendered applications
  - `mongodb`: MongoDB driver for Node.js
  - `axios`: Promise-based HTTP client
  - `stripe`: Payment processing library
  - `jsonwebtoken`: Implementation for JSON Web Tokens
  - `bcryptjs`: Password hashing library

- **Development Dependencies:**
  - `eslint`: Linting utility for JavaScript and JSX
  - `tailwindcss`: Utility-first CSS framework
  - `@types/*`: Type definitions for various libraries to enhance TypeScript support

*Refer to `package.json` for a complete list of dependencies.*

## Project Structure
The project is organized as follows:

```
talk-to-my-lawyer/
│
├── app/                     # Main application files
│   ├── components/          # Reusable UI components
│   ├── pages/               # Route-based pages
│   └── api/                 # API route definitions
│
├── tests/                   # Test scripts
│   ├── auth_test.py         # Comprehensive authentication tests
│   ├── backend_test.py      # Admin dashboard functionality tests
│   ├── final_backend_test.py # Comprehensive API testing
│   ├── focused_backend_test.py # Critical endpoint testing
│   └── openai_test.py       # OpenAI integration testing
│
├── config/                  # Configuration files (e.g. `next.config.js`, `components.json`)
├── lib/                     # Business logic and utility functions
│
├── public/                  # Static files (images, fonts, etc.)
│
└── .env                     # Environment variables (not included in version control)
```

## Conclusion
This backend framework accommodates the needs of users seeking legal documentation and services. With extensive testing to ensure stability and reliability, it serves as a solid foundation for developing a comprehensive legal service application.

For contributions or issues, please refer to the [Contributing Guidelines](CONTRIBUTING.md) or [Report an Issue](ISSUE_TEMPLATE.md).