import { useState } from "react";
import { useNotebooks } from "@/hooks/useNotebooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ExternalLink, Edit, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotebookTagSelector } from "./NotebookTagSelector";

export function NotebookManagement() {
  const navigate = useNavigate();
  const { notebooks, isLoading, createNotebook } = useNotebooks();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim()) {
      toast.error("Please enter a notebook name");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create the notebook with is_public flag
      const { data: notebook, error: createError } = await supabase
        .from('notebooks')
        .insert({
          title: newNotebookName,
          is_public: isPublic,
          user_id: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add tags if any selected
      if (selectedTags.length > 0 && notebook) {
        const tagInserts = selectedTags.map(tagId => ({
          notebook_id: notebook.id,
          tag_id: tagId,
          created_by: user.id,
        }));

        const { error: tagError } = await supabase
          .from('notebook_tags')
          .insert(tagInserts);

        if (tagError) throw tagError;
      }

      toast.success("Notebook created successfully");
      setCreateDialogOpen(false);
      setNewNotebookName("");
      setIsPublic(false);
      setSelectedTags([]);
    } catch (error) {
      console.error('Error creating notebook:', error);
      toast.error("Failed to create notebook");
    }
  };

  const handleDeleteNotebook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notebooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Notebook deleted successfully");
    } catch (error) {
      console.error('Error deleting notebook:', error);
      toast.error("Failed to delete notebook");
    }
  };

  if (isLoading) return <div>Loading notebooks...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Notebooks</h3>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Notebook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Notebook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Notebook Name</Label>
                <Input
                  id="name"
                  value={newNotebookName}
                  onChange={(e) => setNewNotebookName(e.target.value)}
                  placeholder="Enter notebook name"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public">Make this notebook public</Label>
              </div>
              <div>
                <Label>Tags</Label>
                <NotebookTagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
              </div>
              <Button onClick={handleCreateNotebook} className="w-full">
                Create Notebook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notebooks?.map((notebook) => (
            <TableRow key={notebook.id}>
              <TableCell className="font-medium">{notebook.title}</TableCell>
              <TableCell>
                <Badge variant={notebook.generation_status === 'completed' ? 'success' : 'secondary'}>
                  {notebook.generation_status || 'ready'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={notebook.is_public ? 'default' : 'outline'}>
                  {notebook.is_public ? 'Public' : 'Private'}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(notebook.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/notebook/${notebook.id}`)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteNotebook(notebook.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}