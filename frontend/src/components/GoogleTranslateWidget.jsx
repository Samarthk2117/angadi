import React, { useEffect } from 'react';

const GoogleTranslateWidget = () => {
  useEffect(() => {
    if (!document.getElementById('google-translate-script')) {
      const addScript = document.createElement('script');
      addScript.id = 'google-translate-script';
      addScript.setAttribute('src', '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
      document.body.appendChild(addScript);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          { 
            pageLanguage: 'en',
            includedLanguages: 'en,hi,kn,mr,ta,te,ml,bn,gu,pa,ur,or,as', // Restrict to English and requested Indian languages
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE 
          },
          'google_translate_element'
        );
      };
    }
  }, []);

  return (
    <div className="fixed bottom-6 left-6 z-[9999] drop-shadow-2xl opacity-90 hover:opacity-100 transition-opacity">
      <div id="google_translate_element" className="bg-[#1a1a2e] rounded-xl overflow-hidden border border-white/10 p-1"></div>
      <style dangerouslySetInnerHTML={{__html: `
        /* Hide the annoying Google Translate top bar */
        .skiptranslate iframe {
          display: none !important;
        }
        body {
          top: 0px !important;
        }
        /* Style the dropdown nicely — compact size */
        .goog-te-gadget-simple {
          background-color: #1a1a2e !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 6px !important;
          padding: 4px 8px !important;
          font-family: inherit !important;
          font-size: 11px !important;
        }
        .goog-te-gadget-simple .goog-te-menu-value {
          color: white !important;
          font-size: 11px !important;
        }
        .goog-te-gadget-simple .goog-te-menu-value span {
          color: white !important;
          font-size: 11px !important;
        }
        .goog-te-gadget-simple img {
          display: none !important;
        }
      `}} />
    </div>
  );
};

export default GoogleTranslateWidget;
