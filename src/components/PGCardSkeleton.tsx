export function PGCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-[#FFFFFF] border border-[#E2E6E3] rounded-xl overflow-hidden flex flex-col animate-pulse"
    >
      <div className="aspect-[4/3] bg-[#ECEFEB]" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-40 bg-[#ECEFEB] rounded" />
        <div className="h-5 w-3/4 bg-[#E4E8E5] rounded" />
        <div className="h-4 w-full bg-[#ECEFEB] rounded" />
        <div className="h-4 w-2/3 bg-[#ECEFEB] rounded" />
        <div className="pt-3 border-t border-[#EEF0EE] flex gap-2">
          <div className="h-9 flex-1 bg-[#E4E8E5] rounded-lg" />
          <div className="h-9 w-24 bg-[#ECEFEB] rounded-lg" />
        </div>
      </div>
    </div>
  );
}
