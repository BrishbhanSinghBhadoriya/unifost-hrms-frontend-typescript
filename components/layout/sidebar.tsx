"use client";

import { useSession } from 'next-auth/react';
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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['employee', 'manager', 'hr', 'admin'] },
  { name: 'Employees', href: '/employees', icon: Users, roles: ['manager', 'hr', 'admin'] },
  { name: 'Attendance', href: '/attendance', icon: Calendar, roles: ['employee', 'manager', 'hr', 'admin'] },
  { name: 'Holidays', href: '/holidays', icon: CalendarDays, roles: ['employee', 'manager', 'hr', 'admin'] },
  { name: 'Leaves', href: '/leaves', icon: FileText, roles: ['employee', 'manager', 'hr', 'admin'] },
  { name: 'Profile', href: '/profile', icon: User, roles: ['employee', 'manager', 'hr', 'admin'] },
  { name: 'Admin', href: '/admin', icon: Settings, roles: ['hr', 'admin'] },
];

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = (session?.user as any)?.role || 'employee';

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className={cn(
      'flex flex-col h-full bg-card border-r transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground rounded-lg p-2">
            <Building className="h-6 w-6" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-xl">HRMS</h1>
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
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
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