import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { ChevronDown, Plus, MessageSquare } from "lucide-react";
import type { SessionMeta } from "./storage";

type Props = {
  sessions: SessionMeta[];
  currentSessionId: string;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onViewOlder?: () => void;
  loadingOlder?: boolean;
  maxLocalToShow?: number; // پیش‌فرض 5
};

export default function ChatHeader({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onViewOlder,
  loadingOlder,
  maxLocalToShow = 5,
}: Props) {
  const top = sessions.slice(0, maxLocalToShow);

  return (
    <div className="border-b px-4 py-3 rounded-t-lg border-border bg-muted/50 flex-shrink-0 w-full">
      <div className="flex flex-col gap-3">
        {/* عنوان + توضیح (بالا) */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">
              AI
            </span>
          </div>
          <div>
            <div className="font-semibold">QuestApply Assistant</div>
            <div className="text-xs text-muted-foreground">
              Ask me anything about universities
            </div>
          </div>
        </div>

        {/* دکمه‌ها (زیرِ متن) */}
        <div className="flex justify-around items-center gap-2">
          <Button
            onClick={onNewChat}
            className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-1" />
            New chat
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8">
                <MessageSquare className="w-4 h-4 mr-2" />
                History Chat
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              <DropdownMenuLabel>Your sessions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* باکس ثابت + اسکرول */}
              <div className="max-h-64 overflow-y-auto">
                {top.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-muted-foreground">
                    No sessions yet
                  </div>
                ) : (
                  top.map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      className="flex-col items-start gap-1"
                      onClick={() => onSelectSession(s.id)}
                    >
                      <div className="text-sm font-medium truncate w-full">
                        {s.title || "Untitled chat"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(s.updatedAt).toLocaleString()} •{" "}
                        {s.messageCount} msgs
                      </div>
                    </DropdownMenuItem>
                  ))
                )}

                {sessions.length > maxLocalToShow && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={loadingOlder}
                      onClick={onViewOlder}
                    >
                      {loadingOlder ? "Loading older…" : "View older sessions"}
                    </DropdownMenuItem>
                  </>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
