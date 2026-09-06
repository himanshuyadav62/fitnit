import Link from "next/link";

import { Brand } from "@/components/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]"><div className="flex flex-col p-6 sm:p-10"><Brand /><div className="mx-auto flex w-full max-w-md flex-1 items-center py-12">{children}</div><p className="text-xs text-muted-foreground">By continuing, you agree to use Forme as educational guidance. <Link href="/" className="underline">Back home</Link></p></div><div className="relative hidden overflow-hidden border-l border-white/5 bg-card/40 p-12 lg:flex lg:items-end"><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,oklch(0.78_0.19_150_/_0.2),transparent_35%)]" /><blockquote className="relative max-w-xl"><p className="text-3xl font-medium leading-tight tracking-tight">“The strongest plan is the one that makes your next good decision easy.”</p><footer className="mt-5 text-sm text-muted-foreground">Forme training principle</footer></blockquote></div></main>;
}
