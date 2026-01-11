# CoachMe

A NestJS application for trainers and athletes (mountain runners) built with **Hexagonal Architecture** (Ports and Adapters pattern).

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for database)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start PostgreSQL database:

```bash
docker-compose -f docker/docker-compose.dev.yml up -d
```

3. Run database migrations:

```bash
npm run migrate:latest
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
│   │   ├── api-gateway/      # API Gateway DTOs
│   │   │   └── auth/         # Authentication DTOs
│   │   ├── exercises/        # Exercise DTOs
│   │   └── training-plans/   # Training Plan DTOs
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
│   ├── users/                # User management module
│   │   ├── application/      # User services & ports
│   │   ├── domain/           # User entity
│   │   └── infrastructure/   # Database repository
│   ├── exercises/            # Exercises module
│   │   ├── application/      # Exercise services & ports
│   │   ├── domain/           # Exercise entity, WorkoutType enum
│   │   └── infrastructure/   # Database repository & adapters
│   └── training-plans/       # Training Plans module
│       ├── application/      # Training plan services & ports
│       ├── domain/           # TrainingPlan & Workout entities
│       └── infrastructure/   # Database repositories & adapters
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
- `POST /api/exercises` - Create exercise (Trainer only)
- `GET /api/exercises` - List exercises
- `GET /api/exercises/:id` - Get exercise by ID
- `POST /api/training-plans` - Create training plan (Trainer only)
- `GET /api/training-plans` - List training plans
- `GET /api/training-plans/:id` - Get training plan by ID
- `PATCH /api/training-plans/:id` - Update training plan (Trainer only)
- `POST /api/training-plans/:id/workouts` - Add workout to plan (Trainer only)
- `GET /api/training-plans/:id/workouts` - Get workouts from plan
- `PATCH /api/training-plans/:id/workouts/:workoutId` - Update workout (Trainer only)
- `DELETE /api/training-plans/:id/workouts/:workoutId` - Remove workout (Trainer only)

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
- PostgreSQL database storage

### Exercises Module

Manages exercise templates:
- Exercise creation with parameter templates (schema + defaults)
- Support for multiple workout types (RUNNING, CYCLING, SWIMMING, STRENGTH, HIKING, RECOVERY)
- Exercises can be trainer-specific or global/system templates
- Editable parameters per exercise (distance, pace, repetitions, etc.)

### Training Plans Module

Manages training plans and workouts:
- Training plan creation with status management (DRAFT, ACTIVE, COMPLETED, PAUSED)
- Workout management - adding exercise instances to plans
- Trainers can extend plans over time by adding new workouts
- Workouts are always part of a training plan (not standalone)

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

## 🗄️ Database Setup

### Environment Configuration

Create a `.env` file in the project root with the following variables (or use the defaults):

```env
# Database
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=coachme
DB_SSL=false

# Strava Integration (optional)
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
STRAVA_WEBHOOK_VERIFY_TOKEN=STRAVA
```

### Using Docker Compose (Recommended)

Start PostgreSQL database:

```bash
docker-compose -f docker/docker-compose.dev.yml up -d
```

This will start PostgreSQL 15 on port 5433 with:
- Database: `coachme`
- User: `postgres`
- Password: `postgres`

### Running Migrations

After starting the database, run migrations:

```bash
npm run migrate:latest
```

To rollback the last migration:

```bash
npm run migrate:rollback
```

To create a new migration:

```bash
npm run migrate:make migration_name
```

### Manual Database Setup

If you prefer to set up PostgreSQL manually:

1. Create a database named `coachme`
2. Update `.env` file with your database credentials
3. Run migrations: `npm run migrate:latest`

## 🔧 Configuration

Environment variables (optional, defaults provided):

### Server
- `PORT` - Server port (default: 3000)

### JWT
- `JWT_SECRET` - Secret key for JWT tokens (default: 'my-secret-key')
- `JWT_ACCESS_EXPIRES_IN` - Access token expiration (default: '1h')
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: '7d')

### Database
- `DB_HOST` - Database host (default: 'localhost')
- `DB_PORT` - Database port (default: 5433)
- `DB_USER` - Database user (default: 'postgres')
- `DB_PASSWORD` - Database password (default: 'postgres')
- `DB_NAME` - Database name (default: 'coachme')
- `DB_SSL` - Enable SSL connection (default: 'false')

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
- **PostgreSQL 15** - Relational database
- **Knex.js** - SQL query builder and migrations
- **jsonwebtoken** - JWT token handling
- **bcrypt** - Password hashing
- **class-validator** & **class-transformer** - DTO validation
- **@nestjs/swagger** - API documentation
- **ESLint & Prettier** - Code quality and formatting

## 🎯 Future Plans

- ✅ Database integration (PostgreSQL) - **COMPLETED**
- ✅ Exercises module - **COMPLETED**
- ✅ Training Plans module - **COMPLETED**
- Statistics and analytics
- ✅ Strava integration - **COMPLETED**
- ✅ Training session execution tracking - **COMPLETED**
- AI Trainer Assistant (generates training plans based on data analysis)
- PDF report generation (draft review workflow)



## 🔗 Strava Integration

For detailed Strava integration setup and testing instructions, see [STRAVA_SETUP.md](./STRAVA_SETUP.md).

### Quick Start

1. **Add Strava credentials to `.env`:**
   ```env
   STRAVA_CLIENT_ID=your_strava_client_id
   STRAVA_CLIENT_SECRET=your_strava_client_secret
   STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
   STRAVA_WEBHOOK_VERIFY_TOKEN=STRAVA
   ```

2. **Run migrations:**
   ```bash
   npm run migrate:latest
   ```

3. **Connect Strava account:**
   - Login as athlete
   - Call: `GET /api/strava/authorize`
   - Authorize in Strava
   - You'll be redirected back and account will be connected

4. **Sync activities:**
   ```bash
   POST /api/strava/sync
   Authorization: Bearer <athlete_token>
   ```

### Available Endpoints

- `GET /api/strava/authorize` - Start OAuth flow
- `GET /api/strava/callback` - OAuth callback (handled automatically)
- `POST /api/strava/sync` - Manually sync activities
- `POST /api/strava/sync/:activityId` - Sync specific activity
- `POST /api/strava/disconnect` - Disconnect Strava account
- `GET /api/strava/webhook` - Webhook verification
- `POST /api/strava/webhook` - Webhook handler (automatic sync)

## 📄 License

Private project
