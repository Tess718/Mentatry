import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { HostRoomView } from "@/components/host-room-view";
export default async function HostRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      quiz: {
        include: {
          questions: {
            orderBy: { order: "asc" }
          }
        }
      }
    }
  });

  if (!room) {
    notFound();
  }

  if (room.hostId !== session.user.id) {
    redirect("/quizzes"); // Not the host
  }

  return (
    <div className="w-full">
      <main className="px-6 pb-12">
        <HostRoomView 
          roomId={room.id} 
          initialJoinCode={room.joinCode} 
          isGuestMode={room.isGuestMode} 
          questions={room.quiz.questions}
        />
      </main>
    </div>
  );
}
