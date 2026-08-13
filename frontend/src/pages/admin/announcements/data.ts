import { AlertCircle, Info, CheckCircle } from "lucide-react";

export const priorityConfig = {
  high: {
    label: "High",
    className: "text-red-500 bg-red-100",
    icon: AlertCircle,
  },
  medium: {
    label: "Medium",
    className: "text-amber-500 bg-amber-100",
    icon: Info,
  },
  low: {
    label: "Low",
    className: "text-indigo-500 bg-indigo-100",
    icon: CheckCircle,
  },
};
