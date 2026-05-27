"use client";

import { useRef, useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  TrendingUp, Download, Play, HelpCircle, CheckCircle, Sliders,
  ShieldAlert, Layers, Activity, Clock, ArrowRight, ArrowLeft, ChevronDown,
  Cpu, Terminal, Zap, Shield, Sparkles, Check
} from "lucide-react";
import { SiApple } from "react-icons/si";

import {
  Navbar as ResizableNavbar, NavBody, NavItems, MobileNav, NavbarLogo,
  NavbarButton, MobileNavHeader, MobileNavToggle, MobileNavMenu
} from "@/components/ui/resizable-navbar";
import {
  type Lang, type TL,
  LANG_FLAGS, SUPPORTED_LANGS, LANG_STORAGE_KEY
} from "@/lib/landing-translations";

const DOWNLOAD_BASE_URL = "https://call-ava.com/downloads";
const DOWNLOADS = {
  macArm: `${DOWNLOAD_BASE_URL}/Ava-1.1.4-arm64.dmg`,
  macIntel: `${DOWNLOAD_BASE_URL}/Ava-1.1.4-x64.dmg`,
  windows: `${DOWNLOAD_BASE_URL}/AvaSetup-1.1.4.exe`,
  ea: `${DOWNLOAD_BASE_URL}/AvaBridgeEA-1.12.mq5`,
};

// ─── Language context ──────────────────────────────────────────────────────────

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en', setLang: () => {},
});
const useLang = () => useContext(LangCtx);
function useTl() {
  const { lang } = useLang();
  return (obj: TL): string => obj[lang] ?? obj.en;
}

// ─── Shared Components & Utils ───────────────────────────────────────────────

function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}>
      {children}
    </motion.div>
  );
}

