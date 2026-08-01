import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ParticipantWaitView } from "@/components/participant-wait-view";
import { cookies } from "next/headers";
import Avatar from "@/components/ui/avatar";

export default async function GuestWaitRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const room = await prisma.room.findUnique({
    where: { id },
  });

  if (!room) {
    notFound();
  }

  if (!room.isGuestMode) {
    redirect(`/rooms/join?code=${room.joinCode}`);
  }

  const cookieStore = await cookies();
  const guestToken = cookieStore.get(`guest_session_${room.id}`)?.value;
  if (!guestToken) {
    redirect(`/rooms/join?code=${room.joinCode}`);
  }
  
  const guest = await prisma.guestParticipant.findUnique({
    where: { sessionToken: guestToken }
  });
  
  if (!guest || guest.roomId !== room.id) {
    redirect(`/rooms/join?code=${room.joinCode}`);
  }

  if (room.status === "ACTIVE") {
    redirect(`/play/${room.id}/take`);
  }

  if (room.status === "COMPLETED") {
    redirect(`/play/${room.id}/leaderboard`);
  }

  return (
    <div className="w-full flex flex-col items-center gap-6 max-w-2xl mx-auto">
      <div className="flex flex-col items-center p-6 bg-white/90 backdrop-blur-sm rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full">
        <Avatar seed={guest.id} size={100} />
        <h2 className="mt-4 text-3xl font-black tracking-tight uppercase text-slate-800">{guest.displayName}</h2>
        <div className="mt-2 text-xs font-bold uppercase tracking-widest bg-amber-200 text-amber-900 px-3 py-1 rounded-full border-2 border-amber-900">
          Guest Player
        </div>
      </div>
      
      <div className="w-full">
        <ParticipantWaitView roomId={room.id} baseRoute="/play" />
      </div>
    </div>
  );
}
