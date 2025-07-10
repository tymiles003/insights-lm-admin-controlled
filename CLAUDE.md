# InsightsLM - AI Assistant Guide (Admin-Controlled Version)

## Project Overview

InsightsLM is an open-source alternative to Google's NotebookLM, designed as a powerful AI-powered research and knowledge management tool. This admin-controlled version implements role-based access control where only administrators can manage content while users have read-only access to permitted documents.

### Key Features
- **Multi-source Support**: Admin-only upload of PDFs, text files, websites, YouTube videos, and audio files
- **AI-Powered Chat**: Context-aware conversations grounded in permitted sources with verifiable citations
- **Audio Overviews**: Generate podcast-style audio summaries of accessible content
- **Note Taking**: Users can create notes in notebooks they have access to
- **Real-time Sync**: Live updates across sessions using Supabase subscriptions
- **Self-hosted**: Full control over your data and deployment
- **Role-Based Access**: Admin and User roles with different capabilities
- **Tag-Based Permissions**: Content organized by client, brand, topic with granular access control

### Target Use Cases
- Research and academic work
- Content analysis and summarization
- Knowledge base creation
- Document Q&A systems
- Educational content exploration
- Business intelligence gathering

## Architecture & Tech Stack

### Frontend Architecture
```
React 18 + TypeScript + Vite
├── UI Layer: shadcn/ui components + Tailwind CSS
├── State Management: React Query (TanStack Query)
├── Routing: React Router v6
├── Forms: React Hook Form + Zod validation
└── Real-time: Supabase subscriptions
```

### Backend Architecture
```
Supabase Platform
├── Database: PostgreSQL with pgvector extension
├── Authentication: Supabase Auth
├── Storage: Supabase Storage for files
├── Edge Functions: Deno-based serverless functions
└── Workflow Automation: n8n for complex AI operations
```

### Database Schema

```sql
Key Tables:
- profiles: User profile information (includes role: admin/user)
- notebooks: Main notebook entities with metadata (includes is_public flag)
- sources: Content sources (PDFs, text, URLs, YouTube, audio)
- notes: User-created notes within notebooks (includes user_id)
- n8n_chat_histories: Chat conversation storage
- notebook_embeddings: Vector embeddings for semantic search
- tags: Content categorization (client, brand, topic, time_period)
- notebook_tags: Links notebooks to tags
- user_permissions: Grants users access to specific tags
- source_tags: Optional direct source tagging
```

### Authentication Flow
1. User signs up/logs in via Supabase Auth
2. Session stored in localStorage and managed by AuthContext
3. Protected routes check authentication status
4. User role (admin/user) loaded via useProfile hook
5. Row-level security enforced at database level with role checks
6. Permissions validated for content access
7. Automatic session refresh and error handling

## Development Guidelines

### Project Structure
```
/src
├── /components      # UI components organized by feature
│   ├── /admin      # Admin-only components (AdminDashboard, TagManagement, etc.)
│   ├── /auth       # Authentication components
│   ├── /chat       # Chat interface components
│   ├── /dashboard  # Dashboard components
│   ├── /notebook   # Notebook feature components
│   └── /ui         # shadcn/ui base components
├── /hooks          # Custom React hooks for business logic
├── /pages          # Route-level components
├── /contexts       # React contexts (AuthContext)
├── /services       # Service layer (authService)
├── /types          # TypeScript type definitions
└── /lib            # Utility functions
```

### Component Patterns

```typescript
// Standard component structure
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  notebookId: string;
  onUpdate?: () => void;
}

export function MyComponent({ notebookId, onUpdate }: ComponentProps) {
  // 1. Hooks at the top
  const [state, setState] = useState('');
  const { data, isLoading } = useQuery({...});
  
  // 2. Event handlers
  const handleClick = () => {...};
  
  // 3. Render logic
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="space-y-4">
      {/* Component content */}
    </div>
  );
}
```

### Hook Patterns

```typescript
// Custom hook for data management
export function useNotebooks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Query for fetching data
  const notebooksQuery = useQuery({
    queryKey: ['notebooks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  // Mutation for creating data
  const createNotebook = useMutation({
    mutationFn: async (name: string) => {
      // Implementation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
    },
  });
  
  // Real-time subscription
  useEffect(() => {
    const channel = supabase.channel('notebooks-changes')
      .on('postgres_changes', {...}, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      })
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, []);
  
  return {
    notebooks: notebooksQuery.data,
    isLoading: notebooksQuery.isLoading,
    createNotebook: createNotebook.mutate,
  };
}
```

### TypeScript Usage

```typescript
// Always define types for props and data
interface Source {
  id: string;
  notebook_id: string;
  type: 'pdf' | 'text' | 'website' | 'youtube' | 'audio';
  title: string;
  content?: string;
  metadata?: Record<string, any>;
}

// Use type guards for runtime checks
function isPdfSource(source: Source): source is Source & { type: 'pdf' } {
  return source.type === 'pdf';
}

// Leverage Supabase generated types
import { Database } from '@/integrations/supabase/types';
type NotebookRow = Database['public']['Tables']['notebooks']['Row'];
```

