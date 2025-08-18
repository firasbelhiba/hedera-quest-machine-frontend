# Hedera Quest Machine

A gamified learning platform for Hedera blockchain development.

## Features

- **Quest System**: Complete challenges and earn points
- **Badge System**: Earn badges for achievements
- **Leaderboard**: Compete with other developers
- **Admin Panel**: Manage quests, badges, and submissions
- **User Profiles**: Track progress and achievements

## Badge Management

### Creating Badges

The platform includes a comprehensive badge management system for administrators. Badges can be created with the following properties:

#### Required Fields:
- **Name**: Badge name (max 100 characters)
- **Description**: Badge description (max 500 characters)
- **Max to Obtain**: Maximum number of times this badge can be earned (1-1000)
- **Rarity**: Badge rarity level (common, rare, epic, legendary)
- **Points**: Points awarded when badge is earned (0-10000)

#### Optional Fields:
- **Image URL**: URL to badge image
- **Active Status**: Whether the badge is currently active

#### Rarity Levels:
- **Common**: Easily obtainable badges
- **Rare**: Harder to obtain badges
- **Epic**: Very rare and valuable badges
- **Legendary**: Extremely rare and prestigious badges

### API Endpoints

#### Create Badge
```
POST /badges
```

**Request Body:**
```json
{
  "name": "First Quest Badge",
  "description": "Awarded for completing your first quest",
  "maxToObtain": 1,
  "rarity": "common",
  "points": 10,
  "image": "https://example.com/badge.png",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "First Quest Badge",
    "description": "Awarded for completing your first quest",
    "image": "https://example.com/badge.png",
    "maxToObtain": 1,
    "rarity": "common",
    "points": 10,
    "isActive": true,
    "createdBy": 1,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  },
  "message": "Badge created successfully by admin"
}
```

### Usage

1. Navigate to the Admin Panel
2. Click on "Manage Badges" in the sidebar
3. Use the "Create Badge" form to add new badges
4. View and manage existing badges in the badges list

### Components

- `CreateBadgeForm`: Form component for creating new badges
- `BadgeDisplay`: Reusable component for displaying badges
- `AdminBadgesPage`: Admin page for badge management

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   NEXT_PUBLIC_API_URL=your_api_url_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Forms**: React Hook Form, Zod validation
- **HTTP Client**: Axios
- **State Management**: Zustand
- **Icons**: Lucide React

## Project Structure

```
project/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   │   ├── badges/        # Badge management
│   │   ├── quests/        # Quest management
│   │   └── ...
│   ├── quests/            # User quest pages
│   └── ...
├── components/            # Reusable components
│   ├── admin/            # Admin-specific components
│   ├── badges/           # Badge-related components
│   └── ui/               # UI components
├── lib/                  # Utilities and API
│   ├── api/              # API client and endpoints
│   └── types.ts          # TypeScript types
└── ...
```