import type { ExerciseGuide } from "./schema";

type GuideInput = {
  name: string;
  movementPattern: string;
  primaryMuscles: string[];
  equipment: string;
  instructions: string[];
  cues: string[];
};

const sources = {
  chest: { title: "Jeff Nippard: The Best and Worst Chest Exercises", url: "https://www.youtube.com/watch?v=fGm-ef-4PVk" },
  push: { title: "Jeff Nippard: The Perfect Push Workout", url: "https://www.youtube.com/watch?v=b6ouj88iBZs" },
  pull: { title: "Jeff Nippard: The Perfect Pull Workout", url: "https://www.youtube.com/watch?v=DXL18E7QRbk" },
  back: { title: "Jeff Nippard: The Best and Worst Back Exercises", url: "https://www.youtube.com/watch?v=jLvqKgW-_G8" },
  shoulders: { title: "Jeff Nippard: The Best and Worst Shoulder Exercises", url: "https://www.youtube.com/watch?v=SgyUoY0IZ7A" },
  biceps: { title: "Jeff Nippard: The Best and Worst Biceps Exercises", url: "https://www.youtube.com/watch?v=GNO4OtYoCYk" },
  rdl: { title: "Jeff Nippard: How to Do Romanian Deadlifts", url: "https://www.youtube.com/watch?v=_oyxCn2iSjU" },
  quads: { title: "Jeff Nippard: The Best and Worst Quad Exercises", url: "https://www.youtube.com/watch?v=kIXcoivzGf8" },
  glutes: { title: "Jeff Nippard: The Best and Worst Glute Exercises", url: "https://www.youtube.com/watch?v=3ryh7PNhz3E" },
  abs: { title: "Jeff Nippard: Get Abs in 60 Days (Using Science)", url: "https://www.youtube.com/watch?v=Tn-XvYG9x7w" },
} as const;

