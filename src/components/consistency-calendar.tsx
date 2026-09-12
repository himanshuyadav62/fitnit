import { Award, CalendarCheck2, Dumbbell, Flame, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildConsistencyCalendar, type ConsistencySession } from "@/lib/consistency";
import { cn } from "@/lib/utils";

const levelClasses = ["bg-muted/45", "bg-primary/25", "bg-primary/45", "bg-primary/70", "bg-primary"];

export function ConsistencyCalendar({ sessions, timeZone }: { sessions: ConsistencySession[]; timeZone: string }) {
  const calendar = buildConsistencyCalendar(sessions, timeZone);
  const months = calendar.weeks.map((week, index) => {
    const firstOfMonth = week.find((day) => day.date.getUTCDate() === 1);
    if (index === 0) return week[0].date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
    return firstOfMonth?.date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }) ?? "";
  });
  const achievements = [
    { label: "First rep", earned: calendar.totalWorkouts >= 1, icon: Dumbbell },
    { label: "7 active days", earned: calendar.activeDays >= 7, icon: CalendarCheck2 },
    { label: "7-day streak", earned: calendar.longestStreak >= 7, icon: Flame },
    { label: "25 workouts", earned: calendar.totalWorkouts >= 25, icon: Trophy },
  ];

  return <div className="space-y-6">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat icon={Flame} label="Current streak" value={`${calendar.currentStreak} ${calendar.currentStreak === 1 ? "day" : "days"}`} />
      <Stat icon={Trophy} label="Longest streak" value={`${calendar.longestStreak} ${calendar.longestStreak === 1 ? "day" : "days"}`} />
      <Stat icon={CalendarCheck2} label="Active days" value={calendar.activeDays.toLocaleString()} />
      <Stat icon={Dumbbell} label="Workouts" value={calendar.totalWorkouts.toLocaleString()} />
    </div>

    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle className="flex items-center gap-2"><Flame className="size-5 text-primary" /> Training consistency</CardTitle><CardDescription className="mt-1">Every completed workout adds color. More completed sets make the day greener.</CardDescription></div><Badge variant="outline" className="w-fit">Last 12 months</Badge></CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[760px]">
            <div className="mb-2 ml-8 grid grid-cols-[repeat(53,0.75rem)] gap-1 text-[10px] text-muted-foreground">{months.map((month, index) => <span key={`${month}-${index}`}>{month}</span>)}</div>
            <div className="flex gap-2">
              <div className="grid w-6 shrink-0 grid-rows-7 gap-1 text-[10px] leading-3 text-muted-foreground"><span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span /></div>
              <div className="grid grid-cols-[repeat(53,0.75rem)] gap-1">{calendar.weeks.map((week, weekIndex) => <div key={weekIndex} className="grid grid-rows-7 gap-1">{week.map((day) => {
                const description = `${day.date.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}: ${day.workouts} ${day.workouts === 1 ? "workout" : "workouts"}, ${day.sets} completed sets`;
                return <span key={day.key} role="img" aria-label={description} title={description} className={cn("size-3 rounded-[3px] ring-1 ring-inset ring-white/5", day.future ? "bg-transparent ring-transparent" : levelClasses[day.level])} />;
              })}</div>)}</div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><p>{calendar.totalSets.toLocaleString()} completed sets across the visible year</p><div className="flex items-center gap-1.5"><span>Less</span>{levelClasses.map((className, index) => <span key={className} className={cn("size-3 rounded-[3px] ring-1 ring-inset ring-white/5", className)} aria-label={`Activity level ${index}`} />)}<span>More</span></div></div>
      </CardContent>
    </Card>

    <Card className="border-white/8"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Award className="size-4 text-primary" /> Achievements</CardTitle><CardDescription>Milestones from the visible year across every plan, including archived plans.</CardDescription></CardHeader><CardContent className="flex flex-wrap gap-2">{achievements.map(({ label, earned, icon: Icon }) => <Badge key={label} variant={earned ? "default" : "outline"} className={cn("gap-1.5 px-3 py-1.5", !earned && "opacity-45")}><Icon className="size-3.5" /> {label}{earned ? " · Earned" : " · Locked"}</Badge>)}</CardContent></Card>
  </div>;
}

function Stat({ icon: Icon, label, value }: { icon: typeof Flame; label: string; value: string }) {
  return <Card className="border-white/8"><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p></div><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-4" /></span></CardContent></Card>;
}
