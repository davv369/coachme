# CoachMe

A NestJS application for trainers and athletes (mountain runners) built with **Hexagonal Architecture** (Ports and Adapters pattern).

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`

### Building

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── common/                    # Shared modules
│   ├── dto/                  # Data Transfer Objects
│   │   └── api-gateway/      # API Gateway DTOs
│   │       └── auth/         # Authentication DTOs
│   ├── logger/               # Logger service
│   └── error-handling/       # Exception filter and domain exceptions
├── modules/                   # Business modules
│   ├── api-gateway/          # API Gateway - single entry point
│   │   ├── application/      # Application layer (ports & services)
│   │   └── infrastructure/   # Infrastructure layer (adapters)
│   ├── auth/                 # Authentication & Authorization module
│   │   ├── application/      # Auth services, ports, decorators
│   │   ├── domain/           # JWT payload, user roles
│   │   └── infrastructure/   # JWT adapters, guards
│   └── users/                # User management module
│       ├── application/      # User services & ports
│       ├── domain/           # User entity
│       └── infrastructure/   # In-memory repository (for development)
├── app.module.ts             # Root module
└── main.ts                   # Application entry point
```

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (Ports and Adapters) principles:

- **Domain Layer**: Pure business logic, entities, and value objects
- **Application Layer**: Use cases, ports (interfaces), and services
- **Infrastructure Layer**: Adapters (HTTP controllers, repositories, external services)

### Key Principles

- **Ports**: Interfaces that define contracts (In-Ports for use cases, Out-Ports for dependencies)
- **Adapters**: Concrete implementations that connect to external systems
- **Dependency Inversion**: High-level modules depend on abstractions (ports), not concrete implementations
- **Module Isolation**: Each module is self-contained with its own ports and adapters

## 📦 Modules

### API Gateway

Single entry point for all HTTP requests. Routes requests to appropriate modules.

**Endpoints:**
- `GET /api` - Root endpoint
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/bootstrap` - Create first admin user
- `GET /api/me` - Get current user info (Authenticated)

### Auth Module

Handles authentication and authorization:
- JWT token generation and verification
- Role-based access control (TRAINER, ATHLETE, ADMIN)
- `@Authenticated()` decorator for protecting endpoints
- `@CurrentUser()` decorator for accessing authenticated user

### Users Module

Manages user data:
- User creation and retrieval
- Password hashing (bcrypt)
- In-memory storage (for development)

## 🔐 Authentication

### Creating the First Admin

Use the bootstrap endpoint to create the first admin user:

```bash
curl -X POST http://localhost:3000/api/auth/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword",
    "name": "Admin User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using Access Token

Include the token in the Authorization header:

```bash
curl -X GET http://localhost:3000/api/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Registering New Users (Admin Only)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trainer@example.com",
    "password": "password123",
    "name": "Trainer Name",
    "role": "TRAINER"
  }'
```

## 👥 User Roles

- **ADMIN**: Can create users (trainers and athletes)
- **TRAINER**: Can plan and manage training sessions
- **ATHLETE**: Can view and complete training sessions

## 🔧 Configuration

Environment variables (optional, defaults provided):

- `PORT` - Server port (default: 3000)
- `JWT_SECRET` - Secret key for JWT tokens (default: 'my-secret-key')
- `JWT_ACCESS_EXPIRES_IN` - Access token expiration (default: '1h')
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: '7d')

## 📚 API Documentation

Swagger documentation is available at:
```
http://localhost:3000/api/docs
```

## 🧪 Testing

```bash
npm test
```

## 📝 Code Quality

```bash
npm run lint
```

## 🛠️ Development

### Creating a New Module

Use the provided script:

```bash
./generate_module.sh my-module
```

Then:
1. Create domain entities in `src/modules/my-module/domain/`
2. Define ports in `src/modules/my-module/application/ports/`
3. Implement services in `src/modules/my-module/application/services/`
4. Create adapters in `src/modules/my-module/infrastructure/adapters/`
5. Add the module to `app.module.ts`
6. Update `tsconfig.json` and `jest.config.ts` with path mappings

## 📚 Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Typed JavaScript
- **jsonwebtoken** - JWT token handling
- **bcrypt** - Password hashing
- **class-validator** & **class-transformer** - DTO validation
- **@nestjs/swagger** - API documentation
- **ESLint & Prettier** - Code quality and formatting

## 🎯 Future Plans

- Database integration (PostgreSQL)
- Training session planning module
- Statistics and analytics
- Strava integration

## 📄 License

Private project
