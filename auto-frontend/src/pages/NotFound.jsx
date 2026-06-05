import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <>
      <Helmet>
        <title>Pagina nu a fost găsită | Derstronik</title>
        <meta name="description" content="Ne pare rău, dar pagina pe care o cauți nu există. Încearcă să revii la pagina principală sau să cauți în serviciile noastre." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://www.derstronik.md/" />
      </Helmet>
      
      <div className="max-w-4xl mx-auto py-20 text-center px-4">
        {/* Cod eroare */}
        <div className="text-9xl font-bold text-red-600 mb-4">404</div>
        
        {/* Titlu */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Pagina nu a fost găsită</h1>
        
        {/* Descriere */}
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Ne pare rău, dar pagina pe care încerci să o accesezi nu există sau a fost mutată.
        </p>
        
        {/* Butoane de navigare */}
        <div className="space-y-4">
          <Link 
            to="/" 
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            ← Înapoi la pagina principală
          </Link>
          <div>
            <Link to="/services" className="text-blue-600 hover:text-blue-800">
              Vezi toate serviciile →
            </Link>
          </div>
        </div>
        
        {/* Sfaturi utile (opțional) */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Ai nevoie de ajutor? Sună-ne la <a href="tel:+37369857294" className="text-red-600">+373 69 857 294</a>
          </p>
        </div>
      </div>
    </>
  );
}

export default NotFound;