/* =========================================================================
   Cymbiotika — Quiz data
   Source: Figma "Quiz" (branch Vu4Og8IrD2oXI6FhMV62lI), node 2614:53897
     Section 1: "-> Questions" › Basics (10 questions)
     Section 2: Conditional Questions (5, branched off the primary focus)
   Each question's title is the Figma section name; options are the
   Input-Container labels in reading order.
   ========================================================================= */

/* The primary focus question (Q1) branches the quiz into ONE conditional
   deep-dive. These values map an option label -> conditional question id. */
window.FOCUS_TO_CONDITIONAL = {
  "Energy + focus": "cond-energy",
  "Gut health + comfort": "cond-gut",
  "Stress, sleep + mood": "cond-stress",
  "Beauty, aging + longevity": "cond-beauty",
  "Overall wellness + immunity": "cond-other",
};

/* Basics — always shown, in order. `multi:true` allows multiple selections. */
window.BASICS = [
  {
    id: "focus",
    title: "What would you love a little more support with right now?",
    multi: false,
    branches: true, // drives the conditional deep-dive
    options: [
      "Energy + focus",
      "Gut health + comfort",
      "Stress, sleep + mood",
      "Beauty, aging + longevity",
      "Overall wellness + immunity",
    ],
  },
  {
    id: "wishlist",
    title: "What else is on your wellness wishlist?",
    multi: true,
    max: 2,
    options: [
      "Energy + focus",
      "Gut health + comfort",
      "Stress, sleep + mood",
      "Beauty, aging + longevity",
      "Overall wellness + immunity",
    ],
  },
  {
    id: "feeling",
    title: "How has your body been feeling lately?",
    multi: false,
    options: [
      "Energized and balanced",
      "Getting through the day, but not feeling my best",
      "Stressed, tired, or overwhelmed",
      "Managing recurring wellness challenges",
      "Not totally sure",
    ],
  },
  {
    id: "barriers",
    title: "What tends to get in the way of feeling your best?",
    multi: false,
    options: [
      "I don’t have enough energy to stay consistent",
      "Stress and poor sleep make it harder",
      "Digestive or physical discomfort gets in the way",
      "I’m not sure what to take or where to start",
      "Life gets busy and my routine slips",
      "I want something that fits my budget",
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
      "I’m currently taking medications",
      "I’d like to speak with a healthcare practitioner first",
      "None of these",
    ],
  },
  {
    id: "commitment",
    title: "What kind of routine would you actually stick with?",
    multi: false,
    options: [
      "One simple product to start",
      "A few essentials",
      "A complete routine",
      "I want to start small and build over time",
    ],
  },
  {
    id: "begin",
    title: "How would you prefer to begin?",
    multi: false,
    options: [
      "One-time purchase first",
      "Subscribe if I understand the benefits",
      "Subscribe if it helps me stay consistent",
      "I’m not sure yet",
    ],
  },
  {
    id: "mindset",
    title: "What best describes your wellness mindset right now?",
    multi: false,
    options: [
      "I want to feel better day to day",
      "I’m building a long-term routine",
      "I’m focused on prevention",
      "I’m recovering from stress or burnout",
      "I’m optimizing how I feel and perform",
      "I’m trying to understand what works for my body",
    ],
  },
];

/* Conditional deep-dive — exactly ONE is shown, chosen by the Q1 focus. */
window.CONDITIONALS = {
  "cond-stress": {
    id: "cond-stress",
    title: "What does your stress or sleep pattern feel like most often?",
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
    caption: "Gut health + comfort",
    multi: false,
    options: [
      "Bloating",
      "Gas or discomfort",
      "Irregularity",
      "Heavy meals sit with me",
      "Sensitive stomach",
      "General gut health support",
    ],
  },
  "cond-energy": {
    id: "cond-energy",
    title: "When do you notice your energy or focus dip most?",
    caption: "Energy + focus",
    multi: false,
    options: [
      "Morning",
      "Afternoon",
      "Evening",
      "All day",
      "After meals",
      "After poor sleep or stress",
    ],
  },
  "cond-beauty": {
    id: "cond-beauty",
    title: "What kind of radiance are you focused on building?",
    caption: "Beauty, aging + longevity",
    multi: false,
    options: [
      "Glow + hydration",
      "Skin elasticity",
      "Hair health",
      "Healthy aging",
      "Cellular health + longevity",
      "Overall beauty from within",
    ],
  },
  "cond-other": {
    id: "cond-other",
    title: "Is there a current life stage or wellness context we should consider?",
    caption: "Overall wellness + immunity",
    multi: false,
    options: [
      "I’m in a high-stress season",
      "I’m focused on training or recovery",
      "I’m navigating a new life stage",
      "A practitioner suggested I focus on this area",
      "Nothing specific right now",
      "Prefer not to say",
    ],
  },
};

/* =========================================================================
   Results page — product catalog
   Maps each focus area to a recommended Cymbiotika-style product. Prices are
   { oneTime, subscribe(≈-10%) }. `img` references quiz/assets flatlays.
   ========================================================================= */
window.PRODUCTS = {
  "Energy + focus": {
    id: "energy",
    name: "Liposomal B12 + B6",
    oneTime: 80, subscribe: 64,
    img: "assets/prod-glutathione.png",
    blurb: "Fast-absorbing B vitamins for steady, all-day energy and mental clarity — without the crash.",
  },
  "Gut health + comfort": {
    id: "gut",
    name: "Gut Health Probiotic",
    oneTime: 82, subscribe: 66,
    img: "assets/prod-creatine.png",
    blurb: "Targeted probiotics to ease bloating and support a balanced, comfortable digestive system.",
  },
  "Stress, sleep + mood": {
    id: "sleep",
    name: "Magnesium L-Threonate",
    oneTime: 65, subscribe: 52,
    img: "assets/prod-vitaminc.png",
    blurb: "Highly bioavailable magnesium to calm the mind, ease stress, and support restful sleep.",
  },
  "Beauty, aging + longevity": {
    id: "beauty",
    name: "Liposomal Glutathione",
    oneTime: 88, subscribe: 79,
    img: "assets/prod-glutathione.png",
    blurb: "The master antioxidant for skin radiance, gentle detox, and healthy cellular aging.",
  },
  "Overall wellness + immunity": {
    id: "immunity",
    name: "Liposomal Vitamin C",
    oneTime: 78, subscribe: 62,
    img: "assets/prod-vitaminc.png",
    blurb: "Immune-supporting vitamin C with superior liposomal absorption for daily defense.",
  },
};

/* Short chip labels for the "Your goals" row on the results page. */
window.GOAL_CHIP = {
  "Energy + focus": "Energy",
  "Gut health + comfort": "Gut health",
  "Stress, sleep + mood": "Sleep + mood",
  "Beauty, aging + longevity": "Longevity",
  "Overall wellness + immunity": "Immunity",
};
