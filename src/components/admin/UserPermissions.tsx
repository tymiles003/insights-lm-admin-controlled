import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Permission {
  id: string;
  user_id: string;
  tag_id: string;
  granted_at: string;
  expires_at: string | null;
  user: {
    email: string;
    full_name: string | null;
  };
  tag: {
    name: string;
    type: string | null;
  };
}

export function UserPermissions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | undefined>();

  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_permissions')
        .select(`
          *,
          user:profiles!user_permissions_user_id_fkey(email, full_name),
          tag:tags!user_permissions_tag_id_fkey(name, type)
        `)
        .order('granted_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as Permission[];
    },
  });

  const { data: users } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .neq('role', 'admin')
        .order('email');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: tags } = useQuery({
    queryKey: ['all-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name, type')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const grantPermission = useMutation({
    mutationFn: async () => {
      if (!selectedUserId || !selectedTagId) {
        throw new Error('Please select both user and tag');
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_permissions')
        .insert({
          user_id: selectedUserId,
          tag_id: selectedTagId,
          granted_by: user.id,
          expires_at: expiresAt?.toISOString() || null,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast({
        title: "Success",
        description: "Permission granted successfully",
      });
      setGrantDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error granting permission:', error);
      toast({
        title: "Error",
        description: "Failed to grant permission",
        variant: "destructive", 
      });
    },
  });

  const revokePermission = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permissions'] });
      toast({
        title: "Success",
        description: "Permission revoked successfully",
      });
    },
    onError: (error) => {
      console.error('Error revoking permission:', error);
      toast({
        title: "Error",
        description: "Failed to revoke permission",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedUserId("");
    setSelectedTagId("");
    setExpiresAt(undefined);
  };

  if (permissionsLoading) return <div>Loading permissions...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">User Permissions</h3>
        <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Grant Permission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Grant New Permission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user">User</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email} {user.full_name && `(${user.full_name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="tag">Tag</Label>
                <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags?.map((tag) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name} ({tag.type || 'other'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Expires At (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiresAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiresAt ? format(expiresAt, "PPP") : "No expiration"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiresAt}
                      onSelect={setExpiresAt}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Button onClick={() => grantPermission.mutate()} className="w-full">
                Grant Permission
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Tag</TableHead>
            <TableHead>Tag Type</TableHead>
            <TableHead>Granted At</TableHead>
            <TableHead>Expires At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions?.map((permission) => (
            <TableRow key={permission.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{permission.user.email}</div>
                  {permission.user.full_name && (
                    <div className="text-sm text-muted-foreground">
                      {permission.user.full_name}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{permission.tag.name}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{permission.tag.type || 'other'}</Badge>
              </TableCell>
              <TableCell>
                {new Date(permission.granted_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {permission.expires_at
                  ? new Date(permission.expires_at).toLocaleDateString()
                  : <Badge variant="outline">Never</Badge>
                }
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => revokePermission.mutate(permission.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}