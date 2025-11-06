// frontend/src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-900 bg-opacity-80 backdrop-blur-xl border-t border-purple-700 py-6">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm text-gray-400">
          © 2025 VTB API Security Analyzer. Built with 
          <span className="text-purple-400 font-medium"> Spectral</span>, 
          <span className="text-purple-400 font-medium"> xAI Grok</span> & 
          <span className="text-pink-400 font-medium"> React</span>
        </p>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
          <a 
            href="mailto:zhukov28032006@mail.ru" 
            className="hover:text-purple-400 transition-colors"
          >
            zhukov28032006@mail.ru
          </a>
          <span>•</span>
          <a 
            href="https://github.com/Ivan-cell-create/VTB_API_hackathon_2025/tree/main" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-purple-400 transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
} 