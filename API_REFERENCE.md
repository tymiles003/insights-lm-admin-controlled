# API Reference - Admin-Controlled InsightsLM

This document describes the API endpoints and database functions added in the admin-controlled version of InsightsLM.

## Edge Functions

### send-chat-message-with-permissions

Enhanced chat endpoint that validates user permissions before processing messages.

**Endpoint**: `/functions/v1/send-chat-message-with-permissions`

**Method**: POST

**Headers**:
```
Authorization: Bearer [supabase-anon-key]
Content-Type: application/json
```

**Request Body**:
```json
{
  "session_id": "notebook-uuid",
  "message": "User's question",
  "user_id": "user-uuid",
  "notebook_id": "notebook-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "response": "AI response with citations",
    "citations": [...]
  }
}
```

**Error Responses**:
- `403 Forbidden`: User doesn't have access to notebook
- `500 Internal Server Error`: Processing error

**Permission Check**:
- Validates user has access via `user_has_notebook_access` function
- Retrieves notebook tags for filtering
- Passes tag filters to n8n webhook

## Database Functions

### user_has_notebook_access

Checks if a user has permission to access a specific notebook.

**Definition**:
```sql
CREATE OR REPLACE FUNCTION public.user_has_notebook_access(
  notebook_id UUID,
  user_id UUID
) RETURNS BOOLEAN
```

**Parameters**:
- `notebook_id`: The notebook to check access for
- `user_id`: The user requesting access

**Returns**: `BOOLEAN`
- `true` if user has access (owner, admin, or has permission via tags)
- `false` if no access

**Usage Example**:
```sql
SELECT user_has_notebook_access(
  'notebook-uuid'::UUID,
  'user-uuid'::UUID
);
```

### get_accessible_notebooks

Returns all notebooks a user can access based on permissions.

**Definition**:
```sql
CREATE OR REPLACE FUNCTION public.get_accessible_notebooks()
RETURNS SETOF public.notebooks
```

**Returns**: Set of notebook records

**Access Logic**:
1. User's own notebooks
2. Public notebooks
3. Notebooks tagged with user's permitted tags
4. All notebooks for admins

**Usage Example**:
```sql
SELECT * FROM get_accessible_notebooks();
```

### is_admin

Checks if the current authenticated user is an admin.

**Definition**:
```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
```

**Returns**: `BOOLEAN`
- `true` if current user has admin role
- `false` otherwise

**Usage Example**:
```sql
SELECT is_admin();
```

## Database Tables

### profiles (modified)

Added role column for access control.

**New Column**:
```sql
role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user'))
```

### notebooks (modified)

Added public flag for admin-created public content.

**New Column**:
```sql
is_public BOOLEAN DEFAULT false
```

### tags

Stores content categorization tags.

**Schema**:
```sql
CREATE TABLE public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT CHECK (type IN ('client', 'brand', 'topic', 'time_period', 'other')),
  description TEXT,
  color TEXT DEFAULT '#gray',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);
```

### notebook_tags

Links notebooks to tags (many-to-many).

**Schema**:
```sql
CREATE TABLE public.notebook_tags (
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  PRIMARY KEY (notebook_id, tag_id)
);
```

### user_permissions

Grants users access to specific tags.

**Schema**:
```sql
CREATE TABLE public.user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, tag_id)
);
```

### source_tags

Optional direct tagging of sources.

**Schema**:
```sql
CREATE TABLE public.source_tags (
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  PRIMARY KEY (source_id, tag_id)
);
```

## Row Level Security (RLS) Policies

### Notebooks Table

**Users can view accessible notebooks**:
```sql
CREATE POLICY "Users can view accessible notebooks" ON notebooks
FOR SELECT USING (
  user_id = auth.uid()
  OR is_public = true
  OR EXISTS (
    SELECT 1 FROM notebook_tags nt
    JOIN user_permissions up ON up.tag_id = nt.tag_id
    WHERE nt.notebook_id = notebooks.id
    AND up.user_id = auth.uid()
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  )
  OR is_admin()
);
```

**Only admins can create/update/delete**:
```sql
CREATE POLICY "Only admins can create notebooks" ON notebooks
FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update notebooks" ON notebooks
FOR UPDATE USING (is_admin());

CREATE POLICY "Only admins can delete notebooks" ON notebooks
FOR DELETE USING (is_admin());
```

### Tags Table

**Admins manage tags**:
```sql
CREATE POLICY "Admins can manage tags" ON tags
FOR ALL USING (is_admin());
```

