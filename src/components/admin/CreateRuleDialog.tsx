
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  category: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
});

type FormData = z.infer<typeof formSchema>;

type CreateRuleDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
  isSubmitting: boolean;
  editingRule?: FormData | null;
};

const CreateRuleDialog: React.FC<CreateRuleDialogProps> = ({
  open,
  setOpen,
  onSubmit,
  isSubmitting,
  editingRule,
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: editingRule || {
      title: "",
      content: "",
      category: "",
      priority: "medium"
    },
  });

  const {
    register, handleSubmit, setValue, reset, watch, formState: { errors }
  } = form;

  // Form persistence
  const { clearSavedData } = useFormPersistence(
    'rule-form',
    form,
    !editingRule
  );

  useEffect(() => {
    if (editingRule) {
      setValue("title", editingRule.title || "");
      setValue("content", editingRule.content || "");
      setValue("category", editingRule.category || "");
      setValue("priority", editingRule.priority || "medium");
    } else {
      reset({
        title: "",
        content: "",
        category: "",
        priority: "medium"
      });
    }
  }, [editingRule, setValue, reset]);

  const selectedCategory = watch("category");
  const selectedPriority = watch("priority");

  const internalOnSubmit = (data: FormData) => {
    onSubmit(data);
    reset();
    clearSavedData();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} className="mr-1" />
          {editingRule ? "Edit Rule" : "Create Rule"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingRule ? "Edit Rule" : "Add Rule"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(internalOnSubmit)} className="space-y-4 mt-3">
          <div>
            <Label htmlFor="title">Rule Title *</Label>
            <Input id="title" {...register("title")} placeholder="Enter rule title" />
            {errors.title?.message && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="content">Rule Content *</Label>
            <Textarea id="content" {...register("content")} placeholder="Enter detailed rule description" rows={3} />
            {errors.content?.message && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="conduct">Conduct</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={selectedPriority} onValueChange={(value) => setValue("priority", value as "high" | "medium" | "low")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (editingRule ? "Updating..." : "Creating...") : (editingRule ? "Update Rule" : "Create Rule")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRuleDialog;
