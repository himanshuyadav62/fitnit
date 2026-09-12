import type { ExerciseGuide } from "./schema";

export const exerciseGuides: Record<string, ExerciseGuide> = {
  "barbell-bench-press": {
    overview: "The barbell bench press trains the chest, triceps, and front of the shoulders. The goal is a repeatable, comfortable press—not the biggest possible arch or the widest possible grip. Build a stable base, control the descent, and make every rep follow the same path.",
    videoFocus: [
      "Watch the stable upper-back position and the feet pressing into the floor rather than moving during the rep.",
      "Compare the wrist, elbow, and bar alignment at the bottom. The forearms should be close to vertical from the front view.",
      "Notice the soft chest touch and the slightly backward path as the bar returns over the shoulders.",
    ],
    setup: [
      "Adjust the rack hooks so you can unrack with almost-straight arms without reaching so far that your shoulders roll forward. Use a spotter for the hand-off when needed.",
      "Plant the feet where you can keep steady pressure into the floor. Keep the head, upper back, and glutes on the bench; a modest natural lower-back arch is fine.",
      "Squeeze the bar with the thumbs wrapped around it. Start with a moderate grip width, then adjust slightly until the wrists and elbows are stacked at the bottom.",
      "Set the shoulder blades back and slightly down before lifting the bar out. Keep that upper-back tension through the set rather than shrugging toward the ears.",
    ],
    breathing: [
      "Take a breath into the abdomen and sides of the trunk before a rep, then brace as if preparing for a light impact. Do not let the ribs or hips shift while the bar descends.",
      "Keep the brace through the bottom and hardest part of the press, then breathe out near the top and reset before the next rep. Avoid holding one breath through an entire long set.",
      "If you have been advised to avoid straining or breath holding, get individual guidance before using heavy loads.",
    ],
    commonMistakes: [
      { issue: "Wrists fold far backward", correction: "Place the bar lower in the palm, squeeze it firmly, and keep the knuckles pointing more toward the ceiling. Reduce the load if you cannot maintain the stack." },
      { issue: "Elbows flare directly sideways or the bar touches near the neck", correction: "Bring the touch point lower on the chest and use a comfortable elbow angle. Grip width and arm length vary, so do not force one exact angle." },
      { issue: "Shoulders roll forward at the bottom", correction: "Reset the shoulder blades and chest before the set. Use a shorter comfortable range, lighter load, or a dumbbell/machine alternative if the position is painful." },
      { issue: "The bar bounces or the glutes lift off the bench", correction: "Slow the final part of the descent, touch softly, and keep foot pressure steady. The legs stabilize the body; they should not throw the hips off the bench." },
    ],
    safety: [
      "Use a competent spotter or safety arms set to catch a failed rep without trapping you. Test the safety height with an empty bar before loading it.",
      "Use a full thumb-around grip and check that the bench and rack are stable. Do not attempt unfamiliar maximal loads alone.",
      "Stop for sharp, electrical, or worsening shoulder, chest, or elbow pain. A smaller comfortable range or another press is preferable to forcing a painful rep.",
    ],
    progression: [
      "Warm up with light, controlled reps and gradually heavier practice sets. Warm-ups should prepare you, not exhaust you before the working sets.",
      "Follow the plan's rep range and reps-in-reserve target. Add reps while keeping the same touch point, control, and body position.",
      "When every working set reaches the top of its range with clean technique, add the smallest available load and return toward the lower end of the range. Do not increase weight just because one rep was successful.",
    ],
  },
  "barbell-deadlift": {
    overview: "This guide covers the conventional barbell deadlift from the floor, not the Romanian deadlift or sumo variation. It trains the hips, legs, back, and grip by moving a load close to the body. A good rep starts with tension, rises smoothly, and finishes tall without a backward lean.",
    videoFocus: [
      "Watch where the bar starts relative to the middle of the foot and how close it stays to the legs.",
      "Look for the controlled tension-building moment before the plates leave the floor rather than a sudden yank.",
      "Observe the hips and shoulders rising together and the upright finish without leaning back.",
    ],
    setup: [
      "Use flat, stable footwear and a clear lifting area. Standard full-size plates establish the usual start height; raise the bar on stable blocks if smaller plates make the floor position unsuitable.",
      "Start with the feet around hip width and toes slightly turned out if comfortable. Place the bar over mid-foot, usually a small distance in front of the shins.",
      "Hinge to grip just outside the legs, then bend the knees until the shins lightly meet the bar. Do not roll the bar forward while finding the start position.",
      "Keep the arms straight, shoulders slightly in front of the bar, and spine in a comfortable neutral position. Your hip height depends on your proportions; do not force the deadlift into a deep squat.",
      "Tighten the lats by thinking of bringing the armpits toward the hips. Pull gently against the bar to remove slack before starting the drive.",
    ],
    breathing: [
      "Before the pull, take a breath that expands the abdomen, sides, and back of the trunk, then brace firmly. Keep that tension while the bar leaves the floor.",
      "Breathe out after the hardest part or once you are standing securely, lower the weight under control, and reset your breath and position on the floor for the next rep.",
      "For beginners, dead-stop reps make the reset easier to learn. Avoid prolonged breath holding across several repetitions, and seek individual advice if you have been told to avoid straining.",
    ],
    commonMistakes: [
      { issue: "The bar drifts away from the legs", correction: "Recheck the mid-foot start and lat tension. Keep the bar close as it rises; if it moves forward, stop and reset rather than chasing it with the back." },
      { issue: "The hips shoot up before the bar moves", correction: "Do not begin with the hips artificially low. Build tension first, keep the chest and hips connected, and push the floor away with a lighter load." },
      { issue: "The bar is jerked from a loose start", correction: "Pull the slack out gently, brace, and make the first few centimetres smooth. The arms remain long; do not try to curl the weight." },
      { issue: "The lifter leans back or shrugs at lockout", correction: "Finish by standing tall with knees and hips straight. Squeeze the glutes without pushing the pelvis far forward or extending the lower back." },
      { issue: "Each rep becomes more rounded or rushed", correction: "Lower the load or end the set before position deteriorates. Let the bar settle and rebuild the setup between repetitions." },
    ],
    safety: [
      "Keep the area clear and use stable plates and collars. Do not bend the elbows under load; keep both arms long throughout the pull.",
      "Learn with loads you can control and stop well before grinding when technique is new. If the floor start is uncomfortable, use a raised start, kettlebell, or another suitable hinge variation.",
      "Do not force through sharp, electrical, or worsening back or leg pain. Seek qualified coaching for recurring technique problems and appropriate clinical advice for persistent symptoms.",
    ],
    progression: [
      "Practise the hinge and brace with light warm-ups, then increase the warm-up load gradually without adding fatigue. Every practice rep should resemble the working rep.",
      "Use the plan's prescribed sets, reps, and reps-in-reserve target; the included beginner strength work deliberately leaves several clean reps available.",
      "Add the smallest practical load only after all sets are smooth and repeatable. If recovery or position slips, hold the weight, reduce a set, or use a lighter exposure rather than adding more load.",
    ],
  },
};
