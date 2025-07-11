
import React from "react";
import AdminDataTable from "@/components/admin/AdminDataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

type Speaker = {
  id: string;
  name: string;
  title?: string;
  company?: string;
  bio: string;
  photo_url?: string;
  session_title?: string;
  session_time?: string;
  time_allocation?: string;
  topic?: string; // Add this line
};

interface SpeakersTableProps {
  speakers: Speaker[];
  onEdit: (s: Speaker) => void;
  onDelete: (s: Speaker) => void;
}

const columns = [
  {
    accessorKey: "speaker",
    header: "Speaker",
    cell: (value: any, row: any) => {
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={row.photo_url} alt={row.name} />
            <AvatarFallback>
              {row.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-gray-500">
              {row.title && row.company
                ? `${row.title} at ${row.company}`
                : row.title || row.company || ""}
            </div>
            {row.topic && (
              <div className="text-sm text-blue-600 font-medium">
                Topic: {row.topic}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    header: "Session",
    accessorKey: "session_title",
    cell: (value: string, row: any) => (
      <div>
        <div className="font-medium">{value || "—"}</div>
        {row.session_time && (
          <div className="text-sm text-primary-600 dark:text-primary-400">
            {new Date(row.session_time).toLocaleDateString()} •{" "}
            {new Date(row.session_time).toLocaleTimeString()}
          </div>
        )}
      </div>
    ),
  },
  {
    header: "Time Allocation",
    accessorKey: "time_allocation",
    cell: (value: string) => (
      <div className="font-medium">
        {value || "—"}
      </div>
    ),
  },
  {
    header: "Bio",
    accessorKey: "bio",
    cell: (value: string) => (
      <div className="max-w-xs truncate" title={value}>
        {value}
      </div>
    ),
  },
];

const SpeakersTable: React.FC<SpeakersTableProps> = ({
  speakers,
  onEdit,
  onDelete,
}) => {
  return (
    <AdminDataTable
      columns={columns}
      data={speakers}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default SpeakersTable;
