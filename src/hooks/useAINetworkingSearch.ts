
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAINetworkingSearch = () => {
  const [aiResults, setAIResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAISearch = async (query: string, attendees: any[]) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-networking-search", {
        body: { query, attendees },
      });
      if (error) throw error;
      setAIResults(data?.aiResult);
      return data?.aiResult;
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { aiResults, loading, error, runAISearch };
};
