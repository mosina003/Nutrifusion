'use client'

export function Footer() {
  const links = [
    { label: 'About', href: '#' },
    { label: 'Features', href: '#' },
    { label: 'Research', href: '#' },
    { label: 'GitHub', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ]

  return (
    <footer className="bg-slate-900 text-white py-12 sm:py-16 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent mb-2">
              NutriFusion
            </h3>
            <p className="text-slate-400 text-sm">
              AI-Driven Personalized Nutrition Platform integrating modern science with traditional medicine.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2">
              {links.slice(0, 3).map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-teal-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-semibold text-white mb-4">Community</h4>
            <ul className="space-y-2">
              {links.slice(3).map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-teal-400 transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 NutriFusion. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-slate-400 hover:text-teal-400 transition-colors text-sm"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
