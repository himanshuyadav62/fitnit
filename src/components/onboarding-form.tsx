"use client";

import { useActionState } from "react";
import { AlertTriangle, Check, Sparkles } from "lucide-react";

import { completeOnboarding, type ActionState } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = {};

export function OnboardingForm({ defaults }: { defaults?: { name?: string; weight?: string; diet?: string } }) {
  const [state, action, pending] = useActionState(completeOnboarding, initialState);
  const maxAdultDate = new Date();
  maxAdultDate.setFullYear(maxAdultDate.getFullYear() - 18);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
      <Card className="border-white/8">
        <CardHeader>
          <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">01</div>
          <CardTitle>Body & baseline</CardTitle>
          <CardDescription>Used for sensible starting targets—not to judge your fitness.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Date of birth" htmlFor="birthDate"><Input id="birthDate" name="birthDate" type="date" max={maxAdultDate.toISOString().slice(0, 10)} required /></Field>
          <Field label="Sex at birth" htmlFor="sexAtBirth">
            <Select name="sexAtBirth" required><SelectTrigger id="sexAtBirth"><SelectValue placeholder="Choose one" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="intersex">Intersex</SelectItem><SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem></SelectContent></Select>
          </Field>
          <Field label="Gender identity (optional)" htmlFor="genderIdentity"><Input id="genderIdentity" name="genderIdentity" placeholder="How you describe yourself" /></Field>
          <Field label="Height (cm)" htmlFor="heightCm"><Input id="heightCm" name="heightCm" type="number" inputMode="decimal" min="120" max="230" step="0.1" required /></Field>
          <Field label="Current weight (kg)" htmlFor="currentWeightKg"><Input id="currentWeightKg" name="currentWeightKg" type="number" min="30" max="300" step="0.1" defaultValue={defaults?.weight} required /></Field>
          <Field label="Target weight (kg, optional)" htmlFor="targetWeightKg"><Input id="targetWeightKg" name="targetWeightKg" type="number" min="30" max="300" step="0.1" /></Field>
        </CardContent>
      </Card>

      <Card className="border-white/8">
        <CardHeader><div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">02</div><CardTitle>Goal & schedule</CardTitle><CardDescription>A plan should fit your week before it optimizes anything else.</CardDescription></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Primary goal" htmlFor="goal"><Select name="goal" defaultValue="build_muscle" required><SelectTrigger id="goal"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="build_muscle">Build muscle</SelectItem><SelectItem value="lose_fat">Lose fat</SelectItem><SelectItem value="get_stronger">Get stronger</SelectItem><SelectItem value="general_fitness">General fitness</SelectItem></SelectContent></Select></Field>
          <Field label="Training experience" htmlFor="experience"><Select name="experience" defaultValue="beginner" required><SelectTrigger id="experience"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent></Select></Field>
          <Field label="Days per week" htmlFor="daysPerWeek"><Select name="daysPerWeek" defaultValue="3" required><SelectTrigger id="daysPerWeek"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2">2 days · minimalist</SelectItem><SelectItem value="3">3 days · full body / strength</SelectItem><SelectItem value="4">4 days · upper / lower</SelectItem><SelectItem value="5">5 days · strength + athletic</SelectItem><SelectItem value="6">6 days · push / pull / legs</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground">Choose the schedule you can recover from consistently. The 5–6 day plans suit experienced lifters best.</p></Field>
          <Field label="Time per session" htmlFor="sessionMinutes"><Select name="sessionMinutes" defaultValue="60" required><SelectTrigger id="sessionMinutes"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">30 minutes</SelectItem><SelectItem value="45">45 minutes</SelectItem><SelectItem value="60">60 minutes</SelectItem><SelectItem value="75">75 minutes</SelectItem><SelectItem value="90">90 minutes</SelectItem></SelectContent></Select></Field>
          <div className="space-y-2 sm:col-span-2"><Label>Preferred training days</Label><div className="flex flex-wrap gap-2">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <label key={day} className="flex cursor-pointer items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm"><Checkbox name="preferredDays" value={day} />{day}</label>)}</div></div>
        </CardContent>
      </Card>

      <Card className="border-white/8">
        <CardHeader><div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">03</div><CardTitle>Equipment & constraints</CardTitle><CardDescription>We use this to choose realistic exercises and safer substitutions.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2"><Label>Available equipment</Label><div className="grid gap-2 sm:grid-cols-2">{["Full gym", "Dumbbells", "Resistance bands", "Bodyweight only"].map((item) => <label key={item} className="flex cursor-pointer items-center gap-3 rounded-lg border bg-muted/30 px-3 py-3 text-sm"><Checkbox name="equipment" value={item.toLowerCase().replaceAll(" ", "_")} />{item}</label>)}</div></div>
          <Field label="Limitations, old injuries, or disliked movements" htmlFor="limitations"><Textarea id="limitations" name="limitations" placeholder="Optional. Be specific about movements that cause symptoms." /></Field>
        </CardContent>
      </Card>

      <Card className="border-white/8">
        <CardHeader><div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">04</div><CardTitle>Nutrition context</CardTitle><CardDescription>We’ll estimate a starting calorie and protein target you can adjust from real progress.</CardDescription></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Diet" htmlFor="diet"><Select name="diet" defaultValue={defaults?.diet ?? "vegan"} required><SelectTrigger id="diet"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="vegan">Vegan</SelectItem><SelectItem value="vegetarian">Vegetarian</SelectItem><SelectItem value="omnivore">Omnivore</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></Field>
          <Field label="Daily activity outside the gym" htmlFor="activityLevel"><Select name="activityLevel" defaultValue="moderate" required><SelectTrigger id="activityLevel"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Mostly seated</SelectItem><SelectItem value="moderate">Regular walking</SelectItem><SelectItem value="high">Active job / lots of sport</SelectItem></SelectContent></Select></Field>
        </CardContent>
      </Card>

      <Card className="border-white/8">
        <CardHeader><div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">05</div><CardTitle>Readiness & recovery</CardTitle><CardDescription>A final safety check before the plan is generated.</CardDescription></CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field label="Average sleep (hours)" htmlFor="sleepHours"><Input id="sleepHours" name="sleepHours" type="number" min="3" max="12" step="0.5" defaultValue="7" required /></Field>
          <Field label="Current stress (1–5)" htmlFor="stressLevel"><Select name="stressLevel" defaultValue="3" required><SelectTrigger id="stressLevel"><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n} — {n < 3 ? "Low" : n > 3 ? "High" : "Moderate"}</SelectItem>)}</SelectContent></Select></Field>
          <div className="space-y-3 sm:col-span-2"><Label>Do you currently have chest pain, unexplained dizziness/fainting, a doctor’s restriction, or another condition requiring clearance before exercise?</Label><Select name="medicalClearanceNeeded" defaultValue="no" required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes / I’m not sure</SelectItem></SelectContent></Select><p className="text-xs text-muted-foreground">A “yes” saves your profile but pauses automatic plan creation. This is not a diagnosis.</p></div>
        </CardContent>
      </Card>

      {state.error && <Alert variant="destructive"><AlertTriangle /><AlertTitle>We need one adjustment</AlertTitle><AlertDescription>{state.error}</AlertDescription></Alert>}
      <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3"><Sparkles className="mt-0.5 size-5 text-primary" /><div><p className="font-medium">Your first plan is one click away</p><p className="text-sm text-muted-foreground">We’ll create a private 8-week plan plus starting nutrition targets.</p></div></div>
        <Button size="lg" disabled={pending}>{pending ? "Building…" : <><Check /> Build my plan</>}</Button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>;
}
