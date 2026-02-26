# Unani Assessment Update

## Overview
Updated the Unani assessment system from 16 questions to 20 questions based on authentic Unani principles of Mizaj (Temperament) and Akhlat (Four Humors).

## Changes Made

### 1. Question Bank (`questionBanks.js`)
- **Updated from**: 16 questions across 5 categories
- **Updated to**: 20 questions across 4 sections

#### New Question Structure:
- **Section A**: Heat & Cold Dominance (Q1-Q5)
- **Section B**: Moisture & Dryness Patterns (Q6-Q10)
- **Section C**: Humor-Specific Symptoms (Q11-Q15) - **Weight: 2x**
- **Section D**: Digestive & Organ Strength (Q16-Q20) - **Weight: 2x**

#### Four Humors (Akhlat):
Each answer option maps to one of four humors:
- **A = Dam** (Hot + Moist) - Sanguine
- **B = Safra** (Hot + Dry) - Choleric
- **C = Balgham** (Cold + Moist) - Phlegmatic
- **D = Sauda** (Cold + Dry) - Melancholic

### 2. Scoring Engine (`unani.js`)

#### New Scoring System:
1. Count total scores for each humor (Dam, Safra, Balgham, Sauda)
2. Apply 2x weight to questions 11-20 (humor symptoms and digestive questions)
3. Determine primary humor (highest score) and secondary humor (second highest)
4. Calculate severity based on score difference:
   - **Difference 1-2** → Mild (severity: 1)
   - **Difference 3-4** → Moderate (severity: 2)
   - **Difference 5+** → Severe (severity: 3)

#### Digestive Strength Calculation:
Based on Q16 (After meals) and Q17 (Fatty foods tolerance):
- **A (Dam)** → strong
- **B (Safra)** → strong_but_hot
- **C (Balgham)** → slow
- **D (Sauda)** → weak

#### Output Structure:
```javascript
{
  primary_mizaj: "dam|safra|balgham|sauda",
  secondary_mizaj: "dam|safra|balgham|sauda",
  dominant_humor: "dam|safra|balgham|sauda",
  severity: 1-3,
  digestive_strength: "strong|strong_but_hot|slow|weak|moderate",
  humor_scores: {
    dam: number,
    safra: number,
    balgham: number,
    sauda: number
  },
  thermal_tendency: "hot|cold",
  moisture_tendency: "moist|dry",
  balance_indicator: "mild|moderate|severe",
  score_difference: number
}
```

## Sample Questions

### Section A - Heat & Cold Dominance
**Q1**: My body generally feels:
- A) Warm and lively (Dam)
- B) Hot and intense (Safra)
- C) Cool and heavy (Balgham)
- D) Cold and tense (Sauda)

### Section C - Humor-Specific Symptoms (2x weight)
**Q11**: I tend to develop:
- A) Redness or fullness (Dam)
- B) Acidity or burning (Safra)
- C) Cold, cough, sinus (Balgham)
- D) Dark circles or constipation (Sauda)

### Section D - Digestive & Organ Strength (2x weight)
**Q16**: After meals I feel:
- A) Comfortable (Dam → strong digestion)
- B) Heat or burning (Safra → strong but hot)
- C) Heavy and sluggish (Balgham → slow digestion)
- D) Bloated and dry (Sauda → weak digestion)

## Clinical Basis

### Mizaj Principles:
- **Hot/Cold**: Body's thermal tendency
- **Moist/Dry**: Body's moisture balance
- **Akhlat (Humors)**: Four fluid-based temperaments

### Organ Systems Evaluated:
- Liver function (Heat regulation)
- Brain function (Mental patterns)
- Stomach function (Digestive strength)
- Fluid balance (Moisture patterns)

## Testing
To test the updated assessment:
1. Start backend server: `cd backend && node server.js`
2. Submit a Unani assessment with all 20 questions
3. Verify the response includes:
   - Primary and secondary mizaj
   - Humor scores
   - Severity level
   - Digestive strength

## Backward Compatibility
- Old assessments with 16 questions will still work but may produce incomplete results
- New assessments require all 20 questions for accurate scoring
- The scoring engine validates responses and returns appropriate errors

## Next Steps
- Update frontend to display all 20 questions
- Update UI to show humor breakdown
- Add severity and digestive strength indicators
- Consider adding visual representation of humor balance
