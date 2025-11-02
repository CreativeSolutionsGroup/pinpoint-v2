import Carousel from "@/components/ui/carousel";

export default function Home() {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="min-h-1/3 flex gap-2 p-4 overflow-x-auto snap-x snap-mandatory scroll-smooth">
        <Carousel className="w-full h-full gap-3">
          <div className="shrink-0 w-1/6 bg-slate-800 animate-pulse rounded-md snap-center"></div>
          <div className="shrink-0 w-1/6 bg-slate-800 animate-pulse rounded-md snap-center"></div>
          <div className="shrink-0 w-1/6 bg-slate-800 animate-pulse rounded-md snap-center"></div>
          <div className="shrink-0 w-1/6 bg-slate-800 animate-pulse rounded-md snap-center"></div>
          <div className="shrink-0 w-1/6 bg-slate-800 animate-pulse rounded-md snap-center"></div>
          <div className="shrink-0 w-1/6 bg-slate-800 animate-pulse rounded-md snap-center"></div>
          <div className="shrink-0 w-1/6 bg-slate-800 animate-pulse rounded-md snap-center"></div>
          <div className="shrink-0 w-1/6 bg-slate-800 animate-pulse rounded-md snap-center"></div>
          <div className="shrink-0 w-1/6 bg-slate-800 animate-pulse rounded-md snap-center"></div>
        </Carousel>
      </div>
      <div className="min-h-2/3 overflow-y-auto p-4">
        <div className="w-full h-full flex flex-wrap gap-2">
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
          <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
