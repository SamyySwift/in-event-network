
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, ArrowUpCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

export interface Question {
  id: string;
  content: string;
  profiles?: { name: string; photo_url?: string | null };
  upvotes: number;
  is_anonymous: boolean;
  is_answered: boolean;
  response?: string | null;
  response_created_at?: string | null;
  created_at: string;
  event_name?: string;
  session_info?: {
    session_title?: string;
    speaker_name?: string;
    session_time?: string;
  };
}

type QuestionCardProps = {
  question: Question;
  isMarkingAnswered: boolean;
  isDeleting: boolean;
  isResponding: boolean;
  respondingTo?: string | null;
  responseText?: string;
  onStartResponse: (id: string) => void;
  onSubmitResponse: (id: string, response: string) => void;
  onCancelResponse: () => void;
  onMarkAsAnswered: (id: string) => void;
  onDelete: (id: string) => void;
  setResponseText: (text: string) => void;
  selectedEventId?: string | null;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isMarkingAnswered,
  isDeleting,
  isResponding,
  respondingTo,
  responseText,
  onStartResponse,
  onSubmitResponse,
  onCancelResponse,
  onMarkAsAnswered,
  onDelete,
  setResponseText,
  selectedEventId,
}) => {
  const userName = question.profiles?.name || "Anonymous User";
  const userPhoto = question.profiles?.photo_url;

  return (
    <Card className="glass-card overflow-hidden hover:shadow-xl transition-all">
      <CardHeader className="pb-2 flex flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={userPhoto || ""} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{userName}</CardTitle>
            <CardDescription>
              {format(new Date(question.created_at), "MMM d, yyyy h:mm a")}
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge
            variant={question.is_answered ? "success" : "info"}
            className="text-xs"
          >
            {question.is_answered ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Answered
              </>
            ) : (
              <>
                <MessageSquare className="h-3 w-3 mr-1" />
                Pending
              </>
            )}
          </Badge>
          {question.session_info ? (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              <span>
                {question.session_info.session_title ||
                  `${question.session_info.speaker_name}'s Session`}
              </span>
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-xs"
            >
              <MessageSquare size={12} />
              General
            </Badge>
          )}
          {!selectedEventId && question.event_name && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 text-xs"
            >
              {question.event_name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-base mb-3">{question.content}</p>
        {question.response && (
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-200 rounded">
            <p className="text-sm font-medium text-blue-800 mb-1">
              Admin Response:
            </p>
            <p className="text-blue-700">{question.response}</p>
            {question.response_created_at && (
              <p className="text-xs text-blue-600 mt-1">
                Responded on{" "}
                {format(new Date(question.response_created_at), "MMM d, yyyy h:mm a")}
              </p>
            )}
          </div>
        )}

        {respondingTo === question.id && (
          <div className="mt-4 space-y-3">
            <Textarea
              placeholder="Type your response here..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onSubmitResponse(question.id, responseText ?? "")}
                disabled={!responseText?.trim() || isResponding}
              >
                {isResponding ? "Submitting..." : "Submit Response"}
              </Button>
              <Button size="sm" variant="outline" onClick={onCancelResponse}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2 text-sm mt-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <ArrowUpCircle size={14} /> {question.upvotes} upvotes
          </Badge>
          {question.is_anonymous && (
            <Badge variant="secondary">Anonymous</Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3 flex justify-between">
        <div className="text-sm text-muted-foreground">
          Question ID: {question.id}
        </div>
        <div className="flex gap-2">
          {!question.response && respondingTo !== question.id && (
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={() => onStartResponse(question.id)}
            >
              Respond
            </Button>
          )}
          {!question.is_answered && (
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => onMarkAsAnswered(question.id)}
              disabled={isMarkingAnswered}
            >
              Mark Answered
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={() => onDelete(question.id)}
            disabled={isDeleting}
          >
            Remove
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;