**Users view permitted tags**:
```sql
CREATE POLICY "Users can view tags they have permission for" ON tags
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_permissions
    WHERE user_permissions.user_id = auth.uid()
    AND user_permissions.tag_id = tags.id
    AND (expires_at IS NULL OR expires_at > NOW())
  )
  OR is_admin()
);
```

## n8n Webhook Parameters

### Chat Webhook

**Additional Parameters**:
```json
{
  "session_id": "string",
  "message": "string",
  "user_id": "string",
  "notebook_id": "string",
  "tag_filters": ["tag-uuid-1", "tag-uuid-2"],
  "timestamp": "ISO 8601 date"
}
```

**Tag Filtering Logic**:
```javascript
// In n8n workflow
const tagFilters = $input.item.json.tag_filters || [];

// Apply to vector search
if (tagFilters.length > 0) {
  // Filter embeddings by tags
  searchQuery.filters = {
    tag_id: { in: tagFilters }
  };
}
```

## React Hooks

### useProfile

Gets current user profile with role information.

**Usage**:
```typescript
import { useProfile } from '@/hooks/useProfile';

function Component() {
  const { profile, isAdmin, isUser, isLoading } = useProfile();
  
  if (isAdmin) {
    // Show admin features
  }
}
```

**Returns**:
```typescript
{
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isUser: boolean;
}
```

## Query Examples

### Get User's Accessible Notebooks

```sql
-- Using function
SELECT * FROM get_accessible_notebooks();

-- Direct query
SELECT DISTINCT n.*
FROM notebooks n
WHERE 
  n.user_id = auth.uid()
  OR n.is_public = true
  OR EXISTS (
    SELECT 1 FROM notebook_tags nt
    JOIN user_permissions up ON up.tag_id = nt.tag_id
    WHERE nt.notebook_id = n.id
    AND up.user_id = auth.uid()
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
  );
```

### Check User Permissions

```sql
-- Get all permissions for a user
SELECT 
  t.name as tag_name,
  t.type as tag_type,
  up.granted_at,
  up.expires_at,
  p.email as granted_by
FROM user_permissions up
JOIN tags t ON t.id = up.tag_id
LEFT JOIN profiles p ON p.id = up.granted_by
WHERE up.user_id = 'user-uuid';
```

### Tag Usage Report

```sql
-- Count notebooks per tag
SELECT 
  t.name,
  t.type,
  COUNT(DISTINCT nt.notebook_id) as notebook_count,
  COUNT(DISTINCT up.user_id) as user_count
FROM tags t
LEFT JOIN notebook_tags nt ON nt.tag_id = t.id
LEFT JOIN user_permissions up ON up.tag_id = t.id
GROUP BY t.id, t.name, t.type
ORDER BY notebook_count DESC;
```

## Error Handling

### Permission Denied Errors

When a user lacks permission:
```json
{
  "error": "Access denied to this notebook",
  "code": "PERMISSION_DENIED"
}
```

### Tag Not Found

When referencing non-existent tags:
```json
{
  "error": "Tag not found",
  "code": "TAG_NOT_FOUND"
}
```

### Expired Permission

When permission has expired:
```json
{
  "error": "Permission has expired",
  "code": "PERMISSION_EXPIRED"
}
```

## Security Considerations

1. **Always validate permissions** in edge functions
2. **Use RLS policies** as the primary security layer
3. **Log admin actions** for audit trails
4. **Validate tag ownership** before granting permissions
5. **Set appropriate expiration** for temporary access
6. **Use prepared statements** to prevent SQL injection
7. **Validate webhook authentication** in n8n

## Performance Tips

1. **Index foreign keys** for faster joins
2. **Use database functions** instead of multiple queries
3. **Cache permission checks** in frontend where appropriate
4. **Batch tag operations** when possible
5. **Monitor query performance** with EXPLAIN ANALYZE

## Migration from Standard API

| Standard Endpoint | Admin-Controlled Endpoint | Changes |
|-------------------|---------------------------|----------|
| `/send-chat-message` | `/send-chat-message-with-permissions` | Added notebook_id, permission check, tag filtering |
| Direct notebook query | `get_accessible_notebooks()` | Filtered by permissions |
| No role check | `is_admin()` | Role-based UI/API access |

## Rate Limiting

Consider implementing rate limits:
- Admin operations: 100/minute
- User queries: 50/minute
- Permission checks: 200/minute

## Monitoring

Track these metrics:
- Permission check failures
- Tag usage statistics  
- Admin action frequency
- Query performance by tag count