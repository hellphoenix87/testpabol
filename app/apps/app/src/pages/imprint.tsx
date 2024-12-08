import PageContainer from "./pageContainer";

export default function Imprint() {
  return (
    <PageContainer className="p-4" footer metaTags={{ norobots: true }}>
      <h2 className="text-xl font-bold mb-3">Imprint</h2>
      <address className="not-italic">
        <p>Pabolo GmbH</p>
        <p>Albert-Nestler-Straße 10</p>
        <p>76131 Karlsruhe</p>
        <p>Germany</p>
        <p>
          Telephone: +49(0)157-58252145 <br />- no product or billing support –
        </p>
        <p>
          Email:&nbsp;
          <a href="mailto:contact@pabolo.ai" className="text-blue-600 hover:text-blue-800">
            contact@pabolo.ai
          </a>
        </p>
        <p>Local Court Mannheim, Commercial Register Number: HRB 745788</p>
        <p>Sales Tax Identification Number: DE358010764</p>
        <p>Managing Director(s): Thomas Hans Willberger</p>
      </address>
      <section>
        <h3 className="text-lg font-semibold mt-4 mb-2">Online Dispute Resolution</h3>
        <p>
          The EU Commission has provided a platform for online dispute resolution. This platform is available at the
          following link:&nbsp;
          <a href="http://www.ec.europa.eu/consumers/odr" className="text-blue-600 hover:text-blue-800">
            www.ec.europa.eu/consumers/odr
          </a>
        </p>
        <p>
          Pabolo GmbH is not obligated to and nor does it intend to participate in this or any other process for Online
          Dispute Resolution.
        </p>
        <p>
          Any queries regarding this matter can be sent to&nbsp;
          <a href="mailto:odr@pabolo.ai" className="text-blue-600 hover:text-blue-800">
            odr@pabolo.ai
          </a>
          .
        </p>
        <p>
          All rights to the source code, the textual content, the graphical arts, and other legally protected content
          are reserved by Pabolo GmbH.
        </p>
      </section>
    </PageContainer>
  );
}
