"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Ban, CheckCircle, Search, MoreVertical, X, UserCircle2, Mail, Phone, Calendar as CalendarIcon, ShieldCheck, ShieldAlert } from "lucide-react";
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
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif italic text-slate-900 tracking-tight">Collective Registry</h1>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-[#608d64]/60" />
            <p className="text-[10px] font-black text-[#608d64] uppercase tracking-[0.4em]">Managing the Artisan & Curator Ecosystem</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-600 group-focus-within:text-[#608d64] transition-colors" />
          </div>
          <Input
            placeholder="Search registry..."
            className="pl-12 pr-4 h-14 w-full md:w-[320px] bg-white border-slate-100 rounded-2xl focus-visible:ring-1 focus-visible:ring-[#608d64] focus-visible:border-[#608d64] shadow-none transition-all duration-300 placeholder:text-slate-500 placeholder:font-light"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-8 h-8 border-2 border-[#608d64]/20 border-t-[#608d64] rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Retrieving Records</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {users.map((user) => (
            <Card key={user.id} className="border-slate-100 bg-white shadow-none rounded-[2.5rem] overflow-hidden hover:border-[#608d64]/20 transition-all duration-500 group">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  {/* User Identity Area */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-20 w-20 rounded-[1.5rem] border-2 border-slate-50 group-hover:border-[#608d64]/10 transition-colors">
                        <AvatarImage src={user.profile_image_url} alt={user.full_name} className="object-cover" />
                        <AvatarFallback className="bg-slate-50 text-[#608d64] font-black text-lg">
                          {user.full_name?.split(" ").map((n) => n[0]).join("") || user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-lg border-4 border-white flex items-center justify-center ${user.is_verified ? 'bg-[#608d64]' : 'bg-rose-500'}`}>
                        {user.is_verified ? <ShieldCheck className="w-3 h-3 text-white" /> : <ShieldAlert className="w-3 h-3 text-white" />}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-2xl font-serif italic text-slate-900 tracking-tight group-hover:text-[#608d64] transition-colors duration-500">
                        {user.full_name || user.username}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="bg-[#608d64]/5 border-[#608d64]/20 text-[#608d64] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {user.role.replace("_", " ")}
                        </Badge>
                        <span className="text-[11px] text-slate-600 font-light flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 lg:gap-12">
                    <div className="grid grid-cols-1 gap-1">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Joined On</p>
                      <p className="text-sm font-medium text-slate-600">
                        {new Date(user.created_at).toLocaleDateString('en-CA', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewModal(user)}
                        className="h-11 px-5 rounded-2xl border-slate-100 hover:border-[#608d64] hover:bg-[#608d64]/5 text-slate-600 hover:text-[#608d64] transition-all duration-300 flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Inspect</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(user)}
                        className="h-11 px-5 rounded-2xl border-slate-100 hover:border-[#608d64] hover:bg-[#608d64]/5 text-slate-600 hover:text-[#608d64] transition-all duration-300 flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Modify</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(user)}
                        className={`h-11 px-5 rounded-2xl transition-all duration-300 flex items-center gap-2 ${user.is_verified
                          ? "border-rose-50 text-rose-500 hover:bg-rose-50 outline-none"
                          : "border-emerald-50 text-[#608d64] hover:bg-emerald-50 outline-none"
                          }`}
                      >
                        {user.is_verified ? (
                          <><Ban className="h-4 w-4" /> <span className="text-[11px] font-bold uppercase tracking-wider">Restrict</span></>
                        ) : (
                          <><CheckCircle className="h-4 w-4" /> <span className="text-[11px] font-bold uppercase tracking-wider">Restore</span></>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {users.length === 0 && (
            <div className="text-center py-24 rounded-[3rem] border border-dashed border-slate-200 bg-slate-50/50">
              <UserCircle2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-serif italic text-slate-600">No members found in the collective</h3>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">Adjust your refinement filters</p>
            </div>
          )}
        </div>
      )}

      {/* View Modal - Redesigned for Sanctuary Aesthetic */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
          <div className="bg-[#fdfcf9] p-10 space-y-8">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-serif italic text-slate-900">Member Intel</DialogTitle>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-4 bg-[#608d64]/60" />
                <p className="text-[10px] font-black text-[#608d64] uppercase tracking-widest">Detailed Profile Insight</p>
              </div>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-10">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-28 w-28 rounded-[2rem] border-4 border-white shadow-xl shadow-[#608d64]/5">
                    <AvatarImage src={selectedUser.profile_image_url} className="object-cover" />
                    <AvatarFallback className="text-2xl font-black bg-white text-[#608d64]">
                      {selectedUser.full_name?.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-2xl font-serif italic text-slate-900">{selectedUser.full_name || selectedUser.username}</h4>
                    <Badge variant="outline" className="mt-2 bg-[#608d64]/5 border-[#608d64]/20 text-[#608d64] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {selectedUser.role.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 rounded-[2rem] bg-white border border-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 rounded-xl"><Mail className="w-4 h-4 text-slate-600" /></div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Contact Email</p>
                      <p className="text-sm font-medium text-slate-700">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 rounded-xl"><Phone className="w-4 h-4 text-slate-600" /></div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Phone Identity</p>
                      <p className="text-sm font-medium text-slate-700">{selectedUser.phone_number || "Unavailable"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 rounded-xl"><CalendarIcon className="w-4 h-4 text-slate-600" /></div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Member Since</p>
                      <p className="text-sm font-medium text-slate-700">{new Date(selectedUser.created_at).toLocaleDateString('en-CA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-xl ${selectedUser.is_verified ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                      {selectedUser.is_verified ? <ShieldCheck className="w-4 h-4 text-[#608d64]" /> : <ShieldAlert className="w-4 h-4 text-rose-500" />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Platform Stature</p>
                      <p className={`text-sm font-bold ${selectedUser.is_verified ? 'text-[#608d64]' : 'text-rose-500'}`}>
                        {selectedUser.is_verified ? "Active Access" : "Administrative Restriction"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button
                onClick={() => setIsViewModalOpen(false)}
                className="w-full h-14 bg-slate-900 border-none rounded-2xl text-white font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all duration-300"
              >
                Conclude Inspection
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal - Redesigned for Sanctuary Aesthetic */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl">
          <div className="bg-[#fdfcf9] p-10 space-y-8">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-serif italic text-slate-900">Modify Personnel</DialogTitle>
              <div className="flex items-center gap-2">
                <div className="h-[1px] w-4 bg-[#608d64]/60" />
                <p className="text-[10px] font-black text-[#608d64] uppercase tracking-widest">Update Collective Metadata</p>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Full Identity</Label>
                <Input
                  id="full_name"
                  value={editFormData.full_name || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  className="h-14 bg-white border-slate-100 rounded-2xl focus:ring-[#608d64] focus:border-[#608d64] shadow-none font-medium px-6"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Email Conduit</Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="h-14 bg-white border-slate-100 rounded-2xl focus:ring-[#608d64] focus:border-[#608d64] shadow-none font-medium px-6"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-2">Telephonic Contact</Label>
                <Input
                  id="phone"
                  value={editFormData.phone_number || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                  className="h-14 bg-white border-slate-100 rounded-2xl focus:ring-[#608d64] focus:border-[#608d64] shadow-none font-medium px-6"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 h-14 border-slate-200 rounded-2xl text-slate-600 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all duration-300 shadow-none border"
              >
                Discard Changes
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={isSubmitting}
                className="flex-1 h-14 bg-[#608d64] border-none rounded-2xl text-white font-bold uppercase tracking-widest text-[10px] hover:bg-[#4a6e4d] transition-all duration-300 shadow-xl shadow-[#608d64]/10"
              >
                {isSubmitting ? "Committing..." : "Authorize Update"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
