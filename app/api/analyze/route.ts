import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type PackageType = "START" | "PRO" | "PREMIUM";

type RequestBody = {
  image?: string;
  prompt?: string;
  package?: PackageType;
};

const PACKAGE_VERSIONS: Record<PackageType, string[]> = {
  START: ["V2", "V3", "V4"],
  PRO: ["V2", "V3", "V4", "V5", "V6"],
  PREMIUM: ["V2", "V3", "V4", "V5", "V6", "V7", "V8"],
};

function getPackage(value: unknown): PackageType {
  if (
    value === "START" ||
    value === "PRO" ||
    value === "PREMIUM"
  ) {
    return value;
  }

  return "START";
}

/* =========================================================
   AI INSTRUCTIONS
========================================================= */

function buildInstructions(
  packageType: PackageType,
  versions: string[],
  userPrompt: string
) {
  return `
Te vagy az AI Drone Vision Engine.

Feladatod:
A feltöltött ingatlanfotó vagy drónfelvétel professzionális vizuális elemzése.

AKTÍV CSOMAG:
${packageType}

AKTÍV VERZIÓK:
${versions.join(", ")}

FONTOS SZABÁLYOK:

1. Csak az aktív verziókhoz tartozó adatokat add vissza.
2. Ne adj vissza olyan V mezőt, amely nem aktív.
3. Ne találj ki biztos tényeket.
4. Ha valami nem állapítható meg a képből, jelezd megfelelően.
5. A méretek és pénzügyi értékek vizuális becslések.
6. Ne állítsd, hogy hivatalos építészeti, statikai vagy értékbecslői vizsgálat történt.
7. A választ kizárólag a megadott JSON schema szerint add vissza.
8. A confidence és score értékek 0 és 100 közötti értékek legyenek.
9. A V5 koordináták 0 és 100 között legyenek.
10. A végső válasz kizárólag JSON legyen.

FELHASZNÁLÓI MEGJEGYZÉS:
${userPrompt || "Nincs extra megjegyzés."}

=========================================================
V2 – HIBAFELISMERÉS
=========================================================

Vizsgáld meg a képen látható:

- repedéseket
- sérült homlokzatot
- leváló vakolatot
- tetőhibákat
- hiányzó tetőelemeket
- nedvességre utaló jeleket
- sérült ablakokat
- sérült ajtókat
- látható szerkezeti problémákat
- vízelvezetési problémákat
- egyéb látható hibákat

Minden hibánál adj:

- azonosítót
- kategóriát
- helyet
- súlyosságot
- biztosságot
- megfigyelést
- javaslatot

=========================================================
V3 – MÉRÉSI BECSLÉS
=========================================================

Becsüld meg:

- ingatlan összterületét
- látható falfelületet
- padlóterületet
- tetőterületet
- látható ablakok számát
- látható ajtók számát
- mérési biztosságot

Ha nincs elegendő információ pontos becsléshez, jelezd.

=========================================================
V4 – ÁLLAPOTÉRTÉKELÉS
=========================================================

Adj 0–100 közötti állapotpontszámot.

Határozd meg:

- általános állapotot
- részletes magyarázatot
- kritikus hibák számát
- magas hibák számát
- közepes hibák számát
- alacsony hibák számát
- felújítási prioritásokat
- költségkategóriát
- becsült költségtartományt

=========================================================
V5 – VIZUÁLIS MARKEREK
=========================================================

A látható problémás területeket bounding boxokkal jelöld.

A koordináták százalékosak:

x = bal oldali pozíció 0–100
y = felső pozíció 0–100
width = szélesség 0–100
height = magasság 0–100

A bounding box lehetőleg pontosan a problémás terület körül legyen.

=========================================================
V6 – FELÚJÍTÁSI TERV
=========================================================

Készíts strukturált felújítási tervet.

Tartalmazza:

- projektösszefoglaló
- teljes prioritás
- teljes becsült költség
- becsült időtartam
- felújítási fázisok
- munkafeladatok
- szükséges anyagok
- figyelmeztetések

A fázisokat logikus sorrendben add meg.

=========================================================
V7 – INGATLAN INTELLIGENCIA
=========================================================

Határozd meg:

- ingatlantípust
- építészeti stílust
- becsült helyiségek számát
- felismert jellemzőket
- külső állapotot
- belső állapotot, ha látható
- tető állapotát
- homlokzat állapotát
- javasolt következő lépéseket
- felújítási potenciált

=========================================================
V8 – BEFEKTETÉSI ELEMZÉS
=========================================================

Készíts óvatos, becslésen alapuló befektetési elemzést.

Határozd meg:

- befektetési pontszámot 0–100 között
- felújítási értéket
- felújítás utáni becsült értéket
- becsült befektetést
- becsült hozamot
- ROI-t
- befektetési ajánlást
- befektetői összefoglalót
- kockázatokat
- lehetőségeket

FONTOS:

A V8 pénzügyi adatai csak vizuális becslések.
Ha nincs elég adat, ezt egyértelműen jelezd.

A végső válasz kizárólag érvényes JSON legyen.
Ne használj markdown kódblokkot.
`;
}

