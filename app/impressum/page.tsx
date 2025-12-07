import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum | Seitelyx",
  description: "Impressum und Angaben gemäß § 5 DDG für Seitelyx - Ihre moderne Webagentur.",
};

export default function ImpressumPage() {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl prose prose-lg">
        <h1>Impressum</h1>
        <p className="lead">Angaben gemäß § 5 DDG (Digitale Dienste Gesetz)</p>

        <h2>Anbieter</h2>
        <p>
          <strong>Altro Servis Group s.r.o.</strong>
          <br />
          Schulstraße 660/3, Nové Město
          <br />
          110 00 Prag, Tschechische Republik
          <br />
          <br />
          IČO (Steuernummer): 23673389
          <br />
          Grundkapital: 20.000 CZK
          <br />
          Datová schránka: rtq6w48
        </p>

        <h2>Kontakt</h2>
        <p>
          E-Mail: <a href="mailto:kontakt@seitelyx.de" className="text-primary hover:underline">kontakt@seitelyx.de</a>
          <br />
          Telefon: <a href="tel:+420702110166" className="text-primary hover:underline">+420 702 110 166</a>
          <br />
          Website: <a href="https://seitelyx.de" className="text-primary hover:underline">https://seitelyx.de</a>
        </p>

        <h2>Verantwortlich für den Inhalt</h2>
        <p>
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
          <br />
          Altro Servis Group s.r.o.
          <br />
          Schulstraße 660/3, Nové Město
          <br />
          110 00 Prag, Tschechische Republik
        </p>

        <h2>EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
          <br />
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            https://ec.europa.eu/consumers/odr/
          </a>
          <br />
          Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>

        <h2>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>

        <h2>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen Seiten nach den
          allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
          zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>
        <p>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen
          Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
          Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
          Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
        </p>

        <h2>Haftung für Links</h2>
        <p>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
          Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
          verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die
          verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft.
          Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
        </p>
        <p>
          Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte
          einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige
          Links umgehend entfernen.
        </p>

        <h2>Urheberrecht</h2>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
          Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
          Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
        </p>
        <p>
          Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte
          Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem
          auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei
          Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          Stand: Dezember 2024
        </p>
      </div>
    </main>
  );
}
