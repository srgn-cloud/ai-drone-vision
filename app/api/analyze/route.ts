import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = "gpt-5.6";

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["v2", "v3", "v4", "v5", "v6", "v7", "v8"],
  properties: {
    v2: {
      type: "object",
      additionalProperties: false,
      required: ["errors", "totalErrors"],
      properties: {
        errors: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "id",
              "category",
              "location",
              "severity",
              "confidence",
              "observation",
              "recommendation",
            ],
            properties: {
              id: { type: "integer" },
              category: { type: "string" },
              location: { type: "string" },
              severity: { type: "string" },
              confidence: { type: "number" },
              observation: { type: "string" },
              recommendation: { type: "string" },
            },
          },
        },
        totalErrors: { type: "integer" },
      },
    },

    v3: {
      type: "object",
      additionalProperties: false,
      required: [
        "estimatedArea",
        "estimatedWallArea",
        "estimatedFloorArea",
        "estimatedRoofArea",
        "visibleWindows",
        "visibleDoors",
        "measurementConfidence",
        "note",
      ],
      properties: {
        estimatedArea: { type: "string" },
        estimatedWallArea: { type: "string" },
        estimatedFloorArea: { type: "string" },
        estimatedRoofArea: { type: "string" },
        visibleWindows: { type: "integer" },
        visibleDoors: { type: "integer" },
        measurementConfidence: { type: "number" },
        note: { type: "string" },
      },
    },

    v4: {
      type: "object",
      additionalProperties: false,
      required: [
        "conditionScore",
        "condition",
        "explanation",
        "criticalErrors",
        "highErrors",
        "mediumErrors",
        "lowErrors",
        "renovationPriorities",
        "costCategory",
        "estimatedCostRange",
      ],
      properties: {
        conditionScore: { type: "number" },
        condition: { type: "string" },
        explanation: { type: "string" },
        criticalErrors: { type: "integer" },
        highErrors: { type: "integer" },
        mediumErrors: { type: "integer" },
        lowErrors: { type: "integer" },
        renovationPriorities: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "priority",
              "work",
              "reason",
              "urgency",
            ],
            properties: {
              priority: { type: "integer" },
              work: { type: "string" },
              reason: { type: "string" },
              urgency: { type: "string" },
            },
          },
        },
        costCategory: { type: "string" },
        estimatedCostRange: { type: "string" },
      },
    },

    v5: {
      type: "object",
      additionalProperties: false,
      required: ["markers"],
      properties: {
        markers: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "id",
              "type",
              "label",
              "severity",
              "confidence",
              "x",
              "y",
              "width",
              "height",
            ],
            properties: {
              id: { type: "integer" },
              type: { type: "string" },
              label: { type: "string" },
              severity: { type: "string" },
              confidence: { type: "number" },
              x: { type: "number" },
              y: { type: "number" },
              width: { type: "number" },
              height: { type: "number" },
            },
          },
        },
      },
    },

    v6: {
      type: "object",
      additionalProperties: false,
      required: [
        "projectSummary",
        "overallPriority",
        "totalEstimatedCost",
        "estimatedDuration",
        "phases",
        "materials",
        "warnings",
      ],
      properties: {
        projectSummary: { type: "string" },
        overallPriority: { type: "string" },
        totalEstimatedCost: { type: "string" },
        estimatedDuration: { type: "string" },

        phases: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "phase",
              "name",
              "description",
              "priority",
              "estimatedDuration",
              "estimatedCost",
              "tasks",
            ],
            properties: {
              phase: { type: "integer" },
              name: { type: "string" },
              description: { type: "string" },
              priority: { type: "string" },
              estimatedDuration: { type: "string" },
              estimatedCost: { type: "string" },

              tasks: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "task",
                    "reason",
                    "material",
                    "quantity",
                    "materialCost",
                    "laborCost",
                    "duration",
                  ],
                  properties: {
                    task: { type: "string" },
                    reason: { type: "string" },
                    material: { type: "string" },
                    quantity: { type: "string" },
                    materialCost: { type: "string" },
                    laborCost: { type: "string" },
                    duration: { type: "string" },
                  },
                },
              },
            },
          },
        },

        materials: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "material",
              "quantity",
              "estimatedCost",
              "purpose",
            ],
            properties: {
              material: { type: "string" },
              quantity: { type: "string" },
              estimatedCost: { type: "string" },
              purpose: { type: "string" },
            },
          },
        },

        warnings: {
          type: "array",
          items: { type: "string" },
        },
      },
    },

    v7: {
      type: "object",
      additionalProperties: false,
      required: [
        "propertyType",
        "architecturalStyle",
        "estimatedRooms",
        "detectedFeatures",
        "exteriorCondition",
        "interiorCondition",
        "roofCondition",
        "facadeCondition",
        "recommendedActions",
        "renovationPotential",
      ],
      properties: {
        propertyType: { type: "string" },
        architecturalStyle: { type: "string" },
        estimatedRooms: { type: "integer" },
        detectedFeatures: {
          type: "array",
          items: { type: "string" },
        },
        exteriorCondition: { type: "string" },
        interiorCondition: { type: "string" },
        roofCondition: { type: "string" },
        facadeCondition: { type: "string" },
        recommendedActions: {
          type: "array",
          items: { type: "string" },
        },
        renovationPotential: { type: "string" },
      },
    },

    v8: {
      type: "object",
      additionalProperties: false,
      required: [
        "investmentScore",
        "renovationValue",
        "estimatedAfterRenovationValue",
        "estimatedInvestment",
        "estimatedReturn",
        "roi",
        "recommendation",
        "investorSummary",
        "risks",
        "opportunities",
      ],
      properties: {
        investmentScore: { type: "number" },
        renovationValue: { type: "string" },
        estimatedAfterRenovationValue: { type: "string" },
        estimatedInvestment: { type: "string" },
        estimatedReturn: { type: "string" },
        roi: { type: "string" },
        recommendation: { type: "string" },
        investorSummary: { type: "string" },
        risks: {
          type: "array",
          items: { type: "string" },
        },
        opportunities: {
          type: "array",
          items: { type: "string" },
        },
      },
    },
  },
};

