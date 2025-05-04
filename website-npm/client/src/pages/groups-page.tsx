import { useState, useEffect } from "react";
import SidebarNav from "@/components/layout/sidebar-nav";
import MobileHeader from "@/components/layout/mobile-header";
import GroupCard from "@/components/groups/group-card";
import AddGroupDialog from "@/components/groups/add-group-dialog";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Group as DbGroup } from "@shared/schema";

// Extended Group interface for frontend with additional properties
interface Group extends DbGroup {
  role?: string;
  memberCount?: number;
  members?: Array<{
    id: number;
    username: string;
    fullName?: string;
    color?: string;
  }>;
}

export default function GroupsPage() {
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ['/api/groups'],
    // Transform data from external API if needed
    select: (data: any) => {
      // If the external API returns groups in a different format,
      // transform them here to match the expected Group interface
      if (Array.isArray(data)) {
        return data.map((group: any) => ({
          id: typeof group.id === 'number' ? group.id : Number(group.id?.toString() || group.group_id?.toString() || "0"),
          name: group.name || group.group_name || 'Unknown Group',
          description: group.description || group.group_description || null,
          colorScheme: group.colorScheme || group.color_scheme || null,
          permissions: group.permissions || null,
          createdAt: group.createdAt || group.created_at || null,
          // Extended properties
          role: group.role || group.group_role || 'user',
          memberCount: group.memberCount || group.member_count || 0,
          members: Array.isArray(group.members) 
            ? group.members.map((member: any) => ({
                id: member.id || member.user_id || 0,
                username: member.username || 'user',
                fullName: member.fullName || member.full_name || '',
                color: member.color || ''
              }))
            : []
        }));
      }
      return [];
    }
  });

  useEffect(() => {
    document.title = "Group Management - RAMLUCK-CLOUD";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav activePath="/groups" />
      <MobileHeader />

      <div className="lg:pl-64 pt-0 lg:pt-0">
        <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-card-foreground">Group Management</h1>
            <Button
              onClick={() => setIsAddGroupOpen(true)}
              className="flex items-center"
            >
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
                className="mr-1"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Group
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups && groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}

              {/* Add New Group Card */}
              <div 
                className="bg-card/50 border-2 border-dashed border-muted rounded-lg p-6 flex flex-col items-center justify-center hover:bg-card/80 transition-colors cursor-pointer"
                onClick={() => setIsAddGroupOpen(true)}
              >
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-1">Create New Group</h3>
                <p className="text-sm text-muted-foreground text-center">Define a new user group with specific permissions</p>
              </div>
            </div>
          )}

          <AddGroupDialog 
            isOpen={isAddGroupOpen} 
            onClose={() => setIsAddGroupOpen(false)} 
          />
        </div>
      </div>
    </div>
  );
}
