import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export function Accordion({ items, allowMultiple = false }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      if (openIds.includes(id)) {
        setOpenIds(openIds.filter((item) => item !== id));
      } else {
        setOpenIds([...openIds, id]);
      }
    } else {
      setOpenIds(openIds.includes(id) ? [] : [id]);
    }
  };

  return (
    <div className="space-y-2.5 w-full">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        return (
          <div
            key={item.id}
            className="border border-slate-200 rounded-xl overflow-hidden bg-white transition-all duration-200 hover:border-slate-300"
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-slate-800 hover:text-indigo-600 transition-colors focus:outline-none"
            >
              <span>{item.title}</span>
              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform duration-200 ${
                  isOpen ? "transform rotate-180 text-indigo-500" : ""
                }`}
              />
            </button>
            <div
              className={`transition-all duration-200 ease-in-out overflow-hidden ${
                isOpen ? "max-h-40 border-t border-slate-100" : "max-h-0"
              }`}
            >
              <div className="p-5 text-sm text-slate-600 leading-relaxed bg-slate-50">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
