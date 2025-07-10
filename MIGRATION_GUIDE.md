# Migration Guide: Standard to Admin-Controlled InsightsLM

This guide helps you migrate an existing InsightsLM installation to the admin-controlled version with role-based access control.

## Overview

The admin-controlled version adds:
- Role-based access (admin/user)
- Tag-based content organization
- Permission management system
- Restricted content upload (admin-only)

## Pre-Migration Checklist

- [ ] Backup your database
- [ ] Export any custom n8n workflows
- [ ] Document current user access patterns
- [ ] Plan your tag structure (clients, brands, topics)
- [ ] Identify who should be admins

## Migration Steps

### 1. Database Migration

#### A. Run Migration Scripts

```bash
# Apply the new migrations in order
npx supabase migration up
```

This will create:
- Role column in profiles table
- Tags, notebook_tags, user_permissions tables
- Updated RLS policies
- New database functions

#### B. Set Initial Admin Users

```sql
-- Set existing users as admins (replace with actual emails)
UPDATE profiles 
SET role = 'admin' 
WHERE email IN ('admin1@company.com', 'admin2@company.com');

-- All other users default to 'user' role
UPDATE profiles 
SET role = 'user' 
WHERE role IS NULL;
```

### 2. Tag Existing Content

#### A. Create Initial Tags

```sql
-- Example: Create client tags
INSERT INTO tags (name, type, description, color) VALUES
  ('ClientA', 'client', 'Client A - Manufacturing Division', '#blue'),
  ('ClientB', 'client', 'Client B - Retail Chain', '#green'),
  ('Internal', 'topic', 'Internal company documents', '#gray');
```

#### B. Tag Existing Notebooks

```sql
-- Tag notebooks based on title or other criteria
INSERT INTO notebook_tags (notebook_id, tag_id)
SELECT n.id, t.id
FROM notebooks n, tags t
WHERE n.title LIKE '%ClientA%' AND t.name = 'ClientA';
```

### 3. Set User Permissions

#### A. Grant Permissions to Existing Users

```sql
-- Grant user access to specific client
INSERT INTO user_permissions (user_id, tag_id)
SELECT u.id, t.id
FROM profiles u, tags t
WHERE u.email = 'user@clienta.com' AND t.name = 'ClientA';
```

#### B. Set Expiration Dates (Optional)

```sql
-- Grant temporary access
INSERT INTO user_permissions (user_id, tag_id, expires_at)
SELECT u.id, t.id, NOW() + INTERVAL '30 days'
FROM profiles u, tags t
WHERE u.email = 'contractor@example.com' AND t.name = 'ClientA';
```

### 4. Update Edge Functions

Deploy the new permission-aware edge function:

```bash
npx supabase functions deploy send-chat-message-with-permissions
```

### 5. Update n8n Workflows

#### A. Modify Chat Workflow

Add tag filtering to your vector search:

```javascript
// In your n8n chat workflow
const tagFilters = $input.item.json.tag_filters || [];

// Add to your vector search query
if (tagFilters.length > 0) {
  query += ` AND source_id IN (
    SELECT s.id FROM sources s
    JOIN notebook_tags nt ON nt.notebook_id = s.notebook_id
    WHERE nt.tag_id = ANY($1::uuid[])
  )`;
  params.push(tagFilters);
}
```

#### B. Update Document Processing

Ensure new documents inherit notebook tags:

```javascript
// After document processing
const notebookTags = await getNotebookTags(notebookId);
// Apply tags to document metadata
```

### 6. Frontend Updates

#### A. Update Dependencies

```bash
npm install
npm run build
```

#### B. Update Chat Hook

The chat hook now requires notebook_id:

```typescript
// Before
sendMessage({ content: message });

// After
sendMessage({ 
  notebookId: currentNotebookId,
  content: message 
});
```

### 7. Testing

#### A. Test Admin Functions

1. Login as admin
2. Verify you can:
   - Create notebooks
   - Upload sources
   - Manage tags
   - Grant permissions

#### B. Test User Access

1. Login as regular user
2. Verify you:
   - See only permitted notebooks
   - Cannot upload/edit
   - Get filtered chat responses

#### C. Test Permission Boundaries

1. Create test notebook with specific tag
2. Grant user access to different tag
3. Verify user cannot see test notebook
4. Grant correct permission and verify access

## Post-Migration Tasks

### 1. Audit Current Access

```sql
-- Review all user permissions
SELECT 
  p.email,
  t.name as tag_name,
  t.type as tag_type,
  up.granted_at,
  up.expires_at
FROM user_permissions up
JOIN profiles p ON p.id = up.user_id
JOIN tags t ON t.id = up.tag_id
ORDER BY p.email, t.name;
```

### 2. Document Tag Structure

Create documentation for your team:
- Tag naming conventions
- Tag types and their purposes
- Permission granting procedures
- Access request process

### 3. Train Administrators

Ensure admins understand:
- How to create and manage tags
- Permission granting best practices
- Content organization strategies
- Security implications

### 4. Communicate Changes to Users

Inform users about:
- New access control system
- How to request access to content
- What content they can access
- Who to contact for permissions

## Rollback Plan

If you need to rollback:

1. **Database**: Restore from backup
2. **Edge Functions**: Redeploy original functions
3. **Frontend**: Deploy previous version
4. **n8n**: Restore original workflows

## Common Issues

### Users Can't See Any Content

**Cause**: No permissions granted
**Fix**: 
```sql
-- Check user permissions
SELECT * FROM user_permissions WHERE user_id = 'user-uuid';
```

### Chat Returns No Results

**Cause**: Tag filters not applied correctly
**Fix**: Check n8n workflow includes tag filtering logic

### Admin Features Not Visible

**Cause**: User role not set to admin
**Fix**:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

### Migration Script Fails

**Cause**: Existing data conflicts
**Fix**: Check for:
- Duplicate tag names
- Missing foreign key references
- Existing RLS policies with same names

## Performance Considerations

After migration:
1. Create indexes on frequently queried columns
2. Monitor query performance with tag filters
3. Consider partitioning large tables by tag
4. Optimize vector search queries

## Security Notes

- Always use RLS policies
- Validate permissions in edge functions
- Log admin actions for audit trail
- Regularly review user permissions
- Set expiration dates for temporary access

## Support

For migration assistance:
1. Check error logs in Supabase dashboard
2. Review n8n execution logs
3. Use browser developer console for frontend issues
4. Open GitHub issue with details

Remember: Take backups before migration and test thoroughly in a staging environment first!