import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import { fetchCalendar, type CalendarEvent } from "../../services/tasks";

const taskTypeColors: Record<string, string> = {
  watering: "bg-blue-500",
  weeding: "bg-yellow-500",
  harvest: "bg-orange-500",
  planting: "bg-green-500",
  other: "bg-purple-500",
};

// status → chip/bg colors
const statusChip: Record<CalendarEvent["status"], string> = {
  to_do: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
};

// status → event block colors in the grid
const statusBlock: Record<CalendarEvent["status"], string> = {
  to_do: "bg-yellow-500",
  in_progress: "bg-blue-500",
  done: "bg-green-500",
};

// status → French label
const statusLabel: Record<CalendarEvent["status"], string> = {
  to_do: "À faire",
  in_progress: "En cours",
  done: "Terminée",
};

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    fetchCalendar()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const monthName = currentDate.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  // const eventsByDate = useMemo(() => {
  //   const map: Record<string, CalendarEvent[]> = {};
  //   for (const e of events) {
  //     const key = new Date(e.date).toISOString().slice(0, 10); // YYYY-MM-DD
  //     (map[key] ||= []).push(e);
  //   }
  //   return map;
  // }, [events]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      (map[key] ||= []).push(e);
    }
    return map;
  }, [events]);

  const previousMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const openDetail = (e: CalendarEvent) => {
    setSelected(e);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 mb-1 capitalize">
            {monthName}
          </h1>
          <p className="text-gray-600">Planifiez vos activités au jardin</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousMonth}
            className="rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextMonth}
            className="rounded-xl"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-[#E0E0E0] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[#E0E0E0]">
          {days.map((day) => (
            <div key={day} className="p-4 text-center bg-[#F8F5F0]">
              <span className="text-gray-600">{day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {/* leading blanks */}
          {Array.from({
            length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1,
          }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-24 p-2 border-b border-r border-[#E0E0E0] bg-gray-50"
            />
          ))}

          {/* days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = `${currentDate.getFullYear()}-${String(
              currentDate.getMonth() + 1
            ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate[key] || [];
            const isToday =
              new Date().toDateString() ===
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
              ).toDateString();

            return (
              <div
                key={day}
                className={`min-h-24 p-2 border-b border-r border-[#E0E0E0] hover:bg-[#F8F5F0] transition-colors ${
                  isToday ? "bg-[#4CAF50]/5" : ""
                }`}
              >
                <div
                  className={`text-sm mb-2 ${
                    isToday ? "text-[#4CAF50]" : "text-gray-700"
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-1">
                  {dayEvents.map((e) => (
                    <button
                      key={`${e.id}-${e.date}`}
                      onClick={() => openDetail(e)}
                      className={`w-full text-left px-2 py-1 rounded text-xs text-white ${
                        statusBlock[e.status] ?? "bg-purple-500"
                      } hover:opacity-80 transition-opacity truncate`}
                    >
                      {e.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Date</p>
                <p className="text-gray-900">
                  {new Date(selected.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 mb-1">Statut</p>
                <Badge
                  className={
                    statusChip[selected.status] ?? "bg-gray-100 text-gray-800"
                  }
                >
                  {statusLabel[selected.status] ?? "À venir"}
                </Badge>
              </div>

              {selected.description && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Description</p>
                  <p className="text-gray-700">{selected.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
