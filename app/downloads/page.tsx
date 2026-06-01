import Link from "next/link";
import { Apple, ArrowLeft, Download, ShieldCheck, Smartphone, Terminal } from "lucide-react";
import { SiGoogleplay } from "react-icons/si";

const AVA_DESKTOP_VERSION = "1.1.28";
const AVA_BRIDGE_EA_VERSION = "1.17";
const DOWNLOAD_BASE_URL = "https://call-ava.com/downloads";
const BRIDGE_COMPATIBILITY = [
  {
    desktop: "1.1.28",
    bridge: "1.17",
    status: "Recommandé",
    note: "Scalping actif, renforts par zones, bouton d'installation AvaBridge plus explicite et compatibilité Windows améliorée.",
  },
  {
    desktop: "1.1.24 à 1.1.25",
    bridge: "1.15 à 1.17",
    status: "Accepté",
    note: "Compatible partiellement, mise à jour Desktop conseillée pour les renforts et l'installation AvaBridge.",
  },
  {
    desktop: "1.1.12 et avant",
    bridge: "1.14 ou inférieur",
    status: "Obsolète",
    note: "À remplacer pour éviter les anciens comportements et profiter du TP broker actuel.",
  },
];
const DOWNLOADS = [
  {
    title: "Ava iOS",
    subtitle: "Application mobile iPhone",
    href: "https://apps.apple.com/app/ava-ai-voice-assistant/id6744959525",
    icon: Apple,
    cta: "Ouvrir l'App Store",
  },
  {
    title: "Ava Android",
    subtitle: "Application mobile Android",
    href: "https://play.google.com/store/apps/details?id=com.kemyamo.ava",
    icon: SiGoogleplay,
    cta: "Ouvrir Google Play",
  },
  {
    title: "Ava Desktop Mac",
    subtitle: `Apple Silicon · v${AVA_DESKTOP_VERSION}`,
    href: `${DOWNLOAD_BASE_URL}/Ava-${AVA_DESKTOP_VERSION}-arm64.dmg`,
    icon: Apple,
    cta: "Télécharger",
  },
  {
    title: "Ava Desktop Mac",
    subtitle: `Intel · v${AVA_DESKTOP_VERSION}`,
    href: `${DOWNLOAD_BASE_URL}/Ava-${AVA_DESKTOP_VERSION}-x64.dmg`,
    icon: Apple,
    cta: "Télécharger",
  },
  {
    title: "Ava Desktop Windows",
    subtitle: `Installateur · v${AVA_DESKTOP_VERSION}`,
    href: `${DOWNLOAD_BASE_URL}/AvaSetup-${AVA_DESKTOP_VERSION}.exe`,
    icon: Smartphone,
    cta: "Télécharger",
  },
  {
    title: "AvaBridgeEA",
    subtitle: `Expert Advisor MT5 compilé · v${AVA_BRIDGE_EA_VERSION}`,
    href: `${DOWNLOAD_BASE_URL}/AvaBridgeEA-${AVA_BRIDGE_EA_VERSION}.ex5`,
    icon: Terminal,
    cta: "Télécharger",
  },
];

export default function DownloadsPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(244,63,94,0.14),transparent_36%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_76%,rgba(148,163,184,0.08),transparent_42%)]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-8 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-white">
            <ArrowLeft size={16} />
            Ava
          </Link>
          <Link href="/app" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 transition-colors hover:bg-white/[0.08]">
            Mon compte
          </Link>
        </div>

        <div className="mx-auto w-full max-w-3xl pt-20 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-3xl border border-rose-400/20 bg-rose-500/10 text-rose-300">
            <Download size={24} />
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Téléchargements Ava</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Retrouvez Ava mobile, Ava Desktop et AvaBridgeEA pour MetaTrader 5. Les fichiers Desktop sont servis depuis Hostinger dans le dossier public versionné.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DOWNLOADS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={`${item.title}-${item.subtitle}`}
                href={item.href}
                className="group rounded-[28px] border border-white/10 bg-white/[0.035] p-6 transition-colors hover:border-rose-400/35 hover:bg-white/[0.055]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-rose-300">
                    <Icon size={21} />
                  </div>
                  <span className="rounded-2xl bg-white px-4 py-2 text-xs font-black text-slate-950 transition-colors group-hover:bg-rose-400 group-hover:text-white">
                    {item.cta}
                  </span>
                </div>
                <h2 className="mt-6 text-xl font-black">{item.title}</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">{item.subtitle}</p>
              </a>
            );
          })}
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-sm leading-relaxed text-slate-400">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-300" />
          <p>
            Si un fichier Desktop affiche encore une erreur 404, cela signifie simplement que l'asset n'a pas encore été uploadé dans Hostinger sous ce nom exact. La page est prête, les liens fonctionneront dès que les fichiers seront présents dans <span className="font-bold text-slate-300">/downloads</span>.
          </p>
        </div>

        <div className="mx-auto mt-6 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-300">Versions Ava Trading</p>
              <h2 className="mt-1 text-2xl font-black">Compatibilité Ava Desktop / AvaBridge</h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-slate-500">
              Notes courtes pour choisir la bonne version, sans détails internes sensibles.
            </p>
          </div>
          <div className="mt-5 grid gap-3">
            {BRIDGE_COMPATIBILITY.map((item) => (
              <div key={`${item.desktop}-${item.bridge}`} className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/55 p-4 md:grid-cols-[1fr_1fr_120px_2fr] md:items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ava Desktop</p>
                  <p className="mt-1 font-black text-white">v{item.desktop}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">AvaBridgeEA</p>
                  <p className="mt-1 font-black text-white">v{item.bridge}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  item.status === "Recommandé"
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/20"
                    : item.status === "Accepté"
                      ? "bg-blue-500/10 text-blue-300 border border-blue-400/20"
                      : "bg-amber-500/10 text-amber-200 border border-amber-400/20"
                }`}>
                  {item.status}
                </span>
                <p className="text-sm leading-relaxed text-slate-400">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-4xl rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-rose-300">Installation AvaBridgeEA</p>
          <h2 className="mt-1 text-2xl font-black">Installer le fichier compilé .ex5 dans MT5</h2>
          <div className="mt-5 grid gap-3 text-sm leading-relaxed text-slate-400 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="font-black text-white">Windows</p>
              <ol className="mt-3 space-y-2">
                <li>1. Téléchargez <span className="font-bold text-slate-200">AvaBridgeEA-{AVA_BRIDGE_EA_VERSION}.ex5</span>.</li>
                <li>2. Dans MT5, ouvrez <span className="font-bold text-slate-200">Fichier &gt; Ouvrir le dossier des données</span>.</li>
                <li>3. Copiez le fichier dans <span className="font-bold text-slate-200">MQL5/Experts</span>, puis redémarrez MT5.</li>
              </ol>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
              <p className="font-black text-white">macOS</p>
              <ol className="mt-3 space-y-2">
                <li>1. Dans MT5, ouvrez <span className="font-bold text-slate-200">Fichier &gt; Ouvrir le dossier des données</span>.</li>
                <li>2. Si Finder masque le conteneur MetaQuotes/Wine, appuyez sur <span className="font-bold text-slate-200">Cmd + Shift + .</span>.</li>
                <li>3. Placez le fichier dans <span className="font-bold text-slate-200">MQL5/Experts</span>, redémarrez MT5, puis attachez AvaBridgeEA au graphique XAUUSD.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
