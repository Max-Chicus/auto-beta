import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Funcție pentru generarea slug-ului (IDENTICĂ cu cea din Home.jsx)
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[șȘ]/g, 's')
    .replace(/[țȚ]/g, 't')
    .replace(/[ăĂ]/g, 'a')
    .replace(/[îÎ]/g, 'i')
    .replace(/[âÂ]/g, 'a')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '');
}

// Definim toate tipurile de servicii (FĂRĂ câmpul slug)
const SERVICE_TYPES = [
  {
    id: 1,
    title: "Ceasuri, panou de bord",
    icon: "📊",
    image: "/gama-1.webp",
    description: "Reparăm și reprogramăm toate tipurile de panouri de bord pentru afișare corectă a informațiilor vehiculului.",
    seoTitle: "Reparație Panou Bord Auto - Instrument Cluster | Derstronik",
    seoDescription: "Service specializat în reparația panourilor de bord auto (instrument cluster). Reparăm afișaje defecte, pixeli lipsă, indicatoare eronate și probleme de comunicare CAN. Garanție 12 luni.",
    features: [
      "Defecțiunea instrumentelor analogice",
      "Defecțiunea afișajelor digitale",
      "Defecțiune la iluminarea panoului de bord",
      "Defecțiune totală a panoului de bord",
      "Acele indicatoare rămân blocate sau vibrează"
    ],
    longDescription: "Panoul de bord (instrument cluster) este elementul central prin care șoferul primește informații esențiale despre starea vehiculului. Defecțiunile acestuia pot varia de la probleme minore de iluminare până la defecțiuni complete care afectează siguranța în trafic. La Derstronik, diagnosticăm și reparăm toate tipurile de panouri de bord, indiferent de marcă sau model, folosind echipamente profesionale și componente de calitate."
  },
  {
    id: 2,
    title: "Chei auto și imobilizatoare",
    icon: "🔑",
    image: "/gama-2.webp",
    description: "Reprogramare chei originale, clonare transpondere, reparare unități imobilizator și service chei pentru toate mărcile auto.",
    seoTitle: "Programare Chei Auto și Imobilizatoare | Derstronik",
    seoDescription: "Service specializat în programare chei auto, clonare transpondere, reparație imobilizatoare și recuperare chei pierdute pentru toate mărcile. Diagnosticare gratuită.",
    features: ["Reprogramare chei", "Clonare transponder", "Reparație imobilizator", "Chei pierdute", "Programare unitate de control Immo"],
    longDescription: "Serviciul nostru de programare chei auto acoperă toate mărcile și modelele de vehicule. De la chei simple până la sisteme complexe de imobilizator și chei inteligente (keyless), folosim echipamente de ultimă generație pentru a oferi soluții rapide și sigure."
  },
  {
    id: 3,
    title: "Reparație Sisteme multimedia",
    icon: "📱",
    image: "/gama-3.webp",
    description: "Reparație și actualizare pentru sisteme audio, display-uri centrale, navigație și unități head-unit.",
    seoTitle: "Reparație Sisteme Multimedia Auto | Derstronik",
    seoDescription: "Service specializat în reparația sistemelor multimedia auto: ecrane, navigație, unități audio și head-unit. Diagnosticare gratuită și reparație rapidă.",
    features: [
      "CD / DVD nu mai funcționează",
      "Ecran alb sau negru",
      "Navigația nu pornește sau se repornește mereu",
      "Navigația nu poate găsi locația",
      "Lipsă sunet sau imagine"
    ],
    longDescription: "Sistemele multimedia moderne sunt esențiale pentru confortul și siguranța în mașină. De la ecrane centrale defecte la unități audio care nu mai funcționează, diagnosticăm și reparăm toate tipurile de sisteme multimedia auto."
  },
  {
    id: 4,
    title: "Reparație unități de control Cutii de viteze automate",
    icon: "⚡",
    image: "/gama-4.webp",
    description: "Diagnosticare și reparație unități de control pentru transmisii automate (TCU), resetare adaptări și optimizare schimbare viteze.",
    seoTitle: "Reparație Unități Control Cutii Viteze Automate TCU | Derstronik",
    seoDescription: "Service specializat în reparația unităților de control pentru cutii de viteze automate (TCU). Diagnosticare avansată, resetare adaptări și optimizare schimbare trepte.",
    features: [
      "Probleme de comunicare",
      "Lipsă semnal de viteză a treptelor",
      "Schimbarea treptelor imposibil",
      "Lipsă afișarea treptelor",
      "Activare mod avarie"
    ],
    longDescription: "Cutia de viteze automată este unul dintre cele mai complexe sisteme ale unui vehicul. Unitățile de control (TCU) gestionează schimbarea treptelor și pot dezvolta defecțiuni care afectează performanța. La Derstronik, diagnosticăm și reparăm TCU-uri pentru toate mărcile."
  },
  {
    id: 5,
    title: "Reparație unități de control Airbag",
    icon: "🛡️",
    image: "/gama-5.webp",
    description: "Resetare și reparare unități de control airbag după accident, dezactivare erori și testare funcționalitate sisteme de siguranță.",
    seoTitle: "Reparație Unități Control Airbag - Ștergere Crash Data | Derstronik",
    seoDescription: "Service specializat în resetare și reparație unități de control airbag după accident. Ștergere crash data, eliminare erori și testare sisteme de siguranță. Garanție 12 luni.",
    features: [
      "Resetare airbag după accidente",
      "Eliminare erori interne",
      "Ștergere erori",
      "Testarea sistemului",
      "Programarea/Înlocuirea unităților Airbag"
    ],
    longDescription: "Unitățile de control airbag sunt esențiale pentru siguranța pasagerilor. După un accident, acestea blochează datele și trebuie resetate sau reparate profesional. La Derstronik, oferim servicii complete de reparație și resetare pentru toate tipurile de unități airbag."
  },
  {
    id: 6,
    title: "Reparație pentru ABS / ESP",
    icon: "🛞",
    image: "/gama-6.webp",
    description: "Reparație unități de control pentru sisteme de frânare antiblocare și control stabilitate, calibrare senzori și reprogramare.",
    seoTitle: "Reparație ABS și ESP - Unități de Control | Derstronik",
    seoDescription: "Service specializat în reparația unităților ABS și ESP pentru toate mărcile. Diagnosticare avansată, calibrare senzori și reprogramare. Garanție 12 luni.",
    features: [
      "Sunt afișate erori ale senzorilor de roată",
      "Probleme/erori de comunicare",
      "Funcționare ABS neplauzibilă / incorectă",
      "Eroare la motorul pompei sau motorul pompei funcționează permanent",
      "Lipsă presiune de frânare la una dintre roți"
    ],
    longDescription: "ABS și ESP sunt sisteme critice pentru siguranța vehiculului. Defecțiunile acestora pot compromite frânarea și stabilitatea. La Derstronik, diagnosticăm și reparăm unitățile de control ABS și ESP pentru toate mărcile."
  },
  {
    id: 7,
    title: "Reparație unități de control electronice pentru vehicule comerciale",
    icon: "🚛",
    image: "/gama-7.webp",
    description: "Efectuăm reparații expres a unităților de control electronice pentru vehicule comerciale (Motor, Cutie de viteză, sistem de frânare, unități electronice centrale, Ceasuri panouri de bord).",
    seoTitle: "Reparație Unități Electronice Vehicule Comerciale | Derstronik",
    seoDescription: "Service specializat în reparația unităților electronice pentru camioane și vehicule comerciale. Reparații expres pentru ECU, TCU, EBS și panouri de bord.",
    features: [
      "Procesare rapidă – vehiculele revin pe drum rapid",
      "Reducere până la 70% comparativ cu achiziția unei unități noi",
      "Diagnosticare avansată și reparație ECU",
      "Compatibilitate cu toate tipurile de vehicule comerciale"
    ],
    longDescription: "Vehiculele comerciale necesită servicii specializate pentru a minimiza timpul de nefuncționare. Derstronik oferă reparații expres pentru unitățile de control electronice ale camioanelor și autoutilitarelor."
  },
  {
    id: 8,
    title: "Reparația unităților electronice (ECU) motor",
    icon: "⚙️",
    image: "/gama-8.webp",
    description: "Diagnosticăm și reparăm unitățile de control motor pentru funcționare optimă, programare și resoftare.",
    seoTitle: "Reparație Unități de Control Motor ECU | Derstronik",
    seoDescription: "Service specializat în reparația unităților de control motor (ECU). Diagnosticare avansată, programare, resoftare și optimizare performanță. Garanție 12 luni.",
    features: [
      "Funcționare motor incorect",
      "Lipsă semnal injectoare/bobine",
      "Programare/optimizare/resoftare",
      "Alimentare senzori incorectă",
      "Lipsă comunicare cu unitatea de control"
    ],
    longDescription: "Unitatea de control motor (ECU) este creierul motorului, gestionând injecția, aprinderea și toate funcțiile esențiale. La Derstronik, diagnosticăm și reparăm toate tipurile de ECU."
  },
  {
    id: 9,
    title: "Reparație contacte de cheie, unitate blocare volan EZS/ELV",
    icon: "🔑",
    image: "/gama-9.webp",
    description: "Diagnosticăm și reparăm unitățile electronice de contact și blocare volan pentru sistemele de imobilizare și pornire.",
    seoTitle: "Reparație EZS/ELV și Blocare Volan | Derstronik",
    seoDescription: "Service specializat în reparația unităților EZS/ELV și contactelor de cheie. Diagnosticare avansată pentru probleme de imobilizare și pornire motor.",
    features: [
      "Probleme/erori de comunicare",
      "Permisiune pornire motor blocată",
      "Date corupte",
      "Probleme mecanice",
      "Lipsă sincronizare (EZS/ELV)"
    ],
    longDescription: "Sistemul EZS și ELV sunt componente esențiale pentru pornirea și securitatea vehiculului. Derstronik oferă reparații profesionale pentru EZS, ELV și contacte de cheie."
  },
  {
    id: 10,
    title: "Reparație selectoare de viteză",
    icon: "🕹️",
    image: "/gama-10.webp",
    description: "Diagnosticăm și reparăm selectoarele electronice de viteză pentru transmisii automate și semiautomate.",
    seoTitle: "Reparație Selectoare de Viteză Auto | Derstronik",
    seoDescription: "Service specializat în reparația selectoarelor electronice de viteză. Diagnosticare avansată pentru transmisii automate și semiautomate.",
    features: [
      "Lipsa comunicarea cu unitatea electronică",
      "Afișare falsă a vitezelor",
      "Probleme mecanice",
      "Blocarea manetei în poziția P"
    ],
    longDescription: "Selectoarele de viteză electronice sunt componente critice pentru transmisiile automate. Derstronik repară toate tipurile de selectoare electronice."
  },
  {
    id: 11,
    title: "Reparație unitate centrală electronică (BDC, BSM, FEM, BSI)",
    icon: "💻",
    image: "/gama-11.webp",
    description: "Diagnosticăm și reparăm unitățile centrale electronice care gestionează funcțiile caroseriei, iluminatul și sistemele de confort.",
    seoTitle: "Reparație Unități Centrale BDC, BSM, FEM, BSI | Derstronik",
    seoDescription: "Service specializat în reparația unităților centrale electronice BDC, BSM, FEM și BSI. Diagnosticare avansată pentru funcții caroserie și confort.",
    features: [
      "Lumini interioare/exterioare nefuncționale",
      "Lipsă comunicare",
      "Unitatea prezintă erori eronate",
      "Date corupte sau pierdute",
      "Alte/diferite funcții nefuncționale"
    ],
    longDescription: "Unitățile centrale electronice (BDC, BSM, FEM, BSI) gestionează funcțiile caroseriei, iluminatul și sistemele de confort. Derstronik oferă diagnosticare și reparație specializată."
  },
  {
    id: 12,
    title: "Programare Unități Electronice Motor (ECU)",
    icon: "🧠",
    image: "/gama-12.webp",
    description: "Optimizare software, activare/dezactivare sisteme ecologice, dezactivare imobilizator (IMMO OFF) și restabilire software original.",
    seoTitle: "Programare și Optimizare Unități ECU | Derstronik",
    seoDescription: "Service specializat în programare și optimizare ECU. Resoftare, dezactivare imobilizator, activare/dezactivare sisteme și restabilire software original.",
    features: [
      "Optimizare software (creștere putere)",
      "Activare / dezactivare sisteme ecologice",
      "Dezactivare imobilizator (IMMO OFF)",
      "Restabilire software original (reprogramare ECU)"
    ],
    longDescription: "Programarea ECU este esențială pentru optimizarea performanței. Derstronik oferă servicii complete de programare ECU, resoftare și dezactivare imobilizator."
  },
  {
    id: 13,
    title: "Reparații baterii Lithium-Ion",
    icon: "🔋",
    image: "/gama-13.webp",
    description: "Erori în panoul de bord sau modulul BMS",
    seoTitle: "Reparații Baterii Lithium-Ion și Module BMS | Derstronik",
    seoDescription: "Service specializat în reparația bateriilor Li-Ion și modulelor BMS pentru vehicule electrice și hibride.",
    features: [
      "Sistemul 12V indică tensiune scăzută",
      "Baterie descărcată profund sau fără funcționare",
      "Descărcare profundă după utilizare necorespunzătoare sau accident"
    ],
    longDescription: "Bateriile Lithium-Ion și modulele BMS sunt inima vehiculelor electrice și hibride. Derstronik oferă diagnosticare și reparație specializată."
  },
  {
    id: 14,
    title: "Programare chei pentru camioane",
    icon: "🔑",
    image: "/gama-14.webp",
    description: "Programare chei, recuperare chei pierdute, service imobilizator (IMMO)",
    seoTitle: "Programare Chei pentru Camioane și Vehicule Comerciale | Derstronik",
    seoDescription: "Service specializat în programare chei pentru camioane și vehicule comerciale. Recuperare chei pierdute, service imobilizator și diagnosticare IMMO.",
    features: [
      "Programare chei noi pentru camioane",
      "Recuperare chei pierdute sau deteriorate",
      "Programare/dezactivare imobilizator (IMMO)",
      "Reparație unități imobilizator",
      "Diagnoză sistem imobilizator camion"
    ],
    longDescription: "Cheile pentru camioane implică sisteme avansate de imobilizare. Derstronik oferă servicii complete de programare chei pentru camioane."
  }
];

