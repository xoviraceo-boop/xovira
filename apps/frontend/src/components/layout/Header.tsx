"use client";
import Link from "next/link";
import Button from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import NotificationBell from "@/entities/notifications/components/NotificationBell";

export default function Header() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
    
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <header className="w-full z-100 border-b border-cyan-100 bg-gradient-to-r from-white via-cyan-50/30 to-white backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent hover:from-cyan-700 hover:to-blue-700 transition-all">
          xovira
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link 
            href="/explore" 
            className="text-sm font-medium text-slate-600 hover:text-cyan-600 transition-colors relative group"
          >
            Explore
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
          </Link>
          {session?.user ? (
            <>
              <NotificationBell />
              <div className="relative" ref={menuRef}>
                <button
                  className="flex items-center gap-2 rounded-full border-2 border-cyan-100 hover:border-cyan-300 px-2 py-1 transition-all hover:shadow-md bg-white"
                  onClick={() => setOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={open}
                >
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-xs font-semibold flex items-center justify-center text-white shadow-md">
                    {session.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={session.user.image} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      (session.user.name || session.user.email || "").slice(0,2).toUpperCase()
                    )}
                  </div>
                </button>
                {open && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl border border-cyan-100 bg-white shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-cyan-50 bg-gradient-to-br from-cyan-50/50 to-transparent">
                      <p className="text-sm font-semibold text-slate-800 truncate">{session.user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                    </div>
                    <Link 
                      href="/dashboard/my-profile" 
                      className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors font-medium" 
                      onClick={() => setOpen(false)}
                    >
                      View profile
                    </Link>
                    <Link 
                      href="/dashboard/settings" 
                      className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors font-medium" 
                      onClick={() => setOpen(false)}
                    >
                      Settings
                    </Link>
                    <Link 
                      href="/help" 
                      className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors font-medium" 
                      onClick={() => setOpen(false)}
                    >
                      Help
                    </Link>
                    <Link 
                      href="/privacy" 
                      className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors font-medium" 
                      onClick={() => setOpen(false)}
                    >
                      Privacy
                    </Link>
                    <button 
                      className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors font-medium border-t border-cyan-50" 
                      onClick={() => { setOpen(false); signOut(); }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/login">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2 rounded-full shadow-md hover:shadow-lg transition-all">
                Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}