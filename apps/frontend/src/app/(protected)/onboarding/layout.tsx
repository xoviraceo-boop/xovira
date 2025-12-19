const OnboardingLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="relative h-full">
      <main id="careers-page" className="h-full">
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
      </main>
    </div>
   );
}
 
export default OnboardingLayout;