const instructions = `
Te vagy az AI Drone Vision Engine V8.

Feladatod egy feltöltött ingatlanfotó vagy drónfotó teljes vizuális elemzése.

A választ KIZÁRÓLAG a megadott JSON Schema szerint add vissza.

FONTOS SZABÁLYOK:

1. Magyar nyelven válaszolj.
2. Ne találj ki olyan adatot, amely nem látható vagy nem következtethető ésszerűen.
3. A méretek mindig vizuális becslések.
4. A költségek mindig tájékoztató becslések, nem hivatalos árajánlatok.
5. Ha valami nem állapítható meg a képből, ezt egyértelműen jelezd.
6. A confidence értékek 0 és 1 között legyenek.
7. A conditionScore és investmentScore 0 és 100 között legyen.
8. A V5 marker koordinátái százalékosak:
   - x: 0–100
   - y: 0–100
   - width: 0–100
   - height: 0–100
9. A V5 marker pontosan azon a képrészleten legyen, ahol a probléma látható.
10. Ne jelölj hibát csak azért, mert valami nem látható.
11. Ne állítsd biztosan, hogy szerkezeti hiba van, ha ezt egyetlen fotóból nem lehet megállapítani.
12. A V6 felújítási terv legyen gyakorlati és prioritásalapú.
13. A V7 az ingatlan típusát, stílusát és állapotát elemezze.
14. A V8 befektetési elemzés csak becslés legyen.
15. ROI-t csak becslésként adj meg.
16. A V8 ne kezelje a becsléseket hivatalos ingatlanértékbecslésként.
17. A V2–V8 minden szekcióját töltsd ki.
18. Ha nincs elegendő információ, használj olyan értéket, mint:
   "Nem meghatározható a képből."
19. Ne adj markdownot.
20. Ne adj magyarázó szöveget a JSON-on kívül.

V2 – HIBAFELISMERÉS
Azonosítsd a látható problémákat:
- tető
- homlokzat
- vakolat
- repedések
- nedvesség jelei
- nyílászárók
- eresz
- burkolatok
- kerítés
- környezet
- egyéb látható építési problémák

Minden hibához adj:
id, category, location, severity, confidence, observation, recommendation.

V3 – MÉRÉSI BECSLÉS
Becsüld meg:
- összterület
- falfelület
- padlóterület
- tetőterület
- látható ablakok
- látható ajtók
- mérési biztosság

Ha nincs megfelelő perspektíva, ezt jelezd.

V4 – ÁLLAPOTÉRTÉKELÉS
Adj:
- conditionScore
- condition
- explanation
- criticalErrors
- highErrors
- mediumErrors
- lowErrors
- renovationPriorities
- costCategory
- estimatedCostRange

V5 – VIZUÁLIS MARKEREK
A V2-ben felismert ténylegesen látható hibákhoz készíts képi markereket.
A marker koordinátái százalékosak.

V6 – FELÚJÍTÁSI TERV
Készíts:
- projektösszefoglalót
- teljes prioritást
- teljes becsült költséget
- becsült időtartamot
- fázisokat
- feladatokat
- anyaglistát
- figyelmeztetéseket

A felújítási sorrend legyen logikus:
1. sürgős / szerkezeti vagy beázási problémák
2. tető és vízelvezetés
3. homlokzat és vakolat
4. nyílászárók
5. gépészet, ha látható vagy indokolt
6. belső felújítás
7. esztétikai munkák

V7 – INGATLAN INTELLIGENCIA
Határozd meg:
- ingatlantípus
- építészeti stílus
- becsült helyiségek száma
- felismerhető jellemzők
- külső állapot
- belső állapot
- tető állapota
- homlokzat állapota
- javasolt következő lépések
- felújítási potenciál

V8 – BEFEKTETÉSI ELEMZÉS
Becsüld meg:
- investmentScore
- renovationValue
- estimatedAfterRenovationValue
- estimatedInvestment
- estimatedReturn
- roi
- recommendation
- investorSummary
- risks
- opportunities

FONTOS:
Az ingatlan értékét ne kezeld hivatalos értékbecslésként.
Ha nincs helyszín, alapterület, vételár vagy piaci adat, az érték- és ROI-becslés bizonytalanságát egyértelműen jelezd.
`;

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Az OPENAI_API_KEY nincs beállítva. Ellenőrizd a .env.local fájlt.",
        },
        { status: 500 }
      );
    }

    let body: {
      image?: unknown;
      prompt?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Érvénytelen JSON kérés.",
        },
        { status: 400 }
      );
    }

    const image =
      typeof body.image === "string"
        ? body.image
        : "";

    const userPrompt =
      typeof body.prompt === "string"
        ? body.prompt.trim()
        : "";

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: "Nem érkezett kép.",
        },
        { status: 400 }
      );
    }

    if (!image.startsWith("data:image/")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A kép formátuma nem megfelelő. Data URL formátumú képet várunk.",
        },
        { status: 400 }
      );
    }

    const finalInstructions =
      instructions +
      (userPrompt
        ? `\n\nFELHASZNÁLÓI MEGJEGYZÉS:\n${userPrompt}`
        : "");

    const response = await openai.responses.create({
      model: MODEL,

      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: finalInstructions,
            },
            {
              type: "input_image",
              image_url: image,
              detail: "high",
            },
          ],
        },
      ],

      text: {
        format: {
          type: "json_schema",
          name: "ai_drone_vision_v8",
          strict: true,
          schema: analysisSchema,
        },
      },
    });

    const outputText = response.output_text;

    if (!outputText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Az AI nem adott vissza feldolgozható eredményt.",
        },
        { status: 502 }
      );
    }

    let analysis: unknown;

    try {
      analysis = JSON.parse(outputText);
    } catch {
      console.error(
        "AI JSON parse error:",
        outputText
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Az AI válasza nem volt érvényes JSON.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: unknown) {
    console.error(
      "AI Drone Vision API error:",
      error
    );

    const err = error as {
      status?: number;
      message?: string;
      code?: string;
      error?: {
        message?: string;
      };
    };

    const status =
      typeof err?.status === "number"
        ? err.status
        : 500;

    const apiMessage =
      err?.error?.message ||
      err?.message ||
      "";

    if (status === 401) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Az OpenAI API-kulcs érvénytelen vagy nincs jogosultsága.",
        },
        { status: 401 }
      );
    }

    if (status === 429) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Az OpenAI API használati limitje vagy kreditkerete elfogyott. Ellenőrizd az API billing/usage állapotát.",
          details: apiMessage || undefined,
        },
        { status: 429 }
      );
    }

    if (status === 400) {
      return NextResponse.json(
        {
          success: false,
          error:
            apiMessage ||
            "Az OpenAI API elutasította a kérést.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          apiMessage ||
          "Szerverhiba történt az AI elemzés közben.",
      },
      { status: 500 }
    );
  }
}
