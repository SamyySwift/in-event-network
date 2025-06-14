
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Info, AlertTriangle, Zap } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Rule } from "@/hooks/useRules";

interface RuleCardProps {
  rule: Rule;
  isDeleting: boolean;
  onEdit: (rule: Rule) => void;
  onDelete: (rule: Rule) => void;
}

const RuleCard: React.FC<RuleCardProps> = ({
  rule,
  isDeleting,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="glass-card overflow-hidden hover:shadow-xl transition-all">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">{rule.title}</CardTitle>
          <CardDescription className="text-xs mt-1">
            Created: {format(new Date(rule.created_at), "MMM d, yyyy")}
          </CardDescription>
        </div>
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onEdit(rule)}
                >
                  <Edit size={16} />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Rule</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isDeleting}
              >
                <Trash2 size={16} />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Rule</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this rule? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(rule)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-2">
          {rule.category && (
            <Badge variant="outline" className="text-xs capitalize">{rule.category}</Badge>
          )}
          {rule.priority && (
            <Badge className={
              rule.priority === 'high' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
              rule.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
              'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }>
              <div className="flex items-center gap-1 text-xs">
                {rule.priority === 'high' && <AlertTriangle className="h-3 w-3" />}
                {rule.priority === 'medium' && <Zap className="h-3 w-3" />}
                {rule.priority === 'low' && <Info className="h-3 w-3" />}
                <span className="capitalize">{rule.priority}</span>
              </div>
            </Badge>
          )}
        </div>
        {rule.content && (
          <div className="mt-3 text-sm text-muted-foreground">{rule.content}</div>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleCard;
