const PageLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="relative h-full">
      <main id="home-page" className="h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Naiscorp",
              "url": "https://naiscorp.com",
              "logo": "https://naiscorp.com/logo.png",
              "description": "Naiscorp delivers cutting-edge technology solutions to help businesses thrive in today's digital landscape.",
              "sameAs": [
                "https://twitter.com/naiscorp",
                "https://www.linkedin.com/company/naiscorp",
                "https://www.facebook.com/naiscorp"
              ]
            })
          }}
        />
        {children}
        <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
      </main>
    </div>
   );
}
 
export default PageLayout;