function ServiceTypePage() {
  const { serviceSlug } = useParams();
  
  // Găsește tipul de serviciu generând slug-ul dinamic
  const serviceData = SERVICE_TYPES.find(st => generateSlug(st.title) === serviceSlug);

  if (!serviceData) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Serviciul nu a fost găsit</h2>
        <Link to="/services" className="mt-4 inline-block text-red-600 hover:text-red-800">
          ← Înapoi la servicii
        </Link>
      </div>
    );
  }

  const service = serviceData;

  return (
    <>
      <Helmet>
        <title>{service.seoTitle}</title>
        <meta name="description" content={service.seoDescription} />
        <meta name="keywords" content={service.features.join(', ')} />
        <link rel="canonical" href={`https://www.derstronik.md/service-type/${generateSlug(service.title)}`} />
        <meta property="og:title" content={service.seoTitle} />
        <meta property="og:description" content={service.seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://www.derstronik.md/service-type/${generateSlug(service.title)}`} />
        <meta property="og:image" content={`https://www.derstronik.md${service.image}`} />
      </Helmet>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-red-600">Acasă</Link>
          <span className="mx-2">›</span>
          <Link to="/services" className="hover:text-red-600">Servicii</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900 font-medium">{service.title}</span>
        </nav>

        {/* Hero Section - Modern */}
        <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-3xl overflow-hidden mb-12">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 p-8 md:p-12 lg:p-16 text-white">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-6xl md:text-7xl">{service.icon}</span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold">{service.title}</h1>
            </div>
            <p className="text-xl md:text-2xl text-red-100 max-w-3xl">{service.description}</p>
            <div className="flex flex-wrap gap-4 mt-6">
              <Link
                to="/request-service"
                className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition shadow-lg"
              >
                Solicită serviciu
              </Link>
              <a
                href="tel:+37369857294"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
              >
                📞 +373 69 857 294
              </a>
            </div>
          </div>
          {/* Elemente decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-20 -mb-20"></div>
        </div>

        {/* Conținut principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coloana principală */}
          <div className="lg:col-span-2 space-y-8">
            {/* Imagine */}
            <div className="bg-white border rounded-2xl overflow-hidden shadow-lg">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-64 md:h-80 lg:h-96 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/800x400?text=Derstronik+Service';
                }}
              />
            </div>

            {/* Descriere */}
            <div className="bg-white border rounded-2xl p-6 md:p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Despre {service.title}</h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {service.longDescription}
              </p>
            </div>

            {/* Caracteristici */}
            <div className="bg-gray-50 border rounded-2xl p-6 md:p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ce remediem</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-red-200 transition">
                    <span className="text-red-500 text-xl">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA intern */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 md:p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ai nevoie de {service.title}?</h3>
              <p className="text-gray-600 mb-4">Contactează-ne pentru o consultație gratuită și diagnosticare.</p>
              <Link
                to="/request-service"
                className="inline-block bg-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-700 transition shadow-lg"
              >
                Solicită acum
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Beneficii */}
            <div className="bg-white border rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-4">De ce Derstronik?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Diagnosticare inclusa in preț</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Garanție 12 luni</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Service în Chișinău</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Toate mărcile auto</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Transport în regim propriu</span>
                </li>
              </ul>
            </div>

            {/* Alte servicii */}
            <div className="bg-white border rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-4">Alte tipuri de servicii</h3>
              <ul className="space-y-2">
                {SERVICE_TYPES
                  .filter(st => generateSlug(st.title) !== generateSlug(service.title))
                  .slice(0, 14)
                  .map(st => (
                    <li key={st.id}>
                      <Link
                        to={`/service-type/${generateSlug(st.title)}`}
                        className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition p-2 rounded-lg hover:bg-red-50"
                      >
                        <span>{st.icon}</span>
                        <span>{st.title}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
              <Link to="/services" className="block mt-4 text-red-600 hover:text-red-800 font-medium">
                Vezi toate serviciile →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ServiceTypePage;