import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRooms } from '@/hooks/useRooms';
import { Users, PlusCircle } from 'lucide-react';

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
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
        <div className="font-semibold">Rooms</div>
      </div>
      <div className="p-4 border-b flex-shrink-0">
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input 
              placeholder="Room name" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="min-w-0"
            />
            <Input 
              placeholder="Tag (category)" 
              value={tag} 
              onChange={e => setTag(e.target.value)}
              className="min-w-0"
            />
          </div>
          <div className="flex gap-3 items-center">
            <input 
              type="color" 
              value={color} 
              onChange={e => setColor(e.target.value)} 
              className="h-10 w-16 rounded-md border flex-shrink-0" 
              title="Pick color" 
            />
            <Button onClick={handleCreate} disabled={!canCreate} className="flex-1 sm:flex-initial">
              <PlusCircle className="h-4 w-4 mr-1" />
              Create Room
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {loading ? (
          <div className="text-sm text-gray-500">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="text-sm text-gray-500">No rooms yet. Create the first one!</div>
        ) : (
          rooms.map((room) => {
            const count = participantCounts[room.id] ?? 0;
            return (
              <Card key={room.id} className="hover:shadow-sm transition cursor-pointer min-w-0" onClick={() => { onEnterRoom(room.id); joinRoom(room.id); }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="h-6 w-6 rounded flex-shrink-0" style={{ backgroundColor: room.color || '#3b82f6' }} />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{room.name}</div>
                        {room.tag && <div className="text-xs text-muted-foreground truncate">{room.tag}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {count}
                      </Badge>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); onEnterRoom(room.id); joinRoom(room.id); }}>
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