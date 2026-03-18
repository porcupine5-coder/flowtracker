export interface Recommendation {
  id: string;
  category: "nutrition" | "exercise" | "self-care" | "medical";
  title: string;
  description: string;
  icon: string;
  priority?: "low" | "medium" | "high" | "emergency";
  minSeverity?: number;
}

export const symptomRecommendations: Record<string, Recommendation[]> = {
  "Cramps": [
    {
      id: "cramps-1",
      category: "self-care",
      title: "Heat Therapy",
      description: "Apply a heating pad or hot water bottle to your lower abdomen to relax uterine muscles.",
      icon: "🔥",
      priority: "medium",
      minSeverity: 1
    },
    {
      id: "cramps-2",
      category: "nutrition",
      title: "Magnesium Boost",
      description: "Try dark chocolate, spinach, or pumpkin seeds. Magnesium can help reduce muscle contractions.",
      icon: "🍫",
      priority: "low",
      minSeverity: 1
    },
    {
      id: "cramps-3",
      category: "medical",
      title: "Pain Management",
      description: "If pain is persistent, consider over-the-counter anti-inflammatories or consult a doctor.",
      icon: "💊",
      priority: "high",
      minSeverity: 4
    }
  ],
  "Headache": [
    {
      id: "headache-1",
      category: "nutrition",
      title: "Hydration Focus",
      description: "Drink plenty of water and herbal tea. Dehydration can worsen hormonal headaches.",
      icon: "💧",
      priority: "medium",
      minSeverity: 1
    },
    {
      id: "headache-2",
      category: "self-care",
      title: "Sensory Rest",
      description: "Rest in a quiet, dark room for 20 minutes to reduce sensory triggers.",
      icon: "🌙",
      priority: "medium",
      minSeverity: 3
    }
  ],
  "Fever": [
    {
      id: "fever-1",
      category: "medical",
      title: "Monitor Temperature",
      description: "Track your temperature hourly and stay hydrated. Rest is essential.",
      icon: "🌡️",
      priority: "high",
      minSeverity: 1
    },
    {
      id: "fever-2",
      category: "medical",
      title: "Medical Consultation",
      description: "If fever exceeds 102°F or persists, please contact a healthcare provider immediately.",
      icon: "🚨",
      priority: "emergency",
      minSeverity: 4
    }
  ],
  "Bloating": [
    {
      id: "bloating-1",
      category: "nutrition",
      title: "Potassium Intake",
      description: "Limit salty foods which cause water retention. Opt for bananas instead.",
      icon: "🍌",
      priority: "low",
      minSeverity: 1
    },
    {
      id: "bloating-2",
      category: "exercise",
      title: "Light Walking",
      description: "A 15-minute light walk can help stimulate digestion and reduce gas.",
      icon: "🚶",
      priority: "low",
      minSeverity: 1
    }
  ],
  "Fatigue": [
    {
      id: "fatigue-1",
      category: "self-care",
      title: "Structured Rest",
      description: "A short 20-minute nap can recharge your energy levels without grogginess.",
      icon: "😴",
      priority: "medium",
      minSeverity: 1
    },
    {
      id: "fatigue-2",
      category: "nutrition",
      title: "Iron Rich Foods",
      description: "Boost your energy with iron-rich foods like nuts, dried fruits, or lean protein.",
      icon: "🥜",
      priority: "medium",
      minSeverity: 1
    }
  ],
  "Mood swings": [
    {
      id: "mood-1",
      category: "self-care",
      title: "Mindfulness Practice",
      description: "Try a 5-minute guided meditation or deep breathing exercise to ground yourself.",
      icon: "🧘",
      priority: "medium",
      minSeverity: 1
    },
    {
      id: "mood-2",
      category: "self-care",
      title: "Emotional Journaling",
      description: "Spend a few minutes writing down your thoughts to process emotions better.",
      icon: "✍️",
      priority: "low",
      minSeverity: 1
    }
  ],
  "Cold": [
    {
      id: "cold-1",
      category: "nutrition",
      title: "Vitamin C Boost",
      description: "Focus on citrus fruits and warm liquids to support your immune system.",
      icon: "🍊",
      priority: "medium",
      minSeverity: 1
    }
  ],
  "Breast tenderness": [
    {
      id: "breast-1",
      category: "self-care",
      title: "Comfortable Support",
      description: "Opt for a wireless, supportive bra to minimize discomfort and friction.",
      icon: "👙",
      priority: "low",
      minSeverity: 1
    }
  ]
};

