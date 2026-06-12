import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Despre Noi | Derstronik - Service Electronică Auto Chișinău</title>
        <meta name="description" content="Derstronik - service specializat în reparația unităților electronice auto. Peste 10 ani experiență în reparații ECU, ABS, Airbag, panouri de bord și programare chei în Chișinău." />
        <link rel="canonical" href="https://www.derstronik.md/about" />
        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Acasă",
                "item": "https://www.derstronik.md/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Despre Noi",
                "item": "https://www.derstronik.md/about"
              }
            ]
          }`}
        </script>
      </Helmet>
      <div className="min-h-screen">
        {/* HERO SECTION */}
        <div className="relative bg-gradient-to-r from-gray-900 to-red-900 text-white overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/about-hero.webp"
              alt="Despre noi - DersTronik"
              className="w-full h-full object-cover opacity-30"
            />
          </div>

          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                D E R S T R O N I K
              </h1>
              <p className="text-2xl md:text-3xl mb-8 text-gray-200 font-light">
                Testarea și repararea profesională a echipamentului auto electronic
              </p>
              <div className="inline-block bg-red-600 px-6 py-2 rounded-full">
                <span className="text-lg">✓ Atelier autorizat ✓ Garanție 12 luni ✓ Experiență</span>
              </div>
            </div>
          </div>
        </div>
        

        {/* DESPRE NOI */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Despre DERSTRONIK SRL
              </h2>
              <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                <p>
                  DERSTRONIK SRL este un atelier specializat în <strong>electronica auto</strong>, oferind servicii complete de
                  diagnosticare, întreținere și reparație pentru <strong>autoturisme și camioane</strong>.
                </p>
                <h3>Serviciile noastre includ:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Reparații <strong>panouri și ceasuri de bord</strong>, display-uri și sisteme multimedia</li>
                  <li>Unități de control: <strong>ECU motor, ABS/ESP, Airbag (SRS), EZS/EIS, BSI/UCH</strong>, unități
                    pentru transmisie și pompe</li>
                  <li>Calculatoare de bord și alte instrumente de afișare pentru vehicule</li>
                </ul>
                <p className="pt-4">
                  Punem accent pe <strong>precizie, calitate și atenție individuală pentru fiecare client</strong>, oferind servicii
                  la <strong>prețuri corecte și transparente</strong>.
                </p>
                <p>
                  Colaborăm cu <strong>dealeri auto și ateliere</strong>, oferind o alternativă sigură, fiabilă și mai economică față
                  de înlocuirea scumpă a modulelor cu piese noi.
                </p>
                <p>
                  Contactați-ne pentru reparații profesionale la unități de comandă pentru <strong>motor, cutie de viteze,
                    ABS, Airbag, ceasuri/panouri de bord</strong> sau alte module electronice.
                </p>
              </div>
            </div>

            <div className="relative">
              <img
                src="/about-1.webp"
                alt="Echipamente de testare electronică auto"
                className="rounded-2xl shadow-2xl"
              />
              {/* <div className="absolute -bottom-6 -right-6 bg-red-600 text-white p-6 rounded-2xl shadow-xl max-w-xs">
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-lg">Ani de experiență în electronică auto</div>
            </div> */}
            </div>
          </div>
        </div>

        {/* EXPERTIZA SI DIAGNOSTICARE */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="bg-white p-8 rounded-2xl shadow-lg h-full">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Tehnologia modernă și expertiza specializată
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Tehnologia vehiculelor moderne este în continuă dezvoltare pentru a vă oferi
                    un confort de condus de primă clasă. Electronica și software-ul de la bordul
                    vehiculului dumneavoastră sunt din ce în ce mai complexe.
                  </p>
                  <p className="text-gray-700">
                    Pentru a identifica o defecțiune, este necesară utilizarea de echipamente de
                    testare profesionale și expertiză specializată.
                  </p>
                </div>
              </div>

              <div>
                <div className="bg-white p-8 rounded-2xl shadow-lg h-full">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Raport de expertiză pentru electronică auto
                  </h3>
                  <p className="text-gray-700">
                    Evaluăm daunele componentelor electronice ale autovehiculelor. Datorită
                    experienței noastre îndelungate și expertizei necesare în domeniul electronicii
                    auto și diagnosticării moderne, suntem capabili să elaborăm un raport de
                    expertiză calificat.
                  </p>
                  <p className="text-gray-700 mt-2">
                    Analizăm componentele electronice, cum ar fi unitățile de control și panourile
                    de bord, pentru a detecta manipulările kilometrajului, datele accidentelor,
                    modificările numărului de șasiu și creșterile de putere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTIUNI IMPORTANTE */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* PANOU DE BORD */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-3 rounded-lg mr-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Repararea panoului de bord</h3>
              </div>
              <p className="text-gray-700">
                Panoul de bord este cea mai importantă legătură între șofer și vehicul. Acesta oferă
                o mulțime de informații și feedback-uri esențiale, fiind pur și simplu indispensabil
                pentru șofer.
              </p>
            </div>

            {/* SCURTCIRCUITE */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-3 rounded-lg mr-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Scurtcircuite pe plăci electronice</h3>
              </div>
              <p className="text-gray-700">
                Un scurtcircuit apare atunci când un circuit electric primește un flux de curent mai mare
                decât poate suporta. Consecințele pot varia de la deteriorarea componentelor până la
                declanșarea unui incendiu.
              </p>
            </div>

            {/* DAUNE PROVOCATE DE APA */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-3 rounded-lg mr-4">
                  <span className="text-2xl">💧</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Daunele provocate de apă</h3>
              </div>
              <p className="text-gray-700">
                Apa și umezeala sunt periculoase pentru plăcile electronice auto, provocând oxidare și
                coroziune rapidă. Aceasta poate duce la scurtcircuite și disfuncționalități grave.
              </p>
            </div>

            {/* REPARATII SI PIESE DE SCHIMB */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 p-3 rounded-lg mr-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Reparații și piese de schimb</h3>
              </div>
              <p className="text-gray-700">
                Când o reparație nu mai este posibilă, putem furniza o piesă de schimb utilizată.
                Transferăm datele de pe dispozitivul original pe cel de schimb, astfel încât nu va mai
                fi nevoie de o reprogramare.
              </p>
            </div>
          </div>
        </div>

        {/* TIPURI DE DEFECTIUNI */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tipuri de defecțiuni</h2>
              <div className="w-24 h-1 bg-red-600 mx-auto mb-8"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* DEFECTIUNI STANDARD */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-green-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Defecțiuni standard</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Erori frecvente la anumite modele
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Proceduri și piese deja disponibile
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Reparații rapide (1-2 zile)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Prețuri fixe și transparente
                  </li>
                </ul>
              </div>

              {/* DEFECTIUNI NON-STANDARD */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-yellow-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Defecțiuni non-standard</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">⚠</span>
                    Defecțiuni complet noi sau cu cauze noi
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">⚠</span>
                    Diagnosticare detaliată necesară
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">⚠</span>
                    Teste noi și achiziție piese
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-500 mr-2">⚠</span>
                    Timp de procesare mai lung
                  </li>
                </ul>
              </div>

              {/* INTERVENTII ANTERIOARE */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-red-500">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Intervenții anterioare</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">!</span>
                    Dispozitive reparate anterior de alte firme
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">!</span>
                    Daune suplimentare de identificat
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">!</span>
                    Preț și timp de reparație mai mari
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">!</span>
                    Necesită expertiză specializată
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg">
                <p className="text-lg font-semibold">✧ GARANȚIE 12 LUNI pentru toate piesele recondiționate ✧</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA SECTION - VERSION WITH CLEAR BACKGROUND */}
        <div className="relative py-20 overflow-hidden text-white">
          {/* Background image - full visibility */}
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{
              backgroundImage: "url('cta-bg.webp')",
              filter: "brightness(0.7)" // doar puțin întuneric pentru lizibilitatea textului
            }}
          ></div>

          {/* Simple dark overlay - foarte subtil pentru text */}
          <div className="absolute inset-0 bg-black/30 z-10"></div>

          {/* Content */}
          <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 drop-shadow-lg">
              Ai nevoie de o reparație specializată?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-white drop-shadow-md">
              Trimite-ne cererea ta și te vom contacta
            </p>
            <Link
              to="/request-service"
              className="inline-block bg-white text-red-600 hover:bg-gray-100 px-10 py-4 rounded-xl text-lg font-semibold transition duration-300 transform hover:scale-105 shadow-lg"
            >
              Solicită serviciu
            </Link>
            <p className="mt-4 text-white text-sm md:text-base drop-shadow">
              sau sună la <a href="tel:+37369857294" className="font-bold underline">+373 69 857 294</a>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}

export default About;