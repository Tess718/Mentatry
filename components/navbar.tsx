import { auth } from "@/auth";
import { ScrollHeader } from "@/components/scroll-header";
import { NavbarClient } from "@/components/navbar-client";

export async function Navbar() {
  const session = await auth();

  const user = session?.user
    ? {
        id: session.user.id || "",
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
      }
    : null;

  return (
    <ScrollHeader>
      <NavbarClient user={user} />
    </ScrollHeader>
  );
}
