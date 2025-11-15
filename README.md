# Schoolgle Quest

Schoolgle Quest is a prototype game experience for UK schools that combines a 3D Minecraft-style virtual school world with real-world exploration and curriculum-aligned educational activities.

## Overview

The game generates unique 3D school worlds based on UK postcodes and encourages safe, supervised real-world exploration of local areas. Students complete quests that align with the curriculum, earning XP and leveling up while learning maths, spelling, reading, and local knowledge.

## Key Features

- **3D School World**: Procedurally generated Minecraft-style 3D school environments using Babylon.js
- **Postcode-Based Generation**: Each UK postcode generates a unique school world
- **Real-World Exploration**: Safe location discovery (parks, libraries, playgrounds)
- **Curriculum-Aligned Quests**: Mini-games covering maths, spelling, reading, and local knowledge
- **XP and Progression**: Level up system with rewards and achievements
- **Teacher Dashboard**: Quest creation and difficulty configuration (planned)
- **School Creatures**: Department-themed creatures (HR, Finance, GDPR, etc.)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **3D Engine**: Babylon.js
- **Database**: Supabase (PostgreSQL with PostGIS)
- **State Management**: Zustand
- **APIs**:
  - Postcodes.io (UK postcode data)
  - OpenStreetMap Overpass API (location data)
  - UK Schools API (planned)
- **CI/CD**: GitHub Actions
- **Runtime**: Node.js 20+

## Project Structure

```
schoolgle-quest/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── apps/
│   └── web/                    # Next.js web application
│       ├── src/
│       │   ├── app/           # Next.js app router pages
│       │   └── lib/           # Utilities, config, types
│       ├── public/            # Static assets
│       └── package.json
├── packages/
│   ├── shared/                # Shared TypeScript types
│   ├── game-logic/            # Quest, XP, creature logic
│   └── integration/           # External API clients
├── supabase/
│   └── schema.sql            # Database schema and migrations
├── package.json              # Root workspace config
├── tsconfig.base.json        # Base TypeScript config
└── .env.example             # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or pnpm
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/DSumm18/schoolgle-quest.git
cd schoolgle-quest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
- Create a new Supabase project
- Run the SQL in `supabase/schema.sql` in the Supabase SQL editor

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests (across all workspaces)

### Workspace Structure

This is a monorepo using npm workspaces:

- **apps/web**: Main Next.js application
- **packages/shared**: Shared TypeScript types and interfaces
- **packages/game-logic**: Game mechanics (XP, quests, creatures)
- **packages/integration**: External API clients (postcodes, schools, locations)

### Adding Dependencies

For workspace-specific dependencies:
```bash
npm install <package> --workspace web
npm install <package> --workspace @schoolgle/shared
```

For root dependencies:
```bash
npm install <package> -w
```

## Architecture

### Data Flow

1. User enters UK postcode
2. System fetches location data from Postcodes.io
3. Procedural generation creates unique 3D world
4. World data stored in Supabase
5. Babylon.js renders 3D scene
6. Quests generated based on location and curriculum
7. Player progress tracked in database

### Key Systems

**XP System** (`packages/game-logic`):
- Level-based progression
- XP rewards for quest completion
- Exponential level curve

**Quest System** (`packages/game-logic`):
- Multiple quest types (maths, spelling, reading, exploration)
- Difficulty levels (easy, medium, hard)
- Objective tracking

**Creature System** (`packages/game-logic`):
- Department-themed creatures
- Level-based stats
- Battle mechanics (planned)

**Integration Layer** (`packages/integration`):
- Postcode lookup and validation
- School search (placeholder)
- Safe location discovery

## Database Schema

The Supabase schema includes:

- **users**: Authentication and roles
- **schools**: School data with geospatial indexing
- **player_progress**: XP, level, inventory
- **quests**: Quest definitions
- **quest_objectives**: Quest goals and tracking
- **creatures**: Creature definitions
- **locations**: Real-world safe locations
- **world_data**: Generated 3D world data
- **buildings**: 3D building data

See `supabase/schema.sql` for full details.

## Roadmap

### Phase 1 (Current)
- [x] Project scaffolding
- [x] Basic architecture
- [x] Database schema
- [ ] Minimal 3D scene (one building, ground, camera)
- [ ] Postcode input UI
- [ ] Postcode API integration

### Phase 2
- [ ] Procedural world generation
- [ ] Multiple building types
- [ ] Creature spawning
- [ ] Basic quest system

### Phase 3
- [ ] Real-world location integration
- [ ] Quest creation UI (teacher)
- [ ] Mobile-friendly UI
- [ ] User authentication

### Phase 4
- [ ] Mini-games (maths, spelling, reading)
- [ ] Inventory system
- [ ] Achievements
- [ ] Leaderboards

## Contributing

This project is designed to be extended by both AI coding agents and human developers.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Safety and Safeguarding

This application is designed for school use with appropriate safeguarding measures:

- All real-world locations are filtered for safety (parks, libraries, playgrounds)
- Locations require adult supervision
- No personal data collection beyond educational progress
- GDPR compliant
- Teacher oversight and configuration

## License

[Add your license here]

## Support

For issues, questions, or contributions, please visit:
https://github.com/DSumm18/schoolgle-quest/issues

## Acknowledgments

- Babylon.js for 3D rendering
- Postcodes.io for UK postcode data
- OpenStreetMap for location data
- Supabase for backend infrastructure
