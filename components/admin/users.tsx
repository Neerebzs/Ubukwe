"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Ban, CheckCircle, Search, MoreVertical, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  is_verified: boolean;
  phone_number?: string;
  profile_image_url?: string;
  created_at: string;
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<AdminUser>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Only include search parameter if it has a value
      const params: any = {};
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      
      const response = await apiClient.admin.users.getAll(params);
      // Backend returns { users: [], total, etc. }
      console.log('Users API Response:', response.data);
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      if (user.is_verified) {
        await apiClient.admin.users.suspend(user.id, "Administrative suspension");
        toast.success("User suspended successfully");
      } else {
        await apiClient.admin.users.activate(user.id);
        toast.success("User activated successfully");
      }
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      toast.error(error.message || "Failed to update user status");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await apiClient.admin.users.update(selectedUser.id, editFormData);
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openViewModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setEditFormData({
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Platform Users</h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profile_image_url} alt={user.full_name} />
                      <AvatarFallback>
                        {user.full_name?.split(" ").map((n) => n[0]).join("") || user.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{user.full_name || user.username}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <Badge variant="outline" className="capitalize">{user.role.replace("_", " ")}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.is_verified ? "default" : "destructive"}>
                      {user.is_verified ? "Active" : "Suspended"}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => openViewModal(user)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(user)}
                      className={user.is_verified ? "text-destructive hover:text-destructive" : "text-primary hover:text-primary"}
                    >
                      {user.is_verified ? (
                        <><Ban className="h-4 w-4 mr-2" /> Suspend</>
                      ) : (
                        <><CheckCircle className="h-4 w-4 mr-2" /> Activate</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {users.length === 0 && (
            <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/20">
              No users found.
            </div>
          )}
        </div>
      )}

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center space-y-2 mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedUser.profile_image_url} />
                  <AvatarFallback className="text-xl">
                    {selectedUser.full_name?.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h4 className="text-xl font-bold">{selectedUser.full_name || selectedUser.username}</h4>
                  <Badge className="mt-1 capitalize">{selectedUser.role.replace("_", " ")}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Username</p>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone_number || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={selectedUser.is_verified ? "default" : "destructive"}>
                    {selectedUser.is_verified ? "Active" : "Suspended"}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Member Since</p>
                  <p className="font-medium">{new Date(selectedUser.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={editFormData.full_name || ""}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email || ""}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={editFormData.phone_number || ""}
                onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
