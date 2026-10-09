 "use client";

import { ChangeEvent, useState } from "react";

type PlanId = "QUICK" | "FULL" | "PATROL";
type FieldInfo = {
  client: string;
  fieldName: string;
  location: string;
  hectares: string;
  crop: string;
  inspectedAt: string;
  notes: string;
};
type Box = { x: number; y: number; width: number; height: number };
type Finding = {
  id: number;
  title: string;
  category: string;
  severity: string;
  certainty: string;
  observation: string;
  visualEvidence: string;
  location: string;
  recommendation: string;
  imageIndex: number;
  box: Box | null;
};
type Analysis = {
  summary: string;
  overallRisk: string;
  overview: {
    vegetation: string;
    ground: string;
    water: string;
    access: string;
    coverage: string;
  };
  findings: Finding[];
  priorities: string[];
  recommendedChecks: string[];
  limitations: string[];
  nextVisitFocus: string;
};
type UploadedImage = { name: string; dataUrl: string };

const PLANS: { id: PlanId; name: string; tag: string; price: string; description: string; maxImages: number; features: string[] }[] = [
  {
    id: "QUICK", name: "Gyors ellenőrzés", tag: "ALAP", price: "9 990 Ft-tól", maxImages: 2,
    description: "Célzott, gyors ránézés a helyszín látható állapotára.",
    features: ["Legfeljebb 2 drónfotó", "Látható eltérések", "Rövid ellenőrzési jelentés"],
  },
  {
    id: "FULL", name: "Teljes felmérés", tag: "AJÁNLOTT", price: "24 990 Ft-tól", maxImages: 6,
    description: "Több nézőpontból készülő, részletes vizuális értékelés.",
    features: ["Legfeljebb 6 drónfotó", "Hibajelölések és prioritások", "Nyomtatható PDF-jelentés"],
  },
  {
    id: "PATROL", name: "Rendszeres őrjárat", tag: "FOLYAMATOS", price: "Egyedi ajánlat", maxImages: 8,
    description: "Ismételt szemlékhez használható felmérési mód.",
    features: ["Legfeljebb 8 fotó / alkalom", "Figyelendő kockázatok", "Következő látogatás fókusza"],
  },
];

const emptyField: FieldInfo = { client: "", fieldName: "", location: "", hectares: "", crop: "", inspectedAt: "", notes: "" };
const riskTone: Record<string, string> = {
  kritikus: "border-red-400/40 bg-red-500/10 text-red-300",
  magas: "border-orange-400/40 bg-orange-500/10 text-orange-300",
  közepes: "border-amber-400/40 bg-amber-500/10 text-amber-300",
  alacsony: "border-emerald-400/40 bg-emerald-500/10 text-emerald-300",
  információ: "border-sky-400/40 bg-sky-500/10 text-sky-300",
  "nem meghatározható": "border-slate-400/40 bg-slate-500/10 text-slate-300",
};
const mapTone: Record<string, string> = {
  kritikus: "#f87171", magas: "#fb923c", közepes: "#fbbf24", alacsony: "#4ade80", információ: "#7dd3fc",
};

