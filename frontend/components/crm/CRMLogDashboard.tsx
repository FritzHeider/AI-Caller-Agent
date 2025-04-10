// Path: /frontend/components/ui/crm/CRMLogDashboard.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CalendarIcon,
  StarIcon,
  DownloadIcon,
  Volume2,
  RefreshCcw,
  Flame,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";

export default function CRMLogDashboard() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [tagged, setTagged] = useState({});
  const [loading, setLoading] = useState(false);
  const [filterHotLeads, setFilterHotLeads] = useState(false);
  const [filterTodayOnly, setFilterTodayOnly] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm-logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const isToday = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return date.toDateString() === today.toDateString();
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.lead_transcript.toLowerCase().includes(search.toLowerCase()) ||
        log.ai_response.toLowerCase().includes(search.toLowerCase());
      const isHotLead =
        log.ai_response.toLowerCase().includes("booked") ||
        log.ai_response.toLowerCase().includes("confirmed");
      const isFromToday = isToday(log.timestamp);

      return (
        matchesSearch &&
        (!filterHotLeads || isHotLead) &&
        (!filterTodayOnly || isFromToday)
      );
    });
  }, [logs, search, filterHotLeads, filterTodayOnly]);

  const toggleTag = (index) => {
    setTagged((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const exportCSV = () => {
    const header = ["Timestamp", "Lead Transcript", "AI Response", "Audio URL"];
    const csvContent = [
      header.join(","),
      ...logs.map((log) => [
        log.timestamp,
        JSON.stringify(log.lead_transcript),
        JSON.stringify(log.ai_response),
        log.audio_url || ""
      ].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "crm_logs_export.csv");
  };

  const playAudio = (url) => {
    const audio = new Audio(url);
    audio.play();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">📊 CRM Call Logs</h1>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={fetchLogs} variant="outline" disabled={loading}>
            <RefreshCcw className="w-4 h-4 mr-2 animate-spin-slow" /> Refresh
          </Button>
          <Button onClick={exportCSV} variant="secondary">
            <DownloadIcon className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button
            onClick={() => setFilterHotLeads(!filterHotLeads)}
            variant={filterHotLeads ? "default" : "outline"}
          >
            <Flame className="w-4 h-4 mr-2" /> {filterHotLeads ? "Hot Leads" : "All Leads"}
          </Button>
          <Button
            onClick={() => setFilterTodayOnly(!filterTodayOnly)}
            variant={filterTodayOnly ? "default" : "outline"}
          >
            <Clock className="w-4 h-4 mr-2" /> {filterTodayOnly ? "Today Only" : "All Time"}
          </Button>
        </div>
      </div>

      <Input
        className="w-full"
        placeholder="Search leads or AI responses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <ScrollArea className="h-[75vh]">
        <div className="grid gap-4">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-muted-foreground">No matching logs found.</p>
          ) : (
            filteredLogs.map((log, index) => (
              <Card key={index} className={`shadow-md ${tagged[index] ? 'border-yellow-400' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {new Date(log.timestamp).toLocaleString()}
                    </Badge>
                    <div className="flex gap-2">
                      {log.audio_url && (
                        <Button size="sm" onClick={() => playAudio(log.audio_url)} variant="outline">
                          <Volume2 className="w-4 h-4 mr-1" /> Play
                        </Button>
                      )}
                      <Button size="sm" onClick={() => toggleTag(index)} variant={tagged[index] ? "default" : "outline"}>
                        <StarIcon className="w-4 h-4 mr-1" /> {tagged[index] ? "Tagged" : "Tag Lead"}
                      </Button>
                    </div>
                  </div>
                  <p className="font-semibold text-lg">🗣️ Lead Said:</p>
                  <p className="mb-2 text-muted-foreground whitespace-pre-wrap">{log.lead_transcript}</p>
                  <p className="font-semibold text-lg">🤖 AI Replied:</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{log.ai_response}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}