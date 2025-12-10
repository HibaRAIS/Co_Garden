import {
  Calendar,
  User,
  Droplet,
  Scissors,
  ShoppingBasket,
  Sprout,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuPortal,
} from "./ui/dropdown-menu";

type UiStatus = "pending" | "in-progress" | "completed";
type UiType = "watering" | "weeding" | "harvest" | "planting" | "other";

export type UiTask = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD or ISO
  assignedTo: string; // CSV or name(s)
  assignedToId?: string;
  status: UiStatus;
  type: UiType;
  description?: string;
};

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: Task["status"]) => void;
  onEdit?: (task: Task) => void; // 👈 add
  onDelete?: (id: string) => void; // 👈 add
}

const taskIcons = {
  watering: Droplet,
  weeding: Scissors,
  harvest: ShoppingBasket,
  planting: Sprout,
  other: MoreHorizontal,
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

const statusLabels = {
  pending: "À faire",
  "in-progress": "En cours",
  completed: "Terminée",
};

// export function TaskCard({ task, onStatusChange }: TaskCardProps) {
//   const Icon = taskIcons[task.type];

//   return (
//     <div className="bg-white rounded-xl p-4 border border-[#E0E0E0] hover:shadow-lg transition-shadow">
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex items-start gap-3 flex-1">
//           <div className="p-2 rounded-lg bg-[#4CAF50]/10">
//             <Icon className="h-5 w-5 text-[#4CAF50]" />
//           </div>
//           <div className="flex-1">
//             <h4 className="text-gray-900 mb-1">{task.title}</h4>
//             {task.description && (
//               <p className="text-xs text-gray-600 mb-2">{task.description}</p>
//             )}
//             <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
//               <div className="flex items-center gap-1">
//                 <Calendar className="h-3 w-3" />
//                 <span>{new Date(task.date).toLocaleDateString('fr-FR')}</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <User className="h-3 w-3" />
//                 <span>{task.assignedTo}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//         <Badge className={statusColors[task.status]}>
//           {statusLabels[task.status]}
//         </Badge>
//       </div>

//       {task.status !== 'completed' && onStatusChange && (
//         <button
//           onClick={() => onStatusChange(task.id, task.status === 'pending' ? 'in-progress' : 'completed')}
//           className="w-full mt-2 py-2 px-4 rounded-lg bg-[#4CAF50] text-white hover:bg-[#2E7D32] transition-colors"
//         >
//           {task.status === 'pending' ? 'Commencer' : 'Terminer'}
//         </button>
//       )}
//     </div>
//   );
// }

export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const Icon = taskIcons[task.type];

  return (
    <div className="bg-white rounded-xl p-4 border border-[#E0E0E0] hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Only show dropdown menu if onEdit or onDelete are provided (admin only) */}
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="ml-2 inline-flex items-center justify-center h-8 w-8 rounded-lg 
                   bg-[#F1F5F9] hover:bg-[#E2E8F0] text-gray-600"
                  aria-label="Actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuPortal>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={8}
                  className="z-50 w-48 rounded-xl border border-slate-200 bg-white shadow-xl p-1
                   backdrop-blur supports-[backdrop-filter]:bg-white/95
                   data-[side=bottom]:animate-in data-[side=bottom]:slide-in-from-top-1
                   data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
                >
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(task);
                      }}
                      className="rounded-lg cursor-pointer"
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Modifier
                    </DropdownMenuItem>
                  )}

                  {onEdit && onDelete && (
                    <DropdownMenuSeparator className="my-1" />
                  )}

                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                      }}
                      className="rounded-lg cursor-pointer text-red-600 focus:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h4 className="text-gray-900 mb-1">{task.title}</h4>
            </div>

            {task.description && (
              <p className="text-xs text-gray-600 mb-2">{task.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.date).toLocaleDateString("fr-FR")}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{task.assignedTo}</span>
              </div>
            </div>
          </div>
        </div>

        <Badge className={statusColors[task.status]}>
          {statusLabels[task.status]}
        </Badge>
      </div>

      {task.status !== "completed" && onStatusChange && (
        <button
          onClick={() =>
            onStatusChange(
              task.id,
              task.status === "pending" ? "in-progress" : "completed"
            )
          }
          className="w-full mt-2 py-2 px-4 rounded-lg bg-[#4CAF50] text-white hover:bg-[#2E7D32] transition-colors"
        >
          {task.status === "pending" ? "Commencer" : "Terminer"}
        </button>
      )}
    </div>
  );
}
