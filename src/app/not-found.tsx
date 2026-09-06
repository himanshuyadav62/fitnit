import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center px-5 text-center"><div><p className="font-mono text-sm text-primary">404</p><h1 className="mt-3 text-3xl font-semibold">That page isn’t in the plan.</h1><p className="mt-3 text-muted-foreground">Return to your dashboard and take the next useful step.</p><Button className="mt-6" asChild><Link href="/app">Open dashboard</Link></Button></div></main>;
}
