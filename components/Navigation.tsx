'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Package, 
  Wrench, 
  FileText, 
  DollarSign, 
  Settings,
  Menu,
  X,
  ChevronDown,
  Play
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { 
    name: 'Management', 
    icon: Settings,
    children: [
      { name: 'Clients', href: '/clients', icon: Users },
      { name: 'Vendors', href: '/vendors', icon: Users },
      { name: 'Items', href: '/items', icon: Package },
      { name: 'Services', href: '/services', icon: Wrench },
      { name: 'Technicians', href: '/technicians', icon: Users },
    ]
  },
  { name: 'Orders', href: '/orders', icon: FileText },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Payments', href: '/payments', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Demo', href: '/demo', icon: Play },
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-600">
                MOLANT ICT
              </Link>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative">
                  {item.children ? (
                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={cn(
                          'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200',
                          openDropdown === item.name
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        )}
                      >
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </button>
                      
                      {openDropdown === item.name && (
                        <div className="absolute z-10 left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <div className="py-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.name}
                                href={child.href}
                                className={cn(
                                  'flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
                                  isActive(child.href) && 'bg-primary-50 text-primary-700'
                                )}
                                onClick={() => setOpenDropdown(null)}
                              >
                                <child.icon className="h-4 w-4 mr-3" />
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200',
                        isActive(item.href)
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      )}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="w-full text-left px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    
                    {openDropdown === item.name && (
                      <div className="pl-6 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              'block px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                              isActive(child.href) && 'text-primary-700 bg-primary-50'
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <span className="flex items-center">
                              <child.icon className="h-4 w-4 mr-3" />
                              {child.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'block px-3 py-2 text-base font-medium',
                      isActive(item.href)
                        ? 'text-primary-700 bg-primary-50 border-r-2 border-primary-500'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
} 