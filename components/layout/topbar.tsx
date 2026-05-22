"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopbarProps {
  userName: string;
  userEmail: string;
}

export function Topbar({ userName, userEmail }: Readonly<TopbarProps>) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
    router.refresh();
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-14 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur flex items-center justify-end px-6">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md px-3 py-2 text-sm transition-colors outline-none">
          <Avatar className="w-7 h-7">
            <AvatarFallback className="bg-indigo-600 text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span>{userName}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-slate-800 border-slate-700">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-white">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem className="text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-700" />
          <DropdownMenuItem
            className="text-red-400 hover:text-red-300 hover:bg-slate-700 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
