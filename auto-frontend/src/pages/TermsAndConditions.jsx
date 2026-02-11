// src/pages/TermsAndConditions.jsx
import { Link } from 'react-router-dom';

function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-red-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Termeni și condiții</h1>
          <p className="text-gray-200 text-lg">Regulile de utilizare a serviciilor DERSTRONIK</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Navigation */}
          <div className="mb-8">
            <Link to="/" className="text-red-600 hover:text-red-800 inline-flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Înapoi la acasă
            </Link>
          </div>

          {/* Last Updated */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-gray-800">
                  <strong>Important:</strong> Prin utilizarea serviciilor noastre, acceptați acești termeni și condiții.
                  Vă rugăm să citiți cu atenție înainte de a plasa o comandă.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-12">
            {/* Section 1 */}
            <section id="section1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center mr-3">
                  1
                </span>
                Definiții și acceptare termeni
              </h2>
              <div className="ml-13 space-y-4">
                <p className="text-gray-700">
                  <strong>"DERSTRONIK"</strong> se referă la DERSTRONIK SRL, companie înregistrată în Republica Moldova, 
                  specializată în reparații electronice auto.
                </p>
                <p className="text-gray-700">
                  <strong>"Client"</strong> se referă la orice persoană fizică sau juridică care utilizează serviciile noastre.
                </p>
                <p className="text-gray-700">
                  <strong>"Servicii"</strong> includ diagnosticare, reparație, programare și vânzarea de componente electronice auto.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-yellow-800 font-medium">
                    Prin accesarea și utilizarea site-ului nostru, vă confirmați că ați citit, înțeles și 
                    acceptat integral acești termeni și condiții.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="section2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center mr-3">
                  2
                </span>
                Descrierea serviciilor
              </h2>
              <div className="ml-13">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Servicii oferite:</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="font-bold text-red-600 mb-2">✓ Diagnosticare</div>
                    <p className="text-gray-600 text-sm">Testare și identificare defecțiuni electronice</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="font-bold text-red-600 mb-2">✓ Reparație</div>
                    <p className="text-gray-600 text-sm">Repararea componentelor electronice defecte</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="font-bold text-red-600 mb-2">✓ Programare</div>
                    <p className="text-gray-600 text-sm">Programare/actualizare software componente</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="font-bold text-red-600 mb-2">✓ Vânzare piese</div>
                    <p className="text-gray-600 text-sm">Vânzare componente electronice noi și recondiționate</p>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Limitări servicii:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Nu reparăm componente cu daune fizice severe (sparte, arse complet)</li>
                  <li>Nu oferim garanție pentru componente afectate de apă/umezeală extremă</li>
                  <li>Nu garantăm reparația componentelor deja reparate anterior de alte ateliere</li>
                  <li>Costul diagnosticării poate fi aplicat dacă clientul refuză reparația</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="section3">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center mr-3">
                  3
                </span>
                Procesul de comandă și plată
              </h2>
              <div className="ml-13">
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="font-bold text-lg mb-4">Pași pentru comandă:</h3>
                  <ol className="space-y-4">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3">1</span>
                      <div>
                        <p className="font-medium">Solicitare ofertă</p>
                        <p className="text-gray-600 text-sm">Trimiteți detaliile defectului prin site sau telefon</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3">2</span>
                      <div>
                        <p className="font-medium">Diagnosticare și ofertă</p>
                        <p className="text-gray-600 text-sm">Analizăm și trimitem ofertă cu preț și durata estimată</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3">3</span>
                      <div>
                        <p className="font-medium">Confirmare și plată avans</p>
                        <p className="text-gray-600 text-sm">Confirmați oferta și plătiți avansul (30-50%)</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3">4</span>
                      <div>
                        <p className="font-medium">Reparație și testare</p>
                        <p className="text-gray-600 text-sm">Efectuăm reparația și testăm componenta</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3">5</span>
                      <div>
                        <p className="font-medium">Livrare și plată finală</p>
                        <p className="text-gray-600 text-sm">Livrăm și finalizăm plata restului</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Metode de plată acceptate:</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">💰 Numerar</span>
                  <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">💳 Card bancar</span>
                  <span className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm">📱 Transfer bancar</span>
                  <span className="px-3 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm">🏢 Factură companii</span>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="section4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center mr-3">
                  4
                </span>
                Politica de garanție
              </h2>
              <div className="ml-13">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mr-4">
                      <span className="text-xl">🛡️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">Garanție standard: 12 luni</h3>
                      <p className="text-gray-600">Pentru toate reparațiile efectuate</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-green-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <div>
                        <p className="font-medium text-gray-800">Acoperit de garanție:</p>
                        <p className="text-gray-600 text-sm">Defecte identice cu cele reparate, apărute în condiții normale de utilizare</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-red-600 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                      <div>
                        <p className="font-medium text-gray-800">Nu este acoperit:</p>
                        <p className="text-gray-600 text-sm">Daune accidentale, inundări, manipulare necorespunzătoare, modificări de terțe părți</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Procedură garanție:</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                  <li>Contactați-ne telefonic sau prin email pentru a raporta problema</li>
                  <li>Trimiteți componenta la atelier pentru diagnosticare gratuită</li>
                  <li>Dacă defectul este acoperit de garanție, reparația se efectuează gratuit</li>
                  <li>Componenta este retestată și returnată clientului</li>
                </ol>
              </div>
            </section>

            {/* Section 5 */}
            <section id="section5">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center mr-3">
                  5
                </span>
                Politica de retur și anulare
              </h2>
              <div className="ml-13">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-3 text-green-600">Servicii neîncepute</h3>
                    <p className="text-gray-600 mb-4">Puteți anula oricând înainte de începerea reparației.</p>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm font-medium">Taxă anulare: 0%</p>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-3 text-yellow-600">Servicii în curs</h3>
                    <p className="text-gray-600 mb-4">Anularea după începerea reparației.</p>
                    <div className="bg-yellow-50 p-3 rounded">
                      <p className="text-sm font-medium">Taxă anulare: costul muncii efectuate</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Retur piese:</h3>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    Piesele vândute pot fi returnate în 14 zile de la achiziție, dacă:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-gray-700">
                    <li>Piesa este în stare originală, neverificată, cu ambalajul intact</li>
                    <li>Se prezintă factura originală de achiziție</li>
                    <li>Piesa nu face parte dintr-o comandă personalizată</li>
                  </ul>
                  <p className="mt-4 text-gray-600 text-sm">
                    Costurile de transport pentru retur sunt suportate de client.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6-10 - Rest of sections... */}
            <section id="section6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center mr-3">
                  6
                </span>
                Răspundere și limitări
              </h2>
              <div className="ml-13 space-y-4">
                <p className="text-gray-700">
                  Răspunderea noastră este limitată la valoarea serviciului prestat. Nu suntem 
                  răspunzători pentru daune indirecte sau consecințiale rezultate din utilizarea 
                  componentelor reparate.
                </p>
                <div className="bg-red-50 border border-red-100 p-4 rounded-lg">
                  <p className="text-red-800 font-medium">
                    ⚠️ Clientul este responsabil pentru asigurarea vehiculului și a componentelor 
                    în timpul transportului către și de la atelierul nostru.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact & Final */}
            <section className="bg-gray-900 text-white rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Întrebări sau nelămuriri?</h2>
              <div className="text-center">
                <p className="text-gray-300 mb-6">
                  Pentru orice întrebări legate de acești termeni și condiții, 
                  vă rugăm să ne contactați:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="mailto:legal@derstronik.md" 
                     className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    derstronik.info@gmail.com
                  </a>
                  <a href="tel:+37369857294" 
                     className="inline-flex items-center justify-center bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    +373 69 857 294
                  </a>
                </div>
              </div>
            </section>
          </div>

          {/* Acceptance */}
          <div className="mt-12 p-6 border border-gray-300 rounded-xl">
            <div className="flex items-start">
              <input type="checkbox" id="acceptance" className="mt-1 mr-3" />
              <label htmlFor="acceptance" className="text-gray-700">
                Confirm că am citit și înțeles acești termeni și condiții și accept să fiu 
                obligat de ei în relația mea cu DERSTRONIK.
              </label>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 sm:mb-0">
              &copy; {new Date().getFullYear()} DERSTRONIK. Toate drepturile rezervate.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-red-600 hover:text-red-800 text-sm font-medium">
                Politica de confidențialitate
              </Link>
              <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
                Acasă
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;