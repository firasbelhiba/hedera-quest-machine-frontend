# Hedera Quest Machine

A production-quality, gamified learning platform for the Hedera ecosystem. This template provides a fully functional frontend with comprehensive quest management, user progress tracking, and admin capabilities.

## 🚀 Features

### User Features
- **Quest Discovery**: Browse and filter quests by category, difficulty, and completion status
- **Progress Tracking**: Personal dashboard with points, levels, streaks, and achievements
- **Submission System**: Dynamic forms supporting URLs, text, files, and Hedera-specific data
- **Leaderboard**: Competitive rankings with real-time updates
- **Badge System**: Collectible achievements with rarity levels
- **Profile Management**: Comprehensive user settings and Hedera account integration

### Admin Features
- **Dashboard Analytics**: Comprehensive metrics and visualizations
- **Quest Management**: CRUD operations for quest creation and editing
- **Submission Review**: Approval workflow with feedback system
- **User Management**: Monitor user activity and progress
- **Event Management**: Create hackathons, cohorts, and challenges

### Technical Features
- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: Zustand for global state
- **Form Handling**: React Hook Form with Zod validation
- **Responsive Design**: Mobile-first approach with dark/light themes
- **Mock Services**: Complete backend abstraction ready for API integration

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── quests/            # Quest-related pages
│   └── ...                # Other pages
├── components/            # Reusable UI components
│   ├── layout/           # Layout components (Sidebar, Header)
│   ├── quests/           # Quest-specific components
│   ├── submissions/      # Submission forms and displays
│   ├── badges/           # Badge display components
│   └── ui/               # shadcn/ui components
├── lib/                  # Core utilities and services
│   ├── types.ts          # TypeScript type definitions
│   ├── services.ts       # Mock service layer
│   ├── store.ts          # Zustand state management
│   ├── mock-data.ts      # Sample data for development
│   └── utils.ts          # Utility functions
```

## 🎯 Core Architecture

### Service Layer Abstraction
The application uses a complete service layer abstraction through `QuestService` class:
- All data operations go through service methods
- Easy transition from mock data to real APIs
- Consistent error handling and response formatting
- TypeScript interfaces match future API contracts

### State Management
Zustand provides lightweight, efficient state management:
- Global user authentication state
- Quest filters and selections
- UI state (sidebar, theme, etc.)
- Submission management

### Component Organization
Clean separation of concerns:
- Layout components handle navigation and structure
- Feature components focus on specific functionality
- UI components are reusable and consistent
- Business logic stays in services and stores

## 🔧 Getting Started

1. **Clone and Install**
```bash
git clone <repository-url>
cd hedera-quest-machine
npm install
```

2. **Development Server**
```bash
npm run dev
```

3. **Build for Production**
```bash
npm run build
```

## 🎨 Design System

### Color Scheme
- **Primary**: Purple gradient (Hedera brand)
- **Secondary**: Cyan accent
- **Success**: Green for completed states
- **Warning**: Yellow for pending states
- **Error**: Red for failed states

### Typography
- **Headings**: Inter font family, multiple weights
- **Body**: 16px base with 150% line height
- **Code**: Monospace for technical content

### Component Library
- **QuestCard**: Feature-rich cards with progress indicators
- **BadgeDisplay**: Rarity-based badge showcase
- **SubmissionForm**: Dynamic forms based on quest requirements
- **LeaderboardRow**: Ranked entries with change indicators

## 🔌 Backend Integration

### API Contracts
The service layer defines clear interfaces for backend integration:

```typescript
// Replace mock implementations in services.ts
class QuestService {
  static async getQuests(filters?: FilterOptions): Promise<Quest[]> {
    // Replace with: return await api.get('/quests', { params: filters });
    return mockQuests;
  }
  
  static async submitQuest(questId: string, userId: string, content: SubmissionContent): Promise<Submission> {
    // Replace with: return await api.post('/submissions', { questId, userId, content });
    return newMockSubmission;
  }
}
```

### Environment Variables
Add these to your `.env.local`:
```
NEXT_PUBLIC_API_URL=your-api-endpoint
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_USE_API=false
```

## 🌐 Hedera Integration

### Account Validation
Built-in validators for Hedera-specific data:
```typescript
QuestService.validateHederaAccountId('0.0.123456') // true
QuestService.validateTransactionId('0.0.123456@1234567890.123456789') // true
```

### HashScan Integration
Automatic URL generation for blockchain explorers:
```typescript
QuestService.generateHashScanUrl(accountId, 'testnet')
QuestService.generateTransactionUrl(transactionId, 'testnet')
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Touch-friendly 44px minimum tap targets
- Collapsible navigation
- Optimized form layouts
- Swipe-friendly card interfaces

## 🔐 Admin Features

### Role-Based Access
```typescript
// Sidebar automatically shows admin sections
<Sidebar userRole={user?.role} />

// Route protection in pages
if (user?.role !== 'admin') {
  return <Unauthorized />;
}
```

### Dashboard Analytics
- User engagement metrics
- Quest completion rates
- Submission approval workflows
- Category popularity analysis

## 🎮 Gamification Elements

### Progression System
- **Points**: Earned through quest completion
- **Levels**: Milestone-based progression
- **Streaks**: Daily activity tracking
- **Badges**: Achievement rewards with rarity tiers

### Engagement Features
- **Leaderboards**: Competitive rankings
- **Progress Visualization**: Charts and progress bars
- **Achievement Unlocks**: Badge collection system
- **Social Features**: Public profiles and sharing

## 🚀 Deployment

### Build Optimization
```bash
npm run build
```

### Static Export (for CDN deployment)
The app is configured for static export:
```javascript
// next.config.js
module.exports = {
  output: 'export',
  images: { unoptimized: true }
};
```

## 🤝 Contributing

1. Follow the established component patterns
2. Use TypeScript for all new code
3. Follow the service layer abstraction
4. Maintain responsive design principles
5. Add proper error handling
6. Update mock data as needed

## 📄 License

This project is open source and available under the MIT License.

---

## 🎯 Next Steps

1. **Backend Integration**: Replace mock services with real API calls
2. **Authentication**: Implement proper user authentication
3. **Real-time Updates**: Add WebSocket for live notifications
4. **File Upload**: Implement actual file upload functionality
5. **Payment Integration**: Add quest monetization features
6. **Mobile App**: Consider React Native version
7. **Analytics**: Integrate proper analytics tracking
8. **Testing**: Add comprehensive test suite

This template provides a solid foundation for building a production-ready Hedera learning platform. The clean architecture and comprehensive feature set make it ideal for hackathons, educational programs, and community initiatives.