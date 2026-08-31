import { AlertCircle, Info, CheckCircle } from "lucide-react";

export const priorityConfig = {
  HIGH: {
    label: "High",
    className: "text-red-500 bg-red-100",
    icon: AlertCircle,
  },
  MEDIUM: {
    label: "Medium",
    className: "text-amber-500 bg-amber-100",
    icon: Info,
  },
  LOW: {
    label: "Low",
    className: "text-indigo-500 bg-indigo-100",
    icon: CheckCircle,
  },
};
