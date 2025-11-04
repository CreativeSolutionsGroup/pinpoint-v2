import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Plus, Redo, Search, Undo } from "lucide-react";

export default function EventPage() {
  return (
    <div className="flex flex-col h-full py-2 pr-2">
      <div className="min-h-12 max-h-12 bg-muted rounded-md px-3 flex items-center">
        <h1 className="text-xl">Placeholder Event Name</h1>
        <Button variant="outline" className="ml-auto">
          <Undo />
        </Button>
        <Button variant="outline" className="ml-2">
          <Redo />
        </Button>
      </div>
      <div className="flex-1 flex flex-col border shadow-md rounded-md p-2 mt-2">
        <Tabs defaultValue="add-event" className="flex flex-col flex-1">
          <TabsContent value="location-1" className="flex-1"></TabsContent>
          <TabsContent value="location-2" className="flex-1"></TabsContent>
          <TabsContent value="add-event" className="flex-1">
            <div className="flex p-3 pt-1 items-center">
              <h1 className="text-lg">Add Location</h1>
              <div className="relative ml-auto">
                <Input placeholder="Search location" className="ml-auto max-w-48" />
                <Search className="absolute right-2 top-1.5 text-muted-foreground" />
              </div>
            </div>
            <div className="w-full h-[calc(100%-3.5rem)] flex flex-wrap gap-2 overflow-y-auto">
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
          </TabsContent>
          <TabsList>
            <TabsTrigger value="location-1">Location 1</TabsTrigger>
            <TabsTrigger value="location-2">Location 2</TabsTrigger>
            <TabsTrigger value="add-event">
              <Plus />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
