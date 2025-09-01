"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthGuard } from '@/components/auth/auth-guard';
import { mockDepartments, mockDesignations, mockUsers } from '@/lib/mock';
import {
  Building,
  Users,
  Settings,
  UserPlus,
  Plus,
  Edit,
  Trash2,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [showDesignationDialog, setShowDesignationDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);

  return (
    <AuthGuard requiredRole={['hr', 'admin']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">
            Manage organization settings and configurations
          </p>
        </div>

        <Tabs defaultValue="departments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="designations">Designations</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="policies">Policies</TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Departments</CardTitle>
                  <CardDescription>
                    Manage organizational departments
                  </CardDescription>
                </div>
                <Dialog open={showDepartmentDialog} onOpenChange={setShowDepartmentDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Department
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Department</DialogTitle>
                      <DialogDescription>
                        Create a new department in your organization
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deptName">Department Name</Label>
                        <Input id="deptName" placeholder="Engineering" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deptCode">Department Code</Label>
                        <Input id="deptCode" placeholder="ENG" />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowDepartmentDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          toast.success('Department added successfully');
                          setShowDepartmentDialog(false);
                        }}>
                          Add Department
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDepartments.map((dept) => (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>{dept.code}</TableCell>
                        <TableCell>
                          {dept.managerId ? 'Assigned' : 'Not Assigned'}
                        </TableCell>
                        <TableCell>{dept.employeeCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="designations" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Designations</CardTitle>
                  <CardDescription>
                    Manage job titles and positions
                  </CardDescription>
                </div>
                <Dialog open={showDesignationDialog} onOpenChange={setShowDesignationDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Designation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Designation</DialogTitle>
                      <DialogDescription>
                        Create a new job title or position
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="desTitle">Title</Label>
                        <Input id="desTitle" placeholder="Senior Developer" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="desDepartment">Department</Label>
                        <Input id="desDepartment" placeholder="Engineering" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="desLevel">Level</Label>
                        <Input id="desLevel" type="number" placeholder="2" />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowDesignationDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          toast.success('Designation added successfully');
                          setShowDesignationDialog(false);
                        }}>
                          Add Designation
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDesignations.map((designation) => (
                      <TableRow key={designation.id}>
                        <TableCell className="font-medium">{designation.title}</TableCell>
                        <TableCell>{designation.department}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Level {designation.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </div>
                <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>
                        Create a new user account
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="userName">Username</Label>
                        <Input id="userName" placeholder="john.doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userEmail">Email</Label>
                        <Input id="userEmail" type="email" placeholder="john.doe@company.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userRole">Role</Label>
                        <Input id="userRole" placeholder="employee" />
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          toast.success('User created successfully');
                          setShowUserDialog(false);
                        }}>
                          Create User
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={
                            user.role === 'admin' ? 'default' :
                            user.role === 'hr' ? 'secondary' :
                            user.role === 'manager' ? 'outline' : 'secondary'
                          }>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leave Policies</CardTitle>
                  <CardDescription>
                    Configure leave entitlements and rules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Casual Leave</span>
                      <span className="font-medium">12 days/year</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sick Leave</span>
                      <span className="font-medium">7 days/year</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Earned Leave</span>
                      <span className="font-medium">21 days/year</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure Policies
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    General system configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Working Hours</span>
                      <span className="font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Working Days</span>
                      <span className="font-medium">Mon - Fri</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Time Zone</span>
                      <span className="font-medium">EST (UTC-5)</span>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      System Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}