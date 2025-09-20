"use client";

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  Calendar,
  CalendarDays,
  FileText,
  User,
  Settings,
  LayoutDashboard,
  Building,
  Bell,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['employee', 'manager', 'hr', 'admin'] },
  { name: 'Employees', href: '/employees', icon: Users, roles: ['manager', 'hr', 'admin'] },
  { name: 'Attendance', href: '/attendance', icon: Calendar, roles: ['employee', 'manager', 'hr', 'admin'] },
  { name: 'Holidays', href: '/holidays', icon: CalendarDays, roles: ['employee', 'manager', 'hr', 'admin'] },
  { name: 'Leaves', href: '/leaves', icon: FileText, roles: ['employee', 'manager', 'hr', 'admin'] },
  { name: 'Profile', href: '/profile', icon: User, roles: ['employee', 'manager', 'hr', 'admin'] },
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['hr', 'admin'] },
  {name:'Announcements', href: '/announcements', icon: Bell, roles: ['manager', 'hr', 'admin'] },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const userRole = user?.role || 'employee';

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className={cn(
      'flex flex-col h-full border-r transition-all duration-300 bg-gradient-to-b from-background to-secondary',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="mx-auto rounded-full overflow-hidden w-20 h-20 mb-4">
          <img 
               src="/uni.webp" 
               alt="Company Logo" 
               className="w-full h-full object-cover" 
               />
          </div>

          {!collapsed && (
            <div>
              <h1 className="font-bold text-xl tracking-tight">HRMS</h1>
              <p className="text-xs text-muted-foreground">Human Resources</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors shadow-[0_1px_0_0_rgba(0,0,0,0.02)]',
                isActive
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                collapsed && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}