### Error Handling

```typescript
// Consistent error handling pattern
try {
  const result = await someOperation();
  toast.success('Operation completed');
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  toast.error('Something went wrong. Please try again.');
  throw error; // Re-throw for React Query to handle
}
```

## Key Implementation Details

### Adding New Source Types (Admin Only)

**Note**: In the admin-controlled version, only administrators can add new source types and upload content.

1. **Update Database Schema** (`supabase/migrations/`)
   - Add new source type to enum or create new table
   - Update relevant views and functions
   - Ensure RLS policies restrict to admin role

2. **Create Input Component** (`src/components/notebook/`)
   ```typescript
   export function NewSourceInput({ notebookId, onSourceAdded }: Props) {
     const { isAdmin } = useProfile();
     
     if (!isAdmin) return null;
     
     // Implementation following existing patterns
   }
   ```

3. **Add Processing Logic** (`supabase/functions/`)
   - Create edge function for initial processing
   - Add role check at the beginning
   - Update n8n workflow for content extraction

4. **Update UI Components**
   - Add to AddSourcesDialog tabs (visible to admins only)
   - Update SourceCard for display
   - Add icon mapping in getFileTypeIcon
   - Hide upload UI elements for non-admin users

### Chat Functionality with RAG (Permission-Based)

The chat system uses Retrieval-Augmented Generation (RAG) with permission filtering:

1. **Message Flow**:
   - User sends message → Edge function validates permissions → n8n webhook
   - Edge function includes notebook_id and tag_filters
   - n8n performs vector search on embeddings filtered by user's tags
   - Only permitted content chunks retrieved
   - LLM generates response with citations from accessible sources
   - Response stored and returned to UI

2. **Permission Validation**:
   - `send-chat-message-with-permissions` checks user access
   - Uses `user_has_notebook_access` database function
   - Filters results by user's permitted tags

3. **Citation System**:
   - Each response includes source references
   - Citations only from permitted sources
   - SourceContentViewer displays full context if user has access

### Audio Generation Workflow

1. User clicks "Generate Audio Overview"
2. Edge function triggers n8n podcast workflow
3. n8n:
   - Aggregates all notebook sources
   - Generates podcast script
   - Converts to audio using TTS
   - Uploads to Supabase Storage
4. Audio URL stored in notebook record
5. UI updates with AudioPlayer component

### Real-time Updates Pattern

```typescript
// Standard pattern for real-time subscriptions
useEffect(() => {
  const channel = supabase
    .channel(`table-name-${id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'table_name',
        filter: `column=eq.${id}`,
      },
      (payload) => {
        // Handle the change
        queryClient.invalidateQueries({ queryKey: ['data-key'] });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [id, queryClient]);
```

## Common Tasks & Workflows

### Admin Tasks

1. **Setting Up Content for a New Client**:
   - Create client tag (type: 'client')
   - Create notebooks for client content
   - Upload documents and tag appropriately
   - Grant user permissions to client tag
   - Test access with a user account

2. **Managing User Access**:
   - Navigate to Admin Panel → User Permissions
   - Select user and relevant tags
   - Set expiration dates for temporary access
   - Monitor usage through database queries

3. **Content Organization Best Practices**:
   - Use consistent tag naming (e.g., "Client-ABC", "Q4-2024")
   - Create separate notebooks for different content types
   - Tag content at creation time
   - Document tag meanings in descriptions

### Adding a New Feature

1. **Plan the feature**:
   - Identify required database changes
   - Consider role-based access requirements
   - Design component structure with permissions in mind
   - Plan API endpoints/edge functions with role checks

2. **Implementation order**:
   - Database migrations first (including RLS policies)
   - Edge functions with permission validation
   - Update n8n workflows for filtering
   - Frontend hooks with role awareness
   - UI components with conditional rendering
   - Integration and testing for both roles

### Modifying UI Components

1. Check if it's a shadcn/ui component in `/components/ui`
2. For custom components, maintain existing patterns:
   - Use Tailwind classes for styling
   - Follow accessibility guidelines
   - Keep components focused and reusable

### Working with Supabase

```typescript
// Always use the typed client
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

// Check user role before operations
const { isAdmin } = useProfile();

// RLS-aware queries
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('user_id', user.id); // RLS handles authorization

// File uploads
const { data, error } = await supabase.storage
  .from('bucket-name')
  .upload(path, file);
