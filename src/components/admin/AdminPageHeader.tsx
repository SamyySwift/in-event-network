
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  tabs?: { id: string, label: string }[];
  defaultTab?: string;
  children: React.ReactNode;
  onTabChange?: (value: string) => void;
  actionForm?: React.ReactNode; // New prop for action form/content
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  tabs,
  defaultTab,
  children,
  onTabChange,
  actionForm,
}) => {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAction = () => {
    if (actionForm) {
      setIsDialogOpen(true);
    } else if (onAction) {
      onAction();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row items-center justify-between'}`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        
        {actionLabel && (actionForm || onAction) && (
          actionForm ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className={`flex items-center gap-1 ${isMobile ? 'w-full justify-center' : 'whitespace-nowrap'}`}
                >
                  <Plus size={16} />
                  <span className="ml-1">{actionLabel}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{actionLabel}</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to complete this action.
                  </DialogDescription>
                </DialogHeader>
                {actionForm}
              </DialogContent>
            </Dialog>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleAction} 
                    className={`flex items-center gap-1 ${isMobile ? 'w-full justify-center' : 'whitespace-nowrap'}`}
                  >
                    <Plus size={16} />
                    {isMobile ? 
                      <span className="ml-1">{actionLabel}</span> : 
                      actionLabel
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{actionLabel}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        )}
      </div>

      {tabs ? (
        <Tabs defaultValue={defaultTab || tabs[0].id} onValueChange={onTabChange} className="space-y-4">
          <TabsList className={`${isMobile ? 'w-full overflow-x-auto' : ''}`}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {children}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="pt-6">
            {children}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPageHeader;
