// src/pages/PrivacyPolicy.jsx
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-red-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Politica de confidențialitate</h1>
          <p className="text-gray-200 text-lg">Cum protejăm și folosim datele dumneavoastră personale</p>
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
          <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-8">
            <p className="text-gray-800">
              <strong>Ultima actualizare:</strong> 5 februarie 2024
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducere</h2>
              <p className="text-gray-700 mb-3">
                <strong>DERSTRONIK SRL</strong> („noi”, „al nostru”, „niște”) respectă confidențialitatea 
                dumneavoastră și este angajată să protejeze datele dumneavoastră personale. Această politică 
                de confidențialitate explică cum colectăm, folosim, divulgăm și protejăm informațiile dumneavoastră 
                atunci când utilizați serviciile noastre electronice auto.
              </p>
            </section>

            {/* Data Collection */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Datele pe care le colectăm</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Date personale furnizate de dumneavoastră:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Numele complet și prenumele</li>
                <li>Adresa de e-mail</li>
                <li>Număr de telefon</li>
                <li>Adresă de livrare/facturare</li>
                <li>Detalii despre vehicul (marcă, model, an, număr de înmatriculare)</li>
                <li>Informații despre defectul electronic</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Date colectate automat:</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Adresa IP și tipul de browser</li>
                <li>Pagini vizitate și timpul petrecut pe site</li>
                <li>Dispozitivul și sistemul de operare</li>
                <li>Date de locație generale</li>
                <li>Cookies și tehnologii similare</li>
              </ul>
            </section>

            {/* Purpose of Data */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Scopul prelucrării datelor</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-xl">⚙️</span>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Prelucrarea comenzilor</h4>
                  <p className="text-gray-600">Pentru procesarea serviciilor solicitate și livrarea produselor</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-xl">📞</span>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Comunicare clienți</h4>
                  <p className="text-gray-600">Pentru răspuns la întrebări și actualizări despre servicii</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-xl">🔒</span>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Securitate și prevenție</h4>
                  <p className="text-gray-600">Pentru protecția împotriva fraudelor și activităților ilegale</p>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-xl">📈</span>
                  </div>
                  <h4 className="font-bold text-lg mb-2">Îmbunătățire servicii</h4>
                  <p className="text-gray-600">Pentru analiza și îmbunătățirea serviciilor noastre</p>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Partajarea datelor</h2>
              <p className="text-gray-700 mb-4">
                Nu vindem, închiriem sau comercializăm datele dumneavoastră personale către terți. 
                Putem partaja datele doar în următoarele cazuri:
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-sm">✓</span>
                  </div>
                  <p className="text-gray-700">Cu furnizorii noștri de servicii (curieri, procesare plăți) strict pentru serviciile solicitate</p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-sm">✓</span>
                  </div>
                  <p className="text-gray-700">În caz de obligație legală sau cerere autorizată</p>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-sm">✓</span>
                  </div>
                  <p className="text-gray-700">Pentru protecția drepturilor, proprietății sau siguranței noastre</p>
                </div>
              </div>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Securitatea datelor</h2>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Măsurile noastre de securitate:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Criptarea datelor sensibile (SSL/TLS)</li>
                  <li>• Sisteme de firewall și protecție anti-malware</li>
                  <li>• Acces restricționat la datele personale</li>
                  <li>• Monitorizare continuă a sistemelor</li>
                  <li>• Formarea angajaților în protecția datelor</li>
                </ul>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Drepturile dumneavoastră</h2>
              <p className="text-gray-700 mb-6">
                Conform Regulamentului General privind Protecția Datelor (GDPR), aveți următoarele drepturi:
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Dreptul</th>
                      <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Descriere</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">Dreptul de acces</td>
                      <td className="py-3 px-4 border-b text-gray-600">Solicitarea copiei datelor dumneavoastră personale</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">Dreptul de rectificare</td>
                      <td className="py-3 px-4 border-b text-gray-600">Corectarea datelor inexacte sau incomplete</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">Dreptul la ștergere</td>
                      <td className="py-3 px-4 border-b text-gray-600">Ștergerea datelor în anumite condiții</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">Dreptul de opoziție</td>
                      <td className="py-3 px-4 border-b text-gray-600">Opoziția la prelucrarea datelor</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">Dreptul la portabilitate</td>
                      <td className="py-3 px-4 border-b text-gray-600">Primirea datelor într-un format structurat</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies și tehnologii similare</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-3">Tipuri de cookies folosite:</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Cookies esențiale</h4>
                    <p className="text-gray-600 text-sm">Necesare pentru funcționarea site-ului (autentificare, coș de cumpărături)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Cookies de performanță</h4>
                    <p className="text-gray-600 text-sm">Pentru analiza utilizării și îmbunătățirea performanței</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Cookies de funcționalitate</h4>
                    <p className="text-gray-600 text-sm">Pentru a vă aminti preferințele (limbă, regiune)</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-600 text-sm">
                  Puteți gestiona preferințele pentru cookies în setările browser-ului dumneavoastră.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section>
              <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact pentru protecția datelor</h2>
                <p className="text-gray-700 mb-6">
                  Pentru orice întrebări legate de această politică de confidențialitate sau pentru 
                  exercitarea drepturilor dumneavoastră, vă rugăm să ne contactați:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="mailto:privacy@derstronik.md" className="inline-flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    derstronik.info@gmail.com
                  </a>
                  <a href="tel:+37369857294" className="inline-flex items-center justify-center bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    +373 69 857 294
                  </a>
                </div>
              </div>
            </section>

            {/* Changes */}
            <section>
              <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Actualizări ale politicii</h3>
                <p className="text-gray-600">
                  Ne rezervăm dreptul de a actualiza această politică periodic. Vă vom notifica despre 
                  orice modificări semnificative prin postarea noii politici pe acest site. Vă încurajăm 
                  să revizuiți această pagină periodic pentru a fi la curent cu practicile noastre de confidențialitate.
                </p>
              </div>
            </section>
          </div>

          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 sm:mb-0">
              &copy; {new Date().getFullYear()} DERSTRONIK. Toate drepturile rezervate.
            </p>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-red-600 hover:text-red-800 text-sm font-medium">
                Termeni și condiții
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

export default PrivacyPolicy;