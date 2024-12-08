import { useState } from "react";
import PageContainer from "./pageContainer";

export default function PrivacyPolicy() {
  // used to enable and disable the etracker
  const [etracker, setEtracker] = useState((window as any)._etracker?.isTrackingEnabled());

  const etrackerHandler = event => {
    const tld = event.target.getAttribute("data-tld");
    event.target.checked
      ? (window as any)._etracker.enableTracking(tld)
      : (window as any)._etracker.disableTracking(tld);
    setEtracker((window as any)._etracker?.isTrackingEnabled());
  };

  return (
    <PageContainer className="p-4" footer metaTags={{ norobots: true }}>
      <h1 className="text-2xl font-bold mb-3">Privacy policy</h1>
      <p>In this Privacy Policy, we inform you about the processing of your personal data.</p>
      <h3 className="text-xl font-semibold mt-4 mb-2">1. Controller</h3>
      <p>Responsible for the processing of your personal data is:</p>
      <p>pabolo GmbH</p>
      <p>Albert-Nestler-Str. 10</p>
      <p>76131 Karlsruhe</p>
      <p>&nbsp;</p>
      <p>Managing Director: Thomas Hans Willberger</p>
      <p>
        E-mail: <a href="mailto:contact@pabolo.ai">contact@pabolo.ai</a>
      </p>
      <p>Telephone: +49(0)157-58252145</p>
      <p>&nbsp;</p>
      <h3 className="text-xl font-semibold mt-4 mb-2">2. Scope of data processing</h3>
      <p>
        We process personal data (Art. 4 no. 2 GDPR) in accordance with the provisions of the European Data Protection
        Regulation (GDPR) and the German Federal Data Protection Act (BDSG) and observe the provisions of the
        Telecommunications Telemedia Data Protection Act (TTDSG) when you visit our Website{" "}
        <a href="http://www.pabolo.ai/">www.pabolo.ai</a> &nbsp;("<strong>Website</strong>") or our Social Media
        profiles ("<strong>Social Media Fanpages</strong>") and use the services offered there (e.g. newsletter, user
        account).
      </p>
      <p>
        This is data that we collect using Cookies or similar technologies, that you transmit to us yourself or that we
        receive from third parties (e.g. payment providers or Social Media providers). This includes the following
        information in particular:
      </p>
      <h4>a) Device and usage data</h4>
      <p>
        We collect (technical) data about the device you use and your use of our Website and Social Media Fanpages.
        This includes the following information in particular:
      </p>
      <ul>
        <li>
          Information about the device you are using (e.g. model or type of device, operating system and version), your
          browser (type and settings of the browser), language setting;&nbsp;
        </li>
        <li>
          Location data if you share it with us by activating your device's location services; otherwise information we
          can derive from your IP address, e.g. details of the region you are in when you access the Website or
          information about the internet provider you use;
        </li>
        <li>
          Identification data ("<strong>IDs</strong>"), such as device ID and data relating to Cookies (e.g. Cookie ID
          and session IDs), to retrieve recently viewed content; or third-party account IDs (for example, when you pay
          via PayPal or sign in via Single Sign-On procedure) to recognise your device or browser;
        </li>
        <li>
          Access information (e.g. error codes, which pages you access, at what time, how often and how long you stay
          on a page and links you click on) from which we can deduce possible interests.
        </li>
      </ul>
      <p>
        We receive this information when you access our services and from external third parties whose services you use
        as part of our online services.
      </p>
      <h4>b) Identification and contact details</h4>
      <p>
        We collect your identification and contact details when you contact us or use our services (e.g. newsletter,
        contact form, customer service). This data includes, for example, your surname, first name, e-mail address and
        telephone number.
      </p>
      <h4>c) Registration data</h4>
      <p>
        We process the data you provide when registering for a user account on our Website. This includes, for example,
        your e-mail address.
      </p>
      <h4>d) Contract data</h4>
      <p>
        If you conclude a contract with us, we process information within the scope of the contractual relationship,
        e.g. the subject matter of the contract, the term and the time of conclusion of the contract.
      </p>
      <h4>e) Photos and other personal content</h4>
      <p>
        We receive photos and other personal content from you when you share them via our online services or upload
        them to your user account, e.g. a profile photo, user comments or when you create a film by using our AI tool.
      </p>
      <h4>f)&nbsp; Messages and conversation content</h4>
      <p>
        We process the information you provide to us in the course of communications (e.g. via the contact form, when
        contacting our support team, by e-mail or via Social Media Fanpages) and conversations. This also includes
        photos and other personal content when you share it with us.
      </p>
      <h4>g) Payment data</h4>
      <p>
        We offer the usual payment methods such as PayPal and by Credit Card (as soon as Creator is available). To
        carry out the payment, we collect the payment data provided by you and only pass on such data to our external
        payment service providers that are necessary for the transaction. We also receive payment data from our payment
        service providers for credit assessment and payment processing. The payment data includes, among other things,
        the billing address, the selected payment method, bank account data, credit card data and creditworthiness
        data.
      </p>
      <h4>h) Social Media data</h4>
      <p>
        We operate various Social Media Fanpages. If you write us directly via Social Media Fanpages, the operator of
        the Social Media platform may provide us with data that identifies you, e.g. the publicly accessible profile
        information you provide (e.g. Facebook name, contact details), details of the type of device you are using and
        the identification number that the respective Social Media provider has assigned to your profile (e.g. Facebook
        ID).
      </p>
      <h3 className="text-xl font-semibold mt-4 mb-2">3. Purposes of data processing and legal basis</h3>
      <p>We process personal data for the following purposes:</p>
      <h4>a) Provision of the Website</h4>
      <p>We process your personal data in order to provide you our Website.</p>
      <h5>aa) Logfiles</h5>
      <p>
        When you visit our Website, the browser used on your end device sends information automatically to our website
        server. This information is temporarily stored in a so-called logfile. The following information is collected
        without your intervention and stored until automatic deletion: IP address of the requesting computer, date and
        time of access, name and URL of the accessed file, Website from which the access was made ("
        <strong>referrer URL</strong>"), the search engine you used, if applicable, the browser used and, if
        applicable, the operating system of your computer as well as the name of your access provider. Logfiles serve
        as a source of information for error analysis in the event of a system crash, allowing lost data to be
        reconstructed. &nbsp;They can also be used to analyse user behaviour. The legal basis for this type of data
        processing is Art. 6 para. 1 sentence 1 lit. f GDPR. Our legitimate interests follow in particular from the
        following purposes:
      </p>
      <ul>
        <li>Ensuring a smooth connection of the Website,</li>
        <li>Ensuring a comfortable use of the Website,</li>
        <li>Statistical analysis using a pseudonym in order to optimise our Website,</li>
        <li>Evaluation of system security and stability, and</li>
        <li>Other administrative purposes.</li>
      </ul>
      <h5>bb) etracker Analytics</h5>
      <p>
        We use the services of etracker GmbH, Hamburg, Germany (
        <a href="https://www.etracker.com/en/">https://www.etracker.com/en/</a>) to analyse usage data. We do not use
        cookies for web analysis by default. If we use analysis and optimisation cookies, we will obtain your explicit
        consent separately in advance. The data generated by etracker on behalf of us is processed and stored by
        etracker solely in Germany by commission of us and is thus subject to the strict German and European data
        protection laws and standards. The data processing is based on Art. 6 para. 1 sentence 1 lit. f GDPR. Our
        legitimate interest is the optimisation of our online offer and our website. As the privacy of our visitors is
        very important to us, the data that may possibly allow a reference to an individual person, such as IP address,
        registration or device IDs, will be anonymised or pseudonymised as soon as possible. etracker does not use the
        data for any other purpose, combine it with other data or pass it on to third parties. You can object to the
        outlined data processing at any time by clicking on the slider. The objection has no disadvantageous
        consequences. If no slider is displayed, the data collection is already prevented by other blocking means.
      </p>
      <br />
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={etracker}
          className="sr-only peer"
          data-tld="pabolo.ai"
          id="trackingAllowed"
          onChange={etrackerHandler}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
        <span className="ml-3 font-bold">Please exclude me from etracker.</span>
      </label>
      <br />
      <p>
        &nbsp;Further information on data protection with etracker can be found{" "}
        <a
          href="https://www.etracker.com/en/data-privacy/"
          target="_blank"
          className="text-orange-600 font-medium"
          rel="noreferrer"
        >
          here
        </a>
        .
      </p>
      <h5>cc) Cookies and similar technologies</h5>
      <p>
        We use Cookies on our Website, which collect your data using pseudonyms. Cookies are small text files that a
        Website creates and stores in the memory of your browser or device when you visit the Website (hereinafter "
        <strong>Cookies</strong>").
      </p>
      <h6>(1)&nbsp; Types of Cookies</h6>
      <p>We use different types of Cookies depending on how long they are stored and who sets them on our Website:</p>
      <ul>
        <li>
          <strong>Session Cookies</strong>, which only exist for the duration of a browser session and are deleted when
          you close your browser.
        </li>
        <li>
          <strong>Persistent Cookies, </strong>which arestored on your device, last longer than one visit and help us
          remember information, settings, preferences, or login details that you have previously saved.
        </li>
        <li>
          <strong>First-party Cookies, </strong>which are set and controlled by us as the operator of the Website.
        </li>
        <li>
          <strong>Third-party Cookies that are </strong>set on the Website by another provider. We also use third-party
          Cookies for the collection of analytics data, advertising and marketing activities.
        </li>
      </ul>
      <h6>(2)&nbsp; Purposes of use</h6>
      <p>We use different categories of Cookies depending on their purpose:</p>
      <ul>
        <li>
          <strong>Technically necessary </strong>
          <strong>Cookies</strong>
        </li>
      </ul>
      <p>
        Most of the Cookies we use are technically necessary to enable you to use our Website and the services offered
        on it. Our legitimate interest in data processing lies in this purpose; legal bases are Art. 6 para. 1 sentence
        1 lit. f GDPR, Section 25 para. 2 no. 2 TTDSG. Technically necessary Cookies are usually only stored on your
        device for as long as your browser is active and, unless otherwise specified, are deleted after the end of the
        respective browser session, but at the latest after thirty days. The data is not merged with other personal
        data or used for advertising purposes.
      </p>
      <p>Hosting by Google</p>
      <p>
        Technically necessary Cookies are placed by Google Cloud Platforms and Google Firebase, that are services of
        Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA and - if you are resident in the European
        Economic Area ("EEA") or Switzerland - Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland
        ("Google") who hosts the Website for us. Using these Cookies, Google collects information about your use of the
        Website. This includes:
      </p>
      <ul>
        <li>information about your browser, network and device;</li>
        <li>Websites you visited before coming to our Website;</li>
        <li>Websites you access through this Website; and</li>
        <li>your IP address.</li>
      </ul>
      <p>
        As these Cookies are necessary to provide you with the Website and the services offered via the Website, you
        cannot refuse them. We have a legitimate interest in the data processing. The legal basis for the use of these
        Cookies is Art. 6 para. 1 sentence 1 lit. f GDPR, Section 25 para. 2 no. 2 TTDSG. Your data may be transferred
        to and stored on servers in the USA or another third country outside the European Union ("EU") and the European
        Economic Area ("EEA") which does not provide adequate protection for your personal data under EU data
        protection law. We have concluded a data processing agreement within the meaning of Art. 28 GDPR with Google,
        which includes the EU Standard Contractual Clauses ("SCC") to ensure that the processing of your data is
        carried out by means of appropriate safeguards within the meaning of Art. 46 para. 2 lit. c GDPR.
      </p>
      <p>We have concluded a data processing agreement ("DPA") with</p>
      <ul>
        <li>
          Google Cloud Platforms:{" "}
          <a href="https://cloud.google.com/terms/data-processing-addendum">
            https://cloud.google.com/terms/data-processing-addendum
          </a>
        </li>
        <li>
          Google Firebase:{" "}
          <a href="https://firebase.google.com/terms/data-processing-terms">
            https://firebase.google.com/terms/data-processing-terms
          </a>
        </li>
      </ul>
      <p>
        This ensures that Google only processes your personal data in accordance with our instructions and in
        compliance with the GDPR. Further information on the purpose and scope of data collection and processing by
        Google can be found at <a href="https://policies.google.com/privacy">https://policies.google.com/privacy</a>.
      </p>
      <p>Payment service by Stripe</p>
      <p>
        For the payment processing of your subscription (as soon as Creator is available), we use the service provider
        Stripe Payments Europe Ltd, 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Ireland (&ldquo;
        <strong>Stripe</strong>&rdquo;). For payment processing, we transmit certain payment information to Stripe (for
        further information see section 3, b), bb) of this Privacy Policy). Stripe also uses cookies to collect data in
        order to ensure a secure payment process. The use of the cookies set by Stripe is necessary to offer you the
        payment services. We have a legitimate interest in the data processing. The legal basis for the use of these
        Cookies is Art. 6 para. 1 sentence 1 lit. f GDPR, Section 25 para. 2 no.&nbsp;2 TTDSG.
      </p>
      <p>
        Stripe may process your data in the USA or another third country outside the European Union ("EU") and the
        European Economic Area ("EEA") which does not provide adequate protection for your personal data under EU data
        protection law. In order to ensure an appropriate level of data protection, Stripe uses in this case the EU SCC
        (Art. 46 para. 2 lit. c GDPR).
      </p>
      <p>
        You can find further information on the purpose and scope of data collection and processing by Stripe at{" "}
        <a href="https://stripe.com/en-gb-de/privacy">https://stripe.com/en-gb-de/privacy</a>.
      </p>
      <h6>(3)&nbsp; Withdrawal of your consent</h6>
      <p>
        If you wish to withdraw your consent, i.e. deactivate the use of cookies, you can change the settings of your
        browser and delete existing cookies in your browser at any time. If your device supports the change of cookie
        settings in your browser you can set up your browser so that it does not accept any new cookies (especially
        third-party cookies) or informs you of new cookies. You can also delete cookies that have already been saved in
        the settings of your internet browser. You can find help on how to change your cookie settings, for example, in
        the help function of your internet browser. Further information on this and on cookies in general can be found,
        for example, at <a href="http://www.allaboutcookies.org/">http://www.allaboutcookies.org/</a> and{" "}
        <a href="http://www.youronlinechoices.com/">http://www.youronlinechoices.com/</a>.
      </p>
      <p>
        Please be aware that if you deactivate cookies, you may not be able to use all the functions of the Website.
      </p>
      <h5>dd) Simple links to Social Media Fanpages</h5>
      <p>
        Our Website also contains simple links to our profiles on Social Media (LinkedIn, Twitter, YouTube, Facebook,
        Instagram, TikTok, Discord, in the following &ldquo;<strong>Social Media Fanpages</strong>&rdquo;). If you
        click on these links or buttons, you will leave our Website. The data processing on the Websites of the Social
        Media providers is governed by the data protection provisions available there.
      </p>
      <h5>ee) Single Sign-On</h5>
      <p>
        In addition to logging in with your e-mail and a password, we offer you the option of logging in via "Single
        Sign-On". With the Single Sign-On procedure, you can register with us via a user account of a third-party
        provider that offers the Single Sign-On procedure without having to create a user account with us. To do this,
        you must be registered with the Single Sign-On provider we have chosen. We offer Single Sign-On via Google, a
        service of Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland.
      </p>
      <p>
        More information about data privacy, you can find here:{" "}
        <a href="https://policies.google.com/privacy">https://policies.google.com/privacy</a> and in Google`s Terms of
        Use: <a href="https://policies.google.com/terms">https://policies.google.com/terms</a>.
      </p>
      <p>
        If you would like to register with us via the Single Sign-On procedure, you will be forwarded directly to a
        Google online form. There you enter login data of your Google account. Authentication takes place directly with
        Google. We then create a user account for you and link it to an authentication token and e-mail address that we
        receive from Google. Whether we receive additional data from Google depends on the data sharing you have
        selected during authentication, and the privacy settings you have specified for that service. We do not have
        access to the password you enter, nor do we store it. If you no longer wish that the user account on our
        Website is linked to your Google account, you can remove the link via your Google account. If you wish to
        delete your data with us, this is possible by terminating your user account with us.
      </p>
      <p>
        The legal basis for data processing is your consent (Art. 6 para. 1 sentence 1 lit. a DSGVO), if we have asked
        you for it. Otherwise, we process your data as part of the performance of the contract (Art. 6 para. 1 sentence
        1 lit. b DSGVO).
      </p>
      <h4>b) Provision of products and services via the Website</h4>
      <h5>aa) Fulfilment of contractual and pre-contractual obligations</h5>
      <p>
        Personal data is processed for the provision of the products and services offered via the Website and the
        marketing and development of our products, in particular for the conclusion and execution of contracts, for
        billing purposes, for the implementation of pre-contractual measures, for responding to enquiries in connection
        with our business relationship and for all activities required for the operation and administration of our
        company. In particular, we process the personal information that you as a user provide during registration, for
        contractual purposes or as part of an enquiry. In particular, this is the following data: Name, e-mail address,
        user account number. In addition, we store the password, which the user can choose. The password is not stored
        in plain text, but only a so-called hash value. The purposes of data processing primarily depend on the
        specific contractual relationship. Further details on the purpose of data processing in the context of
        contracts pursuant to Art. 6 para. 1 sentence 1 lit. b GDPR can be found in the respective contract documents
        and our Terms of Use.
      </p>
      <h5>bb) Payment processing</h5>
      <p>
        For the payment processing of your subscription (as soon as Creator is available), we process the payment and
        bank data entered by you or already stored in your user account. We offer you various payment options via our
        Website, such as Credit Card and PayPal, which are carried out by the following payment service providers:
      </p>
      <ul>
        <li>
          PayPal (Europe) S.&agrave;.r.l. et Cie, S.C.A., 22-24 Boulevard Royal, L-2449 Luxembourg. PayPal offers the
          payment methods credit card, PayPal and SEPA (for customers living in Germany).
        </li>
        <li>
          Stripe Payments Europe Ltd, 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Ireland. Stripe offers the
          the payment via credit card (e.g. VISA, Mastercard).
        </li>
      </ul>
      <p>
        The payment information you provide will be transmitted to the payment processor of the payment method you
        select. The legal basis for the transmission of data to our payment providers is the fulfilment of the contract
        in accordance with Art. 6 para. 1 sentence 1 lit. b GDPR.
      </p>
      <h4>c) E-mail Marketing</h4>
      <h5>aa) Newsletter</h5>
      <p>
        Based on your explicit consent (Art. 6 para. 1 sentence 1 lit. a GDPR), we will use your e-mail address and
        your first name to inform you about us special promotions and new features in our newsletter by e-mail. The
        provision of your first name is optional. Your consent will be logged. The logging of your registration is
        based on our legitimate interests for the purposes of proving that consent has been properly obtained (Art. 6
        para. 1 sentence 1 lit. f GDPR). If we commission a service provider to send e-mails, this is done on the basis
        of our legitimate interests in an efficient and secure sending system.
      </p>
      <p>
        In order to receive the newsletter, you have to provide us with an e-mail address. For the newsletter
        registration we use the so-called double opt-in procedure. After registering for the newsletter on the Website,
        you will receive an e-mail in which we ask you to confirm your registration. Only after confirmation are you
        registered for the newsletter and will receive our newsletter from then on. The double opt-in procedure ensures
        that no third-party registers with your e-mail address.
      </p>
      <p>
        You can unsubscribe at any time, for example via the link at the end of each e-mail. Alternatively, you may
        send your unsubscribe request by e-mail to <a href="mailto:support@pabolo.ai">support@pabolo.ai</a>. If you
        unsubscribe, your e-mail address will be deleted from our e-mail distribution list and added to our blacklist.
        The withdrawal of your consent will only take effect for the future. Processing that took place before the
        withdrawal is not affected by this.
      </p>
      <h5>bb) Newsletter tracking</h5>
      <p>
        Please note that we evaluate the behaviour of the recipients of our e-mails using usage statistics. For this
        purpose, the e-mails contain so-called web beacons or tracking pixels and links, each of which is linked to an
        individual ID. We use this to record the time at which the e-mail was opened and forwarded, as well as the time
        at which the links contained in the e-mail were clicked on. The analysis is based on aggregated usage
        statistics (e.g. delivery rate, opening rate, click rate, number of forwarding, number of clicks on the links
        contained in the e-mail, country of retrieval). This is (also) in your interest so that we can immediately
        delete you from our e-mail distribution list or correct the delivery problem. The evaluation of user behaviour
        serves to check the success of our e-mail marketing and to constantly improve it. The legal basis for the
        evaluation is your consent to receive the newsletter in accordance with Art. 6 para. 1 sentence 1 lit. a GDPR.
        You can revoke your consent to the evaluation at any time by unsubscribing from the newsletter (e.g. via the
        link at the end of each e-mail); an isolated withdrawal only with regard to the evaluation is (currently)
        technically not possible. We store your usage data until you have withdrawn your consent to the evaluation.
      </p>
      <h5>cc) Sending e-mails via Mailchimp</h5>
      <p>
        We use Mailchimp, a service of the provider Rocket Science Group LLC, 675 Ponce De Leon Ave NE, Suite 5000,
        Atlanta, GA 30308, USA ("MailChimp"), as an external service provider and processor within the meaning of Art.
        28 GDPR for sending and evaluating e-mails. We commission Mailchimp on the basis of our legitimate interest in
        using an efficient and secure system for sending the newsletter. We share your contact details with Mailchimp
        so that Mailchimp can send the newsletter on our behalf. Mailchimp may process your data outside the EEA in
        countries that do not provide an adequate level of protection for your personal data under EU data protection
        law. We have concluded SCCs within the meaning of Art. 46 para. 2 sentence 1 lit. c GDPR to ensure the
        protection of your data. You can view this agreement here:{" "}
        <a href="https://mailchimcl.com/de/legal/data-processing-addendum/">
          https://mailchimcl.com/de/legal/data-processing-addendum/
        </a>
        . Nevertheless, in the opinion of the data protection authorities, there is a risk that your data may be
        processed by US authorities, for control and for monitoring purposes, possibly also without any legal remedy.
        By subscribing to the newsletter, you also consent to the processing of your data in the USA and other
        countries outside the EEA in accordance with Art. 49 para. 1 sentence 1 lit. a GDPR despite this risk. For more
        information please read MailChimp's Privacy Policy <a href="https://www.intuit.com/privacy/statement/">(</a>
        <a href="https://www.intuit.com/privacy/statement/">https://www.intuit.com/privacy/statement/</a>).
      </p>
      <h5>dd) E-mails to existing customers</h5>
      <p>
        If you have already purchased our products or services, we will inform you from time to time by e-mail or
        letter about similar products from us, unless you have objected to this.
      </p>
      <p>
        The legal basis for the data processing is Art. 6 para. 1 sentence 1 lit. f GDPR and Sec. 7 para. 3 German
        Unfair Competition Act (Gesetz gegen den Unlauteren Wettbewerb, UWG). Our legitimate interest lies in direct
        advertising (Recital 47 GDPR).
      </p>
      <p>
        You can object to the use of your e-mail address and postal address for advertising purposes at any time
        without incurring additional costs, for example via the link at the end of each e-mail or by e-mail to{" "}
        <a href="mailto:support@pabolo.ai">support@pabolo.ai</a>.
      </p>
      <h4>d) Contracts with cooperation partners</h4>
      <p>
        We further process personal data for the conclusion and implementation of contracts with cooperation partners.
        This includes processing for billing purposes, for carrying out pre-contractual measures, for answering
        enquiries in connection with our business relationship as well as all activities necessary with the operation
        and administration of our company. In particular, we process the contact and other data that you provide to us
        for contractual purposes or in the context of an enquiry. The legal basis for data processing is Art. 6 para.
        1sentence 1 lit. b GDPR.
      </p>
      <h4>e) Based on your consent&nbsp;</h4>
      <p>
        If you have given us your consent to process personal data for certain purposes (e.g. passing on data), this
        processing is lawful based on your consent (Art. 6 para. 1 sentence 1 lit. a GDPR, Art. 9 para. 2 lit. a GDPR).
        You can withdraw your consent at any time. Please note that the withdrawal is only effective for the future.
        Processing that took place before the withdrawal is not affected.
      </p>
      <h4>f)&nbsp; Protection of legitimate interests</h4>
      <p>
        In addition, we process your data to protect the legitimate interests of us or third parties, in particular in
        the following cases:
      </p>
      <ul>
        <li>Responding to enquiries outside of a contract or pre-contractual measures;</li>
        <li>Advertising or market and opinion research, insofar as you have not objected to the use of your data;</li>
        <li>When using service providers within the scope of commissioned processing;</li>
        <li>Assertion of legal claims and defence in legal disputes;</li>
        <li>Ensuring our IT security and operations;</li>
        <li>Prevention and investigation of criminal offences.</li>
      </ul>
      <p>
        The legal basis is Art. 6 para. 1 sentence 1 lit. f GDPR. Our legitimate interest is to further develop our
        services or to protect ourselves against impairments and dangers and to enforce our claims.
      </p>
      <h4>g) Compliance with legal requirements</h4>
      <p>
        In addition, we are subject to various legal obligations, i.e. legal requirements. The purposes of the
        processing include, among others, the fulfilment of retention periods under commercial and tax law. The legal
        basis for data processing is Art. 6 para. 1 sentence 1 lit. c GDPR.
      </p>
      <h3 className="text-xl font-semibold mt-4 mb-2">4. No obligation to provide personal data</h3>
      <p>
        If we ask you to provide personal data, you can of course refuse to do so. However, we may then not be able to
        provide certain functions of the Website, answer your enquiries or conclude a contract. This applies in
        particular if the data is necessary for our newsletter service, for the establishment, implementation and
        termination of a contractual relationship or if we are legally obliged to collect data.
      </p>
      <h3 className="text-xl font-semibold mt-4 mb-2">5. Categories of recipients</h3>
      <p>
        Within our company, those departments or individuals get access to your data that need it to fulfil our
        contractual and legal obligations.
      </p>
      <p>
        We pass on your data to the recipients expressly named in this Privacy Policy and thus also to service
        providers of third-party Cookies. In doing so, we observe the legal requirements and, if necessary, conclude
        corresponding contracts or agreements with the recipients of your data that serve to protect your data.
      </p>
      <p>
        Furthermore, we share your data with the following categories of recipients if it is necessary for the
        fulfilment of a contractual relationship existing between you and us or for the implementation of
        pre-contractual measures (Art. 6 para. 1 sentence 1 lit. b GDPR) or for the protection of legitimate interests
        (Art. 6 para. 1 sentence 1 lit. f GDPR) or due to a legal regulation:
      </p>
      <ul>
        <li>IT service providers, e.g. cloud, hosting, software as a service providers;</li>
        <li>Customer service provider;</li>
        <li>
          Marketing and advertising service provider, especially in the field of e-mail marketing and for the placement
          of personalised advertisements;
        </li>
        <li>Credit institutions and payment services e.g. for the collection of a fee and fraud prevention;</li>
        <li>Collection agencies for the enforcement of claims</li>
        <li>Fraud prevention and risk analysis service providers</li>
        <li>
          Third parties involved in legal proceedings, provided that they submit a legal order, court order or
          equivalent legal disposition to us.
        </li>
      </ul>
      <p>
        Where processing is necessary to protect legitimate interests, for example when using IT services, our
        legitimate interest is to outsource functions. In addition, we will only share your personal data with third
        parties, if required by law (Art. 6 para. 1 sentence 1 lit. c GDPR) or if you have given your consent (Art. 6
        para. 1 sentence 1 lit. a GDPR).
      </p>
      <h3 className="text-xl font-semibold mt-4 mb-2">6. International data transfer</h3>
      <p>
        For the processing of your personal data, we also use service providers located in third countries outside the
        European Union (EU) or the European Economic Area (EEA). These countries may have a lower level of data
        protection than within the European Union. In case of a data transfer to these countries, we will obtain the
        necessary safeguards to ensure that your data is processed as securely as within the EEA, e.g. by concluding{" "}
        <a href="https://commission.europa.eu/publications/standard-contractual-clauses-international-transfers_en">
          EU Commission standard contractual clauses
        </a>{" "}
        (SCC) within the meaning of Art. 46 para. 2 cl. 1 lit. c GDPR or by other measures taken by contacting us at
        the contact details provided above.
      </p>
      <h3 className="text-xl font-semibold mt-4 mb-2">7. Social Media Fanpages</h3>
      <p>
        We operate Social Media Fanpages. There we publish and share recommendations, content, competitions and offers.
      </p>
      <p>
        When you visit our Social Media Fanpages, the Social Media provider processes information about you. You can
        find more detailed information on data processing in the Privacy Policy of the respective Social Media provider
        listed below. Some Social Media providers also offer the option to object to certain data processing. Please
        note that according to the Social Media providers, user data is also processed in the USA or other third
        countries.
      </p>
      <table>
        <tbody>
          <tr>
            <td valign="top" width="104">
              <p>
                <strong>Platform</strong>
              </p>
            </td>
            <td valign="top" width="236">
              <p>
                <strong>Postal address</strong>
              </p>
            </td>
            <td valign="top" width="226">
              <p>
                <strong>Link to the Privacy Policy</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td valign="top" width="104">
              <p>
                <strong>LinkedIn</strong>
              </p>
            </td>
            <td valign="top" width="236">
              <p>LinkedIn Ireland Unlimited Company, Wilton Place, Dublin 2, Ireland</p>
            </td>
            <td valign="top" width="226">
              <p>
                <a href="https://www.linkedin.com/legal/privacy-policy">
                  https://www.linkedin.com/legal/privacy-policy
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td valign="top" width="104">
              <p>
                <strong>Twitter</strong>
              </p>
            </td>
            <td valign="top" width="236">
              <p>1355 Market St #900, San Francisco, CA 94103, USA</p>
            </td>
            <td valign="top" width="226">
              <p>
                <a href="https://twitter.com/de/privacy">https://twitter.com/de/privacy </a>
              </p>
            </td>
          </tr>
          <tr>
            <td valign="top" width="104">
              <p>
                <strong>Youtube</strong>
              </p>
            </td>
            <td valign="top" width="236">
              <p>Google Ireland Limited</p>
              <p>Gordon House, Barrow Street, Dublin 4, Ireland</p>
            </td>
            <td valign="top" width="226">
              <p>
                <a href="https://policies.google.com/privacy?hl=en">https://policies.google.com/privacy?hl=en</a>
              </p>
            </td>
          </tr>
          <tr>
            <td valign="top" width="104">
              <p>
                <strong>Facebook, </strong>
              </p>
              <p>
                <strong>Instagram</strong>
              </p>
            </td>
            <td valign="top" width="236">
              <p>Meta Platforms Ireland Ltd, 4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Ireland</p>
            </td>
            <td valign="top" width="226">
              <p>
                <a href="https://www.facebook.com/about/privacy/">https://www.facebook.com/about/privacy/</a>{" "}
                <a href="https://instagram.com/about/legal/privacy">https://instagram.com/about/legal/privacy</a>
              </p>
            </td>
          </tr>
          <tr>
            <td valign="top" width="104">
              <p>
                <strong>TikTok</strong>
              </p>
            </td>
            <td valign="top" width="236">
              <p>TikTok Technology Limited, 10 Earlsfort Terrace, Dublin, D02 T380, Ireland</p>
            </td>
            <td valign="top" width="226">
              <p>
                <a href="https://www.tiktok.com/legal/page/eea/privacy-policy/en">
                  https://www.tiktok.com/legal/page/eea/privacy-policy/en
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td valign="top" width="104">
              <p>
                <strong>Discord</strong>
              </p>
            </td>
            <td valign="top" width="236">
              <p>Discord Inc., 444 De Haro Street</p>
              <p>Suite 200, San Francisco, CA 94107, USA</p>
            </td>
            <td valign="top" width="226">
              <p>
                <a href="https://discord.com/privacy">https://discord.com/privacy</a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <h4>a) Insights</h4>
      <p>
        <strong>Meta (Facebook, Instagram) </strong>and <strong>LinkedIn </strong>use Cookies and similar technologies
        to record your user behaviour when visiting the Social Media Fanpages and make the information available to us
        in anonymised form as statistics (so-called <strong>Insights</strong>). This gives us insights into how our
        Social Media Fanpages are used, which topics are particularly popular and what interests our Social Media
        Fanpage visitors have. This enables us to optimise our Social Media Fanpage and better respond to the interests
        of our audience. We do not have access to the personal data used by Meta or LinkedIn to create this
        information. Meta and LinkedIn select the insights data independently of us and process it accordingly.
      </p>
      <p>&nbsp;</p>
      <p>
        We are jointly responsible with both Meta and LinkedIn for the collection of your data and the processing for
        the provision of the Insights, but not the further processing of this data by the Social Media providers. We
        have shared responsibility with
      </p>
      <p>&nbsp;</p>
      <ul>
        <li>
          <strong>Meta </strong>under thefollowing agreement{" "}
          <a href="https://www.facebook.com/legal/terms/page_controller_addendum">
            https://www.facebook.com/legal/terms/page_controller_addendum
          </a>
        </li>
        <li>
          <strong>LinkedIn </strong>under the following agreement
          https://legal.linkedin.com/pages-joint-controller-addendum
        </li>
      </ul>
      <p>
        which specifies which company fulfils which data protection obligations when processing personal data for
        Insights. Under these agreements, Meta and LinkedIn agree to comply with users' requests regarding your data
        protection rights. This means that you can contact Meta (Facebook, Instagram) or LinkedIn directly for
        information and deletion requests. You can find a clear summary of the most important points of the Meta
        agreement here:{" "}
        <a href="https://www.facebook.com/legal/terms/information_about_page_insights_data">
          https://www.facebook.com/legal/terms/information_about_page_insights_data
        </a>
        . Information regarding your data subject rights can be found in the respective data protection provisions:
      </p>
      <p>&nbsp;</p>
      <ul>
        <li>
          <strong>Meta: </strong>
          <a href="https://www.facebook.com/privacy/policy">https://www.facebook.com/privacy/policy</a>
        </li>
        <li>
          <strong>LinkedIn: </strong>
          <a href="https://de.linkedin.com/legal/privacy-policy">https://de.linkedin.com/legal/privacy-policy</a>.
        </li>
      </ul>
      <h4>b) Contact</h4>
      <p>
        If you communicate directly with us via a Social Media Fanpage or share personal content with us, we are
        responsible for processing your data. The purpose of the data processing is to communicate with you.
        Furthermore, we also use the information you share with us for marketing purposes. The legal basis for the data
        processing is our legitimate interest in the meaning of Art. 6 para. 1 cl. 1 lit. f GDPR to get in contact with
        enquirers and to further develop our services.
      </p>
      <h3 className="text-xl font-semibold mt-4 mb-2">8. Storage duration and erasure</h3>
      <p>
        We and our service providers will process and store your personal data in accordance with applicable data
        protection law to the extent and for the duration necessary for the processing purposes set out in this Privacy
        Policy.
      </p>
      <p>
        We store your personal data for the duration of our contractual relationship, this may also include, for
        example, the initiation and processing of a contract. Please note that, depending on the individual case, our
        contractual relationship may be a continuing obligation that lasts for years.
      </p>
      <p>
        Logfiles are generally deleted after the end of the respective browser session, usually after 7 days and at the
        latest after thirty &nbsp;days, unless their further storage is exceptionally necessary and lawful. The storage
        period of Cookies depends on the individual case and is usually between twelve and 24 months. If we process
        your personal data based on your consent, we store your data for the period required to process your personal
        data in accordance with your consent. In the case of contractual relationships, but also in the case of other
        claims under civil law, the storage period is also based on the statutory limitation periods, which, for
        example, according to Sections 195 et seq. of the GermanCivil Code ("<strong>BGB</strong>"), are generally
        three years, but in certain cases can be up to thirty years. In addition, we are subject to various retention
        and documentation obligations, which result from the German Commercial Code ("<strong>HGB</strong>") and the
        German Fiscal Code ("<strong>AO</strong>"), among other things. The retention and documentation periods
        specified there are six years for correspondence in connection with the conclusion of a contract and ten years
        for accounting vouchers and business letters (Sections 238, 257 para. 1 and 4 HGB, Section 147 para. 1 and 3
        AO).
      </p>
      <h3 className="text-xl font-semibold mt-4 mb-2">9. &nbsp;Rights of the data subject</h3>
      <p>
        Insofar as you are affected by the data processing, you have the right of access (Art. 15 GDPR), the right of
        rectification (Art. 16 GDPR), the right to erasure (Art.&nbsp;17 GDPR), the right to restriction of processing
        (Art. 18 GDPR) and the right to data portability (Art. 20 GDPR). With regard to the right of access and the
        right to erasure, the restrictions according to Sections 34 and 35 BDSG apply. You also have the right to
        object to data processing (Art. 21 GDPR).
      </p>
      <p>Your rights in detail:</p>
      <ul>
        <li>
          <strong>Right of access</strong>: You can request the confirmation as to whether and how we process your
          personal data. In particular, you have a right of access to your personal data and the information about the
          purposes of processing, the categories of personal data, the recipients or categories of recipients to whom
          the personal data have been or will be disclosed, if possible the envisaged storage period, or, if this is
          not possible, the criteria for determining this period; the existence of a right to rectification or erasure
          of your personal data, to restriction of the processing or to object to such processing; the existence of a
          right to lodge a complaint with a supervisory authority; the source of the data if the personal data has not
          been collected from you, the existence of automated decision-making, including profiling, and, if applicable,
          meaningful information about the logic involved and the significance and envisaged consequences of such
          processing. If we transfer personal data to a third country or an international organisation, you may also
          request information about the safeguards we have in place to protect your data. Your right to information may
          be limited in individual cases by national law (Sections 29 para. 1 sentence 2, 34 BDSG) and the rights and
          freedoms of others.
        </li>
        <li>
          <strong>Right to rectification</strong>: You may request the rectification of inaccurate personal data with
          undue delay or, taking into account the purposes of the processing, the completion of incomplete personal
          data &ndash; also by means of providing a supplementary declaration.
        </li>
        <li>
          <strong>Right to erasure</strong>: You have a right to immediate erasure of your personal data under certain
          circumstances, e.g. if your personal data is no longer necessary for the purposes for which it was collected
          or otherwise processed, if you withdraw your consent and there is no other legal basis for the processing, or
          if you have objected to the processing of your data for direct marketing purposes. The right does not exist
          to the extent the processing is necessary for exercising the right to freedom of expression and information,
          for compliance with a legal obligation, for reasons of public interest or for the exercise of a public power
          vested in us, or for the establishment, exercise or defence of legal claims. Your right to erasure may be
          limited in individual cases by national law (Section 35 BDSG).
        </li>
        <li>
          <strong>Right to restriction of processing</strong>: You may request the restriction of processing if you
          contest the accuracy of the personal data for the duration of the verification of the accuracy by us, if the
          processing is unlawful but you object to the erasure of your personal data, if we no longer need your
          personal data but you need the data to establish, exercise or defend legal claims, or if you have objected to
          the processing.
        </li>
        <li>
          <strong>Right to data portability</strong>: You have the right to data portability, i.e. the right to receive
          and transmit the personal data you have provided to us in a structured, commonly used and machine-readable
          format, if we process your personal data on the basis of your consent or a contract and the processing is
          carried out by automated means.
        </li>
      </ul>

      <p>
        <strong>Right of objection according to Art. 21 GDPR</strong>
      </p>
      <p>
        <strong>&nbsp;</strong>
      </p>
      <p>
        You have the right to object at any time, on grounds relating to your particular situation, to the processing
        of personal data concerning you which is carried out on the basis of Art. 6 para. 1 sentence 1 lit. e GDPR
        (public security) or&nbsp; Art. 6 para. 1 sentence 1 lit. e GDPR (legitimate interests); this also applies to
        profiling based on these provisions. We shall no longer process this data upon the lodging of the objection,
        unless there are compelling reasons for the processing that merit protection, e.g. processing for the
        establishment, exercise, or defence of legal claims.
      </p>

      <p>
        Where personal data is processed for direct marketing purposes, you have the right to object at any time to the
        processing of personal data concerning you for such marketing; this also applies to profiling insofar as it is
        associated with such direct marketing. We will no longer process your personal data for direct advertising if
        you exercise your right to object.
      </p>

      <p>
        If our processing of your personal data is based on consent (Art. 6 para. 1 sentence 1 lit. a GDPR), you may
        withdraw this consent at any time; the lawfulness of the data processing carried out on the basis of the
        consent until withdrawal remains unaffected by this.
      </p>
      <p>
        To assert your rights and for further questions on the subject of personal data, you can contact us at any time
        using our contact details above (see Section 1).
      </p>
      <p>
        Regardless of this, you have the right to file a complaint with a supervisory authority &ndash; in particular
        in the EU member state of your place of residence, your place of work or the place of the alleged infringement
        &ndash; if you believe that the processing of personal data concerning you violates the GDPR or other
        applicable data protection laws (Art. 77 GDPR, Section 19 BDSG).
      </p>
      <h3 className="text-xl font-semibold mt-4 mb-2">10. Data security</h3>
      <p>
        We transmit your personal data securely by using encryption. We use the TLS (Transport Layer Security) coding
        system for this purpose. Furthermore, we secure the Website and other systems through technical and
        organisational measures against loss as well as destruction, access, modification, or distribution of your data
        by unauthorised persons.
      </p>
      <h3 className="text-xl font-semibold mt-4 mb-2">11. No automated decision-making in individual cases</h3>
      <p>
        For the establishment and implementation of the business relationship, we generally do not use fully automated
        decision-making pursuant to Art. 22 GDPR. Should we use this procedure in individual cases, we will inform you
        of this separately if this is required by law.
      </p>
      <p>Status: September 1st, 2023</p>
    </PageContainer>
  );
}
