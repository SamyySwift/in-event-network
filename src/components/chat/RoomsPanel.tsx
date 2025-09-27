import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRooms } from '@/hooks/useRooms';
import { Users, PlusCircle, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type RoomsPanelProps = {
  eventId?: string;
  onEnterRoom: (roomId: string) => void;
};

const RoomsPanel: React.FC<RoomsPanelProps> = ({ eventId, onEnterRoom }) => {
  const { rooms, participantCounts, createRoom, joinRoom, deleteRoom, loading } = useRooms(eventId);
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const canCreate = name.trim().length > 0;

  const handleCreate = async () => {
    if (!canCreate) return;
    await createRoom(name.trim(), tag.trim() || undefined, color || '#3b82f6');
    setName('');
    setTag('');
    setColor('#3b82f6');
  };

  return (
    <div className="h-full flex flex-col bg-background/40 backdrop-blur-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-background/70 backdrop-blur-xl border-b border-border/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl border border-border/20">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">
              Chat Rooms
            </h2>
            <p className="text-sm text-muted-foreground">Join or create private discussions</p>
          </div>
        </div>
      </div>

      {/* Create Room Form */}
      <div className="p-4 bg-background/50 backdrop-blur-xl border-b border-border/10">
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input 
              placeholder="Room name" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="bg-background/80 backdrop-blur-xl border-border/20 rounded-xl focus:ring-2 focus:ring-primary/20"
            />
            <Input 
              placeholder="Category (optional)" 
              value={tag} 
              onChange={e => setTag(e.target.value)}
              className="bg-background/80 backdrop-blur-xl border-border/20 rounded-xl focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Color:</span>
              <input 
                type="color" 
                value={color} 
                onChange={e => setColor(e.target.value)} 
                className="h-10 w-16 rounded-xl border border-border/20 cursor-pointer" 
                title="Pick room color" 
              />
            </div>
            <Button 
              onClick={handleCreate} 
              disabled={!canCreate}
              className="ml-auto rounded-xl bg-primary hover:bg-primary/90 shadow-lg hover:scale-105 transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </div>
        </div>
      </div>

      {/* Rooms List */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/20 hover:scrollbar-thumb-border/40"
        style={{ 
          touchAction: 'pan-y',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading rooms...</p>
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-muted/40 backdrop-blur-xl rounded-2xl mb-4 border border-border/20">
              <Users className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No rooms yet</h3>
            <p className="text-sm text-muted-foreground">Create the first room to start private discussions!</p>
          </div>
        ) : (
          rooms.map((room) => {
            const count = participantCounts[room.id] ?? 0;
            return (
              <Card 
                key={room.id} 
                className="group relative overflow-hidden bg-background/70 backdrop-blur-xl border border-border/20 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                onClick={() => { onEnterRoom(room.id); joinRoom(room.id); }}
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="relative p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div 
                        className="h-12 w-12 rounded-2xl border-2 border-white/20 shadow-lg flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                        style={{ backgroundColor: room.color || '#3b82f6' }}
                      >
                        {room.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                          {room.name}
                        </h3>
                        {room.tag && (
                          <p className="text-sm text-muted-foreground truncate">{room.tag}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <Badge 
                        variant="secondary" 
                        className="flex items-center gap-1.5 bg-background/60 backdrop-blur-xl border border-border/20 px-2 py-1"
                      >
                        <Users className="h-3 w-3" />
                        <span className="font-medium text-xs">{count}</span>
                      </Badge>
                      {currentUser?.id === room.created_by && (
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={(e) => { e.stopPropagation(); deleteRoom(room.id); }}
                          className="rounded-xl shadow-md hover:scale-110 transition-all duration-300 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); onEnterRoom(room.id); joinRoom(room.id); }}
                        className="rounded-xl bg-primary hover:bg-primary/90 shadow-md hover:scale-110 transition-all duration-300 text-xs px-3"
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoomsPanel;