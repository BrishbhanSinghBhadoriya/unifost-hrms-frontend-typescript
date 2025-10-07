"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { ForgotPasswordModal } from "@/components/modals/forgot-password-modal";
import type { AxiosError } from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast.success("Welcome back!");
        router.push("/dashboard");
      } 
    } catch (error) {
      console.error("💥 Login error:", error);
      const axiosErr = error as AxiosError<{ message?: string }>; 
      toast.error(axiosErr?.response?.data?.message || (error as any)?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center "
      style={{ backgroundImage: "url('/bg.jpg')" }} 
    >
      <Card className="w-full max-w-md shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm dark:bg-black">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto rounded-full overflow-hidden w-20 h-20 mb-4 shadow-md">
            <img
              src="/uni.webp"
              alt="Company Logo"
              className="w-full h-full object-cover"
            />
          </div>

          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
            Welcome to HRMS
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-white">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 ">
            <div className="space-y-2 dark:space-y-2 dark:p-0 h-auto text-sm font-medium  ">
              <Label className="dark:text-primary" htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="dark:text-white"
                
                required
              />
            </div>
            <div className="space-y-2 dark:p-0 h-auto text-sm font-medium text-primary">
              <Label className="dark:text-primary font-medium" htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="dark:text-white"
              />
            </div>
            <div className="flex items-center justify-end px-1">
              <ForgotPasswordModal>
                <Button variant="link" className="p-0 h-auto text-sm font-medium text-primary hover:underline">
                  Forgot Password?
                </Button>
              </ForgotPasswordModal>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
