import { Dumbbell, Flame, Medal, Target, Moon, Shield, Weight } from "lucide-react";

export default function AchievementItem({ type, achievedAt }: { type: string, achievedAt: Date }) {
  let config = { icon: Medal, title: "Achievement", color: "text-gray-500", bg: "bg-gray-100" };

  switch (type) {
    case "FIRST_WORKOUT":
      config = { icon: Dumbbell, title: "First Blood", color: "text-blue-500", bg: "bg-blue-100" };
      break;
    case "STREAK_7_DAYS":
      config = { icon: Flame, title: "7-Day Streak", color: "text-orange-500", bg: "bg-orange-100" };
      break;
    case "PR_HIT":
      config = { icon: Medal, title: "PR Crusher", color: "text-yellow-600", bg: "bg-yellow-100" };
      break;
    case "LIFT_1000_KG":
      config = { icon: Weight, title: "1000kg Volume", color: "text-purple-500", bg: "bg-purple-100" };
      break;
    case "CLUB_100_KG":
      config = { icon: Target, title: "100kg Club", color: "text-rose-500", bg: "bg-rose-100" };
      break;
    case "NIGHT_OWL":
      config = { icon: Moon, title: "Night Owl", color: "text-indigo-500", bg: "bg-indigo-100" };
      break;
    case "IRON_STREAK":
      config = { icon: Shield, title: "Iron Streak", color: "text-slate-700", bg: "bg-slate-200" };
      break;
    case "LEAGUE_GOLD":
      config = { icon: Medal, title: "League Champion", color: "text-yellow-500", bg: "bg-yellow-100" };
      break;
    case "LEAGUE_SILVER":
      config = { icon: Medal, title: "League Runner-Up", color: "text-slate-400", bg: "bg-slate-100" };
      break;
    case "LEAGUE_BRONZE":
      config = { icon: Medal, title: "League Contender", color: "text-amber-700", bg: "bg-amber-100" };
      break;
    default:
      config = { 
        icon: Medal, 
        title: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
        color: "text-green-600", 
        bg: "bg-green-100" 
      };
      break;
  }

  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className={['p-3 rounded-xl', config.bg, config.color].join(' ')}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div>
          <span className="block font-bold text-slate-800">{config.title}</span>
          <span className="text-xs font-medium text-slate-400">
            {new Date(achievedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}
