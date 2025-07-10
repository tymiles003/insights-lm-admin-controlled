# InsightsLM Admin-Controlled Version

This is a modified version of InsightsLM designed for enterprise use cases where only administrators can manage content while regular users can query and interact with pre-approved documents.

## Key Changes from Original InsightsLM

### 1. Role-Based Access Control
- **Admin Role**: Full access to create, edit, and delete notebooks and sources
- **User Role**: Read-only access to assigned notebooks, can only interact via chat

### 2. Content Tagging System
- Tag notebooks and sources by client, brand, topic, or time period
- Users only see content tagged with permissions they've been granted
- Flexible permission system with optional expiration dates

### 3. Permission-Based Content Filtering
- Chat responses only include information from permitted sources
- Vector search respects user permissions
- Audio generation limited to accessible content

## Setup Instructions

### 1. Database Setup

Run the migrations in order:
```bash
npx supabase db push
```

The migrations will:
- Add role column to profiles table (admin/user)
- Create tags, notebook_tags, user_permissions, and source_tags tables
- Update RLS policies for role-based access
- Add necessary functions for permission checking

### 2. Initial Admin Setup

After deployment, you'll need to manually set at least one admin user:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin@email.com';
```

### 3. Environment Variables

Add the new edge function to your Supabase project:
```bash
npx supabase functions deploy send-chat-message-with-permissions
```

### 4. n8n Workflow Updates

Update your n8n workflows to:
- Accept tag_filters parameter in chat requests
- Filter vector search results by tag IDs
- Ensure document chunks include tag metadata

## Admin Guide

### Managing Content

1. **Creating Notebooks**
   - Login as admin
   - Click "Admin Panel" in dashboard
   - Go to "Notebooks" tab
   - Create notebook with appropriate tags

2. **Managing Tags**
   - Navigate to "Tags" tab in admin panel
   - Create tags for:
     - Clients (type: client)
     - Brands (type: brand)  
     - Topics (type: topic)
     - Time periods (type: time_period)

3. **Granting Permissions**
   - Go to "User Permissions" tab
   - Select user and tag
   - Optionally set expiration date
   - Click "Grant Permission"

### Content Organization Best Practices

1. **Client-Based Structure**
   ```
   Tag: "ClientA" (type: client)
   Notebooks:
   - ClientA Q1 Reports
   - ClientA Marketing Materials
   - ClientA Financial Data
   ```

2. **Time-Based Access**
   ```
   Tag: "Q4-2024" (type: time_period)
   Set expiration: End of Q1 2025
   ```

3. **Topic-Based Filtering**
   ```
   Tag: "Financial" (type: topic)
   Tag: "Marketing" (type: topic)
   Tag: "Operations" (type: topic)
   ```

## User Guide

### Accessing Content

1. **Login**: Users login with their credentials
2. **View Notebooks**: Only notebooks with granted permissions appear
3. **Chat Interface**: Ask questions about accessible content
4. **Citations**: All responses include verifiable source citations

### Example Queries

- "What were ClientA's Q4 results?"
- "Show me the marketing campaign performance for Brand X"
- "What happened in the December board meeting?"

The system will automatically filter responses based on your permissions.

## Technical Implementation Details

### Database Schema

**New Tables:**
- `tags`: Content categorization
- `notebook_tags`: Links notebooks to tags
- `user_permissions`: Grants users access to specific tags
- `source_tags`: Optional direct source tagging

**Modified Tables:**
- `profiles`: Added role column (admin/user)
- `notebooks`: Added is_public boolean flag

### Security Model

1. **Row Level Security (RLS)**
   - Admins can perform all CRUD operations
   - Users can only read permitted content
   - All policies check user role and permissions

2. **Edge Function Security**
   - `send-chat-message-with-permissions` validates access
   - Includes notebook_id for permission checking
   - Passes tag filters to n8n workflow

3. **Frontend Security**
   - UI elements hidden based on role
   - API calls will fail without proper permissions
   - No client-side security bypasses possible

### Component Changes

**New Components:**
- `AdminDashboard`: Complete admin interface
- `NotebookManagement`: Admin notebook CRUD
- `TagManagement`: Tag creation and editing
- `UserPermissions`: Permission granting interface
- `NotebookTagSelector`: Tag assignment UI

**Modified Components:**
- `Dashboard`: Added admin panel button
- `NotebookGrid`: Hide create button for users
- `EmptyDashboard`: Different messaging for users
- `NotebookHeader`: Disable editing for users
- `SourcesSidebar`: Hide add/delete for users
- `NotebookCard`: Hide delete for users

### Hooks and Services

**New Hook:**
- `useProfile`: Gets user profile with role information

**Modified Hooks:**
- `useChatMessages`: Includes notebook_id for permission checking

## Deployment Checklist

- [ ] Fork repository and clone locally
- [ ] Run database migrations
- [ ] Deploy new edge function
- [ ] Set initial admin user(s)
- [ ] Update n8n workflows for tag filtering
- [ ] Create initial tags
- [ ] Upload content and tag appropriately
- [ ] Grant user permissions
- [ ] Test permission-based filtering
- [ ] Verify chat responses respect permissions

## Customization Options

### Adding New Tag Types

1. Update the tag type enum in migration
2. Add new type to TagManagement component
3. Update UI to handle new type

### Custom Permission Logic

1. Modify `user_has_notebook_access` function
2. Add additional permission checks in edge functions
3. Update RLS policies as needed

### Integration Points

- **SSO Integration**: Add to AuthContext
- **Audit Logging**: Track admin actions
- **Analytics**: Monitor usage by tag/user
- **Automated Tagging**: ML-based content classification

## Troubleshooting

### Common Issues

1. **Users can't see any notebooks**
   - Check user has been granted permissions
   - Verify tags are properly assigned to notebooks
   - Check permission hasn't expired

2. **Chat returns no results**
   - Ensure notebook has sources uploaded
   - Verify n8n workflow includes tag filtering
   - Check vector embeddings were generated

3. **Admin features not showing**
   - Confirm user role is set to 'admin' in database
   - Clear browser cache and refresh
   - Check useProfile hook is returning correct role

### Debug Queries

Check user permissions:
```sql
SELECT u.email, t.name as tag_name, up.expires_at
FROM user_permissions up
JOIN profiles u ON u.id = up.user_id
JOIN tags t ON t.id = up.tag_id
WHERE u.email = 'user@example.com';
```

Check notebook tags:
```sql
SELECT n.title, t.name as tag_name
FROM notebooks n
JOIN notebook_tags nt ON nt.notebook_id = n.id
JOIN tags t ON t.id = nt.tag_id
WHERE n.title LIKE '%ClientA%';
```

## Support

For issues specific to the admin-controlled version:
1. Check this documentation first
2. Review the git diff against original InsightsLM
3. Test with a fresh user account
4. Verify all migrations ran successfully

Remember: This version prioritizes security and access control over ease of use. All content must be explicitly tagged and permissions granted for users to access it.