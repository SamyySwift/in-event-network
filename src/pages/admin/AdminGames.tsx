import { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useWordSearchGames } from '@/hooks/useWordSearchGames';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Gamepad2 } from 'lucide-react';
import { generateWordSearchGrid } from '@/utils/wordSearchGenerator';
import { toast } from 'sonner';

const AdminGames = () => {
  const { selectedEventId } = useAdminEventContext();
  const { games, isLoading, createGame, deleteGame, updateGame } = useWordSearchGames(selectedEventId);

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [wordsInput, setWordsInput] = useState('');
  const [gridSize, setGridSize] = useState(15);

  const handleCreateGame = async () => {
    if (!selectedEventId) {
      toast.error('Please select an event first');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const words = wordsInput
      .split('\n')
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length < 3) {
      toast.error('Please enter at least 3 words');
      return;
    }

    const { grid, positions } = generateWordSearchGrid(words, gridSize);

    await createGame.mutateAsync({
      event_id: selectedEventId,
      title,
      words,
      grid_size: gridSize,
      grid_data: { grid, positions },
    });

    setIsCreating(false);
    setTitle('');
    setWordsInput('');
  };

  const handleToggleActive = async (gameId: string, currentStatus: boolean) => {
    await updateGame.mutateAsync({
      id: gameId,
      is_active: !currentStatus,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Games</h1>
            <p className="text-muted-foreground">Create and manage word search games for your attendees</p>
          </div>
        </div>

        <div className="space-y-4">
          {!isCreating ? (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Word Search Game
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create New Word Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Game Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Tech Conference Word Search"
                  />
                </div>

                <div>
                  <Label htmlFor="words">
                    Words (one per line, minimum 3 words)
                  </Label>
                  <Textarea
                    id="words"
                    value={wordsInput}
                    onChange={(e) => setWordsInput(e.target.value)}
                    placeholder="Enter words, one per line"
                    rows={8}
                  />
                </div>

                <div>
                  <Label htmlFor="gridSize">Grid Size: {gridSize}x{gridSize}</Label>
                  <Input
                    id="gridSize"
                    type="range"
                    min="10"
                    max="20"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateGame} disabled={createGame.isPending}>
                    Create Game
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                    disabled={createGame.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {isLoading ? (
              <p>Loading games...</p>
            ) : games.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No games created yet. Create your first word search game!
                </CardContent>
              </Card>
            ) : (
              games.map((game) => (
                <Card key={game.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{game.title}</CardTitle>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`active-${game.id}`}>Active</Label>
                          <Switch
                            id={`active-${game.id}`}
                            checked={game.is_active}
                            onCheckedChange={() =>
                              handleToggleActive(game.id, game.is_active)
                            }
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteGame.mutate(game.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {game.words.length} words • {game.grid_size}x{game.grid_size} grid
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {game.words.map((word, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-muted rounded text-sm"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGames;
