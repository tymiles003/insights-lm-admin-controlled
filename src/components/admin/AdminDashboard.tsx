import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotebookManagement } from "./NotebookManagement";
import { TagManagement } from "./TagManagement";
import { UserPermissions } from "./UserPermissions";
import { Shield, Tags, Users, FolderOpen } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

export function AdminDashboard() {
  const { isAdmin, isLoading } = useProfile();

  if (isLoading) {
    return <div className="container mx-auto p-6 max-w-7xl">
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>;
  }

  if (!isAdmin) {
    return <div className="container mx-auto p-6 max-w-7xl">
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-red-600 mr-2" />
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        </div>
        <p className="text-gray-600">You need administrator privileges to access this page.</p>
      </div>
    </div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Shield className="h-8 w-8" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage notebooks, tags, and user permissions
        </p>
      </div>

      <Tabs defaultValue="notebooks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notebooks" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Notebooks
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Tags
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notebooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notebook Management</CardTitle>
              <CardDescription>
                Create and manage notebooks with content sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotebookManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tag Management</CardTitle>
              <CardDescription>
                Create and manage tags for content categorization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TagManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Permissions</CardTitle>
              <CardDescription>
                Manage user access to tags and content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserPermissions />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}