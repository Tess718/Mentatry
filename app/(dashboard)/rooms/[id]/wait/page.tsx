import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ParticipantWaitView } from "@/components/participant-wait-view";

export default async function WaitRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const room = await prisma.room.findUnique({
    where: { id },
  });

  if (!room) {
    notFound();
  }

  if (room.isGuestMode) {
    redirect(`/rooms/join?code=${room.joinCode}`);
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Ensure they are actually a participant or the host
  const participant = await prisma.roomParticipant.findUnique({
    where: { roomId_userId: { roomId: id, userId: session.user.id } },
  });

  if (!participant && room.hostId !== session.user.id) {
    redirect("/quizzes"); // Not a participant
  }

  if (room.status === "ACTIVE") {
    redirect(`/rooms/${room.id}/take`);
  }

  if (room.status === "COMPLETED") {
    redirect("/quizzes");
  }

  return (
    <div className="w-full">
      <main className="px-6 pb-12">
        <ParticipantWaitView roomId={room.id} />
      </main>
    </div>
  );
}
