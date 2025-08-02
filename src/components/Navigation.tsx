'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import React from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  PlusCircle,
  ClipboardList,
  Send,
  User,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  const instructorLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/create-assignment', label: 'Create', icon: PlusCircle },
    { href: '/submissions', label: 'Review', icon: ClipboardList },
  ];

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/assignments', label: 'Assignments', icon: FileText },
    { href: '/submit', label: 'Submit', icon: Send },
    { href: '/my-submissions', label: 'My Work', icon: ClipboardList },
  ];

  const links = session?.user?.role === 'instructor' ? instructorLinks : studentLinks;

  const handlesignOut = () => {
    signOut();
  };

  return (
    <>
      {/* Top Navigation Bar - Desktop/Tablet */}
      <nav className="bg-white border-b border-gray-200 shadow-sm lg:block hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 hidden xl:block">Assignment Portal</span>
                <span className="text-lg font-bold text-gray-900 xl:hidden">Portal</span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="flex items-center space-x-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu - Desktop */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                    {session?.user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm hidden 2xl:block">
                  <div className="font-medium text-gray-900">{session?.user.name}</div>
                  <div className="text-gray-500 capitalize">{session?.user.role}</div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handlesignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xl:inline">signOut</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Top Header - Mobile/Tablet */}
      <header className="bg-white border-b border-gray-200 shadow-sm lg:hidden sticky top-0 z-40">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Portal</span>
            </Link>

            <div className="flex items-center space-x-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                  {session?.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlesignOut}
                className="p-1.5"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile/Tablet Only */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-4 h-16">
          {links.slice(0, 4).map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 transition-colors relative",
                  isActive
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></div>
                )}
                <Icon className={cn("h-5 w-5", isActive && "text-blue-600")} />
                <span className={cn(
                  "text-xs font-medium leading-none",
                  isActive ? "text-blue-600" : "text-gray-600"
                )}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Spacing for Mobile Navigation */}
      <div className="lg:hidden h-16"></div>
    </>
  );
}
