interface IndicatorProps {
  label: string;
  ok: boolean;
  description: string;
  critical?: boolean;
}

export const Indicator = ({ label, ok, description, critical = false }: IndicatorProps) => (
  <div className="flex items-center gap-2">
    {label}
    <div className={`h-2 w-2 rounded-full ${ok ? 'bg-green-500' : critical ? 'bg-red-500' : 'bg-amber-500'}`}></div>
    {description}
  </div>
);
