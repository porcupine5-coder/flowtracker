import { describe, it, expect } from "vitest";
import { symptomRecommendations, emergencyWarnings } from "./recommendations";

describe("Recommendation Engine Logic", () => {
  it("should map symptoms to correct recommendations", () => {
    const crampsRecs = symptomRecommendations["Cramps"];
    expect(crampsRecs).toBeDefined();
    expect(crampsRecs.some(r => r.title === "Heat Therapy")).toBe(true);
  });

  it("should have correct categories for recommendations", () => {
    const categories = ["nutrition", "exercise", "self-care", "medical"];
    Object.values(symptomRecommendations).flat().forEach(rec => {
      expect(categories).toContain(rec.category);
    });
  });

  it("should detect emergency symptom combinations", () => {
    const severeSymptoms = [
      { name: "Fever", severity: 5 },
      { name: "Headache", severity: 4 }
    ];
    
    const feverHeadacheWarning = emergencyWarnings.find(w => w.message.includes("High fever combined with severe headache"));
    expect(feverHeadacheWarning).toBeDefined();
    expect(feverHeadacheWarning?.condition(severeSymptoms)).toBe(true);
  });

  it("should not trigger emergency for mild symptoms", () => {
    const mildSymptoms = [
      { name: "Fever", severity: 2 },
      { name: "Headache", severity: 2 }
    ];
    
    emergencyWarnings.forEach(warning => {
      expect(warning.condition(mildSymptoms)).toBe(false);
    });
  });

  it("should trigger medical recommendations only for high severity", () => {
    const crampsMedical = symptomRecommendations["Cramps"].find(r => r.category === "medical");
    expect(crampsMedical?.minSeverity).toBeGreaterThanOrEqual(4);
  });
});
