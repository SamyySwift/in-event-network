import AdminLayout from "@/components/layouts/AdminLayout";
import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
import { useWordSearchGames } from "@/hooks/useWordSearchGames";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Gamepad2, Lightbulb, Link2, ExternalLink } from "lucide-react";
import { generateWordSearchGrid } from "@/utils/wordSearchGenerator";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

const AdminGames = () => {
  const { selectedEventId } = useAdminEventContext();
  const { games, isLoading, createGame, deleteGame, updateGame } =
    useWordSearchGames(selectedEventId);
  const { toast: toastHook } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [wordsInput, setWordsInput] = useState("");
  const [gridSize, setGridSize] = useState(15);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [theme, setTheme] = useState("general");
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);

  const THEMED_WORDS = {
    tech: [
      "JAVASCRIPT",
      "PYTHON",
      "DATABASE",
      "CODING",
      "ALGORITHM",
      "BINARY",
      "NETWORK",
      "SOFTWARE",
      "HARDWARE",
      "CYBERSECURITY",
    ],
    business: [
      "STRATEGY",
      "PROFIT",
      "REVENUE",
      "MARKETING",
      "SALES",
      "BUDGET",
      "INVESTMENT",
      "PARTNERSHIP",
      "INNOVATION",
      "LEADERSHIP",
    ],
    health: [
      "WELLNESS",
      "NUTRITION",
      "FITNESS",
      "MEDICINE",
      "THERAPY",
      "EXERCISE",
      "MINDFULNESS",
      "HYGIENE",
      "IMMUNITY",
      "HEALTHCARE",
    ],
    education: [
      "LEARNING",
      "KNOWLEDGE",
      "TEACHER",
      "STUDENT",
      "CLASSROOM",
      "STUDY",
      "RESEARCH",
      "ACADEMIC",
      "DEGREE",
      "SCHOLARSHIP",
    ],
    general: [],
  };

  const handleCreateGame = async () => {
    if (!selectedEventId) {
      toast.error("Please select an event first");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const words = wordsInput
      .split("\n")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length < 3) {
      toast.error("Please enter at least 3 words");
      return;
    }

    const { grid, positions } = generateWordSearchGrid(words, gridSize);

    await createGame.mutateAsync({
      event_id: selectedEventId,
      title,
      words,
      grid_size: gridSize,
      grid_data: { grid, positions },
      difficulty,
      theme,
      hints_enabled: hintsEnabled,
      time_limit: timeLimit,
    });

    setIsCreating(false);
    setTitle("");
    setWordsInput("");
    setDifficulty("medium");
    setTheme("general");
    setHintsEnabled(false);
    setTimeLimit(null);
  };

  const handleToggleActive = async (gameId: string, currentStatus: boolean) => {
    await updateGame.mutateAsync({
      id: gameId,
      is_active: !currentStatus,
    });
  };

  const generateShareableLink = () => {
    if (!selectedEventId) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/live-games/${selectedEventId}`;
  };

  const copyShareableLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link);
    toastHook({
      title: "Link copied!",
      description: "Shareable link has been copied to clipboard",
    });
  };

  const openInNewTab = () => {
    const link = generateShareableLink();
    window.open(link, '_blank');
  };

  return (
    <AdminPageHeader
      title="Games"
      description="Create and manage word search games for your attendees"
    >
      <div className="space-y-4">
        {selectedEventId && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Live Leaderboard Link</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Share this link to display the live game leaderboard
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono break-all">
                      {generateShareableLink()}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyShareableLink}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={openInNewTab}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(v: any) => setDifficulty(v)}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (10x10 grid)</SelectItem>
                      <SelectItem value="medium">
                        Medium (15x15 grid)
                      </SelectItem>
                      <SelectItem value="hard">Hard (20x20 grid)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="theme">Word Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="health">Health & Wellness</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {theme !== "general" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const themedWords =
                      THEMED_WORDS[theme as keyof typeof THEMED_WORDS] || [];
                    setWordsInput(themedWords.join("\n"));
                    const newGridSize =
                      difficulty === "easy"
                        ? 10
                        : difficulty === "hard"
                        ? 20
                        : 15;
                    setGridSize(newGridSize);
                  }}
                  className="w-full"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Use {theme.charAt(0).toUpperCase() + theme.slice(1)} Themed
                  Words
                </Button>
              )}

              <div>
                <Label htmlFor="words">
                  Words (one per line, minimum 3 words)
                </Label>
                <Textarea
                  id="words"
                  value={wordsInput}
                  onChange={(e) => setWordsInput(e.target.value)}
                  placeholder="Enter words, one per line, or use themed words above"
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gridSize">
                    Grid Size: {gridSize}x{gridSize}
                  </Label>
                  <Input
                    id="gridSize"
                    type="range"
                    min="10"
                    max="20"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="timeLimit">
                    Time Limit (optional, in seconds)
                  </Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="30"
                    placeholder="No limit"
                    value={timeLimit || ""}
                    onChange={(e) =>
                      setTimeLimit(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="hints"
                  checked={hintsEnabled}
                  onCheckedChange={setHintsEnabled}
                />
                <Label htmlFor="hints">Enable hints for players</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateGame}
                  disabled={createGame.isPending}
                >
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
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap text-sm">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                        {game.difficulty || "medium"}
                      </span>
                      {game.theme && game.theme !== "general" && (
                        <span className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full">
                          {game.theme}
                        </span>
                      )}
                      {game.hints_enabled && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
                          Hints enabled
                        </span>
                      )}
                      {game.time_limit && (
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full">
                          {game.time_limit}s limit
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {game.words.length} words • {game.grid_size}x
                      {game.grid_size} grid
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
    </AdminPageHeader>
  );
};

export default AdminGames;