/* =========================================================
   SCHEMA BUILDER
========================================================= */

function buildSchema(versions: string[]) {
  const properties: Record<string, unknown> = {};

  /* =======================================================
     V2
  ======================================================= */

  if (versions.includes("V2")) {
    properties.v2 = {
      type: "object",
      additionalProperties: false,
      properties: {
        errors: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: {
                type: "integer",
              },
              category: {
                type: "string",
              },
              location: {
                type: "string",
              },
              severity: {
                type: "string",
              },
              confidence: {
                type: "number",
              },
              observation: {
                type: "string",
              },
              recommendation: {
                type: "string",
              },
            },
            required: [
              "id",
              "category",
              "location",
              "severity",
              "confidence",
              "observation",
              "recommendation",
            ],
          },
        },

        totalErrors: {
          type: "integer",
        },
      },

      required: [
        "errors",
        "totalErrors",
      ],
    };
  }

  /* =======================================================
     V3
  ======================================================= */

  if (versions.includes("V3")) {
    properties.v3 = {
      type: "object",
      additionalProperties: false,
      properties: {
        estimatedArea: {
          type: "string",
        },
        estimatedWallArea: {
          type: "string",
        },
        estimatedFloorArea: {
          type: "string",
        },
        estimatedRoofArea: {
          type: "string",
        },
        visibleWindows: {
          type: "integer",
        },
        visibleDoors: {
          type: "integer",
        },
        measurementConfidence: {
          type: "number",
        },
        note: {
          type: "string",
        },
      },

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
    };
  }

  /* =======================================================
     V4
  ======================================================= */

  if (versions.includes("V4")) {
    properties.v4 = {
      type: "object",
      additionalProperties: false,

      properties: {
        conditionScore: {
          type: "number",
        },

        condition: {
          type: "string",
        },

        explanation: {
          type: "string",
        },

        criticalErrors: {
          type: "integer",
        },

        highErrors: {
          type: "integer",
        },

        mediumErrors: {
          type: "integer",
        },

        lowErrors: {
          type: "integer",
        },

        renovationPriorities: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,

            properties: {
              priority: {
                type: "integer",
              },

              work: {
                type: "string",
              },

              reason: {
                type: "string",
              },

              urgency: {
                type: "string",
              },
            },

            required: [
              "priority",
              "work",
              "reason",
              "urgency",
            ],
          },
        },

        costCategory: {
          type: "string",
        },

        estimatedCostRange: {
          type: "string",
        },
      },

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
    };
  }

  /* =======================================================
     V5
  ======================================================= */

  if (versions.includes("V5")) {
    properties.v5 = {
      type: "object",
      additionalProperties: false,

      properties: {
        markers: {
          type: "array",

          items: {
            type: "object",
            additionalProperties: false,

            properties: {
              id: {
                type: "integer",
              },

              type: {
                type: "string",
              },

              label: {
                type: "string",
              },

              severity: {
                type: "string",
              },

              confidence: {
                type: "number",
              },

              x: {
                type: "number",
              },

              y: {
                type: "number",
              },

              width: {
                type: "number",
              },

              height: {
                type: "number",
              },
            },

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
          },
        },
      },

      required: [
        "markers",
      ],
    };
  }

  /* =======================================================
     V6
  ======================================================= */

  if (versions.includes("V6")) {
    properties.v6 = {
      type: "object",
      additionalProperties: false,

      properties: {
        projectSummary: {
          type: "string",
        },

        overallPriority: {
          type: "string",
        },

        totalEstimatedCost: {
          type: "string",
        },

        estimatedDuration: {
          type: "string",
        },

        phases: {
          type: "array",

          items: {
            type: "object",
            additionalProperties: false,

            properties: {
              phase: {
                type: "integer",
              },

              name: {
                type: "string",
              },

              description: {
                type: "string",
              },

              priority: {
                type: "string",
              },

              estimatedDuration: {
                type: "string",
              },

              estimatedCost: {
                type: "string",
              },

              tasks: {
                type: "array",

                items: {
                  type: "object",
                  additionalProperties: false,

                  properties: {
                    task: {
                      type: "string",
                    },

                    reason: {
                      type: "string",
                    },

                    material: {
                      type: "string",
                    },

                    quantity: {
                      type: "string",
                    },

                    materialCost: {
                      type: "string",
                    },

                    laborCost: {
                      type: "string",
                    },

                    duration: {
                      type: "string",
                    },
                  },

                  required: [
                    "task",
                    "reason",
                    "material",
                    "quantity",
                    "materialCost",
                    "laborCost",
                    "duration",
                  ],
                },
              },
            },

            required: [
              "phase",
              "name",
              "description",
              "priority",
              "estimatedDuration",
              "estimatedCost",
              "tasks",
            ],
          },
        },

        materials: {
          type: "array",

          items: {
            type: "object",
            additionalProperties: false,

            properties: {
              material: {
                type: "string",
              },

              quantity: {
                type: "string",
              },

              estimatedCost: {
                type: "string",
              },

              purpose: {
                type: "string",
              },
            },

            required: [
              "material",
              "quantity",
              "estimatedCost",
              "purpose",
            ],
          },
        },

        warnings: {
          type: "array",

          items: {
            type: "string",
          },
        },
      },

      required: [
        "projectSummary",
        "overallPriority",
        "totalEstimatedCost",
        "estimatedDuration",
        "phases",
        "materials",
        "warnings",
      ],
    };
  }

  /* =======================================================
     V7
  ======================================================= */

  if (versions.includes("V7")) {
    properties.v7 = {
      type: "object",
      additionalProperties: false,

      properties: {
        propertyType: {
          type: "string",
        },

        architecturalStyle: {
          type: "string",
        },

        estimatedRooms: {
          type: "integer",
        },

        detectedFeatures: {
          type: "array",
          items: {
            type: "string",
          },
        },

        exteriorCondition: {
          type: "string",
        },

        interiorCondition: {
          type: "string",
        },

        roofCondition: {
          type: "string",
        },

        facadeCondition: {
          type: "string",
        },

        recommendedActions: {
          type: "array",
          items: {
            type: "string",
          },
        },

        renovationPotential: {
          type: "string",
        },
      },

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
    };
  }

  /* =======================================================
     V8
  ======================================================= */

  if (versions.includes("V8")) {
    properties.v8 = {
      type: "object",
      additionalProperties: false,

      properties: {
        investmentScore: {
          type: "number",
        },

        renovationValue: {
          type: "string",
        },

        estimatedAfterRenovationValue: {
          type: "string",
        },

        estimatedInvestment: {
          type: "string",
        },

        estimatedReturn: {
          type: "string",
        },

        roi: {
          type: "string",
        },

        recommendation: {
          type: "string",
        },

        investorSummary: {
          type: "string",
        },

        risks: {
          type: "array",
          items: {
            type: "string",
          },
        },

        opportunities: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },

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
    };
  }

  return {
    type: "object",
    additionalProperties: false,
    properties,

    required: versions.map((version) =>
      version.toLowerCase()
    ),
  };
}

