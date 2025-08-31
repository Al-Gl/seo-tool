# SEO Analyzer Frontend

A modern, responsive frontend for the SEO Analysis Platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🎯 **Modern UI/UX**: Clean, professional design with smooth animations
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- ⚡ **Performance Optimized**: Built with Next.js 14 for optimal loading speeds
- 🔧 **TypeScript**: Full type safety throughout the application
- 🎨 **Tailwind CSS**: Utility-first CSS framework with custom design system
- 📊 **Data Visualization**: Interactive charts and progress indicators
- ♿ **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- 🔄 **Real-time Updates**: Live progress tracking during analysis
- 📄 **PDF Export**: Generate professional SEO reports
- 🔗 **Share Results**: Easy sharing of analysis results

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 3001

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── charts/         # Chart components
│   ├── layout/         # Layout components (Header, Footer)
│   ├── URLInput.tsx    # URL input form component
│   ├── ProgressTracker.tsx  # Analysis progress component
│   └── ResultsDashboard.tsx # Results display component
├── hooks/              # Custom React hooks
│   ├── useAnalysis.ts  # Analysis-related hooks
│   └── usePrompts.ts   # Prompt management hooks
├── lib/                # Utility functions
│   ├── api.ts          # API client and endpoints
│   └── utils.ts        # Helper functions
├── pages/              # Next.js pages
│   ├── analysis/       # Analysis results pages
│   ├── _app.tsx        # App wrapper
│   ├── _document.tsx   # Document wrapper
│   ├── index.tsx       # Landing page
│   ├── 404.tsx         # 404 error page
│   └── 500.tsx         # 500 error page
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS and custom styles
└── types/              # TypeScript type definitions
    └── index.ts        # Application types
```

## Key Components

### URLInput Component
- URL validation and formatting
- Analysis type selection
- Custom prompt input for tailored analysis
- Form validation with real-time feedback

### ProgressTracker Component  
- Real-time progress visualization
- Step-by-step progress indication
- Estimated completion time
- Cancel analysis functionality

### ResultsDashboard Component
- SEO score visualization with circular progress
- Issues categorized by severity (Critical, Warning, Suggestion)
- Interactive charts showing score breakdown
- Actionable recommendations with priority levels
- PDF export functionality
- Share results capability

## API Integration

The frontend communicates with the backend API through:

- **POST /api/analyze** - Submit new analysis
- **GET /api/analyze/:id** - Get analysis results
- **GET /api/analyze/:id/status** - Get analysis status
- **DELETE /api/analyze/:id** - Cancel analysis
- **GET /api/reports/:id/pdf** - Download PDF report

## Responsive Design

The application is fully responsive with:

- **Mobile-first approach** with progressive enhancement
- **Flexible grid layouts** that adapt to screen sizes
- **Touch-friendly interfaces** on mobile devices
- **Optimized navigation** with collapsible mobile menu
- **Readable typography** across all device sizes

## Accessibility Features

- **WCAG 2.1 AA compliant**
- **Keyboard navigation** support
- **Screen reader** compatibility with proper ARIA labels
- **High contrast** color schemes
- **Focus indicators** for all interactive elements
- **Semantic HTML** structure

## Performance Optimizations

- **Code splitting** with Next.js dynamic imports
- **Image optimization** with Next.js Image component
- **Bundle analysis** and optimization
- **Lazy loading** for non-critical components
- **Caching strategies** with React Query
- **Optimized fonts** with preloading

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_APP_ENV` | App environment | `development` |

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new components
3. Ensure responsive design on all screen sizes
4. Add proper accessibility attributes
5. Test on multiple browsers and devices
6. Write meaningful commit messages

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions) 
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## License

This project is part of the SEO Analyzer platform.