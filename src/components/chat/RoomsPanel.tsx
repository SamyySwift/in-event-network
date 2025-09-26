import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRooms } from '@/hooks/useRooms';
import { Users, PlusCircle, Sparkles, MessageCircle } from 'lucide-react';

type RoomsPanelProps = {
  eventId?: string;
  onEnterRoom: (roomId: string) => void;
};

const RoomsPanel: React.FC<RoomsPanelProps> = ({ eventId, onEnterRoom }) => {
  const { rooms, participantCounts, createRoom, joinRoom, loading } = useRooms(eventId);
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
    <div className="h-full flex flex-col min-w-0 overflow-hidden">
      {/* Modern Header */}
      <div className="p-6 border-b border-border/50 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-primary-50/30 to-accent/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Chat Rooms</h2>
            <p className="text-sm text-muted-foreground">Connect with other attendees</p>
          </div>
        </div>
      </div>
      
      {/* Modern Create Room Section */}
      <div className="p-6 border-b border-border/50 flex-shrink-0 bg-card/50">
        <Card className="glass-card border-0 shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Create New Room</span>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Input 
                placeholder="Enter room name..." 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="min-w-0 border-border/50 bg-background/50 focus:bg-background transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input 
                  placeholder="Category (optional)" 
                  value={tag} 
                  onChange={e => setTag(e.target.value)}
                  className="min-w-0 border-border/50 bg-background/50 focus:bg-background transition-colors"
                />
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={color} 
                    onChange={e => setColor(e.target.value)} 
                    className="h-10 w-full rounded-lg border border-border/50 bg-background/50 cursor-pointer flex-shrink-0" 
                    title="Room color" 
                  />
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleCreate} 
              disabled={!canCreate} 
              className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modern Rooms List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading rooms...</p>
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="p-4 rounded-2xl bg-muted/30 w-fit mx-auto">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">No rooms yet</p>
              <p className="text-xs text-muted-foreground">Be the first to create a room!</p>
            </div>
          </div>
        ) : (
          rooms.map((room) => {
            const count = participantCounts[room.id] ?? 0;
            const isPopular = count >= 5;
            return (
              <Card 
                key={room.id} 
                className={`group glass-card hover:shadow-lg cursor-pointer min-w-0 transition-all duration-300 hover:-translate-y-1 ${isPopular ? 'ring-2 ring-primary/20' : ''}`}
                onClick={() => { onEnterRoom(room.id); joinRoom(room.id); }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="relative flex-shrink-0">
                        <div 
                          className="h-10 w-10 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300" 
                          style={{ backgroundColor: room.color || '#3b82f6' }}
                        />
                        {isPopular && (
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Sparkles className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                          {room.name}
                        </div>
                        {room.tag && (
                          <div className="text-xs text-muted-foreground truncate bg-muted/50 px-2 py-1 rounded-full w-fit">
                            {room.tag}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <Badge 
                        variant={count > 0 ? "default" : "secondary"} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-50 to-accent/20 text-primary border-primary/20"
                      >
                        <Users className="h-3 w-3" />
                        <span className="font-medium">{count}</span>
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="bg-primary/10 hover:bg-primary hover:text-primary-foreground transition-all duration-300 group-hover:scale-105"
                        onClick={(e) => { e.stopPropagation(); onEnterRoom(room.id); joinRoom(room.id); }}
                      >
                        Enter
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