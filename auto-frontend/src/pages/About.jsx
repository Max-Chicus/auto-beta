import { useEffect } from 'react';
import { Link } from 'react-router-dom';

function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-r from-gray-900 to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="public/about-hero.webp"
            alt="Despre noi - DersTronik"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              D E R S T R O N I K
            </h1>
            <p className="text-2xl md:text-3xl mb-8 text-gray-200 font-light">
              Testarea și repararea profesională a echipamentului auto electronic
            </p>
            <div className="inline-block bg-red-600 px-6 py-2 rounded-full">
              <span className="text-lg">✓ Atelier autorizat ✓ Garanție 24 luni ✓ Experiență 10+ ani</span>
            </div>
          </div>
        </div>
      </div>

      {/* DESPRE NOI */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Despre compania noastră
            </h2>
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>
                Compania noastră este un atelier specializat în electronică auto. Oferim 
                servicii de diagnosticare, întreținere, reparații și montaj pentru echipamente 
                electronice auto.
              </p>
              <p>
                <strong>Gama largă a serviciilor noastre include reparații pentru:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Panouri de bord</li>
                <li>Unități de control (unități de control motor, unități de control ABS/ESP, unități de control airbag, unități de control transmisie, unități de control pompe, etc.)</li>
                <li>Sisteme de navigație</li>
                <li>Calculatoare de bord</li>
                <li>Diverse alte instrumente de afișare pentru autovehicule</li>
              </ul>
              <p className="pt-4">
                Punem un mare accent pe precizia și calitatea superioară a muncii noastre, 
                precum și pe o atenție individualizată pentru clienți, oferind prețuri corecte 
                și transparente.
              </p>
            </div>
          </div>

          <div className="relative">
            <img
              src="/about-equipment.webp"
              alt="Echipamente de testare electronică auto"
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 bg-red-600 text-white p-6 rounded-2xl shadow-xl max-w-xs">
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-lg">Ani de experiență în electronică auto</div>
            </div>
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

      {/* PLATFORME DE TESTARE */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Platforme / Bănci de testare
          </h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-8"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="/about-equipment-2.webp"
              alt="Platformă de testare electronică"
              className="rounded-2xl shadow-xl"
            />
          </div>

          <div className="space-y-4">
            <p className="text-gray-700 text-lg">
              Un element esențial al unei reparații de calitate superioară este diagnosticarea 
              precisă a erorilor. Băncile noastre de testare sunt proiectate pentru a evalua 
              structuri complexe, incluzând interacțiunile dintre unitățile de control al motorului, 
              panourile de bord și sistemele de imobilizare.
            </p>
            <p className="text-gray-700 text-lg">
              Cu ajutorul acestei tehnologii avansate, putem identifica rapid defecțiunile și 
              interveni eficient pentru corectarea erorilor de software, restabilind funcționalitatea 
              optimă a sistemelor electronice.
            </p>
            <p className="text-gray-700 text-lg">
              Acest proces riguros nu doar asigură o diagnosticare corectă, ci previne și eventualele 
              probleme recurente, contribuind la prelungirea duratei de viață a componentelor și la 
              menținerea performanțelor vehiculului la cele mai înalte standarde.
            </p>
            <p className="text-gray-700 text-lg font-semibold">
              Investim continuu în echipamente de testare de ultimă generație și în formarea echipei 
              noastre de experți, pentru a garanta reparații precise și fiabile.
            </p>
          </div>
        </div>
      </div>

      {/* PROCESOARE BGA */}
      <div className="bg-gradient-to-r from-gray-900 to-red-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tehnologia BGA în electronică auto</h2>
            <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <p className="text-lg">
                Procesoarele BGA (Ball Grid Array) sunt utilizate pe scară largă în electronică, 
                inclusiv în plăcile auto. Aceste cipuri folosesc bile de lipit pe partea inferioară 
                pentru conexiuni, oferind dimensiuni compacte, densitate mare de pini și o disipare 
                eficientă a căldurii.
              </p>
              <div className="bg-white/10 p-6 rounded-xl">
                <h4 className="text-xl font-bold mb-2">Avantaje:</h4>
                <p>Permite conectivitate sporită și performanță ridicată în spații mici.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl">
                <h4 className="text-xl font-bold mb-2">Provocări:</h4>
                <p>Reparațiile sunt complexe, necesită echipamente speciale, iar expunerea la căldură 
                necontrolată poate deteriora placa.</p>
              </div>
              <p className="text-lg">
                În automobile, procesoarele BGA sunt esențiale în modulele de control (ECU) și alte 
                sisteme critice, contribuind la funcționarea sigură și eficientă a vehiculului.
              </p>
            </div>

            <div className="relative">
              <img
                src="/about-BGA.webp"
                alt="Procesoare BGA"
                className="rounded-2xl shadow-xl"
              />
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

      {/* CTA SECTION */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Reparații noi și neobișnuite</h2>
          <p className="text-xl mb-8 text-red-100 max-w-3xl mx-auto">
            Dacă nu găsiți un dispozitiv sau o defecțiune în catalogul nostru, ne puteți contacta. 
            Investigăm zilnic noi posibilități de reparații și le adăugăm în portofoliul nostru.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/request-service"
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition duration-300"
            >
              Solicită expertiză
            </Link>
            <a
              href="tel:+37369857294"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition duration-300"
            >
              Sună acum: +373 69 857 294
            </a>
          </div>
          <p className="mt-8 text-red-200">
            <strong>Program de lucru:</strong> Luni - Vineri: 8:00 - 18:00 • Sâmbătă: 9:00 - 14:00
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;