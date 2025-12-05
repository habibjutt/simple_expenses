"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Header />
      <main className="">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">
            Welcome, {session.user?.name || session.user?.email}!
          </h1>
          <p>You are successfully logged in.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
