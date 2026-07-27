import {
  Church,
  BookOpen,
  Trophy,
  Star,
  Users,
  Heart,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";

// We create a small icon map since lucide doesn't have "Hands" or "Cross"
// We'll substitute appropriate icons
const iconMap: Record<string, React.ElementType> = {
  church: Church,
  hands: Heart,
  book: BookOpen,
  trophy: Trophy,
  star: Star,
  cross: BookOpen,
  users: Users,
  heart: Heart,
};

interface Service {
  id: string;
  title: string;
  description: string;
  day: string;
  time: string;
  location: string;
  icon: string;
}

export default function ServiceCard({ service }: { service: Service }) {
  const Icon = iconMap[service.icon] || Calendar;

  return (
    <div className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-colors duration-300">
          <Icon
            size={22}
            className="text-primary group-hover:text-white transition-colors duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">
            {service.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {service.description}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <Calendar size={12} />
              <span>{service.day}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={12} />
              <span>{service.time}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin size={12} />
              <span>{service.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
