> CSCI3100 Project of Group B7
> https://github.com/Ivan103099/CSCI3100-Project

---

# Finawise

A personal finance management web application.

## Features

- Overview with Charts
- Categorized Transactions
- Budgets for Expense Categories
- GraphQL API for Data Access
- JWT Authentication via Cookie
- Rate Limited API Endpoints
- User Account & License Key System

## Stack

### Frontend

Written in TypeScript

- User Interface
  - React + Tailwind
  - React Aria Components
- Environment
  - Vite: build tool
  - Biome: linter & formatter

### Backend

Written in Go

- Server
  - in-house `net/http` wrapper
    - `github:tnychn/httpx`
  - router
    - `github:gorilla/mux`
- API
  - GraphQL layer
    - `github:99designs/gqlgen`
- Security
  - Encryption
    - passwords encrypted with bcrypt
      - `golang.org/x/crypto/bcrypt`
  - Rate Limiting
    - token bucket with bursts
      - `golang.org/x/time/rate`
  - Authentication
    - JWT passed as Cookie
      - `github:golang-jwt/jwt`
- Database
  - SQLite
    - `modernc.org/sqlite3`
  - in-house query builder (lightweight ORM)
    - `github:tnychn/sq`

## Getting Started

### Building

```bash
./build.sh
```

### Developing

```bash
cd web && npm start

cd server && go run ./main.go -debug
```

#### Environment

```bash
# url to vite dev server for enabling cors
URL="http://localhost:8080"

HOST=""
PORT=6969

# url to database (sqlite file)
DATABASE_URL="./finawise.db"

SECRET="<secret>" # secret key for jwt
```

#### Branches

- `main`: trunk for major releases
- `develop`: for active development, merges to `main` when ready
- `test`: for test case
