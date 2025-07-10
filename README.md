<p align="center">
  <img src="https://www.theaiautomators.com/wp-content/uploads/2025/06/Group-2651.svg" alt="InsightsLM Logo" width="600"/>
</p>


# InsightsLM: Enterprise Admin-Controlled Knowledge Base

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/theaiautomators/insights-lm-public?style=social)](https://github.com/theaiautomators/insights-lm-public/stargazers)
[![YouTube Video](https://img.shields.io/badge/YouTube-Watch%20the%20Build-red)](https://www.youtube.com/watch?v=IXJEGjfZRBE)

> **Admin-Controlled Version**: This fork of InsightsLM implements role-based access control where only administrators can manage content while users have read-only access to permitted documents.

## What's Different in This Version?

This admin-controlled version of InsightsLM is designed for enterprise use cases where:
- **Only administrators** can upload and manage documents
- **Users** have read-only access to specific content based on permissions
- **Content is tagged** by client, brand, topic, or time period
- **Responses are filtered** based on user permissions

Perfect for agencies managing multiple clients or enterprises with strict content access requirements.


## About The Project

InsightsLM is an open-source, self-hostable alternative to NotebookLM with enterprise-grade access controls. It's a powerful AI research tool that grounds its responses exclusively in the sources you provide, with the added security of role-based permissions.

This version adds:
- **Role-Based Access**: Admin and User roles with different capabilities
- **Tag-Based Permissions**: Grant access by client, brand, or topic
- **Content Isolation**: Users only see permitted information
- **Audit Trail**: Track who has access to what content


<p align="center">
  <img src="https://www.theaiautomators.com/wp-content/uploads/2024/04/TAIA-Logo-S2.png" alt="The AI Automators Logo" width="500"/>
</p>


## Join Our Community

If you're interested in learning how to customize InsightsLM or build similar applications, join our community, The AI Automators.

https://www.theaiautomators.com/


## Key Features

### Core Features
* **Chat with Your Documents:** Get instant, context-aware answers from permitted documents
* **Verifiable Citations:** Jump directly to the source of information
* **Podcast Generation:** Create audio summaries from accessible content
* **Private and Self-Hosted:** Maintain complete control over your data

### Admin-Controlled Features
* **Admin Dashboard:** Centralized content and permission management
* **Tag Management:** Organize content by client, brand, topic, or time
* **User Permissions:** Grant specific users access to tagged content
* **Content Isolation:** Ensure users only see permitted information
* **Audit Logging:** Track access and permission changes


## Demo & Walkthrough

For a complete demonstration of the original InsightsLM, check out our YouTube video:

<p>
  <a target="_blank" href="https://www.youtube.com/watch?v=IXJEGjfZRBE"><img src="https://raw.githubusercontent.com/theaiautomators/insights-lm-public/main/public/video.png" alt="Video" width="500"/></a>
</p>


## Built With

This project is built with a modern, powerful stack:
* **Frontend:** 
    * [Loveable](https://theaiautomators.com/go/loveable)
    * [Vite](https://vitejs.dev/)
    * [React](https://react.dev/)
    * [TypeScript](https://www.typescriptlang.org/)
    * [shadcn-ui](https://ui.shadcn.com/)
    * [Tailwind CSS](https://tailwindcss.com/)
* **Backend:**
    * [Supabase](https://supabase.com/) - for database, authentication, and storage
    * [N8N](https://theaiautomators.com/go/n8n) - for workflow automation
    * PostgreSQL with pgvector for semantic search
* **Security:**
    * Row-Level Security (RLS) policies
    * Role-based access control
    * Tag-based permission system


## Getting Started: Admin-Controlled Setup

### Prerequisites
- Supabase account
- N8N instance (self-hosted or cloud)
- GitHub account
- OpenAI API key (or compatible LLM)

### Quick Setup

1. **Create Supabase Project**
   ```bash
   # Create new project at supabase.com
   # Save your database password
   ```

2. **Fork and Deploy**
   - Fork this repository
   - Import into Bolt.new or deploy manually
   - Connect Supabase integration

3. **Run Migrations**
   ```bash
   npx supabase db push
   ```
   This creates:
   - Role system (admin/user)
   - Tag tables for content organization
   - Permission tables for access control
   - Updated RLS policies

4. **Set Initial Admin**
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin@email.com';
   ```

5. **Configure N8N Workflows**
   - Import workflows from `/n8n` directory
   - Update workflows to handle tag filtering
   - Configure webhook URLs and authentication

6. **Add Supabase Secrets**
   Navigate to Edge Functions → Secrets and add:
   - `NOTEBOOK_CHAT_URL`
   - `NOTEBOOK_GENERATION_URL`
   - `AUDIO_GENERATION_WEBHOOK_URL`
   - `DOCUMENT_PROCESSING_WEBHOOK_URL`
   - `ADDITIONAL_SOURCES_WEBHOOK_URL`
   - `NOTEBOOK_GENERATION_AUTH`
   - `OPENAI_API_KEY`

7. **Deploy Edge Functions**
   ```bash
   npx supabase functions deploy send-chat-message-with-permissions
   ```


## Usage Guide

### For Administrators

1. **Access Admin Panel**
   - Login with admin credentials
   - Click "Admin Panel" button in dashboard

2. **Create Tags**
   - Navigate to Tags tab
   - Create tags for clients, brands, topics
   - Examples: "ClientA", "Q4-2024", "Financial"

3. **Upload Content**
   - Create notebooks with descriptive names
   - Upload relevant documents
   - Assign appropriate tags

4. **Grant Permissions**
   - Go to User Permissions tab
   - Select user and tag(s)
   - Set optional expiration date

### For Users

1. **Login and Browse**
   - See only notebooks you have permission to access
   - No upload or edit capabilities

2. **Ask Questions**
   - "What were ClientA's Q4 results?"
   - "Show me marketing metrics for Brand X"
   - System automatically filters responses

3. **Verify Information**
   - Click citations to see source documents
   - All responses are grounded in permitted content


## Security Model

### Role-Based Access
- **Admins**: Full CRUD on all content
- **Users**: Read-only access to permitted content

### Tag-Based Permissions
- Content tagged by category (client, brand, topic)
- Users granted access to specific tags
- Permissions can expire automatically

### Content Isolation
- RLS policies enforce access at database level
- Chat responses filtered by permissions
- No data leakage between clients/brands


## Customization Options

### Adding New Tag Types
1. Update tag type enum in migrations
2. Modify TagManagement component
3. Add UI handling for new type

### Custom Permission Logic
1. Modify `user_has_notebook_access` function
2. Update edge function validation
3. Adjust RLS policies as needed

### Integration Points
- **SSO**: Add enterprise authentication
- **Analytics**: Track usage by tag/user
- **Automated Tagging**: ML-based classification
- **Export Controls**: Limit data extraction


## Migration from Standard InsightsLM

See [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) for detailed steps on converting an existing InsightsLM instance to the admin-controlled version.


## API Reference

See [API_REFERENCE.md](API_REFERENCE.md) for detailed documentation of new endpoints and parameters.


## Troubleshooting

### Users Can't See Content
- Verify permissions are granted
- Check tags are assigned to notebooks
- Ensure permissions haven't expired

### Chat Returns No Results
- Confirm notebook has sources
- Verify n8n workflow includes tag filtering
- Check vector embeddings exist

### Admin Features Missing
- Confirm role is 'admin' in database
- Clear browser cache
- Check console for errors


## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Support

- **Documentation**: Check [ADMIN_CONTROLLED_README.md](ADMIN_CONTROLLED_README.md)
- **Issues**: Open a GitHub issue
- **Community**: Join [The AI Automators](https://www.theaiautomators.com/)


## Acknowledgments

- Original InsightsLM by The AI Automators
- Built on the shoulders of Supabase and N8N
- Inspired by Google's NotebookLM