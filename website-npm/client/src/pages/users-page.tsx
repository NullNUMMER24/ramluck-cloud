import { useState, useEffect } from "react";
import SidebarNav from "@/components/layout/sidebar-nav";
import MobileHeader from "@/components/layout/mobile-header";
import UserTable from "@/components/users/user-table";
import AddUserDialog from "@/components/users/add-user-dialog";

export default function UsersPage() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  useEffect(() => {
    document.title = "User Management - RAMLUCK-CLOUD";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarNav activePath="/users" />
      <MobileHeader />

      <div className="lg:pl-64 pt-0 lg:pt-0">
        <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <button
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center"
              onClick={() => setIsAddUserOpen(true)}
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
              Add User
            </button>
          </div>

          <UserTable />

          <AddUserDialog 
            isOpen={isAddUserOpen} 
            onClose={() => setIsAddUserOpen(false)} 
          />
        </div>
      </div>
    </div>
  );
}
