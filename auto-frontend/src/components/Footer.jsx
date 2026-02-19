function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 text-white pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 flex items-center justify-center">
                <img
                  src="/footer-logo.svg"
                  alt="Derstronik Logo"
                  className="h-10 w-auto object-contain transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div>
                <div className="font-bold text-xl">DERSTRONIK</div>
                <div className="text-sm text-gray-300">Electronic Auto</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Reparație profesională de unități auto electronice. Calitate, garanție și servicii complete.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Linkuri rapide</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-red-400 transition-colors">Acasă</a></li>
              <li><a href="/about" className="text-gray-400 hover:text-red-400 transition-colors">Despre noi</a></li>
              <li><a href="/services" className="text-gray-400 hover:text-red-400 transition-colors">Servicii</a></li>
              <li><a href="/request-service" className="text-gray-400 hover:text-red-400 transition-colors">Solicită serviciu</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-gray-400">+373 69 857 294</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-400">derstronik.info@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-400">Chișinău, Moldova<br /> Șoseaua Balcani 53</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Social Media & Contact</h3>
            <p className="text-gray-400 mb-4 text-sm">Urmărește-ne și contactează-ne</p>
            <div className="flex flex-wrap gap-4">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61579703693654"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors transform hover:-translate-y-1"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/derstronik"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 text-white p-3 rounded-lg transition-all transform hover:-translate-y-1"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/37369857294"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors transform hover:-translate-y-1"
                aria-label="WhatsApp"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.76.982.998-3.675-.236-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.9 6.994c-.004 5.45-4.438 9.88-9.888 9.88m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.333.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.333 11.893-11.893 0-3.18-1.24-6.162-3.495-8.411" />
                </svg>
              </a>

              {/* Viber - adaptat pentru iconiță */}
              <a
                href="viber://chat?number=%2B37369857294"
                className="bg-[#7360F2] hover:bg-[#5a48d1] text-white p-3 rounded-lg transition-colors transform hover:-translate-y-1"
                aria-label="Viber"
              >
                <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M30 15.3785C30 6.20699 26.7692 2 16 2C5.23077 2 2 6.20699 2 15.3785C2 21.9055 3.63629 25.9182 8.46154 27.6895V30.7774C8.46154 31.9141 9.88769 32.4332 10.6264 31.5656L13.1164 28.6411C14.0113 28.7185 14.9713 28.7569 16 28.7569C26.7692 28.7569 30 24.5499 30 15.3785ZM13.7113 26.5316C14.4251 26.5882 15.1872 26.6164 16 26.6164C25.1124 26.6164 27.8462 23.0825 27.8462 15.3785C27.8462 7.67443 25.1124 4.14055 16 4.14055C6.88757 4.14055 4.15385 7.67443 4.15385 15.3785C4.15385 20.8239 5.51965 24.1859 9.53846 25.6891V30.2639C9.53846 30.6627 10.0389 30.8449 10.2981 30.5404L13.7113 26.5316Z" fill="#BFC8D0" />
                  <path d="M16 25.8548C15.1766 25.8548 14.4047 25.8262 13.6815 25.7685L10.224 29.845C9.96145 30.1546 9.45455 29.9693 9.45455 29.5638V24.9119C5.38354 23.3834 4 19.9647 4 14.4274C4 6.59346 6.76923 3 16 3C25.2308 3 28 6.59346 28 14.4274C28 22.2613 25.2308 25.8548 16 25.8548Z" fill="#9179EE" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M30 14.3785C30 5.20699 26.7692 1 16 1C5.23077 1 2 5.20699 2 14.3785C2 20.9055 3.63629 24.9182 8.46154 26.6895V29.7774C8.46154 30.9141 9.88769 31.4332 10.6264 30.5656L13.1164 27.6411C14.0113 27.7185 14.9713 27.7569 16 27.7569C26.7692 27.7569 30 23.5499 30 14.3785ZM13.7113 25.5316C14.4251 25.5882 15.1872 25.6164 16 25.6164C25.1124 25.6164 27.8462 22.0825 27.8462 14.3785C27.8462 6.67443 25.1124 3.14055 16 3.14055C6.88757 3.14055 4.15385 6.67443 4.15385 14.3785C4.15385 19.8239 5.51965 23.1859 9.53846 24.6891V29.2639C9.53846 29.6627 10.0389 29.8449 10.2981 29.5404L13.7113 25.5316Z" fill="white" />
                  <path d="M11.5432 12.1345L11.5026 12.157L11.4668 12.1866C11.1902 12.4154 10.7756 13.0434 11.1388 13.8197C11.4414 14.4665 12.1157 15.7874 13.3005 16.7826C14.4592 17.756 15.6965 18.2795 16.5092 18.4509L16.5603 18.4617H16.6069C16.6091 18.4619 16.614 18.4624 16.6219 18.4636C16.6412 18.4663 16.6645 18.4703 16.7012 18.4767L16.7874 17.9842L16.7012 18.4767C16.7075 18.4778 16.714 18.479 16.7208 18.4802C16.9709 18.5244 17.5704 18.6304 18.0729 18.1297C18.3954 17.8083 18.6898 17.4732 18.8165 17.3225C18.9055 17.2413 19.1956 17.0731 19.5626 17.1972C20.2576 17.4321 21.0839 17.9621 21.4833 18.2308C21.7925 18.439 22.4924 18.9404 22.8079 19.1682L22.8082 19.1684C22.8344 19.1873 22.8959 19.2493 22.9291 19.3354C22.9557 19.4042 22.97 19.4988 22.9061 19.6357C22.7875 19.8895 22.4266 20.374 21.9378 20.7978C21.4401 21.2294 20.9222 21.5 20.5072 21.5C20.5087 21.5 20.5072 21.4998 20.5025 21.4992C20.484 21.4967 20.4153 21.4874 20.2792 21.4568C20.1262 21.4225 19.9195 21.3686 19.6669 21.2926C19.1622 21.1407 18.485 20.904 17.7029 20.5675C16.1375 19.8941 14.1668 18.8277 12.3218 17.2572C11.1613 16.2694 10.0664 14.9036 9.2138 13.6251C8.35407 12.3358 7.77896 11.1932 7.62244 10.6655L7.61148 10.6285L7.595 10.5937C7.55603 10.5114 7.50112 10.3355 7.50002 10.136C7.49895 9.94333 7.54725 9.75923 7.67465 9.60657C8.09467 9.10322 8.53938 8.60859 9.52049 8.13395C9.61188 8.08974 9.75504 8.05076 9.89575 8.04849C10.04 8.04617 10.1152 8.082 10.1452 8.10835C10.5206 8.43751 11.1025 9.01857 11.4945 9.51513C11.6971 9.77164 11.9418 10.0975 12.1458 10.3806C12.2478 10.5222 12.3377 10.6506 12.4062 10.7527C12.4405 10.8039 12.4679 10.8462 12.4881 10.8788C12.5019 10.9012 12.5093 10.9143 12.5124 10.9199C12.5141 10.9256 12.5218 10.9498 12.5286 10.9939C12.5371 11.0494 12.5411 11.1177 12.5354 11.1891C12.5235 11.3351 12.4755 11.4524 12.3892 11.5315C12.0962 11.7998 11.699 12.0482 11.5432 12.1345ZM16.2766 6.51613C16.2769 6.51585 16.2772 6.51557 16.2775 6.51527C16.2847 6.50852 16.2994 6.5 16.3226 6.5C20.3145 6.5 23.4984 9.53785 23.5 13.223C23.4994 13.2239 23.4983 13.2251 23.4967 13.2267C23.4895 13.2334 23.4747 13.2419 23.4516 13.2419C23.4285 13.2419 23.4137 13.2334 23.4065 13.2267C23.4049 13.2251 23.4039 13.2239 23.4032 13.223C23.4016 9.49946 20.2032 6.53226 16.3226 6.53226C16.2994 6.53226 16.2847 6.52374 16.2775 6.51699C16.2772 6.51669 16.2769 6.5164 16.2766 6.51613ZM16.2775 10.646C16.2772 10.6457 16.2769 10.6454 16.2766 10.6452C16.2769 10.6449 16.2772 10.6446 16.2775 10.6443C16.2847 10.6376 16.2994 10.629 16.3226 10.629C17.8916 10.629 19.1113 11.8182 19.1129 13.223C19.1123 13.2239 19.1112 13.2251 19.1096 13.2267C19.1024 13.2334 19.0877 13.2419 19.0645 13.2419C19.0414 13.2419 19.0266 13.2334 19.0194 13.2267C19.0178 13.2251 19.0168 13.2239 19.0161 13.223C19.0145 11.7799 17.7803 10.6613 16.3226 10.6613C16.2994 10.6613 16.2847 10.6528 16.2775 10.646ZM16.2775 8.5815C16.2772 8.58121 16.2769 8.58092 16.2766 8.58065C16.2769 8.58037 16.2772 8.58008 16.2775 8.57979C16.2847 8.57304 16.2994 8.56452 16.3226 8.56452C19.1031 8.56452 21.3048 10.678 21.3065 13.223C21.3058 13.2239 21.3048 13.2251 21.3032 13.2267C21.296 13.2334 21.2812 13.2419 21.2581 13.2419C21.2349 13.2419 21.2201 13.2334 21.213 13.2267C21.2114 13.2251 21.2103 13.2239 21.2097 13.223C21.2081 10.6397 18.9917 8.59677 16.3226 8.59677C16.2994 8.59677 16.2847 8.58825 16.2775 8.5815Z" fill="white" stroke="white" strokeLinecap="round" />
                </svg>
              </a>

              {/* Email - aici am păstrat mailul existent */}
              {/* <a
                href="mailto:derstronik.info@gmail.com"
                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors transform hover:-translate-y-1"
                aria-label="Email"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a> */}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400">
              &copy; {currentYear} <span className="font-semibold text-red-400">DERSTRONIK</span>. Toate drepturile rezervate.
            </p>
          </div>

          <div className="flex space-x-6">
            <a href="/privacy" className="text-gray-400 hover:text-red-400 transition-colors text-sm">
              Politica de confidențialitate
            </a>
            <a href="/terms" className="text-gray-400 hover:text-red-400 transition-colors text-sm">
              Termeni și condiții
            </a>
          </div>
        </div>

        {/* Development Credit */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-xs">
            Dezvoltat cu ❤️ pentru pasionații de electronică auto
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;