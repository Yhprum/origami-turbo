# origami

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses SQLite with Drizzle ORM.

1. Start the local SQLite database:
```bash
cd apps/paper && bun db:local
```

2. Update your `.env` file in the `apps/paper` directory with the appropriate connection details if needed.

4. Apply the schema to your database:
```bash
bun db:push
```


Then, run the development server:

```bash
bun dev
```



The API is running at [http://localhost:3001](http://localhost:3001).



## Project Structure

```
origami-turbo/
├── apps/
│   └── origami/    # Frontend + user management server (Tanstack Start)
│   └── paper/      # Stock data API (Elysia)
```

## Available Scripts

- `bun dev`: Start both web and server in development mode
- `bun build`: Build both web and server
- `bun dev:web`: Start only the web application
- `bun dev:server`: Start only the server
- `bun check-types`: Check TypeScript types across all apps
- `bun db:push`: Push schema changes to database
- `bun db:studio`: Open database studio UI
- `cd apps/paper && bun db:local`: Start the local SQLite database
