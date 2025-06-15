
import React from "react";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

interface ListItemProps extends React.ComponentPropsWithoutRef<"a"> {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}
const ListItem = React.forwardRef<React.ElementRef<"a">, ListItemProps>(
  ({ className, title, children, icon, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white/10 focus:bg-white/10 text-white",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none flex items-center">
              <span className="mr-2 text-cyan-400">{icon}</span>
              {title}
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-white/60">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";
export default ListItem;
