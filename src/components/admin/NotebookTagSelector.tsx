import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface NotebookTagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function NotebookTagSelector({ selectedTags, onTagsChange }: NotebookTagSelectorProps) {
  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags-for-selection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  if (isLoading) return <div>Loading tags...</div>;

  if (!tags || tags.length === 0) {
    return <div className="text-sm text-muted-foreground">No tags available. Create tags first.</div>;
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
      {tags.map((tag) => (
        <div key={tag.id} className="flex items-center space-x-2">
          <Checkbox
            id={tag.id}
            checked={selectedTags.includes(tag.id)}
            onCheckedChange={() => handleTagToggle(tag.id)}
          />
          <Label htmlFor={tag.id} className="flex items-center gap-2 cursor-pointer">
            <span>{tag.name}</span>
            <Badge variant="outline" className="text-xs">
              {tag.type || 'other'}
            </Badge>
          </Label>
        </div>
      ))}
    </div>
  );
}