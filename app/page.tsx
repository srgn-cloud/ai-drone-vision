"use client";

import { ChangeEvent, ReactNode, useState } from "react";

type ErrorItem = {
  id: number;
  category: string;
  location: string;
  severity: string;
  confidence: number;
  observation: string;
  recommendation: string;
};

type Marker = {
  id: number;
  type: string;
  label: string;
  severity: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Priority = {
  priority: number;
  work: string;
  reason: string;
  urgency: string;
};

type Task = {
  task: string;
  reason: string;
  material: string;
  quantity: string;
  materialCost: string;
  laborCost: string;
  duration: string;
};

type Phase = {
  phase: number;
  name: string;
  description: string;
  priority: string;
  estimatedDuration: string;
  estimatedCost: string;
  tasks?: Task[];
};

type Material = {
  material: string;
  quantity: string;
  estimatedCost: string;
  purpose: string;
};

type Analysis = {
  v2?: {
    errors?: ErrorItem[];
    totalErrors?: number;
  };

  v3?: {
    estimatedArea?: string;
    estimatedWallArea?: string;
    estimatedFloorArea?: string;
    estimatedRoofArea?: string;
    visibleWindows?: number;
    visibleDoors?: number;
    measurementConfidence?: number;
    note?: string;
  };

  v4?: {
    conditionScore?: number;
    condition?: string;
    explanation?: string;
    criticalErrors?: number;
    highErrors?: number;
    mediumErrors?: number;
    lowErrors?: number;
    renovationPriorities?: Priority[];
    costCategory?: string;
    estimatedCostRange?: string;
  };

  v5?: {
    markers?: Marker[];
  };

  v6?: {
    projectSummary?: string;
    overallPriority?: string;
    totalEstimatedCost?: string;
    estimatedDuration?: string;
    phases?: Phase[];
    materials?: Material[];
    warnings?: string[];
  };

  v7?: {
    propertyType?: string;
    architecturalStyle?: string;
    estimatedRooms?: number;
    detectedFeatures?: string[];
    exteriorCondition?: string;
    interiorCondition?: string;
    roofCondition?: string;
    facadeCondition?: string;
    recommendedActions?: string[];
    renovationPotential?: string;
  };

  v8?: {
    investmentScore?: number;
    renovationValue?: string;
    estimatedAfterRenovationValue?: string;
    estimatedInvestment?: string;
    estimatedReturn?: string;
    roi?: string;
    recommendation?: string;
    investorSummary?: string;
    risks?: string[];
    opportunities?: string[];
  };
};

export default function Home() {
  const [image, setImage] = useState("");
  const [fileName, setFileName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Csak képfájlt tölts fel.");
      return;
    }

    setError("");
    setAnalysis(null);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };

    reader.onerror = () => {
      setError("A kép beolvasása sikertelen.");
    };

    reader.readAsDataURL(file);
  }

  async function analyzeImage() {
    if (!image) {
      setError("Először tölts fel egy képet.");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image,
          prompt,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Az elemzés sikertelen."
        );
      }

      setAnalysis(data.analysis);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ismeretlen hiba történt."
      );
    } finally {
      setLoading(false);
    }
  }

  function removeImage() {
    setImage("");
    setFileName("");
    setAnalysis(null);
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-8">

        {/* HEADER */}

        <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div className="flex items-center gap-4">

            {/* AI DRONE VISION LOGO */}

            <div className="flex h-16 w-16 shrink-0 items-center justify-center">
  <img
    src="/ai-drone-vision.png"
    alt="AI Drone Vision"
    className="h-16 w-16 object-contain"
              />
            </div>

            <div>
              <h1 className="text-3xl font-black">
                AI Drone Vision
              </h1>

              <p className="text-sm text-slate-400">
                AI ingatlanfelmérés és felújítás-tervezés
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "V2",
              "V3",
              "V4",
              "V5",
              "V6",
              "V7",
              "V8",
            ].map((version) => (
              <span
                key={version}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-400"
              >
                {version}
              </span>
            ))}
          </div>

        </header>

        <div className="grid gap-6 xl:grid-cols-[430px_1fr]">

          {/* INPUT */}

          <section className="h-fit rounded-3xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-bold">
              Ingatlan elemzése
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tölts fel egy ingatlanfotót vagy drónfelvételt.
            </p>

            {!image ? (
              <label className="mt-6 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 p-6 text-center hover:border-blue-500">

                <div className="text-6xl">
                  📷
                </div>

                <p className="mt-4 font-bold">
                  Kép feltöltése
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  JPG · PNG · WEBP
                </p>

                <span className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold">
                  Fájl kiválasztása
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

              </label>
            ) : (
              <div className="mt-6">

                <div className="overflow-hidden rounded-2xl border border-slate-700 bg-black">

                  <img
                    src={image}
                    alt="Feltöltött ingatlan"
                    className="max-h-[400px] w-full object-contain"
                  />

                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-950 p-3">

                  <span className="max-w-[70%] truncate text-xs text-slate-400">
                    {fileName}
                  </span>

                  <button
                    onClick={removeImage}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs hover:border-red-500 hover:text-red-400"
                  >
                    Törlés
                  </button>

                </div>

              </div>
            )}

            <div className="mt-6">

              <label className="mb-2 block text-sm font-semibold">
                Megjegyzés az AI-nak
              </label>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Pl. Különösen vizsgáld meg a tetőt és a homlokzatot."
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm outline-none focus:border-blue-500"
              />

            </div>

            <button
              onClick={analyzeImage}
              disabled={!image || loading}
              className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-4 font-bold hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {loading
                ? "🔄 AI elemzés folyamatban..."
                : "🔍 V2–V8 TELJES ELEMZÉS"}
            </button>

            {error && (
              <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

          </section>

          {/* RESULTS */}

          <section className="space-y-6">

            {!analysis && !loading && (
              <EmptyScreen />
            )}

            {loading && (
              <LoadingScreen />
            )}

            {analysis && !loading && (
              <>
                <StatusCard />

                {/* V2 */}

                {analysis.v2 && (
                  <Panel
                    title="V2 · Hibafelismerés"
                    color="red"
                    badge={`${analysis.v2.totalErrors ?? 0} hiba`}
                  >
                    {(analysis.v2.errors ?? []).length === 0 ? (
                      <Empty text="Nem található látható hiba." />
                    ) : (
                      <div className="space-y-3">
                        {(analysis.v2.errors ?? []).map(
                          (item) => (
                            <div
                              key={item.id}
                              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                            >
                              <div className="flex justify-between gap-4">

                                <div>
                                  <h3 className="font-bold">
                                    {item.category}
                                  </h3>

                                  <p className="text-xs text-slate-500">
                                    {item.location}
                                  </p>
                                </div>

                                <span className="text-xs font-bold text-red-400">
                                  {item.severity}
                                </span>

                              </div>

                              <p className="mt-3 text-sm text-slate-300">
                                {item.observation}
                              </p>

                              <p className="mt-2 text-sm text-blue-400">
                                Javaslat: {item.recommendation}
                              </p>

                              <p className="mt-2 text-xs text-slate-600">
                                Biztosság:{" "}
                                {Math.round(
                                  (item.confidence ?? 0) * 100
                                )}
                                %
                              </p>

                            </div>
                          )
                        )}
                      </div>
                    )}
                  </Panel>
                )}

                {/* V3 */}

                {analysis.v3 && (
                  <Panel
                    title="V3 · Mérési becslés"
                    color="blue"
                  >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                      <Stat
                        label="Összterület"
                        value={analysis.v3.estimatedArea}
                      />

                      <Stat
                        label="Fal terület"
                        value={analysis.v3.estimatedWallArea}
                      />

                      <Stat
                        label="Padló"
                        value={analysis.v3.estimatedFloorArea}
                      />

                      <Stat
                        label="Tető"
                        value={analysis.v3.estimatedRoofArea}
                      />

                      <Stat
                        label="Látható ablakok"
                        value={String(
                          analysis.v3.visibleWindows ?? 0
                        )}
                      />

                      <Stat
                        label="Látható ajtók"
                        value={String(
                          analysis.v3.visibleDoors ?? 0
                        )}
                      />

                      <Stat
                        label="Mérési biztosság"
                        value={`${Math.round(
                          analysis.v3.measurementConfidence ?? 0
                        )}%`}
                      />

                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                      {analysis.v3.note ||
                        "A méretek vizuális becslések."}
                    </p>

                  </Panel>
                )}

                {/* V4 */}

                {analysis.v4 && (
                  <Panel
                    title="V4 · Állapotértékelés"
                    color="yellow"
                    badge={`${analysis.v4.conditionScore ?? 0}/100`}
                  >

                    <div className="grid gap-5 md:grid-cols-[120px_1fr]">

                      <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-yellow-500 text-3xl font-black text-yellow-400">
                        {analysis.v4.conditionScore ?? 0}
                      </div>

                      <div>

                        <h3 className="text-xl font-bold">
                          {analysis.v4.condition ||
                            "Nem meghatározható"}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {analysis.v4.explanation ||
                            "Nincs részletes magyarázat."}
                        </p>

                      </div>

                    </div>

                    <div className="mt-5 grid grid-cols-4 gap-2 text-center">

                      <MiniStat
                        label="Kritikus"
                        value={analysis.v4.criticalErrors ?? 0}
                      />

                      <MiniStat
                        label="Magas"
                        value={analysis.v4.highErrors ?? 0}
                      />

                      <MiniStat
                        label="Közepes"
                        value={analysis.v4.mediumErrors ?? 0}
                      />

                      <MiniStat
                        label="Alacsony"
                        value={analysis.v4.lowErrors ?? 0}
                      />

                    </div>

                    <div className="mt-5 rounded-xl bg-slate-950 p-4">

                      <p className="text-xs text-slate-500">
                        Becsült költség
                      </p>

                      <p className="mt-1 text-xl font-bold text-yellow-400">
                        {analysis.v4.estimatedCostRange ||
                          "Nem meghatározható"}
                      </p>

                    </div>

                    <div className="mt-5 space-y-2">

                      {(analysis.v4.renovationPriorities ?? []).map(
                        (item) => (
                          <div
                            key={item.priority}
                            className="rounded-xl bg-slate-950 p-4"
                          >

                            <div className="flex gap-3">

                              <span className="font-black text-yellow-400">
                                #{item.priority}
                              </span>

                              <div>

                                <p className="font-bold">
                                  {item.work}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {item.reason}
                                </p>

                                <p className="mt-2 text-xs text-yellow-500">
                                  {item.urgency}
                                </p>

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </Panel>
                )}

                {/* V5 */}

                {analysis.v5 && (
                  <Panel
                    title="V5 · Vizuális hibajelölés"
                    color="purple"
                    badge={`${(analysis.v5.markers ?? []).length} marker`}
                  >

                    <div className="mb-4 rounded-xl bg-purple-950/30 p-4 text-sm text-purple-300">
                      A piros keretek az AI által felismert problémás területeket jelölik.
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-black">

                      <img
                        src={image}
                        alt="AI vizuális elemzés"
                        className="block h-auto w-full"
                      />

                      {(analysis.v5.markers ?? []).map(
                        (marker) => {

                          const x = clamp(
                            marker.x,
                            0,
                            100
                          );

                          const y = clamp(
                            marker.y,
                            0,
                            100
                          );

                          const width = clamp(
                            marker.width,
                            0.5,
                            Math.max(
                              0.5,
                              100 - x
                            )
                          );

                          const height = clamp(
                            marker.height,
                            0.5,
                            Math.max(
                              0.5,
                              100 - y
                            )
                          );

                          return (
                            <div
                              key={marker.id}
                              className="absolute"
                              style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                width: `${width}%`,
                                height: `${height}%`,
                              }}
                            >

                              <div className="absolute inset-0 rounded-md border-2 border-red-500 bg-red-500/10" />

                              <div className="absolute left-0 top-0 z-10 -translate-y-full whitespace-nowrap rounded-md bg-red-600 px-2 py-1 text-[11px] font-bold text-white">
                                #{marker.id} {marker.label}
                              </div>

                              <div className="absolute bottom-0 right-0 z-10 rounded-tl-md bg-black/80 px-2 py-1 text-[9px] text-white">
                                {Math.round(
                                  (marker.confidence ?? 0) * 100
                                )}
                                %
                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  </Panel>
                )}

                {/* V6 */}

                {analysis.v6 && (
                  <Panel
                    title="V6 · Felújítási terv"
                    color="cyan"
                  >

                    <p className="leading-7 text-slate-300">
                      {analysis.v6.projectSummary ||
                        "Nincs összefoglaló."}
                    </p>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">

                      <Stat
                        label="Prioritás"
                        value={analysis.v6.overallPriority}
                      />

                      <Stat
                        label="Teljes költség"
                        value={analysis.v6.totalEstimatedCost}
                      />

                      <Stat
                        label="Időtartam"
                        value={analysis.v6.estimatedDuration}
                      />

                    </div>

                    <div className="mt-6 space-y-4">

                      {(analysis.v6.phases ?? []).map(
                        (phase) => (
                          <div
                            key={phase.phase}
                            className="rounded-2xl border border-slate-800 bg-slate-950 p-5"
                          >

                            <div className="flex flex-col justify-between gap-3 md:flex-row">

                              <div>

                                <p className="text-xs font-bold text-cyan-400">
                                  FÁZIS {phase.phase}
                                </p>

                                <h3 className="mt-1 text-lg font-bold">
                                  {phase.name}
                                </h3>

                                <p className="mt-2 text-sm text-slate-400">
                                  {phase.description}
                                </p>

                              </div>

                              <div className="text-left md:text-right">

                                <p className="font-bold text-cyan-400">
                                  {phase.estimatedCost}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {phase.estimatedDuration}
                                </p>

                              </div>

                            </div>

                            <div className="mt-4 space-y-2">

                              {(phase.tasks ?? []).map(
                                (task, index) => (
                                  <div
                                    key={index}
                                    className="rounded-xl bg-slate-900 p-4"
                                  >

                                    <p className="font-semibold">
                                      {task.task}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-500">
                                      {task.reason}
                                    </p>

                                    <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-4">

                                      <span>
                                        Anyag: {task.material}
                                      </span>

                                      <span>
                                        Mennyiség: {task.quantity}
                                      </span>

                                      <span>
                                        Anyagköltség: {task.materialCost}
                                      </span>

                                      <span>
                                        Munkadíj: {task.laborCost}
                                      </span>

                                    </div>

                                    <p className="mt-2 text-xs text-cyan-500">
                                      Idő: {task.duration}
                                    </p>

                                  </div>
                                )
                              )}

                            </div>

                          </div>
                        )
                      )}

                    </div>

                    <div className="mt-6">

                      <h3 className="mb-3 font-bold">
                        Anyaglista
                      </h3>

                      <div className="space-y-2">

                        {(analysis.v6.materials ?? []).map(
                          (material, index) => (
                            <div
                              key={index}
                              className="grid gap-2 rounded-xl bg-slate-950 p-4 md:grid-cols-4"
                            >

                              <span className="font-semibold">
                                {material.material}
                              </span>

                              <span className="text-slate-400">
                                {material.quantity}
                              </span>

                              <span className="text-cyan-400">
                                {material.estimatedCost}
                              </span>

                              <span className="text-slate-500">
                                {material.purpose}
                              </span>

                            </div>
                          )
                        )}

                      </div>

                    </div>

                    {(analysis.v6.warnings ?? []).length > 0 && (
                      <div className="mt-5 rounded-xl border border-yellow-900/40 bg-yellow-950/20 p-4">

                        <p className="font-bold text-yellow-400">
                          Figyelmeztetések
                        </p>

                        <ul className="mt-3 space-y-2 text-sm text-slate-400">

                          {(analysis.v6.warnings ?? []).map(
                            (warning, index) => (
                              <li key={index}>
                                ⚠ {warning}
                              </li>
                            )
                          )}

                        </ul>

                      </div>
                    )}

                  </Panel>
                )}

                {/* V7 */}

                {analysis.v7 && (
                  <Panel
                    title="V7 · Ingatlan intelligencia"
                    color="pink"
                  >

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

                      <Stat
                        label="Ingatlantípus"
                        value={analysis.v7.propertyType}
                      />

                      <Stat
                        label="Építészeti stílus"
                        value={analysis.v7.architecturalStyle}
                      />

                      <Stat
                        label="Becsült helyiségek"
                        value={String(
                          analysis.v7.estimatedRooms ?? 0
                        )}
                      />

                      <Stat
                        label="Felújítási potenciál"
                        value={analysis.v7.renovationPotential}
                      />

                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">

                      <Condition
                        label="Külső"
                        value={analysis.v7.exteriorCondition}
                      />

                      <Condition
                        label="Belső"
                        value={analysis.v7.interiorCondition}
                      />

                      <Condition
                        label="Tető"
                        value={analysis.v7.roofCondition}
                      />

                      <Condition
                        label="Homlokzat"
                        value={analysis.v7.facadeCondition}
                      />

                    </div>

                    <div className="mt-6">

                      <h3 className="font-bold">
                        Felismert jellemzők
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-2">

                        {(analysis.v7.detectedFeatures ?? []).map(
                          (feature, index) => (
                            <span
                              key={index}
                              className="rounded-lg bg-pink-600/10 px-3 py-2 text-xs text-pink-300"
                            >
                              {feature}
                            </span>
                          )
                        )}

                      </div>

                    </div>

                    <div className="mt-6 rounded-xl bg-slate-950 p-5">

                      <h3 className="font-bold">
                        Javasolt következő lépések
                      </h3>

                      <ul className="mt-3 space-y-2 text-sm text-slate-400">

                        {(analysis.v7.recommendedActions ?? []).map(
                          (action, index) => (
                            <li key={index}>
                              ✓ {action}
                            </li>
                          )
                        )}

                      </ul>

                    </div>

                  </Panel>
                )}

                {/* V8 */}

                {analysis.v8 && (
                  <Panel
                    title="V8 · Befektetési elemzés"
                    color="emerald"
                    badge={`${analysis.v8.investmentScore ?? 0}/100`}
                  >

                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

                      <Stat
                        label="Befektetési pontszám"
                        value={`${analysis.v8.investmentScore ?? 0}/100`}
                      />

                      <Stat
                        label="Becsült befektetés"
                        value={analysis.v8.estimatedInvestment}
                      />

                      <Stat
                        label="Felújítás utáni érték"
                        value={analysis.v8.estimatedAfterRenovationValue}
                      />

                      <Stat
                        label="ROI"
                        value={analysis.v8.roi}
                      />

                    </div>

                    <div className="mt-5 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5">

                      <p className="text-xs font-bold uppercase text-emerald-400">
                        AI befektetési ajánlás
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        {analysis.v8.recommendation ||
                          "Nem meghatározható"}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {analysis.v8.investorSummary ||
                          "Nincs befektetői összefoglaló."}
                      </p>

                    </div>

                    <div className="mt-5 grid gap-5 md:grid-cols-2">

                      <div className="rounded-xl bg-slate-950 p-5">

                        <h3 className="font-bold text-emerald-400">
                          Lehetőségek
                        </h3>

                        <ul className="mt-3 space-y-2 text-sm text-slate-400">

                          {(analysis.v8.opportunities ?? []).map(
                            (item, index) => (
                              <li key={index}>
                                ✓ {item}
                              </li>
                            )
                          )}

                        </ul>

                      </div>

                      <div className="rounded-xl bg-slate-950 p-5">

                        <h3 className="font-bold text-red-400">
                          Kockázatok
                        </h3>

                        <ul className="mt-3 space-y-2 text-sm text-slate-400">

                          {(analysis.v8.risks ?? []).map(
                            (item, index) => (
                              <li key={index}>
                                ⚠ {item}
                              </li>
                            )
                          )}

                        </ul>

                      </div>

                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-3">

                      <Stat
                        label="Felújítási érték"
                        value={analysis.v8.renovationValue}
                      />

                      <Stat
                        label="Várható hozam"
                        value={analysis.v8.estimatedReturn}
                      />

                      <Stat
                        label="Megtérülés"
                        value={analysis.v8.roi}
                      />

                    </div>

                  </Panel>
                )}

              </>
            )}

          </section>
        </div>

        <footer className="mt-10 border-t border-slate-900 pt-6 text-center text-xs text-slate-600">
          AI Drone Vision Engine · V2–V8
        </footer>

      </div>
    </main>
  );
}

/* =========================
   STATUS
========================= */

function StatusCard() {
  return (
     <div className="rounded-3xl border border-emerald-900/40 bg-emerald-950/20 p-5">
      <div className="flex items-center gap-4">

        <div className="flex items-center justify-center text-xl text-emerald-400">
          ✓
        </div>

        <div>
          <h2 className="font-bold text-emerald-300">
            AI elemzés elkészült
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            V2–V8 feldolgozás sikeres.
          </p>
        </div>

      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["V2", "V3", "V4", "V5", "V6", "V7", "V8"].map(
          (version) => (
            <span
              key={version}
              className="rounded-lg border border-emerald-900/40 bg-slate-950 px-3 py-1.5 text-xs font-bold text-emerald-400"
            >
              {version} ✓
            </span>
          )
        )}
      </div>
    </div>
  );
}

/* =========================
   PANEL
========================= */

function Panel({
  title,
  color,
  badge,
  children,
}: {
  title: string;
  color: string;
  badge?: string;
  children: ReactNode;
}) {
  const borders: Record<string, string> = {
    red: "border-red-900/40",
    blue: "border-blue-900/40",
    yellow: "border-yellow-900/40",
    purple: "border-purple-900/40",
    cyan: "border-cyan-900/40",
    pink: "border-pink-900/40",
    emerald: "border-emerald-900/40",
  };

  const text: Record<string, string> = {
    red: "text-red-400",
    blue: "text-blue-400",
    yellow: "text-yellow-400",
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    pink: "text-pink-400",
    emerald: "text-emerald-400",
  };

  return (
    <section
      className={`rounded-3xl border bg-slate-900 p-6 ${
        borders[color] || "border-slate-800"
      }`}
    >

      <div className="mb-5 flex items-center justify-between gap-4">

        <h2 className="text-xl font-black">
          {title}
        </h2>

        {badge && (
          <span
            className={`rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold ${
              text[color] || "text-slate-300"
            }`}
          >
            {badge}
          </span>
        )}

      </div>

      {children}

    </section>
  );
}

/* =========================
   STAT
========================= */

function Stat({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-950 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words font-bold text-slate-200">
        {value || "—"}
      </p>

    </div>
  );
}

/* =========================
   MINI STAT
========================= */

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-950 p-3">

      <p className="text-lg font-black">
        {value}
      </p>

      <p className="text-[10px] text-slate-500">
        {label}
      </p>

    </div>
  );
}

/* =========================
   CONDITION
========================= */

function Condition({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-950 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold">
        {value || "Nem meghatározható"}
      </p>

    </div>
  );
}

/* =========================
   EMPTY
========================= */

function Empty({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl bg-slate-950 p-5 text-sm text-slate-500">
      {text}
    </div>
  );
}

/* =========================
   EMPTY SCREEN
========================= */

function EmptyScreen() {
  return (
    <div className="flex min-h-[600px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900">

      <div className="text-center">

        <div className="flex items-center justify-center">
  <img
    src="/ai-drone-vision.png"
    alt="AI Drone Vision"
    className="h-60 w-60 object-contain"
          />
        </div>

        <h2 className="mt-5 text-2xl font-bold">
          AI Vision Engine
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Tölts fel egy ingatlanfotót az elemzéshez.
        </p>

      </div>

    </div>
  );
}

/* =========================
   LOADING
========================= */

function LoadingScreen() {
  return (
    <div className="flex min-h-[600px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900">

      <div className="text-center">

        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

        <h2 className="mt-6 text-xl font-bold">
          AI Vision Engine dolgozik
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          V2 → V3 → V4 → V5 → V6 → V7 → V8
        </p>

      </div>

    </div>
  );
}

/* =========================
   CLAMP
========================= */

function clamp(
  value: number,
  min: number,
  max: number
) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(
    Math.max(value, min),
    max
  );
}