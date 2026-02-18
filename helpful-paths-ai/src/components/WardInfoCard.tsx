import { motion } from "framer-motion";
import { Building2, DoorOpen, Layers, MapPin, Tag } from "lucide-react";
import { Department } from "@/data/hospitalData";

interface WardInfoCardProps {
  dept: Department;
  lang: "en" | "ta";
}

export default function WardInfoCard({ dept, lang }: WardInfoCardProps) {
  const isTA = lang === "ta";

  const items = [
    {
      icon: Tag,
      label: "Department / பிரிவு",
      value: `${dept.name} / ${dept.nameTA}`
    },
    {
      icon: DoorOpen,
      label: "Ward No. / வார்டு எண்",
      value: dept.room
    },
    {
      icon: Layers,
      label: "Floor / தளம்",
      value: `${dept.floor === 0 ? "Ground Floor" : `Floor ${dept.floor}`} / ${dept.floor === 0 ? "தரை தளம்" : `தளம் ${dept.floor}`}`
    },
    {
      icon: Building2,
      label: "Block / பிளாக்",
      value: `Block ${dept.block}`
    },
    {
      icon: MapPin,
      label: "Side / பக்கம்",
      value: `${dept.side} / ${dept.sideTA}`
    },
    {
      icon: MapPin,
      label: "Category / வகை",
      value: dept.category
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-secondary border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary/10 border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
          {dept.room}
        </div>
        <div>
          <p className="text-base font-semibold text-foreground leading-tight">
            {dept.name}<br />
            <span className="text-sm opacity-80">{dept.nameTA}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">Ward Details / வார்டு தகவல்</p>
        </div>
      </div>

      {/* Details grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 p-3 rounded-lg bg-muted/50 ${i === 0 ? "col-span-2" : ""}`}
          >
            <item.icon size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground leading-tight mb-0.5">{item.label}</p>
              <p className="text-sm font-semibold text-foreground leading-tight">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
