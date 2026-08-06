/* =========================================================================
   Cymbiotika — Quiz data (question set v2)
     Q1 Primary Wellness Goal (focus)  — single, randomized, branches
     Q2 Secondary Goals (wishlist)     — up to 2, randomized, branches
     Q3 Current Wellness State (feeling)
     Q4 Main Barrier (barriers)
     Q5 Supplement Experience (experience)
     Q6 Current Routine Load (routine-now)
     Q7 Safety Considerations (flags)
   Plus 4 conditional deep-dives branched off Q1/Q2 selections.
   ========================================================================= */

/* Q1/Q2 share the same five goal labels. These labels are the keys used by
   the maps below and by the results page — keep them in sync. */
var GOALS = [
  "Energy",
  "Gut health",
  "Stress, sleep + mood",
  "Beauty, aging + longevity",
  "Overall wellness + immunity",
];

/* A goal branches the quiz into ONE conditional deep-dive. "Overall wellness +
   immunity" intentionally has no deep-dive (and also skips Q2 — see app.jsx). */
window.FOCUS_TO_CONDITIONAL = {
  "Energy": "cond-energy",
  "Gut health": "cond-gut",
  "Stress, sleep + mood": "cond-stress",
  "Beauty, aging + longevity": "cond-beauty",
  // "Overall wellness + immunity": none
};

/* Basics — always shown, in order. `multi:true` allows multiple selections. */
window.BASICS = [
  {
    id: "focus",
    title: "What’s your top wellness priority right now?",
    multi: false,
    branches: true,   // drives the conditional deep-dive
    randomize: true,  // present the answers in random order
    options: GOALS.slice(),
  },
  {
    id: "wishlist",
    title: "What else is on your wellness wishlist?",
    multi: true,
    max: 2,
    randomize: true,
    options: GOALS.slice(),
  },
  {
    id: "feeling",
    title: "How has your body been feeling lately?",
    multi: false,
    options: [
      "Energized and balanced",
      "Getting through the day but not feeling my best",
      "Tired or overwhelmed",
      "Managing health priorities",
      "Not sure",
    ],
  },
  {
    id: "barriers",
    title: "What’s the hardest part of staying consistent?",
    multi: false,
    options: [
      "I don’t have the energy",
      "Feeling uncomfortable throws me off track",
      "I’m not sure what to take or where to start",
      "Life gets busy and my routine slips",
    ],
  },
  {
    id: "experience",
    title: "Where are you in your supplement journey?",
    multi: false,
    options: [
      "Just getting started",
      "I take a few basics",
      "I have a consistent routine",
      "I’ve tried several, but haven’t found what works",
      "A practitioner recommended supplements to me",
    ],
  },
  {
    id: "routine-now",
    title: "What does your current routine look like?",
    multi: false,
    options: [
      "I’m not taking any supplements right now",
      "I take 1–2 products",
      "I take 3–5 products",
      "I take 6+ products",
      "I’m inconsistent, but want a better rhythm",
    ],
  },
  {
    id: "flags",
    title: "Anything important we should know before we build your plan?",
    multi: false,
    options: [
      "I have a sensitive stomach",
      "I’m pregnant or breastfeeding",
      "I’m currently taking medication",
      "None of these",
    ],
  },
];

/* Conditional deep-dives — inserted right after Q1 (focus) and Q2 (wishlist)
   for the matching goal, de-duplicated so a topic picked twice appears once. */
window.CONDITIONALS = {
  "cond-stress": {
    id: "cond-stress",
    title: "How would you describe your sleep and stress right now?",
    caption: "Stress, sleep + mood",
    multi: false,
    options: [
      "Wired but tired",
      "Trouble falling asleep",
      "Waking up during the night",
      "Waking up unrefreshed",
      "Stress affects my energy or focus",
    ],
  },
  "cond-gut": {
    id: "cond-gut",
    title: "What kind of digestive support feels most relevant?",
    caption: "Gut health",
    multi: false,
    options: [
      "Bloating",
      "Gas or discomfort",
      "Heavy meals sit with me",
      "Sensitive stomach",
      "General gut health support",
    ],
  },
  "cond-energy": {
    id: "cond-energy",
    title: "When do you notice your energy or focus dip most?",
    caption: "Energy",
    multi: false,
    options: [
      "Morning",
      "Afternoon",
      "Evening",
      "All day",
    ],
  },
  "cond-beauty": {
    id: "cond-beauty",
    title: "What areas of beauty are you focused on?",
    caption: "Beauty, aging + longevity",
    multi: false,
    options: [
      "Glowing Skin",
      "Skin elasticity",
      "Nail Support",
      "Hair health",
      "Healthy aging",
    ],
  },
};

/* =========================================================================
   Results page — product catalog (3 products, keyed by id).
     Liposomal Glutathione            → teal flatlay
     Liposomal Vitamin D3 + K2 + CoQ10 → gold flatlay
     Liposomal Vitamin C              → orange flatlay
   ========================================================================= */
window.PRODUCTS = {
  glutathione: {
    id: "glutathione",
    name: "Liposomal Glutathione",
    oneTime: 116, subscribe: 88,
    img: "assets/prod-glutathione.png",
    blurb: "you want to feel more like yourself again — this master antioxidant supports gentle detox, radiance, and healthy cellular aging.",
  },
  d3k2: {
    id: "d3k2",
    name: "Liposomal Vitamin D3 + K2 + CoQ10",
    oneTime: 100, subscribe: 76,
    img: "assets/prod-d3k2.png",
    blurb: "energy and steady daily performance matter to you — D3 + K2 with CoQ10 supports cellular energy, immunity, and bone health.",
  },
  vitaminc: {
    id: "vitaminc",
    name: "Liposomal Vitamin C",
    oneTime: 98, subscribe: 74,
    img: "assets/prod-vitaminc.png",
    blurb: "you want stronger day-to-day defense — high-absorption vitamin C supports immunity and natural collagen production.",
  },
};

/* Which product is the "Top Match" for each primary goal (Q1). */
window.FOCUS_TO_PRODUCT = {
  "Energy": "d3k2",
  "Gut health": "glutathione",
  "Stress, sleep + mood": "glutathione",
  "Beauty, aging + longevity": "glutathione",
  "Overall wellness + immunity": "vitaminc",
};

/* Short chip labels for the "Your goals" row on the results page. */
window.GOAL_CHIP = {
  "Energy": "Energy",
  "Gut health": "Gut health",
  "Stress, sleep + mood": "Sleep + mood",
  "Beauty, aging + longevity": "Longevity",
  "Overall wellness + immunity": "Immunity",
};
