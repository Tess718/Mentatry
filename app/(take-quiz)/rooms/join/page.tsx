import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { JoinLiveRoomForm } from "./client-form";

export default function JoinLiveRoomPage() {
  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <Suspense fallback={<div className="p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
          <JoinLiveRoomForm />
        </Suspense>
      </main>
    </div>
  );
}