async function prepareImage(file: File): Promise<UploadedImage> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Csak JPG, PNG vagy WEBP képet tölts fel.");
  if (file.size > 16 * 1024 * 1024) throw new Error(`A(z) ${file.name} túl nagy (maximum 16 MB).`);
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error(`Nem sikerült beolvasni: ${file.name}`));
      element.src = url;
    });
    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = Math.min(1, 1500 / longest);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("A böngésző nem tudta előkészíteni a képet.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
    if (dataUrl.length > 2_800_000) throw new Error(`A(z) ${file.name} tömörítve is túl nagy.`);
    return { name: file.name, dataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Pill({ children, tone = "" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${tone || "border-[#365b43] bg-[#173324] text-[#b4d8bd]"}`}>{children}</span>;
}
function SmallTitle({ overline, title, description }: { overline: string; title: string; description?: string }) {
  return <div className="mb-5"><p className="text-[11px] font-black uppercase tracking-[.21em] text-lime-300">{overline}</p><h2 className="mt-2 text-2xl font-black tracking-tight text-white">{title}</h2>{description && <p className="agri-muted mt-2 text-sm leading-6">{description}</p>}</div>;
}
function DataRow({ label, value }: { label: string; value: string }) {
  return <div className="border-b border-[#294536] py-2.5 last:border-0"><p className="text-[11px] font-bold uppercase tracking-wide text-[#83a891]">{label}</p><p className="mt-1 break-words text-sm leading-6 text-[#e4f5e8]">{value || "Nincs megadva"}</p></div>;
}

export default function Home() {
  const [plan, setPlan] = useState<PlanId>("FULL");
  const [field, setField] = useState<FieldInfo>(emptyField);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [accessCode, setAccessCode] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [reportTime, setReportTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const selectedPlan = PLANS.find((item) => item.id === plan)!;

  function changePlan(next: PlanId) {
    const limit = PLANS.find((item) => item.id === next)!.maxImages;
    setPlan(next);
    setImages((current) => current.slice(0, limit));
    setActiveImage(0);
    setAnalysis(null);
    setError("");
  }
  function updateField(key: keyof FieldInfo, value: string) {
    setField((current) => ({ ...current, [key]: value }));
    setAnalysis(null);
  }
  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    if (files.length + images.length > selectedPlan.maxImages) {
      setError(`Ehhez a csomaghoz legfeljebb ${selectedPlan.maxImages} kép választható.`);
      return;
    }
    setUploading(true);
    setError("");
    try {
      const prepared = await Promise.all(files.map(prepareImage));
      const total = [...images, ...prepared].reduce((sum, item) => sum + item.dataUrl.length, 0);
      if (total > 3_600_000) throw new Error("A képek együtt túl nagyok. Válassz kevesebb képet.");
      setImages((current) => [...current, ...prepared]);
      setAnalysis(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hiba történt a képek feltöltésekor.");
    } finally {
      setUploading(false);
    }
  }
  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
    setActiveImage(0);
    setAnalysis(null);
  }
  async function runAnalysis() {
    if (!images.length) {
      setError("Elöször legalább egy drónfotót tölts fel.");
      return;
    }
    if (images.reduce((sum, image) => sum + image.dataUrl.length, 0) > 3_600_000) {
      setError("A képek összmérete túl nagy. Tölts fel kevesebbet.");
      return;
    }
    setLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, images: images.map((img) => img.dataUrl), field, accessCode }),
      });
      const payload = await response.json() as { success?: boolean; analysis?: Analysis; error?: string };
      if (!response.ok || !payload.success || !payload.analysis) throw new Error(payload.error || "Az elemzés sikertelen.");
      setAnalysis(payload.analysis);
      setReportTime(new Date().toLocaleString("hu-HU"));
      setActiveImage(0);
      setTimeout(() => document.getElementById("jelentes")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nem sikerült elvégezni az elemzést.");
    } finally {
      setLoading(false);
    }
  }
  function saveReport() {
    if (analysis) window.print();
  }
  function saveJSON() {
    if (!analysis) return;
    const content = JSON.stringify({ product: "AGRI DRONE VISION", generatedAt: reportTime, plan: selectedPlan.name, field, analysis }, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: "application/json;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "agri-drone-vision-jelentes.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="agri-grid glow min-h-screen">
      <header className="no-print sticky top-0 z-30 border-b border-[#203c2c] bg-[#09150e]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="#fooldal" className="flex items-center gap-3" aria-label="AGRI DRONE VISION kezdőlap">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lime-300/30 bg-lime-300/10 text-2xl text-lime-300">✥</div>
            <div className="leading-tight"><p className="text-sm font-black tracking-[.13em] text-white sm:text-base">AGRI <span className="text-lime-300">DRONE</span> VISION</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[.24em] text-[#8fae9a]">Agricultural Intelligence</p></div>
          </a>
          <div className="flex items-center gap-2 sm:gap-5"><span className="hidden text-xs text-[#8cae97] md:block">DJI Mini 3 · RGB-kompatibilis</span><a href="#felmeres" className="rounded-xl border border-lime-300/20 bg-lime-300 px-4 py-2.5 text-xs font-black text-[#112418] transition hover:bg-lime-200">Felmérés indítása →</a></div>
        </div>
      </header>

      <main id="fooldal" className="mx-auto max-w-[1450px] px-5 pb-20 sm:px-8">
        <section className="intro-section relative overflow-hidden py-12 lg:py-20">
          <div className="relative z-10 max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center gap-2"><Pill>MEZŐGAZDASÁGI DRÓNFELMÉRÉS</Pill><Pill>AI KÉPELEMZÉS</Pill><Pill>MAGYAR NYELVEN</Pill></div>
            <h1 className="text-[2.5rem] font-black leading-[1.07] tracking-tight text-white sm:text-6xl lg:text-7xl">Lásd a földedet <span className="text-lime-300">más szemszögből.</span></h1>
            <p className="agri-muted mt-7 max-w-2xl text-base leading-8 sm:text-lg">Drónfotókból készült intelligens vizuális helyszínellenőrzés. Látható eltérések, vadkárra vagy belvízre utaló jelek, veszélyforrások és a következő teendők — egy áttekinthető jelentésben.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3"><a href="#felmeres" className="rounded-xl bg-lime-300 px-6 py-3.5 text-sm font-black text-[#112418] hover:bg-lime-200">Saját terület elemzése ↗</a><span className="text-xs text-[#83a891]">Nincs automatikus fizetés · Árak tájékoztató jellegűek</span></div>
          </div>
          <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full border border-lime-300/10 bg-lime-300/5 blur-3xl" />
        </section>

        <section className="intro-section mb-12 grid gap-3 md:grid-cols-4">
          {[
            ["01", "Növényzet", "Foltosság, elszíneződés, állománykülönbségek"],
            ["02", "Vadkárgyanú", "Taposás, hiányos növénysávok látható jelei"],
            ["03", "Víz és talaj", "Pangóvíz, lefolyás, erózióra utaló minták"],
            ["04", "Veszélyforrás", "Akadályok, veszélyesnek tűnő fák, járhatóság"],
          ].map(([number, title, desc]) => (
            <div key={number} className="agri-panel p-5"><p className="mb-4 text-xs font-black tracking-[.25em] text-lime-300">{number} / VIZSGÁLAT</p><h3 className="text-lg font-black text-white">{title}</h3><p className="agri-muted mt-2 text-xs leading-6">{desc}</p></div>
          ))}
        </section>

        <section className="intro-section mb-12" aria-label="Csomagok">
          <SmallTitle overline="Választható szolgáltatás" title="Ellenőrzési módok" description="Válaszd ki a felmérés céljához illő csomagot. 50 hektár felett egyedi helyszíni ajánlat javasolt." />
          <div className="grid gap-4 lg:grid-cols-3">
            {PLANS.map((item) => <button key={item.id} type="button" onClick={() => changePlan(item.id)} aria-pressed={plan === item.id} className={`rounded-[22px] border p-6 text-left transition ${plan === item.id ? "border-lime-300 bg-[#203b28] shadow-[0_0_0_1px_rgba(190,242,100,.2)]" : "border-[#294536] bg-[#0f2017] hover:border-[#557f5a]"}`}>
              <div className="mb-5 flex items-center justify-between"><span className="text-[10px] font-black tracking-[.2em] text-lime-300">{item.tag}</span><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${plan === item.id ? "border-lime-300 bg-lime-300 text-[#112418]" : "border-[#51725a]"}`}>{plan === item.id ? "✓" : ""}</span></div>
              <h3 className="text-xl font-black text-white">{item.name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-[#9fbaaa]">{item.description}</p><p className="mt-5 text-2xl font-black text-lime-300">{item.price}</p>
              <div className="mt-5 space-y-2 border-t border-[#365841] pt-4">{item.features.map((feature) => <p key={feature} className="flex items-start gap-2 text-xs text-[#bed1c2]"><span className="font-black text-lime-300">✓</span>{feature}</p>)}</div>
            </button>)}
          </div>
        </section>

        <div id="felmeres" className="grid scroll-mt-24 gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
          <section className="input-section agri-panel h-fit p-6 sm:p-7">
            <SmallTitle overline="Új vizsgálat" title="Területi adatlap" description="A megadott információk segítik a képek értelmezését. Nem helyettesítik a helyszíni mérést." />
            <div className="mb-6 flex items-center justify-between rounded-xl border border-lime-300/20 bg-lime-300/10 p-4"><div><p className="text-[10px] font-bold uppercase tracking-wide text-lime-300">Aktív elemzés</p><p className="mt-1 text-sm font-black text-white">{selectedPlan.name}</p></div><span className="text-xs font-bold text-lime-300">{selectedPlan.maxImages} fotó max.</span></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><label className="agri-label" htmlFor="client">Megrendelő / gazdaság</label><input id="client" className="agri-input" value={field.client} onChange={(e) => updateField("client", e.target.value)} placeholder="Pl. Kovács családi gazdaság" /></div>
              <div><label className="agri-label" htmlFor="fieldName">Tábla / terület neve</label><input id="fieldName" className="agri-input" value={field.fieldName} onChange={(e) => updateField("fieldName", e.target.value)} placeholder="Pl. Nyugati tábla" /></div>
              <div><label className="agri-label" htmlFor="location">Település / körzet</label><input id="location" className="agri-input" value={field.location} onChange={(e) => updateField("location", e.target.value)} placeholder="Pl. Győr környéke" /></div>
              <div><label className="agri-label" htmlFor="hectares">Terület (ha), ha ismert</label><input id="hectares" className="agri-input" value={field.hectares} onChange={(e) => updateField("hectares", e.target.value)} inputMode="decimal" placeholder="Pl. 12,5" /></div>
              <div><label className="agri-label" htmlFor="crop">Kultúra / hasznosítás</label><input id="crop" className="agri-input" value={field.crop} onChange={(e) => updateField("crop", e.target.value)} placeholder="Pl. kukorica, legelő" /></div>
              <div className="sm:col-span-2"><label className="agri-label" htmlFor="inspectedAt">Felvétel dátuma (ha ismert)</label><input id="inspectedAt" type="date" className="agri-input" value={field.inspectedAt} onChange={(e) => updateField("inspectedAt", e.target.value)} /></div>
              <div className="sm:col-span-2"><label className="agri-label" htmlFor="notes">Mire figyeljen az AI?</label><textarea id="notes" rows={4} maxLength={1200} className="agri-input resize-y" value={field.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Pl. A keleti szélén vadkárra gyanakszom. A déli sarok vizesedhet." /></div>
            </div>

            <div className="mt-8"><div className="mb-3 flex items-center justify-between"><label className="agri-label !mb-0">Drónfotók feltöltése</label><span className="text-xs font-bold text-lime-300">{images.length} / {selectedPlan.maxImages}</span></div>
              <label className={`flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${uploading || loading ? "cursor-wait border-[#264530] bg-[#122419]" : "cursor-pointer border-[#467c55] bg-[#11271a] hover:border-lime-300"}`}>
                <span className="mb-3 text-4xl">↥</span><span className="text-sm font-black text-white">{uploading ? "Képek előkészítése…" : "Kattints a fotók kiválasztásához"}</span><span className="mt-2 max-w-xs text-xs leading-5 text-[#91ad9a]">JPG · PNG · WEBP · képenként 16 MB-ig. A képeket feltöltés előtt tömörítjük.</span>
                <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" multiple disabled={uploading || loading || images.length >= selectedPlan.maxImages} onChange={handleUpload} />
              </label>
              {images.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{images.map((img, index) => <div className="group relative overflow-hidden rounded-xl border border-[#3b6347]" key={`${img.name}-${index}`}><img src={img.dataUrl} alt={`Drónfotó ${index + 1}`} className="h-24 w-full object-cover" /><div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-center text-[10px] font-bold text-white">{index + 1}. kép</div><button aria-label={`${index + 1}. kép eltávolítása`} type="button" disabled={loading} onClick={() => removeImage(index)} className="absolute right-1 top-1 rounded-md bg-red-700 px-2 py-0.5 text-xs font-black text-white">×</button></div>)}</div>}
            </div>

            <div className="mt-6"><label className="agri-label" htmlFor="access">Hozzáférési kód (ha be van állítva)</label><input id="access" type="password" autoComplete="off" className="agri-input" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="Csak védett telepítésnél szükséges" /></div>
            <button type="button" disabled={!images.length || loading || uploading} onClick={runAnalysis} className="mt-6 w-full rounded-xl bg-lime-300 px-6 py-4 text-sm font-black text-[#112418] transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-[#54705a] disabled:text-[#a8bfaf]">{loading ? "◌  AI felmérés folyamatban…" : "✦  AI FELMÉRÉS INDÍTÁSA"}</button>
            {error && <div role="alert" className="mt-4 rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm leading-6 text-red-200">{error}</div>}
            <p className="mt-5 text-xs leading-6 text-[#83a891]">A feltöltött képeket az AI-elemzéshez az OpenAI szolgáltatás dolgozza fel. A felületen nincs fiók- vagy felmérésmentés. Ne tölts fel olyan képet, amelynek feldolgozására nincs jogosultságod.</p>
          </section>

          <section id="jelentes" className="result-section print-area min-w-0 scroll-mt-24 space-y-5">
            {!analysis && !loading && <div className="agri-panel flex min-h-[550px] flex-col items-center justify-center p-8 text-center"><div className="mb-7 flex h-28 w-28 items-center justify-center rounded-full border border-lime-300/20 bg-[#183b27] text-5xl text-lime-300">◎</div><Pill>FELMÉRÉSRE KÉSZ</Pill><h2 className="mt-6 text-3xl font-black text-white">Itt jelenik meg az elemzésed.</h2><p className="agri-muted mt-4 max-w-md text-sm leading-7">Válassz csomagot, add meg a terület adatait, majd tölts fel saját drónfotókat. Az AI azonosítja a képen látható fontos megfigyeléseket és ellenőrizendő területeket.</p><div className="mt-8 grid w-full max-w-md grid-cols-3 gap-2">{["01 · Fotó", "02 · Elemzés", "03 · Jelentés"].map((step) => <div key={step} className="rounded-lg border border-[#294536] bg-[#13271b] px-1 py-4 text-xs font-black text-lime-300">{step}</div>)}</div></div>}
            {loading && <div className="agri-panel flex min-h-[550px] flex-col items-center justify-center p-8 text-center" role="status"><div className="mb-8 h-16 w-16 animate-spin rounded-full border-4 border-lime-300/20 border-t-lime-300" /><Pill>AI FELDOLGOZÁS</Pill><h2 className="mt-6 text-2xl font-black text-white">Drónképek kiértékelése…</h2><p className="agri-muted mt-3 max-w-sm text-sm leading-7">Megfigyelések, kockázatok és ajánlott teendők összegyűjtése. Az eredmények tájékoztató jellegűek.</p></div>}
            {analysis && !loading && <>
              <div className="no-print flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.2em] text-lime-300">Elkészült jelentés</p><h2 className="mt-1 text-2xl font-black text-white">Területértékelés</h2></div><div className="flex flex-wrap gap-2"><button onClick={saveJSON} className="rounded-xl border border-[#3b6549] px-4 py-2.5 text-xs font-bold text-[#caebd2] hover:border-lime-300">JSON mentése</button><button onClick={saveReport} className="rounded-xl bg-lime-300 px-4 py-2.5 text-xs font-black text-[#122419] hover:bg-lime-200">Mentés PDF-ként / Nyomtatás</button></div></div>
              <div className="print-title hidden"><h1 className="text-2xl font-black">AGRI DRONE VISION — Vizuális mezőgazdasági jelentés</h1></div>
              <div className="agri-panel print-card print-avoid p-6 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><Pill>AI FELMÉRÉS</Pill><Pill tone={riskTone[analysis.overallRisk] || riskTone.információ}>Kockázati szint: {analysis.overallRisk}</Pill></div><h3 className="mt-5 text-2xl font-black text-white">Összefoglaló értékelés</h3><p className="agri-muted mt-4 text-sm leading-8">{analysis.summary}</p><p className="mt-5 text-xs text-[#91ab99]">Generálva: {reportTime} · Csomag: {selectedPlan.name} · {images.length} fotó</p></div>
              <div className="agri-panel print-card print-avoid p-6 sm:p-7"><h3 className="mb-4 text-lg font-black text-white">Terület alapadatai</h3><div className="grid gap-x-6 sm:grid-cols-2"><DataRow label="Megrendelő" value={field.client} /><DataRow label="Tábla neve" value={field.fieldName} /><DataRow label="Helyszín" value={field.location} /><DataRow label="Terület (megadott)" value={field.hectares ? `${field.hectares} ha` : ""} /><DataRow label="Kultúra" value={field.crop} /><DataRow label="Felvétel dátuma" value={field.inspectedAt} /></div>{field.notes && <div className="mt-3"><DataRow label="Megrendelői megjegyzés" value={field.notes} /></div>}</div>
              <div className="agri-panel print-card print-avoid p-6 sm:p-7"><h3 className="mb-5 text-lg font-black text-white">Vizuális állapot áttekintése</h3><div className="grid gap-3 sm:grid-cols-2">{([ ["Növényzet", analysis.overview.vegetation], ["Talaj / felszín", analysis.overview.ground], ["Vízviszonyok", analysis.overview.water], ["Megközelítés", analysis.overview.access], ["Fotófedettség", analysis.overview.coverage] ] as [string, string][]).map(([name, description]) => <div key={name} className="rounded-xl border border-[#2d5139] bg-[#0b1a12] p-4 print-card"><p className="mb-2 text-xs font-black uppercase tracking-wide text-lime-300">{name}</p><p className="agri-muted text-sm leading-6">{description}</p></div>)}</div></div>
              <div className="agri-panel print-card p-5 sm:p-7"><div className="mb-5 flex flex-wrap justify-between gap-3"><div><h3 className="text-lg font-black text-white">Fotó és vizuális jelölések</h3><p className="agri-muted mt-1 text-xs">A keretek hozzávetőlegesek, nem térinformatikai mérések.</p></div><Pill>{analysis.findings.length} megfigyelés</Pill></div>
                <div className="no-print mb-3 flex flex-wrap gap-2">{images.map((img, index) => <button key={`${img.name}-${index}`} type="button" onClick={() => setActiveImage(index)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${activeImage === index ? "border-lime-300 bg-lime-300 text-[#102418]" : "border-[#32533e] text-[#bbd4c2]"}`}>{index + 1}. fotó</button>)}</div>
                <div className="no-print relative w-full overflow-hidden rounded-2xl border border-[#32533e] bg-black"><img src={images[Math.min(activeImage, images.length - 1)].dataUrl} alt={`Elemzett drónfotó ${activeImage + 1}`} className="block h-auto w-full" />{analysis.findings.filter((finding) => finding.imageIndex === activeImage && finding.box).map((finding) => {const b = finding.box!; const x = Math.max(0, Math.min(100, b.x)); const y = Math.max(0, Math.min(100, b.y)); const w = Math.max(0, Math.min(100 - x, b.width)); const h = Math.max(0, Math.min(100 - y, b.height));return <div key={finding.id} className="pointer-events-none absolute border-[3px]" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, borderColor: mapTone[finding.severity] || "#bef264", boxShadow: "0 0 0 1px #0008" }} title={finding.title}><span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-black/85 px-2 py-1 text-[10px] font-black text-white">#{finding.id} {finding.category}</span></div>})}</div>
                <p className="no-print agri-muted mt-2 text-xs">Fotó: {activeImage + 1}/{images.length} · {images[activeImage]?.name}</p>
                <div className="hidden print:block">{images.map((img, imageIndex) => <div key={imageIndex} className="print-photo"><p className="mb-2 text-xs font-bold">{imageIndex + 1}. fotó — {img.name}</p><div className="relative w-full overflow-hidden border border-[#cbd5cb]"><img src={img.dataUrl} alt={`Elemzett fotó ${imageIndex + 1}`} className="block h-auto w-full" />{analysis.findings.filter((finding) => finding.imageIndex === imageIndex && finding.box).map((finding) => { const b = finding.box!; const x = Math.max(0, Math.min(100, b.x)); const y = Math.max(0, Math.min(100, b.y)); return <div key={finding.id} className="absolute border-[3px]" style={{ left: `${x}%`, top: `${y}%`, width: `${Math.max(0, Math.min(100 - x, b.width))}%`, height: `${Math.max(0, Math.min(100 - y, b.height))}%`, borderColor: mapTone[finding.severity] || "#84cc16" }} />; })}</div></div>)}</div>
              </div>
              <div className="agri-panel print-card p-6 sm:p-7"><h3 className="text-lg font-black text-white">Azonosított megfigyelések</h3><p className="agri-muted mt-1 text-xs">Az AI látható jelekből dolgozik; minden fontos megállapítást érdemes a helyszínen ellenőrizni.</p>
                <div className="mt-5 space-y-3">{analysis.findings.length === 0 ? <div className="rounded-xl border border-[#32533e] p-5 text-sm text-[#bad2c1]">Nem azonosítható megalapozott, konkrét vizuális eltérés a feltöltött képeken. Ez nem jelenti azt, hogy a terület biztosan problémamentes.</div> : analysis.findings.map((item, index) => <article className="print-avoid rounded-xl border border-[#31533d] bg-[#102118] p-5 print-card" key={`${item.id}-${index}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="mb-1 text-[10px] font-black uppercase tracking-wide text-lime-300">#{item.id} · {item.category} · {item.imageIndex + 1}. kép</p><h4 className="text-base font-black text-white">{item.title}</h4></div><Pill tone={riskTone[item.severity] || riskTone.információ}>{item.severity}</Pill></div><p className="agri-muted mt-3 text-sm leading-7">{item.observation}</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-[#294536] p-3"><p className="text-[10px] font-black uppercase text-[#8cab94]">Látható bizonyíték</p><p className="mt-1 text-xs leading-6 text-[#d4e8d9]">{item.visualEvidence}</p></div><div className="rounded-lg border border-[#294536] p-3"><p className="text-[10px] font-black uppercase text-[#8cab94]">Hol látható?</p><p className="mt-1 text-xs leading-6 text-[#d4e8d9]">{item.location}</p></div></div><p className="mt-3 text-sm leading-7 text-lime-200"><strong>Javaslat:</strong> {item.recommendation}</p><p className="agri-muted mt-2 text-xs">A vizuális megfigyelés megbízhatósága: {item.certainty}</p><button type="button" onClick={() => setActiveImage(Math.max(0, Math.min(images.length - 1, item.imageIndex)))} className="no-print mt-3 text-xs font-black text-lime-300 hover:underline">Mutasd a fotón →</button></article>)}</div>
              </div>
              <div className="grid gap-5 md:grid-cols-2"><div className="agri-panel print-card print-avoid p-6"><h3 className="mb-4 text-lg font-black text-white">Elsődleges teendők</h3><ul className="space-y-4">{analysis.priorities.length ? analysis.priorities.map((text, i) => <li key={i} className="flex gap-3 text-sm leading-6"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-300 text-xs font-black text-[#102418]">{i + 1}</span><span className="agri-muted">{text}</span></li>) : <li className="agri-muted text-sm">A képek alapján nincs egyértelműen rangsorolható beavatkozás.</li>}</ul></div><div className="agri-panel print-card print-avoid p-6"><h3 className="mb-4 text-lg font-black text-white">Javasolt helyszíni ellenőrzések</h3><ul className="space-y-3">{analysis.recommendedChecks.map((text, i) => <li key={i} className="flex gap-3 text-sm leading-6"><span className="font-black text-lime-300">✓</span><span className="agri-muted">{text}</span></li>)}</ul></div></div>
              <div className="agri-panel print-card print-avoid p-6 sm:p-7"><h3 className="text-lg font-black text-white">Következő felmérés fókusza</h3><p className="agri-muted mt-3 text-sm leading-7">{analysis.nextVisitFocus}</p><h4 className="mt-6 text-sm font-black text-amber-300">Értelmezési korlátok</h4><ul className="agri-muted mt-3 list-inside list-disc space-y-2 text-xs leading-6">{analysis.limitations.map((line, i) => <li key={i}>{line}</li>)}<li>Az RGB-képek nem helyettesítik az NDVI-t, laborvizsgálatot, geodéziai mérést vagy agronómiai szakvéleményt.</li></ul></div>
              <div className="no-print rounded-xl border border-[#36523e] p-4 text-xs leading-6 text-[#8fae99]">PDF készítése: kattints a „Mentés PDF-ként / Nyomtatás” gombra, majd a böngésző nyomtatási ablakában válaszd a „Mentés PDF-ként” lehetőséget.</div>
            </>}
          </section>
        </div>
      </main>
      <footer className="no-print border-t border-[#25402e] px-5 py-7 text-center text-xs leading-6 text-[#89a994]">© AGRI DRONE VISION · Vizuális döntéstámogatás drónfelvételekből · Nem hivatalos kárszakértői vagy növényorvosi szakvélemény.</footer>
    </div>
  );
}
