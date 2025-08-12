"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  BookOpen,
  FileText,
  FolderOpen,
  Home,
  MessageSquare,
  Settings,
  Users
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home
  },
  {
    title: "Posts",
    href: "/admin/posts",
    icon: FileText,
    badge: "posts"
  },
  {
    title: "Comentarios",
    href: "/admin/comments",
    icon: MessageSquare,
    badge: "comments"
  },
  {
    title: "Categorías",
    href: "/admin/categories",
    icon: FolderOpen,
    badge: "categories"
  },
  {
    title: "Usuarios",
    href: "/admin/users", 
    icon: Users,
    badge: "users"
  },
  {
    title: "Configuración",
    href: "/admin/settings",
    icon: Settings
  }
]

interface AdminSidebarClientProps {
  children: React.ReactNode
  userCount: number
  colaboradorCount: number
  categoriesCount: number
  postsCount?: number
  commentsCount?: number
}

export function AdminSidebarClient({ 
  children, 
  userCount, 
  colaboradorCount, 
  categoriesCount,
  postsCount = 0, 
  commentsCount = 0 
}: AdminSidebarClientProps) {
  const pathname = usePathname()

  const getBadgeCount = (badgeType: string) => {
    switch (badgeType) {
      case "users":
        return userCount
      case "colaboradores":
        return colaboradorCount
      case "categories":
        return categoriesCount
      case "posts":
        return postsCount
      case "comments":
        return commentsCount
      default:
        return 0
    }
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* Header with trigger and title like Claude */}
        <SidebarHeader className="flex flex-row items-center justify-between border-b p-2">
          <h2 className="text-lg flex flex-row items-center gap-2 pl-1 font-semibold truncate group-data-[collapsible=icon]:hidden">
            <Image src="/favicon.svg" alt="Gabi Zimmer" width={32} height={32} />
            Admin
          </h2>
          <SidebarTrigger className="h-8 w-8 shrink-0" />
        </SidebarHeader>
        
        <SidebarContent>
          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge && getBadgeCount(item.badge) > 0 && (
                        <SidebarMenuBadge>{getBadgeCount(item.badge)}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Acceso Rápido */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Acceso Rápido</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Ver Sitio de Gabi"
                  >
                    <Link href="/" className="text-purple-600 hover:text-purple-800">
                      <Home />
                      <span>Ver Sitio</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Ver Blog de Gabi"
                  >
                    <Link href="/blog" className="text-wine-accent hover:text-wine-primary">
                      <BookOpen />
                      <span>Ver Blog</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarRail />
      </Sidebar>
      
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}