/* =========================================================
   POST API
========================================================= */

export async function POST(request: Request) {
  try {
    /* =======================================================
       API KEY
    ======================================================= */

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "OPENAI_API_KEY nincs beállítva a környezeti változók között.",
        },
        {
          status: 500,
        }
      );
    }

    /* =======================================================
       REQUEST
    ======================================================= */

    let body: RequestBody;

    try {
      body = (await request.json()) as RequestBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Érvénytelen JSON kérés.",
        },
        {
          status: 400,
        }
      );
    }

    /* =======================================================
       IMAGE CHECK
    ======================================================= */

    if (!body.image) {
      return NextResponse.json(
        {
          success: false,
          error: "Nem érkezett kép.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body.image !== "string" ||
      !body.image.startsWith("data:image/")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A feltöltött kép formátuma nem támogatott.",
        },
        {
          status: 400,
        }
      );
    }

    /* =======================================================
       PACKAGE
    ======================================================= */

    const packageType = getPackage(body.package);

    const versions = PACKAGE_VERSIONS[packageType];

    /* =======================================================
       INSTRUCTIONS
    ======================================================= */

    const instructions = buildInstructions(
      packageType,
      versions,
      body.prompt || ""
    );

    /* =======================================================
       SCHEMA
    ======================================================= */

    const schema = buildSchema(versions);

    /* =======================================================
       OPENAI RESPONSE
    ======================================================= */

    const response = await openai.responses.create({
      model: "gpt-5.6",

      input: [
        {
          role: "user",

          content: [
            {
              type: "input_text",
              text: instructions,
            },

            {
              type: "input_image",
              image_url: body.image,
              detail: "high",
            },
          ],
        },
      ],

      text: {
        format: {
          type: "json_schema",
          name: "ai_drone_vision_analysis",
          strict: true,
          schema,
        },
      },
    });

    /* =======================================================
       OUTPUT
    ======================================================= */

    const outputText = response.output_text;

    if (!outputText) {
      throw new Error(
        "Az AI nem adott vissza eredményt."
      );
    }

    /* =======================================================
       JSON PARSE
    ======================================================= */

    let analysis: unknown;

    try {
      analysis = JSON.parse(outputText);
    } catch {
      console.error(
        "Invalid AI JSON:",
        outputText
      );

      throw new Error(
        "Az AI válasza nem érvényes JSON."
      );
    }

    /* =======================================================
       RESPONSE
    ======================================================= */

    return NextResponse.json({
      success: true,
      package: packageType,
      versions,
      analysis,
    });
  } catch (error) {
    console.error(
      "AI Drone Vision API error:",
      error
    );

    let message =
      "Ismeretlen szerverhiba.";

    if (error instanceof Error) {
      message = error.message;
    }

    /* =======================================================
       OPENAI ERROR HANDLING
    ======================================================= */

    if (
      typeof error === "object" &&
      error !== null
    ) {
      const possibleError = error as {
        status?: number;
        code?: string;
        message?: string;
      };

      if (possibleError.status === 400) {
        message =
          possibleError.message ||
          "Érvénytelen kérés érkezett az OpenAI API felé.";
      }

      if (possibleError.status === 401) {
        message =
          "Az OpenAI API kulcs érvénytelen vagy nem megfelelő.";
      }

      if (possibleError.status === 429) {
        message =
          "Az OpenAI API jelenleg nem tudja feldolgozni a kérést. Ellenőrizd az API kreditet és a számlázási beállításokat.";
      }

      if (possibleError.status === 500) {
        message =
          "Az OpenAI szerverén átmeneti hiba történt.";
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}