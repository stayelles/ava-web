import Link from "next/link";
import { Apple, ArrowLeft, Download, ShieldCheck, Smartphone } from "lucide-react";
import { SiGoogleplay } from "react-icons/si";

const AVA_DESKTOP_MAC_VERSION = "1.2.63";
const AVA_DESKTOP_WINDOWS_VERSION = "1.2.65";
const DOWNLOAD_BASE_URL = "https://call-ava.com/downloads";
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
    subtitle: `Apple Silicon · v${AVA_DESKTOP_MAC_VERSION}`,
    href: `${DOWNLOAD_BASE_URL}/Ava-${AVA_DESKTOP_MAC_VERSION}-arm64.dmg`,
    icon: Apple,
    cta: "Télécharger",
  },
  {
    title: "Ava Desktop Mac",
    subtitle: `Intel · v${AVA_DESKTOP_MAC_VERSION}`,
    href: `${DOWNLOAD_BASE_URL}/Ava-${AVA_DESKTOP_MAC_VERSION}-x64.dmg`,
    icon: Apple,
    cta: "Télécharger",
  },
  {
    title: "Ava Desktop Windows",
    subtitle: `Installateur · v${AVA_DESKTOP_WINDOWS_VERSION}`,
    href: `${DOWNLOAD_BASE_URL}/AvaSetup-${AVA_DESKTOP_WINDOWS_VERSION}.exe`,
    icon: Smartphone,
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
            Retrouvez Ava mobile et Ava Desktop. Les fichiers Desktop sont servis depuis Hostinger dans le dossier public versionné.
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
            Si un fichier Desktop affiche encore une erreur 404, cela signifie simplement que l&apos;asset n&apos;a pas encore été uploadé dans Hostinger sous ce nom exact. La page est prête, les liens fonctionneront dès que les fichiers seront présents dans <span className="font-bold text-slate-300">/downloads</span>.
          </p>
        </div>
      </section>
    </main>
  );
}