const movementDetails: Record<string, {
  focus: string;
  setup: string[];
  mistakes: Array<{ issue: string; correction: string }>;
  safety: string;
  sources: Array<(typeof sources)[keyof typeof sources]>;
}> = {
  squat: {
    focus: "Use the deepest comfortable range you can control while keeping the whole foot connected to the floor.",
    setup: ["Choose a stance that lets the knees travel in the same general direction as the toes.", "Brace before descending, keep pressure across the heel and forefoot, and let the hips and knees bend together."],
    mistakes: [{ issue: "The heels lift or the feet roll inward", correction: "Reduce the depth or load, adjust stance width, and keep three points of each foot—heel, base of the big toe, and base of the little toe—grounded." }, { issue: "Depth is forced after the pelvis starts tucking", correction: "End the rep at your deepest controlled position. Build mobility and control gradually instead of chasing a universal depth." }],
    safety: "Use rack safeties for barbell variations and practise a safe bail-out before heavy sets.", sources: [sources.quads, sources.glutes],
  },
  "single-leg squat": {
    focus: "Create a stable front-foot base and use a repeatable stride that lets the hip and knee share the work.",
    setup: ["Use a rail or rack for balance while learning; balance should not limit the target muscles.", "Set the working foot fully down, brace, and lower vertically through a comfortable hip and knee range."],
    mistakes: [{ issue: "The front heel lifts or the knee collapses inward", correction: "Shorten the range, reduce load, and keep the knee tracking with the middle toes while the whole foot stays planted." }, { issue: "The back leg does most of the work", correction: "Treat the rear leg as a kickstand and drive the floor away with the working leg." }],
    safety: "Start with bodyweight or external support and earn load only after both sides are stable.", sources: [sources.quads, sources.glutes],
  },
  hinge: {
    focus: "Move primarily at the hips, keep the load close, and stop at the end of your controlled hamstring and hip range.",
    setup: ["Begin with soft—not deeply bent—knees, a braced trunk, and the load close to the legs.", "Send the hips backward while keeping pressure through the whole foot; stand by driving the hips forward without leaning back."],
    mistakes: [{ issue: "The weight drifts away from the body", correction: "Keep the arms long and guide the load close to the thighs and shins; reduce weight if the lats cannot hold it there." }, { issue: "Extra depth comes from rounding the back", correction: "Stop when the hips can no longer travel backward or the hamstring stretch is strong. The floor is not the target on an RDL." }],
    safety: "Use a load that allows a repeatable brace and stop if symptoms radiate, feel electrical, or worsen rep to rep.", sources: [sources.rdl, sources.glutes],
  },
  "horizontal push": {
    focus: "Keep the upper body stable, lower with control, and use a comfortable elbow path and range of motion.",
    setup: ["Set the shoulder blades against the bench or, for push-ups, keep the shoulder girdle controlled against the floor.", "Stack the wrists over the forearms and lower toward a repeatable chest position without bouncing."],
    mistakes: [{ issue: "The shoulders roll forward at the bottom", correction: "Reduce load or range and maintain upper-back tension; choose a neutral-grip dumbbell or machine option if needed." }, { issue: "The elbows flare straight sideways", correction: "Use a comfortable diagonal elbow path and adjust grip width until the wrists and forearms stay stacked." }],
    safety: "Use safeties or a spotter for loaded bench work and never force a painful bottom position.", sources: [sources.chest, sources.push],
  },
  "vertical push": {
    focus: "Press through a path that clears the face while the ribs, pelvis, and wrists remain controlled.",
    setup: ["Begin with wrists over elbows and the forearms close to vertical from the front.", "Brace the trunk and press overhead without turning the movement into a large standing backbend."],
    mistakes: [{ issue: "The ribs flare and lower back overextends", correction: "Reduce the load, squeeze the glutes, and keep the rib cage stacked over the pelvis." }, { issue: "The weight finishes in front of the body", correction: "Move the head only enough to clear the load, then finish with the arms comfortably beside the ears." }],
    safety: "Use a range and grip that feel comfortable at the shoulder; do not force the elbows far behind the body.", sources: [sources.shoulders, sources.push],
  },
  "vertical pull": {
    focus: "Drive the elbows down while keeping the torso controlled, then allow a deliberate comfortable stretch.",
    setup: ["Choose a grip that permits a pain-free range and secure the thighs under the pad when using a pulldown.", "Start long through the arms, set the shoulders without an exaggerated shrug, and pull by moving the elbows toward the sides."],
    mistakes: [{ issue: "Momentum replaces the pull", correction: "Reduce load or add assistance and keep the legs and torso quiet enough that the back controls both directions." }, { issue: "Only the hands move", correction: "Think about the elbows travelling down and slightly in; finish before the shoulders roll forward." }],
    safety: "Never pull behind the neck; use assistance when bodyweight reps cannot be controlled.", sources: [sources.back, sources.pull],
  },
  "horizontal pull": {
    focus: "Keep the torso repeatable, reach to a comfortable stretch, and row with the elbows rather than jerking the handle.",
    setup: ["Brace or use chest support so the target muscles—not body swing—move the load.", "Begin with long arms, then pull toward the lower ribs or hips according to the intended elbow path."],
    mistakes: [{ issue: "The torso rocks to create momentum", correction: "Lower the load, pause briefly at each end, and keep the trunk angle consistent." }, { issue: "The shoulders shrug toward the ears", correction: "Reach without collapsing, then guide the elbows back while keeping the neck relaxed." }],
    safety: "Do not chase a longer range by forcefully rounding or overextending the lower back.", sources: [sources.back, sources.pull],
  },
  "chest isolation": {
    focus: "Move the upper arms through a wide hugging arc while keeping a small, consistent elbow bend.",
    setup: ["Set the cables and stance so tension is smooth and you can stay balanced.", "Keep the chest stable and open the arms only to a comfortable chest stretch before reversing the arc."],
    mistakes: [{ issue: "The movement becomes a press", correction: "Keep the elbow angle nearly fixed and think about bringing the upper arms toward one another." }, { issue: "Too much stretch pulls the shoulders forward", correction: "Shorten the range and reduce the load; more depth is useful only while the shoulder remains comfortable and controlled." }],
    safety: "Use moderate loads and never force the cables behind a comfortable shoulder range.", sources: [sources.chest],
  },
  "shoulder isolation": {
    focus: "Raise through the shoulder with light control, allowing the arm path that feels natural rather than chasing momentum.",
    setup: ["Start with a light load, soft elbows, and the dumbbells slightly away from the body.", "Raise in the scapular plane—slightly forward of directly sideways—and stop around a controlled shoulder-height position."],
    mistakes: [{ issue: "The body swings to launch the weight", correction: "Use less load and begin each rep from a settled position." }, { issue: "The shoulders shrug hard toward the ears", correction: "Let the shoulder blade move naturally but keep the neck relaxed and lead with the elbows." }],
    safety: "Use a pain-free arm path; a cable or machine can provide a more stable alternative.", sources: [sources.shoulders],
  },
  "elbow extension": {
    focus: "Keep the upper arm stable while the elbow moves through a full, controlled range.",
    setup: ["Choose a handle and grip that keep the wrists comfortable, then set the shoulders down and back.", "Pin the elbows near the sides and extend without using bodyweight to move the stack."],
    mistakes: [{ issue: "The elbows drift and torso rocks", correction: "Lower the pin weight and keep the upper arms quiet while only the forearms move." }, { issue: "The stack crashes on the return", correction: "Control the lengthening phase and stop just before shoulder position changes." }],
    safety: "Avoid snapping into elbow lockout; use a smooth finish and a comfortable grip.", sources: [sources.push],
  },
  "elbow flexion": {
    focus: "Curl without swinging and preserve tension through a comfortable stretch and squeeze.",
    setup: ["Set the shoulders and allow the arms to hang naturally before the first rep.", "Keep the upper arms mostly still, curl by bending the elbows, and lower under control."],
    mistakes: [{ issue: "The shoulders roll forward to finish the curl", correction: "End the rep before the upper arm travels forward or reduce the weight." }, { issue: "The hips swing the dumbbells upward", correction: "Slow the first half of the rep, brace, and choose a load you can start without momentum." }],
    safety: "Do not force the elbows or shoulders into an uncomfortable stretched position.", sources: [sources.biceps, sources.pull],
  },
  "knee flexion": {
    focus: "Keep the hips secured while the hamstrings curl and control the return into a long position.",
    setup: ["Align the knee with the machine pivot and adjust the ankle pad so it does not sit on the heel.", "Secure the thigh pad, keep the hips down, and curl without lifting the pelvis."],
    mistakes: [{ issue: "The hips lift to complete the rep", correction: "Reduce the load or range and press the hips into the seat throughout." }, { issue: "The return is dropped", correction: "Use a two-to-three-second controlled return and keep tension as the knees straighten." }],
    safety: "Use a comfortable knee range and stop if you feel sharp pain behind or inside the knee.", sources: [sources.rdl],
  },
  "knee extension": {
    focus: "Extend the knee smoothly, pause briefly, and control the lowering phase without kicking the pad.",
    setup: ["Align the knee with the machine pivot and place the pad above the ankle.", "Keep the hips and back against the seat while extending through a comfortable range."],
    mistakes: [{ issue: "The hips lift and the stack is kicked", correction: "Lower the weight, secure the seat position, and make both directions smooth." }, { issue: "Lockout is slammed", correction: "Finish under muscular control without snapping the knee or letting the plates collide." }],
    safety: "Adjust range or load if the knee feels irritated; hard quad effort is different from sharp joint pain.", sources: [sources.quads],
  },
  "hip extension": {
    focus: "Drive through the feet and finish with the glutes while keeping the ribs and pelvis controlled.",
    setup: ["Position the bench below the shoulder blades and pad the load across the hip crease.", "Set the feet so the shins are near vertical at the top, brace, and lift the hips without throwing the head back."],
    mistakes: [{ issue: "The lower back arches to create lockout", correction: "Keep the ribs down and finish when the hips are extended, not when the spine is hyperextended." }, { issue: "The feet are too far away or too close", correction: "Adjust foot position until the top is stable and the glutes—not knee or hamstring discomfort—limit the rep." }],
    safety: "Use a thick secure pad and a stable bench or purpose-built machine.", sources: [sources.glutes],
  },
  "plantar flexion": {
    focus: "Use a long, controlled calf range with a pause rather than bouncing through the Achilles tendon.",
    setup: ["Place the balls of the feet securely on the platform while keeping a stable handhold.", "Lower under control into a comfortable stretch, then rise as high as possible without rolling the ankles."],
    mistakes: [{ issue: "The reps bounce rapidly", correction: "Pause briefly in the stretch and at the top, and reduce load until momentum is unnecessary." }, { issue: "The ankles roll outward", correction: "Keep pressure through the base of the big and little toes and use a smaller controlled range." }],
    safety: "Build loaded stretch gradually and stop if the Achilles tendon feels sharp or increasingly painful.", sources: [],
  },
  brace: {
    focus: "Create whole-body tension while continuing to breathe and ending the set before alignment slips.",
    setup: ["Stack the ribs over the pelvis, lightly squeeze the glutes, and set the elbows below the shoulders.", "Push the floor away and make a long line from head to heels without dropping or piking the hips."],
    mistakes: [{ issue: "The breath is held for the entire set", correction: "Take short controlled breaths behind the brace and shorten the interval if breathing cannot continue." }, { issue: "The lower back sags", correction: "Tighten the glutes, shorten the lever by using the knees, or end the set before position fails." }],
    safety: "Quality matters more than duration; stop the interval when you cannot breathe or hold position.", sources: [sources.abs],
  },
  "anti-extension": {
    focus: "Move the limbs only as far as the trunk can stay quiet against the floor.",
    setup: ["Lie with hips and knees bent, exhale gently, and bring the ribs toward the pelvis without forcefully flattening the spine.", "Lower opposite limbs slowly and shorten the reach whenever the trunk starts to move."],
    mistakes: [{ issue: "The lower back lifts as the limbs extend", correction: "Use a shorter lever, move one limb at a time, and exhale through the hardest point." }, { issue: "The reps are rushed", correction: "Pause at the reach and return deliberately; the exercise is trunk control, not speed." }],
    safety: "Choose a range that remains comfortable for the back and hips.", sources: [sources.abs],
  },
  "trunk flexion": {
    focus: "Shorten the front of the trunk under control instead of turning the exercise into a hip hinge.",
    setup: ["Kneel far enough from the stack for continuous tension and hold the rope beside the head without pulling with the arms.", "Bring the ribs toward the pelvis while the hips stay mostly fixed, then return slowly."],
    mistakes: [{ issue: "The hips rock back and forth", correction: "Reduce load and keep the pelvis nearly still while the spine flexes through a comfortable range." }, { issue: "The arms pull the rope", correction: "Keep the hands as quiet anchors and initiate by curling the rib cage down." }],
    safety: "Use smooth reps and avoid forcing loaded spinal flexion if it causes pain.", sources: [sources.abs],
  },
  carry: {
    focus: "Walk with a tall, braced posture while the hands and trunk resist the load pulling you out of position.",
    setup: ["Choose clear level ground and pick the weights up with a controlled hinge.", "Stand tall, keep the weights beside the thighs, and take short deliberate steps without leaning."],
    mistakes: [{ issue: "The shoulders and torso collapse", correction: "Use less weight or a shorter interval and maintain a tall rib-over-pelvis position." }, { issue: "The weights swing into the legs", correction: "Slow the walk, shorten the steps, and keep the arms quiet." }],
    safety: "Keep the path clear, use collars or secure implements, and set the weights down with a hinge before grip fails.", sources: [],
  },
  conditioning: {
    focus: "Sequence the legs, trunk, and arms smoothly so effort rises without technique becoming rushed.",
    setup: ["Set the foot straps and damper to a controllable position, then sit tall with long relaxed arms.", "Drive first with the legs, open the hips, and finish with the handle near the lower ribs; reverse that order on recovery."],
    mistakes: [{ issue: "The arms pull before the legs drive", correction: "Keep the arms long at the catch and push the machine away with the legs first." }, { issue: "The recovery is as fast as the drive", correction: "Return hands, hinge, then bend the knees at a calmer rhythm so each stroke resets." }],
    safety: "Increase pace only while the stroke remains coordinated and pain-free.", sources: [],
  },
};

