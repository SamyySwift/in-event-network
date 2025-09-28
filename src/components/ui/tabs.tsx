
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

// File-level exports (Tabs, TabsList, TabsTrigger, TabsContent) remain the same

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Mobile-first: full width, horizontal scroll, proper spacing, accessible height
      "inline-flex w-full items-center gap-2 rounded-2xl bg-muted/70 p-1.5 text-muted-foreground shadow-sm h-auto min-h-[44px] overflow-x-auto sm:overflow-visible scrollbar-hide",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Larger tap targets, non-wrapping, smooth hover/active transitions
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm sm:text-base font-medium ring-offset-background transition-colors duration-200 h-11 sm:h-10 flex-shrink-0 hover:bg-background/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      // Consistent spacing below bar + smooth content transitions
      "mt-3 sm:mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-safe:data-[state=active]:animate-in motion-safe:data-[state=active]:fade-in-50 motion-safe:data-[state=active]:slide-in-from-top-1 motion-safe:data-[state=active]:duration-200",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
