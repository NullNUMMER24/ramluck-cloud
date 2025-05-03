import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Group } from "@shared/schema";

// Additional interfaces for UI implementation
interface GroupMember {
  id: number;
  username: string;
  fullName?: string;
  color?: string;
}

interface GroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: GroupCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch users for this group
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
    enabled: !!group,
  });

  // Generate member objects from the users
  const members = users.slice(0, 3).map(user => ({
    id: user.id,
    username: user.username,
    fullName: user.fullName || user.username
  }));

  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/groups/${group.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      toast({
        title: "Group deleted",
        description: `The group "${group.name}" has been deleted.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete group: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteGroupMutation.mutate();
    setIsDeleteDialogOpen(false);
  };

  // Colors for avatars
  const bgColors = [
    "bg-primary/10", "bg-green-100", "bg-blue-100", 
    "bg-purple-100", "bg-rose-100", "bg-teal-100"
  ];
  
  const textColors = [
    "text-primary", "text-green-600", "text-blue-600", 
    "text-purple-600", "text-rose-600", "text-teal-600"
  ];

  // Get color pair based on index or predefined color
  const getColorPair = (index: number, color?: string) => {
    if (color) {
      const [bg, text] = color.split('|');
      return { bg, text };
    }
    
    const colorIndex = index % bgColors.length;
    return {
      bg: bgColors[colorIndex],
      text: textColors[colorIndex]
    };
  };

  // Parse permissions from JSON if needed
  const permissions = group.permissions ? 
    (typeof group.permissions === 'string' 
      ? JSON.parse(group.permissions as string) 
      : group.permissions as string[]) 
    : [];

  // Common permissions for display
  const commonPermissions = [
    { name: "View VMs", granted: permissions.includes("view:vms") },
    { name: "Create VMs", granted: permissions.includes("create:vms") },
    { name: "Manage Users", granted: permissions.includes("manage:users") },
    { name: "System Config", granted: permissions.includes("admin:config") }
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-6 py-5 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-card-foreground">{group.name}</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-red-600"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {group.description && (
          <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Members</span>
          <span className="text-sm font-semibold text-primary">{members.length} users</span>
        </div>
        
        <div className="flex -space-x-2 overflow-hidden mb-4">
          {members.map((member, index) => {
            const { bg, text } = getColorPair(index, member.color);
            const initials = getInitials(member.fullName || member.username);
            
            return (
              <Avatar key={member.id} className="ring-2 ring-background">
                <AvatarFallback className={`${bg} ${text}`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            );
          })}
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Permissions</h3>
          <ul className="space-y-1">
            {commonPermissions.map((permission, index) => (
              <li key={index} className="flex items-center">
                {permission.granted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-500 mr-2"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500 mr-2"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                )}
                <span className="text-sm text-card-foreground">{permission.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 bg-muted/50">
        <Button variant="outline" className="w-full border-primary text-primary">
          View Details
        </Button>
      </CardFooter>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the group "{group.name}" and remove all associated permissions. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// Helper function to get initials
function getInitials(name: string): string {
  const parts = name.split(/[ ._-]/);
  
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  } else if (name.length >= 2) {
    return name.substring(0, 2).toUpperCase();
  } else {
    return name.toUpperCase();
  }
}
