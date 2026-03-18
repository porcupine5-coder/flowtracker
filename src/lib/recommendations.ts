export interface Recommendation {
  id: string;
  category: "diet" | "exercise" | "self-care" | "wellness";
  title: string;
  description: string;
  icon: string;
}

export const symptomRecommendations: Record<string, Recommendation[]> = {
  "Cramps": [
    {
      id: "cramps-1",
      category: "self-care",
      title: "Heat Therapy",
      description: "Apply a heating pad or hot water bottle to your lower abdomen to relax uterine muscles.",
      icon: "🔥"
    },
    {
      id: "cramps-2",
      category: "diet",
      title: "Magnesium Rich Foods",
      description: "Try dark chocolate, spinach, or pumpkin seeds. Magnesium can help reduce muscle contractions.",
      icon: "🍫"
    }
  ],
  "Headache": [
    {
      id: "headache-1",
      category: "wellness",
      title: "Hydration Boost",
      description: "Drink plenty of water and herbal tea. Dehydration can worsen hormonal headaches.",
      icon: "💧"
    },
    {
      id: "headache-2",
      category: "self-care",
      title: "Dark Room Rest",
      description: "Rest in a quiet, dark room for 20 minutes to reduce sensory triggers.",
      icon: "🌙"
    }
  ],
  "Bloating": [
    {
      id: "bloating-1",
      category: "diet",
      title: "Reduce Sodium",
      description: "Limit salty foods which cause water retention. Opt for potassium-rich bananas instead.",
      icon: "🍌"
    },
    {
      id: "bloating-2",
      category: "exercise",
      title: "Gentle Movement",
      description: "A 15-minute light walk can help stimulate digestion and reduce gas.",
      icon: "🚶"
    }
  ],
  "Fatigue": [
    {
      id: "fatigue-1",
      category: "self-care",
      title: "Power Nap",
      description: "A short 20-minute nap can recharge your energy levels without causing grogginess.",
      icon: "😴"
    },
    {
      id: "fatigue-2",
      category: "diet",
      title: "Iron Rich Snacks",
      description: "Boost your energy with iron-rich foods like nuts, dried fruits, or lean protein.",
      icon: "🥜"
    }
  ],
  "Mood swings": [
    {
      id: "mood-1",
      category: "wellness",
      title: "Mindfulness",
      description: "Try a 5-minute guided meditation or deep breathing exercise to ground yourself.",
      icon: "🧘"
    },
    {
      id: "mood-2",
      category: "wellness",
      title: "Journaling",
      description: "Spend a few minutes writing down your thoughts to process emotions better.",
      icon: "✍️"
    }
  ],
  "Breast tenderness": [
    {
      id: "breast-1",
      category: "self-care",
      title: "Supportive Wear",
      description: "Opt for a wireless, supportive bra to minimize discomfort and friction.",
      icon: "👙"
    },
    {
      id: "breast-2",
      category: "diet",
      title: "Reduce Caffeine",
      description: "Limiting caffeine may help reduce breast sensitivity during this phase.",
      icon: "☕"
    }
  ],
  "Acne": [
    {
      id: "acne-1",
      category: "wellness",
      title: "Clean Pillowcases",
      description: "Switch to a clean silk or cotton pillowcase to prevent skin irritation.",
      icon: "🛏️"
    },
    {
      id: "acne-2",
      category: "diet",
      title: "Low Glycemic Foods",
      description: "Avoid high-sugar snacks which can trigger hormonal breakouts.",
      icon: "🥦"
    }
  ],
  "Nausea": [
    {
      id: "nausea-1",
      category: "diet",
      title: "Ginger Tea",
      description: "Sip on warm ginger or peppermint tea to soothe your stomach.",
      icon: "🍵"
    },
    {
      id: "nausea-2",
      category: "diet",
      title: "Small Meals",
      description: "Eat smaller, more frequent portions to avoid putting pressure on your digestion.",
      icon: "🥗"
    }
  ],
  "Back pain": [
    {
      id: "back-1",
      category: "exercise",
      title: "Gentle Stretching",
      description: "Try child's pose or cat-cow stretches to relieve tension in your lower back.",
      icon: "🧘‍♀️"
    },
    {
      id: "back-2",
      category: "self-care",
      title: "Warm Bath",
      description: "An Epsom salt bath can help relax your muscles and ease lower back discomfort.",
      icon: "🛁"
    }
  ],
  "Loss of appetite": [
    {
      id: "appetite-1",
      category: "diet",
      title: "Nutrient Smoothies",
      description: "If solid food feels heavy, try a nutrient-dense smoothie to keep your energy up.",
      icon: "🥤"
    }
  ],
  "Insomnia": [
    {
      id: "insomnia-1",
      category: "wellness",
      title: "Digital Detox",
      description: "Avoid screens 60 minutes before bed to support your natural melatonin production.",
      icon: "📱"
    },
    {
      id: "insomnia-2",
      category: "self-care",
      title: "White Noise",
      description: "Try a white noise machine or calming rain sounds to drift off easier.",
      icon: "🌧️"
    }
  ],
  "Anxiety": [
    {
      id: "anxiety-1",
      category: "wellness",
      title: "Box Breathing",
      description: "Inhale for 4, hold for 4, exhale for 4, hold for 4 to calm your nervous system.",
      icon: "🫁"
    },
    {
      id: "anxiety-2",
      category: "wellness",
      title: "Nature Connection",
      description: "Even a few minutes near a window or outdoors can help ground your thoughts.",
      icon: "🌿"
    }
  ]
};

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