export function createExerciseGuide(input: GuideInput): ExerciseGuide {
  const details = movementDetails[input.movementPattern] ?? movementDetails.carry;
  return {
    overview: `${input.name} trains the ${input.primaryMuscles.join(", ")} using ${input.equipment}. ${details.focus}`,
    videoFocus: [details.focus, `Check that these cues stay visible from the first rep to the last: ${input.cues.join("; ")}.`, "Notice the controlled return; a useful rep owns both the lifting and lowering phases."],
    setup: [...details.setup, ...input.instructions],
    breathing: ["Inhale and brace before the effort while keeping the ribs and pelvis controlled.", "Exhale through or just after the hardest part, then reset deliberately before the next repetition.", "Do not hold one breath across a long set; if you have been told to avoid straining, get individual medical guidance before heavy training."],
    commonMistakes: [...details.mistakes, { issue: "Load increases before technique is repeatable", correction: `Keep the weight steady until every rep preserves the key checkpoints: ${input.cues.join("; ")}.` }],
    safety: [details.safety, "Stop for sharp, electrical, or worsening joint pain. Muscle effort and a controlled stretch are expected; pain that changes your movement is not.", "Keep the training area and equipment secure, and ask a qualified coach for in-person help when the setup remains unclear."],
    progression: ["Warm up with easy practice reps that use the same range and tempo planned for the work sets.", "Add repetitions inside the programmed range while keeping the target reps in reserve and the same technique checkpoints.", "When every set reaches the top of the range cleanly, add the smallest practical load. Reduce load, range, or sets when recovery or form declines."],
    sources: details.sources,
  };
}

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
    sources: [sources.chest, sources.push],
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
    sources: [sources.glutes],
  },
};