```

### Integrating with n8n Workflows

1. Create edge function to receive request
2. Validate and prepare webhook payload
3. Send to n8n webhook URL with auth
4. Handle response and update database
5. Return result to frontend

## Testing & Deployment

### Current State
- No formal test suite implemented
- Manual testing approach
- TypeScript provides type safety

### Recommended Testing Strategy
```bash
# Add testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Create test structure
/src
├── /__tests__
│   ├── /components
│   ├── /hooks
│   └── /utils
```

### Environment Setup

Required environment variables:
```env
# Frontend (.env.local)
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Edge Functions (Supabase Dashboard)
N8N_WEBHOOK_URL=your-n8n-instance
WEBHOOK_SECRET=your-secret-key
```

### Deployment Considerations

1. **Frontend**: Deploy to Vercel/Netlify
2. **Supabase**: Use Supabase CLI for migrations
3. **n8n**: Self-host or use n8n.cloud
4. **Security**: Configure CORS and auth properly

## Customization Guide

### For Client Adaptations

1. **Branding**:
   - Update `index.html` title and meta tags
   - Modify theme colors in `tailwind.config.ts`
   - Replace logo components
   - Customize UI component styles

2. **Feature Configuration**:
   ```typescript
   // Create feature flags
   const FEATURES = {
     audioGeneration: true,
     youtubeImport: true,
     publicSharing: false,
   };
   ```

3. **Custom Source Types**:
   - Extend source type enum
   - Create custom processors
   - Add UI components
   - Update workflows

4. **API Integration Points**:
   - Edge functions for external APIs
   - n8n for complex integrations
   - Webhook handlers for third-party services

### White-label Considerations

1. Remove InsightsLM branding
2. Update authentication UI
3. Customize email templates
4. Configure custom domains
5. Adjust feature set per client needs

## Sub-agent Work Patterns

### Parallel Processing Strategies

When working on this codebase, leverage parallel operations:

```typescript
// Good: Parallel file reads
const [component, hook, types] = await Promise.all([
  readFile('component.tsx'),
  readFile('useData.tsx'),
  readFile('types.ts'),
]);

// Good: Parallel Supabase queries
const [notebooks, sources, notes] = await Promise.all([
  supabase.from('notebooks').select('*'),
  supabase.from('sources').select('*'),
  supabase.from('notes').select('*'),
]);
```

### Task Delegation Guidelines

1. **Search Operations**:
   - Use sub-agents for broad pattern searches
   - Delegate file discovery to parallel agents
   - Coordinate results for comprehensive analysis

2. **Code Generation**:
   - One agent for component structure
   - Another for business logic hooks
   - Third for type definitions
   - Coordinate for consistent implementation

3. **Refactoring Tasks**:
   - Analyze impact across codebase in parallel
   - Delegate changes by module
   - Coordinate for atomic commits

### Efficient Codebase Exploration

```bash
# Quick navigation commands
# Find all components using a specific hook
grep -r "useNotebooks" src/components/

# Locate all API endpoints
find supabase/functions -name "index.ts"

# Identify all n8n workflow integrations
grep -r "N8N_WEBHOOK_URL" supabase/functions/
```

## New Hooks and Components (Admin-Controlled)

### Key Hooks

1. **useProfile** - Gets user profile with role information
   ```typescript
   const { profile, isAdmin, isUser } = useProfile();
   ```

2. **Modified Hooks** - Include permission checks:
   - `useNotebooks` - Filters based on user permissions
   - `useChatMessages` - Includes notebook_id for validation

### Admin Components

Located in `/src/components/admin/`:
- **AdminDashboard** - Main admin interface
- **NotebookManagement** - Create/manage notebooks
- **TagManagement** - CRUD operations for tags
- **UserPermissions** - Grant/revoke access
- **NotebookTagSelector** - Assign tags to notebooks

### Modified Components

All components check `isAdmin` for conditional rendering:
- Upload buttons hidden for non-admins
- Edit capabilities restricted
- Delete options admin-only

## Important Patterns to Maintain

1. **Always use TypeScript** - No JavaScript files
2. **Component composition** - Small, focused components
3. **Custom hooks** for business logic
4. **Consistent error handling** with toast notifications
5. **Role checks** at component level
6. **Permission validation** in edge functions
7. **Tag-based filtering** in database queries
5. **Real-time updates** where appropriate
6. **Secure by default** - Use RLS and auth checks
7. **Mobile-responsive** - Test on various screen sizes

## Common Pitfalls to Avoid

1. Don't bypass Supabase RLS
2. Don't store sensitive data in frontend
3. Don't create large, monolithic components
4. Don't ignore TypeScript errors
5. Don't forget to clean up subscriptions
6. Don't make synchronous chains of API calls

## Quick Reference

### Key Files
- `/src/App.tsx` - Main app structure
- `/src/contexts/AuthContext.tsx` - Authentication logic
- `/src/hooks/useNotebooks.tsx` - Notebook data management
- `/supabase/migrations/` - Database schema
- `/n8n/` - Workflow definitions

### Common Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run preview      # Preview production build

# Supabase commands
npx supabase start   # Start local Supabase
npx supabase db push # Push migrations
```

### Debugging Tips
1. Check browser console for errors
2. Verify Supabase RLS policies
3. Check n8n workflow execution logs
4. Use React Query DevTools
5. Monitor network requests

---

This guide should help you efficiently work with and customize the InsightsLM codebase. Remember to maintain the established patterns and focus on creating a great user experience for your clients.