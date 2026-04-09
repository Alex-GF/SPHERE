import { FaCheck } from "react-icons/fa6";

type SelectableCardProps = {
  readonly name: string;
  readonly selected: boolean;
  readonly onClick: () => void;
};

export default function SelectablePricingCard({ name, selected, onClick }: SelectableCardProps) {
  return (
    <div className={`relative cursor-pointer rounded-[10px] px-5 py-2 transition-[border,box-shadow] duration-300 ${selected ? 'border-2 border-sphere-primary-700' : 'border border-slate-300'}`} onClick={onClick}>
      <p>{name}</p>
      {selected && (
        <div className="absolute right-[-10px] top-[-10px] flex h-5 w-5 items-center justify-center rounded-full bg-sphere-primary-700 text-white">
          <FaCheck />
        </div>
      )}
    </div>
  );
};