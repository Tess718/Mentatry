"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRoomAction } from "@/app/actions/rooms";
import { UserCheck, Loader2 } from "lucide-react";
import { useAlertModal } from "@/components/ui/use-alert-modal";

export function HostLiveButton({ quizId }: { quizId: string }) {
  const router = useRouter();
  const { showAlert, AlertModal } = useAlertModal();
  const [isPending, startTransition] = useTransition();

  const handleHost = () => {
    startTransition(async () => {
      const res = await createRoomAction(quizId);
      if (res.roomId) {
        router.push(`/rooms/${res.roomId}/host`);
      } else {
        showAlert(res.error || "Failed to create room");
      }
    });
  };

  return (
    <>
      <AlertModal />
      <button
      onClick={handleHost}
      disabled={isPending}
      className="neo-btn neo-btn-yellow text-xs py-2.5 px-4 flex-1 flex items-center justify-center gap-2"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4 stroke-[3]" />}
      <span>HOST</span>
    </button>
    </>
  );
}