function DotGrid({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANG_FLAGS.find(l => l.code === lang) ?? LANG_FLAGS[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-bold text-slate-300 hover:text-white transition-colors"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown size={12} className={cn("transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-32 rounded-2xl border border-white/10 bg-slate-950 p-1.5 shadow-2xl backdrop-blur-xl"
          >
            {LANG_FLAGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors text-left",
                  lang === l.code
                    ? "bg-white/[0.08] text-white"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                )}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const tl = useTl();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { name: tl({ en: 'Features', fr: 'Fonctionnalités', de: 'Funktionen', tr: 'Özellikler', es: 'Características' }), link: "/#features" },
    { name: tl({ en: 'Pricing', fr: 'Tarifs', de: 'Preise', tr: 'Fiyatlar', es: 'Precios' }), link: "/#pricing" },
    { name: "Ava Trading", link: "/trading" },
    { name: tl({ en: 'Download', fr: 'Télécharger', de: 'Download', tr: 'İndir', es: 'Descargar' }), link: "/#download" },
    { name: tl({ en: 'Blog', fr: 'Blog', de: 'Blog', tr: 'Blog', es: 'Blog' }), link: "/blog" },
  ];

  return (
    <ResizableNavbar>
      <NavBody>
        <NavbarLogo />
        <NavItems items={NAV_ITEMS} />
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <NavbarButton href="/app" variant="primary">
            {tl({ en: 'Start For Free', fr: 'Commencer gratuitement', de: 'Kostenlos starten', tr: 'Ücretsiz Başla', es: 'Empezar gratis' })}
          </NavbarButton>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          {NAV_ITEMS.map((item, idx) => (
            <a key={idx} href={item.link} onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-medium py-1 transition-colors">
              {item.name}
            </a>
          ))}
          <div className="pt-1 pb-1">
            <LangSwitcher />
          </div>
          <NavbarButton href="/app" variant="primary" className="w-full mt-2">
            {tl({ en: 'Start For Free', fr: 'Commencer gratuitement', de: 'Kostenlos starten', tr: 'Ücretsiz Başla', es: 'Empezar gratis' })}
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
}

// ─── Page Translations ────────────────────────────────────────────────────────

const PAGE_T = {
  metaTitle: {
    en: "Ava Trading — Automatic IA Scalping Bot for MT5",
    fr: "Ava Trading — Bot de Scalping IA Automatique pour MT5",
    de: "Ava Trading — Automatischer KI-Scalping-Bot für MT5",
    tr: "Ava Trading — MT5 için Otomatik Yapay Zeka Scalping Botu",
    es: "Ava Trading — Bot de Scalping IA Automático para MT5",
  },
  heroBadge: {
    en: "Algorithmic Scalping Bot",
    fr: "Bot de Scalping Algorithmique",
    de: "Algorithmischer Scalping-Bot",
    tr: "Algoritmik Scalping Botu",
    es: "Bot de Scalping Algorítmico",
  },
  heroH1: {
    en: "Ava Trading",
    fr: "Ava Trading",
    de: "Ava Trading",
    tr: "Ava Trading",
    es: "Ava Trading",
  },
  heroH2: {
    en: "AI Scalping on MT5",
    fr: "Le Scalping IA sur MT5",
    de: "KI-Scalping auf MT5",
    tr: "MT5 üzerinde YZ Scalping",
    es: "Scalping IA en MT5",
  },
  heroSub: {
    en: "Connect your MetaTrader 5 demo or real account to Ava. Our artificial intelligence analyzes the market at a tick-by-tick frequency, places trades automatically, learns from every transaction, and secures your profits.",
    fr: "Connectez votre compte démo ou réel MetaTrader 5 à Ava. Notre intelligence artificielle analyse le marché à une fréquence tick-par-tick, ouvre des positions automatiquement, apprend de chaque transaction et sécurise vos profits.",
    de: "Verbinden Sie Ihr Demo- oder Echtgeld-MetaTrader 5-Konto mit Ava. Unsere künstliche Intelligenz analysiert den Markt im Tick-by-Tick-Takt, platziert Trades automatisch, lernt aus jeder Transaktion und sichert Ihre Gewinne.",
    tr: "MetaTrader 5 demo veya gerçek hesabınızı Ava'ya bağlayın. Yapay zekamız piyasayı anlık olarak analiz eder, otomatik olarak işlem açar, her işlemden ders çıkarır ve kârınızı güvence altına alır.",
    es: "Conecte su cuenta demo o real de MetaTrader 5 a Ava. Nuestra inteligencia artificial analiza el mercado a una frecuencia de tick a tick, abre posiciones de forma automática, aprende de cada transacción y asegura sus ganancias.",
  },

  // ── Prerequisites ──
  prereqTitle: {
    en: "Prerequisites for Ava Trading",
    fr: "Prérequis pour Ava Trading",
    de: "Voraussetzungen für Ava Trading",
    tr: "Ava Trading için Gereksinimler",
    es: "Requisitos para Ava Trading",
  },
  prereqSub: {
    en: "Before configuring and launching the bot, make sure you have prepared the following elements:",
    fr: "Avant de configurer et de lancer le bot, assurez-vous d'avoir préparé les éléments suivants :",
    de: "Stellen Sie vor dem Konfigurieren und Starten des Bots sicher, dass Sie folgende Elemente vorbereitet haben:",
    tr: "Botu kurup başlatmadan önce aşağıdaki unsurları hazırladığınızdan emin olun:",
    es: "Antes de configurar y lanzar el bot, asegúrese de haber preparado los siguientes elementos:",
  },
  prereqs: [
    {
      title: { en: "MT5 Demo Account", fr: "Compte démo MT5", de: "MT5-Demo-Konto", tr: "MT5 Demo Hesabı", es: "Cuenta Demo MT5" },
      desc: {
        en: "A MetaTrader 5 account is required. We highly recommend starting with a Deriv Demo account to familiarize yourself with the bot's speed.",
        fr: "Un compte MetaTrader 5 est nécessaire. Nous recommandons vivement de commencer sur un compte Démo Deriv pour se familiariser avec la vitesse du bot.",
        de: "Ein MetaTrader 5-Konto ist erforderlich. Wir empfehlen dringend, mit einem Deriv-Demo-Konto zu beginnen, um sich mit der Geschwindigkeit vertraut zu machen.",
        tr: "Bir MetaTrader 5 hesabı gereklidir. Botun hızına alışmak için kesinlikle bir Deriv Demo hesabı ile başlamanızı öneririz.",
        es: "Se requiere una cuenta de MetaTrader 5. Recomendamos encarecidamente comenzar con una cuenta demo de Deriv para familiarizarse con la velocidad del bot.",
      }
    },
    {
      title: { en: "Ava Desktop App", fr: "Application Ava Desktop", de: "Ava Desktop-App", tr: "Ava Desktop Uygulaması", es: "Aplicación Ava Desktop" },
      desc: {
        en: "Ava Trading runs exclusively inside our desktop app. Install it on your macOS (Apple Silicon/Intel) or Windows 10/11 computer.",
        fr: "Ava Trading fonctionne exclusivement sur notre application desktop. Installez-la sur votre ordinateur macOS (Apple Silicon/Intel) ou Windows 10/11.",
        de: "Ava Trading läuft exklusiv in unserer Desktop-App. Installieren Sie sie auf Ihrem macOS- (Apple Silicon/Intel) oder Windows 10/11-Computer.",
        tr: "Ava Trading yalnızca masaüstü uygulamamızda çalışır. macOS (Apple Silicon/Intel) veya Windows 10/11 bilgisayarınıza kurun.",
        es: "Ava Trading funciona exclusivamente en nuestra aplicación de escritorio. Instálela en su ordenador macOS (Apple Silicon/Intel) o Windows 10/11.",
      }
    },
    {
      title: { en: "EA Bridge File", fr: "Le fichier EA Bridge", de: "Die EA Bridge-Datei", tr: "EA Bridge Dosyası", es: "El archivo EA Bridge" },
      desc: {
        en: "Download the AvaBridgeEA.mq5 file and install it in your MT5 terminal to link the Ava Desktop app and MetaTrader 5.",
        fr: "Téléchargez le fichier AvaBridgeEA.mq5 et placez-le dans votre terminal MT5 pour faire la liaison entre l'application Ava Desktop et MetaTrader 5.",
        de: "Laden Sie die Datei AvaBridgeEA.mq5 herunter und legen Sie sie in Ihrem MT5-Terminal ab, um die Ava Desktop-App mit MetaTrader 5 zu verbinden.",
        tr: "AvaBridgeEA.mq5 dosyasını indirin ve Ava Desktop uygulaması ile MetaTrader 5 arasında köprü kurmak için MT5 terminalinize kurun.",
        es: "Descargue el archivo AvaBridgeEA.mq5 e instálelo en su terminal MT5 para vincular la aplicación Ava Desktop y MetaTrader 5.",
      }
    },
    {
      title: { en: "Subscription Plan", fr: "Plan d'abonnement actif", de: "Aktives Abonnement", tr: "Aktif Abonelik Planı", es: "Plan de suscripción activo" },
      desc: {
        en: "Ava Trading is available starting with the Custom Simple plan. Upgrade to Custom Pro to customize all settings.",
        fr: "Ava Trading est accessible à partir du plan Custom Simple. Passez au plan Custom Pro pour personnaliser tous vos paramètres.",
        de: "Ava Trading ist ab dem Custom Simple-Plan verfügbar. Aktualisieren Sie auf Custom Pro, um alle Einstellungen anzupassen.",
        tr: "Ava Trading, Custom Simple planından itibaren kullanılabilir. Tüm ayarları özelleştirmek için Custom Pro planına geçin.",
        es: "Ava Trading está disponible a partir del plan Custom Simple. Actualice a Custom Pro para personalizar todos los ajustes.",
      }
    }
  ],

  // ── Setup Steps ──
  setupTitle: {
    en: "How to Start (5 Simple Steps)",
    fr: "Comment démarrer (5 étapes simples)",
    de: "Wie man startet (5 einfache Schritte)",
    tr: "Nasıl Başlanır (5 Kolay Adım)",
    es: "Cómo empezar (5 pasos sencillos)",
  },
  steps: [
    {
      title: { en: "Download and Install", fr: "Télécharger & Installer", de: "Herunterladen & Installieren", tr: "İndir ve Kur", es: "Descargar e Instalar" },
      desc: {
        en: "Download Ava Desktop for your operating system and place the AvaBridgeEA.mq5 file inside your MT5 Experts folder.",
        fr: "Téléchargez Ava Desktop pour votre système et placez le fichier AvaBridgeEA.mq5 dans le dossier Experts de votre MT5.",
        de: "Laden Sie Ava Desktop für Ihr System herunter und legen Sie die Datei AvaBridgeEA.mq5 in den Experts-Ordner Ihres MT5.",
        tr: "Sisteminiz için Ava Desktop'ı indirin ve AvaBridgeEA.mq5 dosyasını MT5 Experts klasörünüzün içine yerleştirin.",
        es: "Descargue Ava Desktop para su sistema y coloque el archivo AvaBridgeEA.mq5 en la carpeta Experts de su MT5.",
      }
    },
    {
      title: { en: "Connect with PIN", fr: "Se connecter avec le PIN", de: "Mit PIN verbinden", tr: "PIN ile Bağlan", es: "Conectarse con PIN" },
      desc: {
        en: "Open Ava Desktop and enter the secure PIN associated with your Ava account to activate your subscription capabilities.",
        fr: "Ouvrez Ava Desktop et saisissez le PIN sécurisé associé à votre compte Ava pour activer les capacités liées à votre plan.",
        de: "Öffnen Sie Ava Desktop und geben Sie die sichere PIN Ihres Ava-Kontos ein, um die Funktionen Ihres Abonnements freizuschalten.",
        tr: "Ava Desktop'ı açın ve abonelik özelliklerinizi etkinleştirmek için Ava hesabınızla ilişkili güvenli PIN kodunu girin.",
        es: "Abra Ava Desktop e introduzca el PIN seguro asociado a su cuenta de Ava para activar las funciones de su suscripción.",
      }
    },
    {
      title: { en: "Open Ava Trading Panel", fr: "Ouvrir l'onglet Ava Trading", de: "Ava Trading-Panel öffnen", tr: "Ava Trading Panelini Aç", es: "Abrir Panel Ava Trading" },
      desc: {
        en: "Select 'Ava Trading' in the sidebar. You will see all trading parameters, status trackers, and charts.",
        fr: "Sélectionnez 'Ava Trading' dans le menu latéral. Vous accédez au panneau avec tous les paramètres, statistiques de session et graphiques.",
        de: "Wählen Sie 'Ava Trading' in der Seitenleiste. Sie sehen alle Parameter, Statistiken und Charts.",
        tr: "Yan menüden 'Ava Trading'i seçin. Tüm parametreleri, istatistikleri ve grafikleri içeren panele erişeceksiniz.",
        es: "Seleccione 'Ava Trading' en el menú lateral. Accederá al panel con todos los parámetros, estadísticas de sesión y gráficos.",
      }
    },
    {
      title: { en: "Attach EA in MT5", fr: "Attacher l'EA sur MT5", de: "EA in MT5 anhängen", tr: "EA'yı MT5'e Ekle", es: "Acoplar el EA en MT5" },
      desc: {
        en: "Open MT5, refresh your Experts list, drag AvaBridgeEA onto a chart (e.g. Gold XAUUSD), and make sure 'Algo Trading' is enabled.",
        fr: "Sur MT5, rafraîchissez vos Experts, glissez AvaBridgeEA sur un graphique (ex: Gold XAUUSD) et assurez-vous d'activer l'Option 'Algo Trading'.",
        de: "Aktualisieren Sie in MT5 Ihre Experten, ziehen Sie AvaBridgeEA auf einen Chart (z.B. Gold XAUUSD) und aktivieren Sie 'Algo Trading'.",
        tr: "MT5'te Uzman listesini yenileyin, AvaBridgeEA'yı bir grafiğe (örn. Gold XAUUSD) sürükleyin ve 'Algo Trading' seçeneğinin açık olduğundan emin olun.",
        es: "En MT5, actualice sus Expertos, arrastre AvaBridgeEA a un gráfico (por ejemplo, Gold XAUUSD) y asegúrese de activar la opción 'Algo Trading'.",
      }
    },
    {
      title: { en: "Adjust & Launch Bot", fr: "Ajuster & Lancer le bot", de: "Anpassen & Bot starten", tr: "Ayarla ve Botu Başlat", es: "Ajustar y Lanzar el Bot" },
      desc: {
        en: "If you have Custom Pro, set your parameters (Lot, Giveback, SL, TP). Press 'Start' to let the AI take over.",
        fr: "Si vous avez le plan Custom Pro, ajustez vos paramètres (Lot, Giveback, SL, TP). Appuyez sur 'Démarrer' pour laisser l'IA agir.",
        de: "Wenn Sie den Custom Pro-Plan haben, passen Sie Ihre Parameter an (Lot, Gewinnschutz, SL, TP). Klicken Sie auf 'Start', um die KI zu aktivieren.",
        tr: "Custom Pro planınız varsa parametrelerinizi (Lot, Giveback, SL, TP) ayarlayın. Yapay zekayı başlatmak için 'Başlat'a tıklayın.",
        es: "Si tiene el plan Custom Pro, ajuste sus parámetros (Lote, Giveback, SL, TP). Presione 'Iniciar' para dejar actuar a la IA.",
      }
    }
  ],

  // ── Parameters Explanation ──
  paramTitle: {
    en: "Parameter Specifications",
    fr: "Spécification des Paramètres",
    de: "Parameter-Spezifikationen",
    tr: "Parametre Açıklamaları",
    es: "Especificación de los Parámetros",
  },
  paramSub: {
    en: "Here is the exact role of each parameter you can modify on the Ava Trading interface:",
    fr: "Voici le rôle exact de chaque élément configurable sur l'interface d'Ava Trading :",
    de: "Hier ist die genaue Rolle jedes konfigurierbaren Elements auf der Ava Trading-Schnittstelle:",
    tr: "Ava Trading arayüzünde yapılandırabileceğiniz her bir öğenin tam görevi aşağıdadır:",
    es: "Este es el rol exacto de cada elemento configurable en la interfaz de Ava Trading:",
  },
  params: [
    {
      name: "Lot Size (Lot)",
      icon: Activity,
      desc: {
        en: "Represents the size of each opened transaction. Locked at 0.01 for Simple users to protect equity. Pro users can customize it up to 0.02 to increase return potential.",
        fr: "Représente la taille de chaque position ouverte. Bloqué à 0.01 pour les utilisateurs Simple pour protéger leur capital. Les utilisateurs Pro peuvent monter jusqu'à 0.02 pour démultiplier les gains.",
        de: "Repräsentiert die Größe jeder geöffneten Position. Für Simple-Nutzer auf 0.01 fixiert, um das Kapital zu schützen. Pro-Nutzer können bis zu 0.02 einstellen, um Gewinne zu maximieren.",
        tr: "Açılan her işlemin büyüklüğünü temsil eder. Bakiyeyi korumak için Simple kullanıcılarında 0.01'de kilitlidir. Pro kullanıcıları, getiri potansiyelini artırmak için bunu 0.02'ye kadar özelleştirebilir.",
        es: "Representa el tamaño de cada posición abierta. Bloqueado en 0.01 para usuarios Simple para proteger el capital. Los usuarios Pro pueden subir hasta 0.02 para multiplicar las ganancias.",
      }
    },
    {
      name: "Profit Min $",
      icon: TrendingUp,
      desc: {
        en: "The minimum net gain required to close a profitable position. Locked at $0.09 for Simple. Custom Pro users can adjust it up to $0.20 per trade.",
        fr: "Le gain net minimum requis pour fermer un trade en profit. Bloqué à 0.09$ pour le plan Simple. Les utilisateurs Custom Pro peuvent l'ajuster jusqu'à 0.20$ pour viser plus de rentabilité par trade.",
        de: "Der minimale Nettogewinn, der erforderlich ist, um einen profitablen Trade zu schließen. Auf 0.09$ für Simple fixiert. Custom Pro-Nutzer können ihn auf bis zu 0.20$ anpassen.",
        tr: "Kârlı bir işlemi kapatmak için gereken minimum net kâr. Simple için 0.09$ seviyesinde kilitlidir. Custom Pro kullanıcıları bunu işlem başına 0.20$'a kadar ayarlayabilir.",
        es: "La ganancia neta mínima requerida para cerrar una operación en ganancia. Bloqueado en $0.09 para Simple. Los usuarios de Custom Pro pueden ajustarlo hasta $0.20 por operación.",
      }
    },
    {
      name: "SL $ Max",
      icon: ShieldAlert,
      desc: {
        en: "Emergency hard drawdown stop. If a session reaches this loss value, all positions close instantly. Fixed at -$90 for Simple, adjustable from -$85 to -$300 for Pro.",
        fr: "Seuil de perte maximum historique de secours. Si la session descend à cette perte, tout est coupé. Fixé à -90$ pour Simple, ajustable de -85$ à -300$ pour Pro.",
        de: "Notfall-Drawdown-Schutz. Wenn dieser Verlustwert erreicht wird, werden alle Positionen sofort geschlossen. Fest auf -90$ für Simple, einstellbar von -85$ bis -300$ für Pro.",
        tr: "Acil durum maksimum kayıp sınırı. Oturum bu kayıp değerine ulaşırsa tüm işlemler anında kapatılır. Simple için -90$'da sabittir, Pro için -85$ ile -300$ arasında ayarlanabilir.",
        es: "Umbral de pérdida máxima de emergencia. Si la sesión alcanza este valor de pérdida, todas las posiciones se cierran al instante. Fijo en -$90 para Simple, ajustable de -$85 a -$300 para Pro.",
      }
    },
    {
      name: "Giveback $",
      icon: Shield,
      desc: {
        en: "Smart profit protection. If the session profit reaches a peak (e.g. +$179) and then drops by this threshold (e.g. drop of $0.50), the bot locks and stops trading to secure earnings. Customizable from $0.10 to $5.00 for Custom Simple, and up to $100.00 for Custom Pro.",
        fr: "Protection intelligente des gains. Si le profit cumulé de la session atteint un sommet (ex: +179$) puis retombe de la valeur du Giveback (ex: baisse de 0.50$), le bot se verrouille pour sécuriser les gains. Modifiable de 0.10$ à 5.00$ pour Custom Simple, et jusqu'à 100.00$ pour Custom Pro.",
        de: "Intelligenter Gewinnschutz. Wenn der aufgelaufene Gewinn ein Hoch erreicht (z.B. +179$) und dann um diesen Wert fällt (z.B. Rückgang um 0.50$), sperrt sich der Bot, um Gewinne zu sichern. Anpassbar von 0.10$ bis 5.00$ für Custom Simple, und bis zu 100.00$ für Custom Pro.",
        tr: "Akıllı kâr koruması. Oturum kârı bir zirveye ulaşırsa (örneğin +179$) ve ardından bu eşik kadar düşerse (örneğin 0.50$ düşüş), bot kazançları korumak için kendini kilitler. Custom Simple için 0.10$ ile 5.00$, Custom Pro için 0.10$ ile 100.00$ arasında ayarlanabilir.",
        es: "Protección inteligente de ganancias. Si el beneficio acumulado de la sesión alcanza un pico (ej: +$179) y luego cae por este umbral (ej: caída de $0.50), el bot se bloquea para asegurar las ganancias. Ajustable de $0.10 a $5.00 para Custom Simple, y hasta $100.00 para Custom Pro.",
      }
    },
    {
      name: "Reset on Start",
      icon: Clock,
      desc: {
        en: "Resets session statistics (peak profit, actual profit, trade counter) back to zero upon booting the bot. Simple users always resume from previous session counters. Pro users can toggle this option freely.",
        fr: "Remet à zéro les compteurs de session (plus haut pic, profit actuel, nombre de trades) à chaque démarrage du bot. Simple reprend toujours là où il s'est arrêté. Les membres Pro peuvent l'activer ou la désactiver librement.",
        de: "Setzt die Sitzungsstatistiken (Peak, aktueller Gewinn, Trade-Zähler) beim Starten des Bots auf Null zurück. Simple-Nutzer setzen immer die vorherige Sitzung fort. Pro-Nutzer können diese Option frei wählen.",
        tr: "Bot başlatıldığında oturum istatistiklerini (en yüksek kâr, mevcut kâr, işlem sayacı) sıfırlar. Simple kullanıcıları her zaman önceki oturumdan devam eder. Pro kullanıcıları bu seçeneği serbestçe açıp kapatabilir.",
        es: "Restablece a cero las estadísticas de la sesión (pico de beneficio, beneficio actual, contador de operaciones) al iniciar el bot. Simple siempre continúa desde la sesión anterior. Los miembros Pro pueden activar o desactivar esta opción libremente.",
      }
    },
    {
      name: "Session Target $",
      icon: TargetIcon,
      desc: {
        en: "Session profit goal. Once this threshold is hit, the bot shuts down to prevent overtrading. Customizable up to $1000 for Custom Pro users.",
        fr: "Objectif de gain global de la session. Une fois ce profit cumulé atteint, le bot s'arrête de lui-même pour éviter l'overtrading. Ajustable jusqu'à 1000$ pour le plan Custom Pro.",
        de: "Gewinnziel für die Sitzung. Sobald dieses Ziel erreicht ist, stoppt der Bot, um Overtrading zu vermeiden. Anpassbar bis zu 1000$ für Custom Pro-Nutzer.",
        tr: "Oturum kâr hedefi. Bu birikmiş kâr hedefine ulaşıldığında, bot aşırı ticareti önlemek için kendi kendine durur. Custom Pro kullanıcıları için 1000$'a kadar ayarlanabilir.",
        es: "Objetivo de ganancia global de la sesión. Una vez alcanzado este beneficio acumulado, el bot se detiene por sí mismo para evitar el overtrading. Ajustable hasta $1000 para el plan Custom Pro.",
      }
    },
    {
      name: "Scalping Window",
      icon: Layers,
      desc: {
        en: "Analysis timeframe (from 1 second to 5 minutes). Defines the candle speed used by the AI model to analyze the charts. Available for Custom Pro.",
        fr: "Fenêtre temporelle d'analyse (de 1 seconde à 5 minutes). Définit la vitesse des bougies lues par le modèle IA pour prendre ses décisions. Modifiable sur Custom Pro.",
        de: "Analyse-Zeitrahmen (von 1 Sekunde bis 5 Minuten). Bestimmt die Geschwindigkeit der Kerzen, die das KI-Modell analysiert. Verfügbar für Custom Pro.",
        tr: "Analiz zaman aralığı (1 saniyeden 5 dakikaya kadar). Yapay zeka modelinin grafikleri analiz etmek için kullandığı mum hızını tanımlar. Custom Pro için mevcuttur.",
        es: "Ventana de tiempo de análisis (de 1 segundo a 5 minutos). Define la velocidad de las velas leídas por el modelo IA para tomar decisiones. Modificable en Custom Pro.",
      }
    },
    {
      name: "AI Confidence Threshold",
      icon: Sparkles,
      desc: {
        en: "Minimum probability required (50% to 95%) for the AI model to authorize order entry. Higher values yield higher accuracy but fewer trade opportunities.",
        fr: "Probabilité minimale exigée (de 50% à 95%) pour que le modèle IA autorise l'ouverture d'un ordre. Plus la valeur est haute, plus l'analyse est sélective.",
        de: "Erforderliche Mindestwahrscheinlichkeit (50% bis 95%), mit der das KI-Modell einen Trade freigibt. Höhere Werte bedeuten höhere Präzision, aber weniger Trades.",
        tr: "Yapay zeka modelinin işlem açmaya izin vermesi için gereken minimum olasılık (%50 ila %95). Daha yüksek değerler daha yüksek doğruluk sağlar ancak daha az işlem fırsatı sunar.",
        es: "Probabilidad mínima requerida (del 50% al 95%) para que el modelo IA autorice la apertura de una orden. Cuanto mayor sea el valor, más selectivo será el análisis.",
      }
    }
  ],

  // ── Comparison Table ──
  compTitle: {
    en: "Simple vs Pro Plans",
    fr: "Comparatif Simple vs Pro",
    de: "Vergleich Simple vs Pro",
    tr: "Simple ve Pro Karşılaştırması",
    es: "Comparativa Simple vs Pro",
  },
  compHeaders: {
    feature: { en: "Feature", fr: "Fonctionnalité", de: "Funktion", tr: "Özellik", es: "Función" },
    simple: { en: "Custom Simple", fr: "Custom Simple", de: "Custom Simple", tr: "Custom Simple", es: "Custom Simple" },
    pro: { en: "Custom Pro", fr: "Custom Pro", de: "Custom Pro", tr: "Custom Pro", es: "Custom Pro" },
  },
  compRows: [
    {
      name: { en: "Trading Lot Size", fr: "Taille du Lot", de: "Lotgröße", tr: "Lot Büyüklüğü", es: "Tamaño del Lote" },
      simple: { en: "0.01 (Fixed)", fr: "0.01 (Fixe)", de: "0.01 (Fest)", tr: "0.01 (Sabit)", es: "0.01 (Fijo)" },
      pro: { en: "Up to 0.02 (Custom)", fr: "Jusqu'à 0.02 (Modifiable)", de: "Bis 0.02 (Anpassbar)", tr: "0.02'ye kadar (Özel)", es: "Hasta 0.02 (Modificable)" },
      isNew: false
    },
    {
      name: { en: "Minimum Profit", fr: "Profit Min", de: "Mindestgewinn", tr: "Minimum Kâr", es: "Beneficio Mínimo" },
      simple: { en: "$0.09 (Fixed)", fr: "0.09$ (Fixe)", de: "0.09$ (Fest)", tr: "0.09$ (Sabit)", es: "0.09$ (Fijo)" },
      pro: { en: "Up to $0.20 (Custom)", fr: "Jusqu'à 0.20$ (Modifiable)", de: "Bis 0.20$ (Anpassbar)", tr: "0.20$'a kadar (Özel)", es: "Hasta $0.20 (Modificable)" },
      isNew: false
    },
    {
      name: { en: "Max Stop Loss", fr: "Stop Loss Max", de: "Max. Stop-Loss", tr: "Maks. Stop Loss", es: "Stop Loss Máximo" },
      simple: { en: "-$90 (Fixed)", fr: "-90$ (Fixe)", de: "-90$ (Fest)", tr: "-90$ (Sabit)", es: "-90$ (Fijo)" },
      pro: { en: "-$85 to -$300 (Custom)", fr: "-85$ à -300$ (Modifiable)", de: "-85$ bis -300$ (Anpassbar)", tr: "-85$ ile -300$ (Özel)", es: "-85$ a -300$ (Modificable)" },
      isNew: false
    },
    {
      name: { en: "Giveback $ (Profit Protection)", fr: "Giveback $ (Protection Profit)", de: "Giveback (Gewinnschutz)", tr: "Giveback (Kâr Koruması)", es: "Giveback (Protección Ganancias)" },
      simple: { en: "$0.10 to $5.00 (Custom)", fr: "0.10$ à 5.00$ (Modifiable)", de: "0.10$ bis 5.00$ (Anpassbar)", tr: "0.10$ ile 5.00$ (Özel)", es: "0.10$ a 5.00$ (Modificable)" },
      pro: { en: "$0.10 to $100.00 (Custom)", fr: "0.10$ à 100.00$ (Modifiable)", de: "0.10$ bis 100.00$ (Anpassbar)", tr: "0.10$ ile 100.00$ (Özel)", es: "0.10$ a 100.00$ (Modificable)" },
      isNew: true
    },
    {
      name: { en: "Reset Session on Start", fr: "Reset Session au démarrage", de: "Sitzungs-Reset beim Start", tr: "Başlangıçta Seans Sıfırlama", es: "Reset de Sesión al iniciar" },
      simple: { en: "Disabled (Always resumes)", fr: "Désactivé (Reprise continue)", de: "Deaktiviert (Fortlaufend)", tr: "Devre dışı (Sürekli devam eder)", es: "Desactivado (Continuación continua)" },
      pro: { en: "Enabled (Togglable)", fr: "Activable / Désactivable", de: "Aktivierbar (Umschaltbar)", tr: "Etkin (Seçilebilir)", es: "Activable / Desactivable" },
      isNew: true
    },
    {
      name: { en: "Advanced Parameters Access", fr: "Accès Paramètres Avancés", de: "Zugang zu erweiterten Parametern", tr: "Gelişmiş Parametrelere Erişim", es: "Acceso a Parámetros Avanzados" },
      simple: { en: "No (Runs on system defaults)", fr: "Non (Paramètres par défaut)", de: "Nein (Standardeinstellungen)", tr: "Hayır (Varsayılan ayarlar)", es: "No (Ajustes por defecto)" },
      pro: { en: "Yes (Full manual control)", fr: "Oui (Contrôle total manuel)", de: "Ja (Volle manuelle Kontrolle)", tr: "Evet (Tam manuel kontrol)", es: "Sí (Control total manual)" },
      isNew: false
    }
  ],

  // ── FAQ ──
  faqTitle: {
    en: "Frequently Asked Questions",
    fr: "Questions Fréquentes",
    de: "Häufig gestellte Fragen",
    tr: "Sıkça Sorulan Sorular",
    es: "Preguntas Frecuentes",
  },
  faqs: [
    {
      q: {
        en: "Why is the bot locked and not taking any trades?",
        fr: "Pourquoi le bot est-il verrouillé et ne prend plus de positions ?",
        de: "Warum ist der Bot gesperrt und platziert keine Trades mehr?",
        tr: "Bot neden kilitlendi ve neden yeni işlem açmıyor?",
        es: "¿Por qué el bot está bloqueado y no abre posiciones?",
      },
      a: {
        en: "The bot locks itself primarily when the Giveback threshold is triggered. If the session profit drops by the Giveback value from its peak, the bot secures the remaining profits and locks further entries. It also stops trading if the maximum stop loss is hit, if there's insufficient volatility, or if the market is outside of active scalping hours.",
        fr: "Le bot se verrouille principalement lorsque le seuil de Giveback est franchi. Si le gain retombe depuis le sommet de la valeur du Giveback, le bot fige la session pour sécuriser vos gains. Il s'arrête aussi si le Stop Loss Max est touché, en cas de volatilité insuffisante, ou si le marché est hors des heures propices de scalping.",
        de: "Der Bot sperrt sich hauptsächlich, wenn die Giveback-Schwelle erreicht wird. Wenn der Gewinn seit dem Höchststand um den Giveback-Wert fällt, friert der Bot die Sitzung ein, um Gewinne zu sichern. Er stoppt auch, wenn der maximale Stop-Loss erreicht ist, bei mangelnder Volatilität oder außerhalb der Handelszeiten.",
        tr: "Bot, öncelikle Giveback eşiği aşıldığında kendini kilitler. Oturum kârı zirve noktasından Giveback değeri kadar düşerse, bot kazançları korumak için oturumu dondurur. Ayrıca, Maks. Stop Loss seviyesine ulaşıldığında, yetersiz oynaklık durumunda veya piyasa aktif scalping saatlerinin dışındaysa işlem yapmayı durdurur.",
        es: "El bot se bloquea principalmente cuando se alcanza el umbral de Giveback. Si el beneficio de la sesión cae desde el pico por el valor del Giveback, el bot congela la sesión para asegurar sus ganancias. También se detiene si se toca el Stop Loss Máximo, si no hay suficiente volatilidad o si el mercado está fuera del horario de scalping.",
      }
    },
    {
      q: {
        en: "Does resetting the session wipe out the AI's training?",
        fr: "Est-ce que cocher 'Repartir à zéro' efface l'apprentissage de l'IA ?",
        de: "Löscht das Zurücksetzen der Sitzung das Training der KI?",
        tr: "'Repartir à zéro / Sıfırdan Başla' seçeneği yapay zekanın öğrenmesini sıfırlar mı?",
        es: "¿El marcar 'Reiniciar sesión' borra el aprendizaje de la IA?",
      },
      a: {
        en: "No. The 'Reset Session' (Repartir à zéro) option only resets local session metrics such as the peak profit, current session profit, and trade count back to 0. It does not affect the artificial intelligence core, machine learning weights, or the conversational coach memory. Your bot retains all its global learned intelligence.",
        fr: "Non. L'option 'Repartir à zéro' (Reset Session) réinitialise uniquement les indicateurs locaux de la session en cours (sommet de gain, profit cumulé, nombre de trades). Cela n'a aucun impact sur le modèle d'intelligence artificielle, les poids d'apprentissage automatique (ML Sync) ou la mémoire du coach. Le bot conserve toute son expérience.",
        de: "Nein. Die Option 'Sitzungs-Reset' (Repartir à zéro) setzt lediglich die lokalen Indikatoren der aktuellen Sitzung (Spitzengewinn, aufgelaufener Gewinn, Anzahl der Trades) zurück. Dies hat keine Auswirkungen auf das KI-Modell, die Lerneinstellungen (ML Sync) oder das Gedächtnis. Der Bot behält seine gesamte Erfahrung.",
        tr: "Hayır. 'Repartir à zéro' (Oturumu Sıfırla) seçeneği yalnızca en yüksek kâr, mevcut oturum kârı ve işlem sayısı gibi yerel oturum göstergelerini sıfırlar. Yapay zeka çekirdeğini, makine öğrenimi ağırlıklarını (ML Sync) veya koç hafızasını etkilemez. Botunuz tüm küresel öğrenilmiş deneyimini korur.",
        es: "No. La opción 'Reiniciar sesión' (Repartir à zéro) solo restablece los indicadores locales de la sesión actual (pico de ganancias, beneficio acumulado, número de operaciones). No tiene ningún impacto en el núcleo del modelo de IA, los pesos de aprendizaje automático (ML Sync) o la memoria del coach. El bot conserva toda su experiencia.",
      }
    },
    {
      q: {
        en: "Why don't I see Stop Loss (SL) or Take Profit (TP) orders in MetaTrader 5?",
        fr: "Pourquoi le SL et le TP ne s'affichent pas sur mon MetaTrader 5 ?",
        de: "Warum sehe ich keine Stop-Loss (SL) oder Take-Profit (TP) Orders in MT5?",
        tr: "MetaTrader 5'te neden Stop Loss (SL) veya Take Profit (TP) emirlerini göremiyorum?",
        es: "¿Por qué no se muestran el SL y el TP en mi MetaTrader 5?",
      },
      a: {
        en: "Ava Trading uses internal 'soft' Stop Loss and Take Profit levels managed directly by our AI engine. Since orders are monitored and closed dynamically by the bot, they are not registered on the broker's books. This prevents brokers from hunting your stops and protects our proprietary algorithms from reverse-engineering.",
        fr: "Ava Trading utilise des Stop Loss et Take Profit 'soft' gérés en interne par notre moteur IA. Comme les ordres sont surveillés et clôturés dynamiquement par le bot, ils ne sont pas visibles chez le courtier. Cela évite la chasse aux stops par les brokers et protège notre technologie contre le reverse-engineering.",
        de: "Ava Trading verwendet interne, 'weiche' Stop-Loss- und Take-Profit-Level, die direkt von unserer KI verwaltet werden. Da die Orders vom Bot dynamisch überwacht und geschlossen werden, sind sie beim Broker nicht sichtbar. Dies verhindert Stop-Hunting durch Broker und schützt unsere Technologie vor Reverse-Engineering.",
        tr: "Ava Trading, doğrudan yapay zeka motorumuz tarafından yönetilen dahili 'esnek' Stop Loss ve Take Profit seviyeleri kullanır. İşlemler bot tarafından dinamik olarak izlendiği ve kapatıldığı için aracı kurumda görünmezler. Bu, aracı kurumların stop seviyelerinizi hedeflemesini (stop hunting) önler ve teknolojimizi tersine mühendisliğe karşı korur.",
        es: "Ava Trading utiliza niveles de Stop Loss y Take Profit 'soft' gestionados internamente por nuestro motor de IA. Como las órdenes son monitoreadas y cerradas dinámicamente por el bot, no son visibles para el bróker. Esto evita la caza de stops por parte de los brókers y protege nuestra tecnología contra la ingeniería inversa.",
      }
    }
  ]
};

function TargetIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const tl = useTl();
  return (
    <footer className="border-t border-white/[0.06] py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Ava" className="w-8 h-8 rounded-full object-cover shadow-md shadow-rose-500/20" style={{ objectPosition: "center 45%" }} />
              <span className="font-black text-white">Ava</span>
            </div>
            <p className="text-white/25 text-sm leading-relaxed max-w-xs">
              {tl({
                en: "Your personal voice assistant and AI trading companion.",
                fr: "Votre assistant vocal personnel et compagnon de trading IA.",
                de: "Ihr persönlicher Sprachassistent und KI-Trading-Begleiter.",
                tr: "Kişisel sesli asistanınız ve yapay zeka işlem ortağınız.",
                es: "Su asistente de voz personal y compañero de trading IA.",
              })}
            </p>
          </div>
          <div>
            <p className="text-white/45 text-[10px] font-bold uppercase tracking-widest mb-4">
              {tl({ en: "Download", fr: "Télécharger", de: "Download", tr: "İndir", es: "Descargar" })}
            </p>
            <ul className="space-y-2.5">
              {[
                ["iOS App", "https://apps.apple.com/app/ava-ai-voice-assistant/id6744959525"],
                ["Android App", "https://play.google.com/store/apps/details?id=com.kemyamo.ava"],
                ["Mac (Apple Silicon)", DOWNLOADS.macArm],
                ["Mac (Intel)", DOWNLOADS.macIntel],
                ["Windows", DOWNLOADS.windows],
              ].map(([l, h]) => (
                <li key={l}><a href={h} className="text-white/35 hover:text-white text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white/45 text-[10px] font-bold uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2.5">
              {[
                [tl({ en: "Blog", fr: "Blog", de: "Blog", tr: "Blog", es: "Blog" }), "/blog"],
                [tl({ en: "Terms of Use", fr: "Conditions d'utilisation", de: "Nutzungsbedingungen", tr: "Kullanım Şartları", es: "CGU" }), "/cgu"],
                [tl({ en: "Privacy Policy", fr: "Confidentialité", de: "Datenschutz", tr: "Gizlilik", es: "Confidencialidad" }), "/confidentialite"],
                [tl({ en: "Refund Policy", fr: "Remboursement", de: "Rückerstattung", tr: "İade Politikası", es: "Reembolso" }), "/remboursement"],
                [tl({ en: "Support", fr: "Support", de: "Support", tr: "Destek", es: "Soporte" }), "/support"],
              ].map(([l, h]) => (
                <li key={l}><a href={h} className="text-white/35 hover:text-white text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white/45 text-[10px] font-bold uppercase tracking-widest mb-4">Community</p>
            <ul className="space-y-2.5">
              {[
                ["WhatsApp Channel", "https://whatsapp.com/channel/0029VbCsZ3A6WaKv6TLkxO0r"],
                ["Twitter / X", "https://x.com/woonixltd"],
              ].map(([l, h]) => (
                <li key={l}><a href={h} className="text-white/35 hover:text-white text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-6 space-y-4">
          <p className="text-white/20 text-[11px] leading-relaxed">
            {tl({
              en: "Trading financial instruments involves high risks. AI models make predictions based on mathematical models, which do not guarantee future profits. Do not trade with capital you cannot afford to lose.",
              fr: "Le trading d'instruments financiers comporte des risques élevés. Les modèles d'IA effectuent des prédictions basées sur des modèles mathématiques, ce qui ne garantit pas les gains futurs. Ne tradez pas avec un capital que vous ne pouvez pas vous permettre de perdre.",
              de: "Der Handel mit Finanzinstrumenten birgt hohe Risiken. KI-Modelle treffen Vorhersagen auf der Grundlage mathematischer Modelle, die keine zukünftigen Gewinne garantieren. Handeln Sie nicht mit Kapital, das Sie sich nicht leisten können zu verlieren.",
              tr: "Finansal enstrümanların ticareti yüksek riskler içerir. Yapay zeka modelleri, gelecekteki kârı garanti etmeyen matematiksel modellere dayanarak tahminler yapar. Kaybetmeyi göze alamayacağınız sermaye ile işlem yapmayın.",
              es: "El trading de instrumentos financieros conlleva altos riesgos. Los modelos de IA realizan predicciones basadas en modelos matemáticos, lo que no garantiza ganancias futuras. No opere con capital que no pueda permitirse perder.",
            })}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/18 text-xs">© {new Date().getFullYear()} Ava — Woonix LTD</p>
            <p className="text-white/18 text-xs">Made with ❤️ for smart traders</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function TradingExplanationPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as Lang | null;
    if (saved && SUPPORTED_LANGS.includes(saved)) { setLang(saved); return; }
    const detected = (navigator.language || '').slice(0, 2).toLowerCase() as Lang;
    setLang(SUPPORTED_LANGS.includes(detected) ? detected : 'en');
  }, []);

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem(LANG_STORAGE_KEY, l);
  };

  const tl = (obj: TL): string => obj[lang] ?? obj.en;

  return (
    <LangCtx.Provider value={{ lang, setLang: handleSetLang }}>
      <main className="bg-[#020617] min-h-screen text-slate-100 font-sans antialiased overflow-x-hidden">
        
        {/* Navigation */}
        <Navbar />

        {/* ─── Hero Section ─── */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(225,29,72,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_50%)]" />
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }} />

          <div className="max-w-6xl mx-auto px-6 relative">
            <div className="max-w-3xl mx-auto text-center">
              <FadeUp>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6">
                  <Sparkles size={12} className="text-rose-400" />
                  <span className="text-rose-400 text-xs font-bold tracking-wide uppercase">{tl(PAGE_T.heroBadge)}</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
                  {tl(PAGE_T.heroH1)}
                  <br />
                  <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-blue-500 bg-clip-text text-transparent">
                    {tl(PAGE_T.heroH2)}
                  </span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
                  {tl(PAGE_T.heroSub)}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <motion.a href={DOWNLOADS.ea}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm shadow-xl shadow-rose-500/25 transition-all">
                    <Download size={16} />
                    <span>Download AvaBridgeEA (v1.11)</span>
                  </motion.a>
                  <motion.a href="/#pricing"
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-sm transition-all">
                    <span>{tl({ en: "View Pricing", fr: "Voir les tarifs", de: "Tarife anzeigen", tr: "Fiyatları Gör", es: "Ver precios" })}</span>
                  </motion.a>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ─── Prerequisites Section ─── */}
        <section className="py-20 border-t border-white/[0.06] relative">
          <div className="max-w-6xl mx-auto px-6">
            <FadeUp className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                {tl(PAGE_T.prereqTitle)}
              </h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">
                {tl(PAGE_T.prereqSub)}
              </p>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PAGE_T.prereqs.map((prereq, index) => (
                <FadeUp key={index} delay={index * 0.05}>
                  <div className="h-full p-6 rounded-3xl border border-white/[0.08] bg-slate-900/30 backdrop-blur-md flex flex-col">
                    <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5 text-rose-400 font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-3">{tl(prereq.title)}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed flex-grow">{tl(prereq.desc)}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Setup Guide ─── */}
        <section className="py-20 border-t border-white/[0.06] bg-slate-950/40 relative">
          <div className="max-w-6xl mx-auto px-6">
            <FadeUp className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                {tl(PAGE_T.setupTitle)}
              </h2>
            </FadeUp>

            <div className="max-w-4xl mx-auto relative border-l border-white/10 pl-6 md:pl-10 space-y-12">
              {PAGE_T.steps.map((step, index) => (
                <FadeUp key={index} delay={index * 0.08} className="relative">
                  <div className="absolute -left-[39px] md:-left-[55px] w-6 h-6 md:w-8 md:h-8 rounded-full bg-rose-500 border-4 border-[#020617] flex items-center justify-center text-[10px] md:text-xs font-black text-white">
                    {index + 1}
                  </div>
                  <div className="p-6 rounded-3xl border border-white/[0.08] bg-slate-900/20">
                    <h3 className="text-white font-bold text-lg mb-2">{tl(step.title)}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{tl(step.desc)}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Parameters Explanation ─── */}
        <section className="py-20 border-t border-white/[0.06] relative">
          <div className="max-w-6xl mx-auto px-6">
            <FadeUp className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                {tl(PAGE_T.paramTitle)}
              </h2>
              <p className="text-slate-400 text-base max-w-xl mx-auto">
                {tl(PAGE_T.paramSub)}
              </p>
            </FadeUp>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {PAGE_T.params.map((param, index) => {
                const Icon = param.icon;
                return (
                  <FadeUp key={index} delay={index * 0.05}>
                    <div className="p-6 rounded-3xl border border-white/[0.08] bg-slate-900/30 hover:border-rose-500/20 transition-all flex gap-4 items-start">
                      <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-rose-400 flex-shrink-0">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-base mb-2">{param.name}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{tl(param.desc)}</p>
                      </div>
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Comparison Table ─── */}
        <section className="py-20 border-t border-white/[0.06] bg-slate-950/40 relative">
          <div className="max-w-5xl mx-auto px-6">
            <FadeUp className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                {tl(PAGE_T.compTitle)}
              </h2>
            </FadeUp>

            <FadeUp>
              <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/20 backdrop-blur-md">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="p-5 text-sm font-bold uppercase tracking-wider text-slate-400">{tl(PAGE_T.compHeaders.feature)}</th>
                      <th className="p-5 text-sm font-bold uppercase tracking-wider text-slate-400 text-center">{tl(PAGE_T.compHeaders.simple)}</th>
                      <th className="p-5 text-sm font-bold uppercase tracking-wider text-rose-400 text-center">{tl(PAGE_T.compHeaders.pro)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAGE_T.compRows.map((row, index) => (
                      <tr key={index} className="border-b border-white/[0.06] hover:bg-white/[0.01] transition-colors">
                        <td className="p-5 font-bold text-sm text-white flex items-center gap-2">
                          {tl(row.name)}
                          {row.isNew && (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/20">
                              NEW v1.1.1
                            </span>
                          )}
                        </td>
                        <td className="p-5 text-slate-400 text-sm text-center font-medium">{tl(row.simple)}</td>
                        <td className="p-5 text-rose-300 text-sm text-center font-semibold">{tl(row.pro)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ─── FAQ Section ─── */}
        <section className="py-20 border-t border-white/[0.06] relative">
          <div className="max-w-3xl mx-auto px-6">
            <FadeUp className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                {tl(PAGE_T.faqTitle)}
              </h2>
            </FadeUp>

            <div className="space-y-4">
              {PAGE_T.faqs.map((faq, idx) => (
                <FadeUp key={idx} delay={idx * 0.05}>
                  <div className="rounded-3xl border border-white/[0.08] bg-slate-900/30 overflow-hidden">
                    <button
                      onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-6 text-left gap-4 transition-colors hover:bg-white/[0.01]"
                    >
                      <span className="text-white font-bold text-base">{tl(faq.q)}</span>
                      <motion.div
                        animate={{ rotate: activeFaq === idx ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 text-slate-400"
                      >
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>
                    <AnimatePresence initial={false}>
                      {activeFaq === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="p-6 pt-0 text-slate-400 text-sm leading-relaxed border-t border-white/[0.04] mt-1 pt-4">
                            {tl(faq.a)}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />

      </main>
    </LangCtx.Provider>
  );
}
