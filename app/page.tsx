"use client";

import { ChangeEvent, ReactNode, useState } from "react";

type PackageType = "START" | "PRO" | "PREMIUM";

type PackageConfig = {
  id: PackageType;
  name: string;
  price: string;
  description: string;
  versions: string[];
  image: string;
  badge?: string;
};

const PACKAGES: PackageConfig[] = [
  {
    id: "START",
    name: "START",
    price: "5 990 Ft",
    description: "Alap AI ingatlanfelmérés",
    versions: ["V2", "V3", "V4"],
    image: "/package-start.jpg",
  },
  {
    id: "PRO",
    name: "PRO",
    price: "12 990 Ft",
    description: "Komplett ingatlanfelmérés és felújítás-tervezés",
    versions: ["V2", "V3", "V4", "V5", "V6"],
    image: "/package-pro.jpg",
    badge: "LEGNÉPSZERŰBB",
  },
  {
    id: "PREMIUM",
    name: "PREMIUM",
    price: "39 990 Ft",
    description: "Teljes AI ingatlan- és befektetési elemzés",
    versions: ["V2", "V3", "V4", "V5", "V6", "V7", "V8"],
    image: "/package-premium.jpg",
  },
];

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
  const [selectedPackage, setSelectedPackage] =
    useState<PackageConfig | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function selectPackage(packageConfig: PackageConfig) {
    setSelectedPackage(packageConfig);
    setAnalysis(null);
    setImages([]);
    setFileNames([]);
    setPrompt("");
    setError("");
  }

  function changePackage() {
    if (loading) return;

    setSelectedPackage(null);
    setAnalysis(null);
    setImages([]);
    setFileNames([]);
    setPrompt("");
    setError("");
  }

  function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const maxImages =
      selectedPackage?.id === "START" ? 1 : 8;

    if (files.length > maxImages) {
      setError(
        selectedPackage?.id === "START"
          ? "A START csomagban csak 1 kép tölthető fel."
          : "Maximum 8 kép tölthető fel."
      );

      event.target.value = "";
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setError("Csak képfájlt tölts fel.");
        event.target.value = "";
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        setError(
          `A(z) "${file.name}" kép maximális mérete 20 MB lehet.`
        );
        event.target.value = "";
        return;
      }
    }

    setError("");
    setAnalysis(null);

    const readers = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            if (typeof reader.result === "string") {
              resolve(reader.result);
            } else {
              reject(new Error("A kép beolvasása sikertelen."));
            }
          };

          reader.onerror = () => {
            reject(new Error("A kép beolvasása sikertelen."));
          };

          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers)
      .then((results) => {
        setImages(results);
        setFileNames(files.map((file) => file.name));
      })
      .catch(() => {
        setError("A képek beolvasása sikertelen.");
      });

    event.target.value = "";
  }

  async function analyzeImage() {
    if (!selectedPackage) {
      setError("Először válassz elemzési csomagot.");
      return;
    }

    if (!images.length) {
      setError("Először tölts fel egy képet.");
      return;
    }

    if (
      selectedPackage.id === "START" &&
      images.length > 1
    ) {
      setError(
        "A START csomagban csak 1 kép használható."
      );
      return;
    }

    if (
      (selectedPackage.id === "PRO" ||
        selectedPackage.id === "PREMIUM") &&
      images.length > 8
    ) {
      setError("Maximum 8 kép használható.");
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
          images,
          image: images[0],
          prompt,
          package: selectedPackage.id,
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

  function removeImage(index: number) {
    setImages((current) =>
      current.filter((_, i) => i !== index)
    );

    setFileNames((current) =>
      current.filter((_, i) => i !== index)
    );

    setAnalysis(null);
    setError("");
  }

  if (!selectedPackage) {
    return (
      <PackageSelector
        packages={PACKAGES}
        onSelect={selectPackage}
      />
    );
  }

  const maxImages =
    selectedPackage.id === "START" ? 1 : 8;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-8">

        <header className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
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

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-black text-blue-400">
              {selectedPackage.name}
            </span>

            {selectedPackage.versions.map((version) => (
              <span
                key={version}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-400"
              >
                {version}
              </span>
            ))}

            <button
              onClick={changePackage}
              className="rounded-lg border border-slate-800 px-3 py-2 text-xs font-bold text-slate-500 transition hover:border-blue-500 hover:text-blue-400"
            >
              Csomagváltás
            </button>
          </div>
        </header>

        <div className="mb-6 rounded-2xl border border-blue-900/30 bg-blue-950/10 p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Aktív csomag
              </p>

              <p className="mt-1 text-lg font-black">
                {selectedPackage.name}
              </p>

              <p className="text-sm text-slate-500">
                {selectedPackage.description}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-2xl font-black">
                {selectedPackage.price}
              </p>

              <p className="text-xs text-slate-500">
                Demó mód · fizetés nincs bekötve
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[430px_1fr]">

          {/* INPUT */}

          <section className="h-fit rounded-3xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-bold">
              Ingatlan elemzése
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {selectedPackage.id === "START"
                ? "Tölts fel egy ingatlanfotót vagy drónfelvételt."
                : "Tölts fel legfeljebb 8 ingatlanfotót vagy egy többképes kollázst."}
            </p>

            {images.length === 0 ? (
              <label className="mt-6 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950 p-6 text-center transition hover:border-blue-500">

                <div className="text-6xl">
                  📷
                </div>

                <p className="mt-4 font-bold">
                  {selectedPackage.id === "START"
                    ? "Kép feltöltése"
                    : "Képek feltöltése"}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  JPG · PNG · WEBP · max. 20 MB / kép
                </p>

                {selectedPackage.id !== "START" && (
                  <p className="mt-1 text-xs font-bold text-blue-400">
                    Maximum 8 kép
                  </p>
                )}

                <span className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold transition hover:bg-blue-500">
                  Fájl kiválasztása
                </span>

                <input
                  type="file"
                  accept="image/*"
                  multiple={selectedPackage.id !== "START"}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="mt-6">

                <div className="grid grid-cols-2 gap-3">
                  {images.map((img, index) => (
                    <div
                      key={`${fileNames[index]}-${index}`}
                      className="relative overflow-hidden rounded-2xl border border-slate-700 bg-black"
                    >
                      <img
                        src={img}
                        alt={`Feltöltött ingatlan ${index + 1}`}
                        className="h-40 w-full object-cover"
                      />

                      <div className="absolute left-2 top-2 rounded-lg bg-black/80 px-2 py-1 text-[10px] font-bold text-white">
                        {index + 1}/{images.length}
                      </div>

                      <button
                        onClick={() => removeImage(index)}
                        disabled={loading}
                        className="absolute right-2 top-2 rounded-lg bg-red-600/90 px-2 py-1 text-[10px] font-bold text-white transition hover:bg-red-500 disabled:opacity-40"
                      >
                        Törlés
                      </button>
                    </div>
                  ))}
                </div>

                {images.length < maxImages &&
                  selectedPackage.id !== "START" && (
                    <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 px-4 py-3 text-xs font-bold text-slate-400 transition hover:border-blue-500 hover:text-blue-400">
                      + További kép hozzáadása

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(event) => {
                          const files = Array.from(
                            event.target.files || []
                          );

                          if (!files.length) return;

                          const remaining =
                            maxImages - images.length;

                          if (files.length > remaining) {
                            setError(
                              `Még csak ${remaining} kép tölthető fel.`
                            );
                            event.target.value = "";
                            return;
                          }

                          const fakeEvent = {
                            target: event.target,
                          } as ChangeEvent<HTMLInputElement>;

                          handleImageUpload(fakeEvent);
                        }}
                        className="hidden"
                      />
                    </label>
                  )}

                <div className="mt-3 rounded-xl bg-slate-950 p-3">
                  <p className="text-xs text-slate-400">
                    {images.length} / {maxImages} kép feltöltve
                  </p>

                  <div className="mt-2 space-y-1">
                    {fileNames.map((name, index) => (
                      <p
                        key={`${name}-${index}`}
                        className="truncate text-[11px] text-slate-600"
                      >
                        {index + 1}. {name}
                      </p>
                    ))}
                  </div>
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
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            <button
              onClick={analyzeImage}
              disabled={!images.length || loading}
              className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-4 font-bold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {loading
                ? "🔄 AI elemzés folyamatban..."
                : `🔍 ${selectedPackage.name} ELEMZÉS`}
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
              <EmptyScreen
                selectedPackage={selectedPackage}
              />
            )}

            {loading && (
              <LoadingScreen
                selectedPackage={selectedPackage}
              />
            )}

            {analysis && !loading && (
              <>
                <StatusCard
                  selectedPackage={selectedPackage}
                />

                {selectedPackage.versions.includes("V2") &&
                  analysis.v2 && (
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

                {selectedPackage.versions.includes("V3") &&
                  analysis.v3 && (
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

                {selectedPackage.versions.includes("V4") &&
                  analysis.v4 && (
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

                {selectedPackage.versions.includes("V5") &&
                  analysis.v5 && (
                    <Panel
                      title="V5 · Vizuális hibajelölés"
                      color="purple"
                      badge={`${(analysis.v5.markers ?? []).length} marker`}
                    >
                      <div className="mb-4 rounded-xl bg-purple-950/30 p-4 text-sm text-purple-300">
                        A piros keretek az AI által felismert problémás területeket jelölik.
                      </div>

                      <div className="space-y-6">
                        {images.map((img, imageIndex) => (
                          <div
                            key={imageIndex}
                            className="relative overflow-hidden rounded-2xl border border-slate-700 bg-black"
                          >
                            <img
                              src={img}
                              alt={`AI vizuális elemzés ${imageIndex + 1}`}
                              className="block h-auto w-full"
                            />

                            {imageIndex === 0 &&
                              (analysis.v5.markers ?? []).map(
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
                                        #{marker.id}{" "}
                                        {marker.label}
                                      </div>

                                      <div className="absolute bottom-0 right-0 z-10 rounded-tl-md bg-black/80 px-2 py-1 text-[9px] text-white">
                                        {Math.round(
                                          (marker.confidence ?? 0) *
                                            100
                                        )}
                                        %
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                          </div>
                        ))}
                      </div>
                    </Panel>
                  )}

                {selectedPackage.versions.includes("V6") &&
                  analysis.v6 && (
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
                                          Anyag:{" "}
                                          {task.material}
                                        </span>

                                        <span>
                                          Mennyiség:{" "}
                                          {task.quantity}
                                        </span>

                                        <span>
                                          Anyagköltség:{" "}
                                          {task.materialCost}
                                        </span>

                                        <span>
                                          Munkadíj:{" "}
                                          {task.laborCost}
                                        </span>
                                      </div>

                                      <p className="mt-2 text-xs text-cyan-500">
                                        Idő:{" "}
                                        {task.duration}
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

                {selectedPackage.versions.includes("V7") &&
                  analysis.v7 && (
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
                          value={
                            analysis.v7.architecturalStyle
                          }
                        />

                        <Stat
                          label="Becsült helyiségek"
                          value={String(
                            analysis.v7.estimatedRooms ?? 0
                          )}
                        />

                        <Stat
                          label="Felújítási potenciál"
                          value={
                            analysis.v7.renovationPotential
                          }
                        />
                      </div>

                      <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <Condition
                          label="Külső"
                          value={
                            analysis.v7.exteriorCondition
                          }
                        />

                        <Condition
                          label="Belső"
                          value={
                            analysis.v7.interiorCondition
                          }
                        />

                        <Condition
                          label="Tető"
                          value={analysis.v7.roofCondition}
                        />

                        <Condition
                          label="Homlokzat"
                          value={
                            analysis.v7.facadeCondition
                          }
                        />
                      </div>

                      <div className="mt-6">
                        <h3 className="font-bold">
                          Felismert jellemzők
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {(
                            analysis.v7.detectedFeatures ?? []
                          ).map((feature, index) => (
                            <span
                              key={index}
                              className="rounded-lg bg-pink-600/10 px-3 py-2 text-xs text-pink-300"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 rounded-xl bg-slate-950 p-5">
                        <h3 className="font-bold">
                          Javasolt következő lépések
                        </h3>

                        <ul className="mt-3 space-y-2 text-sm text-slate-400">
                          {(
                            analysis.v7
                              .recommendedActions ?? []
                          ).map((action, index) => (
                            <li key={index}>
                              ✓ {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Panel>
                  )}

                {selectedPackage.versions.includes("V8") &&
                  analysis.v8 && (
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
                          value={
                            analysis.v8.estimatedInvestment
                          }
                        />

                        <Stat
                          label="Felújítás utáni érték"
                          value={
                            analysis.v8
                              .estimatedAfterRenovationValue
                          }
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
                            {(
                              analysis.v8
                                .opportunities ?? []
                            ).map((item, index) => (
                              <li key={index}>
                                ✓ {item}
                              </li>
                            ))}
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
                          value={
                            analysis.v8.renovationValue
                          }
                        />

                        <Stat
                          label="Várható hozam"
                          value={
                            analysis.v8.estimatedReturn
                          }
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
          AI Drone Vision Engine · {selectedPackage.name} ·{" "}
          {selectedPackage.versions.join(" · ")}
        </footer>
      </div>
    </main>
  );
}

function PackageSelector({
  packages,
  onSelect,
}: {
  packages: PackageConfig[];
  onSelect: (packageConfig: PackageConfig) => void;
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 py-10">

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="relative z-10 mb-10 text-center">
          <div className="flex justify-center">
            <img
              src="/ai-drone-vision.png"
              alt="AI Drone Vision"
              className="h-32 w-32 object-contain"
            />
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            AI Drone Vision
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
            Válaszd ki a számodra megfelelő AI ingatlan-elemzési
            csomagot.
          </p>
        </div>

        <div className="relative z-10 w-full space-y-4">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => onSelect(pkg)}
              className="group relative w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/60 hover:shadow-2xl hover:shadow-blue-950/30"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 transition duration-500 group-hover:scale-105 group-hover:opacity-30"
                style={{
                  backgroundImage: `url(${pkg.image})`,
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/50" />

              <div className="relative flex w-full items-center gap-4 p-5 md:gap-6 md:p-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/80 text-2xl font-black text-blue-400">
                  {pkg.id === "START" && "S"}
                  {pkg.id === "PRO" && "P"}
                  {pkg.id === "PREMIUM" && "★"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black md:text-2xl">
                      {pkg.name}
                    </h2>

                    {pkg.badge && (
                      <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-black tracking-wider text-white">
                        {pkg.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-400">
                    {pkg.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pkg.versions.map((version) => (
                      <span
                        key={version}
                        className="rounded-md border border-slate-700 bg-slate-950/70 px-2 py-1 text-[10px] font-bold text-slate-400"
                      >
                        {version}
                      </span>
                    ))}
                  </div>

                  {pkg.id !== "START" && (
                    <p className="mt-2 text-[11px] font-bold text-blue-400">
                      📸 Akár 8 kép
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xl font-black text-white md:text-2xl">
                    {pkg.price}
                  </p>

                  <p className="mt-1 text-xs font-bold text-blue-400 opacity-0 transition group-hover:opacity-100">
                    KIVÁLASZTÁS →
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="relative z-10 mt-8 text-center text-xs text-slate-600">
          Demó mód · fizetés jelenleg nincs bekötve
        </p>
      </div>
    </main>
  );
}

function StatusCard({
  selectedPackage,
}: {
  selectedPackage: PackageConfig;
}) {
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
            {selectedPackage.name} csomag ·{" "}
            {selectedPackage.versions.join(" · ")} feldolgozás sikeres.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {selectedPackage.versions.map(
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

function EmptyScreen({
  selectedPackage,
}: {
  selectedPackage: PackageConfig;
}) {
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
          {selectedPackage.name} AI Vision Engine
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {selectedPackage.id === "START"
            ? "Tölts fel egy ingatlanfotót az elemzéshez."
            : "Tölts fel akár 8 ingatlanfotót az összevont elemzéshez."}
        </p>

        <div className="mt-5 flex justify-center gap-2">
          {selectedPackage.versions.map(
            (version) => (
              <span
                key={version}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-slate-500"
              >
                {version}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({
  selectedPackage,
}: {
  selectedPackage: PackageConfig;
}) {
  return (
    <div className="flex min-h-[600px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900">
      <div className="text-center">
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

        <h2 className="mt-6 text-xl font-bold">
          AI Vision Engine dolgozik
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {selectedPackage.name} csomag feldolgozása
        </p>

        <div className="mt-4 flex justify-center gap-2">
          {selectedPackage.versions.map(
            (version) => (
              <span
                key={version}
                className="rounded-md bg-slate-950 px-2 py-1 text-[10px] font-bold text-blue-400"
              >
                {version}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

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
