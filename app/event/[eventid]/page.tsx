import { EventMapContainer } from "@/components/event-map/event-map-container";

interface EventPageProps {
  params: Promise<{
    eventid: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventid } = await params;

  return (
    <div className="h-screen w-full">
      <EventMapContainer eventId={eventid} />
    </div>
  );
}