export const emergencyWarnings = [
  {
    condition: (symptoms: {name: string, severity: number}[]) => {
      const fever = symptoms.find(s => s.name === "Fever" && s.severity >= 4);
      const headache = symptoms.find(s => s.name === "Headache" && s.severity >= 4);
      return !!(fever && headache);
    },
    message: "High fever combined with severe headache requires immediate medical attention.",
    icon: "🚨"
  },
  {
    condition: (symptoms: {name: string, severity: number}[]) => {
      const cramps = symptoms.find(s => s.name === "Cramps" && s.severity >= 5);
      const fever = symptoms.find(s => s.name === "Fever" && s.severity >= 3);
      return !!(cramps && fever);
    },
    message: "Severe pelvic pain with fever could indicate an infection. Please consult a doctor.",
    icon: "🚨"
  }
];

export const phaseMotivations: Record<string, string[]> = {
  "menstrual": [
    "Be gentle with yourself today. You're doing great.",
    "Rest is productive. Listen to what your body needs.",
    "Your strength isn't just about doing; it's also about being."
  ],
  "follicular": [
    "New beginnings, new energy. What will you conquer today?",
    "Your creativity is peaking. Let your ideas flow!",
    "The world is ready for your unique spark."
  ],
  "ovulation": [
    "You are radiant and capable. Shine bright today!",
    "Confidence is your superpower right now. Use it!",
    "Connection and community—today is perfect for reaching out."
  ],
  "luteal": [
    "Turn inward and recharge. You've earned this quiet time.",
    "Focus on completion and organization today.",
    "Small acts of self-care lead to big results."
  ]
};

export const phaseRecommendations: Record<string, Recommendation[]> = {
  "menstrual": [
    {
      id: "phase-m-1",
      category: "exercise",
      title: "Restorative Yoga",
      description: "Focus on gentle poses that don't put pressure on the abdomen.",
      icon: "🧘‍♀️"
    },
    {
      id: "phase-m-2",
      category: "diet",
      title: "Warm Comfort Foods",
      description: "Soups and stews are easy to digest and comforting during your period.",
      icon: "🍲"
    }
  ],
  "follicular": [
    {
      id: "phase-f-1",
      category: "exercise",
      title: "Cardio Kickstart",
      description: "Energy levels are rising! Great time for a jog or a dance class.",
      icon: "🏃‍♀️"
    },
    {
      id: "phase-f-2",
      category: "diet",
      title: "Fermented Foods",
      description: "Support your gut health with kimchi or yogurt as estrogen begins to rise.",
      icon: "🥛"
    }
  ],
  "ovulation": [
    {
      id: "phase-o-1",
      category: "exercise",
      title: "High Intensity",
      description: "You're at your physical peak. Try HIIT or strength training today.",
      icon: "💪"
    },
    {
      id: "phase-o-2",
      category: "self-care",
      title: "Social Connection",
      description: "Confidence is high! It's a great day for social gatherings or important meetings.",
      icon: "👯‍♀️"
    }
  ],
  "luteal": [
    {
      id: "phase-l-1",
      category: "diet",
      title: "Complex Carbs",
      description: "Oats and sweet potatoes can help stabilize blood sugar and reduce cravings.",
      icon: "🍠"
    },
    {
      id: "phase-l-2",
      category: "wellness",
      title: "Prioritize Sleep",
      description: "Progesterone can affect sleep quality. Aim for an extra hour of rest tonight.",
      icon: "🛏️"
    }
  ]
};

export const moodRecommendations: Record<string, Recommendation[]> = {
  "sad": [
    {
      id: "mood-sad-1",
      category: "wellness",
      title: "Uplifting Music",
      description: "Create a playlist of your favorite high-energy songs to boost your mood.",
      icon: "🎵"
    }
  ],
  "anxious": [
    {
      id: "mood-anxious-1",
      category: "wellness",
      title: "Nature Walk",
      description: "Spending time in green spaces can significantly lower cortisol levels.",
      icon: "🌳"
    }
  ],
  "irritated": [
    {
      id: "mood-irritated-1",
      category: "exercise",
      title: "Physical Release",
      description: "Channel that energy into a quick workout or some house cleaning.",
      icon: "🥊"
    }
  ]
};
