export function AgeRestricationInformation() {
  return (
    <div className="max-h-[60vh] overflow-y-scroll text-gray-600">
      <p className="mt-5">
        Our content moderation team will check your movie for content compliance. We check for illegal content as
        stated in our Terms of Use (Section 5 - “Responsibility of Creators for Films”) which includes especially, but
        not only:
      </p>
      <ul className="mt-1 mb-1 pl-7 list-disc">
        <li>pornographic, racist, insulting or defamatory content</li>
        <li>copyrighted content or content violating privacy and private rights</li>
        <li>glorifying violence and extreme weapon display (e.g., child soldiers)</li>
        <li>extreme political views or conspiracy theories.</li>
      </ul>
      <p className="mt-5">
        We also encourage you to specify if your content is suited for minors. We allow content equivalent to rated R
        specifications, but not NC-17. Rated R content will only be displayed to registered users (as they need to be
        at least 16 years of age to register). Other viewers only can view content rated equivalent to a PG-13 or below
        rating without registration. Therefore, please specify before publishing your movie if the video is suited for
        viewers under or above the age of 16 years. Here are some guidelines to help you make this decision:
      </p>
      <h4 className="text-l font-bold mt-4">Violence </h4>
      <p>
        Brief violence might be ok for a PG-13 rating, but as soon as there is a certain threshold of persistency and
        in any case extreme or realistic violence an R rating is indicated for your movie.
      </p>
      <h4 className="text-l font-bold mt-5">Weapon Usage </h4>
      <p>
        Equal to violence, as soon as weapons take a dominant part in your movie (e.g., Western, War movie), your
        rating should be 16 or above. A short display of a weapon implemented in the story line might be acceptable for
        a rating below 16 years of age.
      </p>
      <h4 className="text-l font-bold mt-5">Disturbing Content </h4>
      <p>
        Some genres like Horror might naturally fall into 16 years and above in this content category due to its
        nature. Make sure if not rating your movie R, that children below 16 years of age can sleep at night after
        watching your movie.
      </p>
      <h4 className="text-l font-bold mt-5">Political Content </h4>
      <p>
        In our Terms of Use we state: “We believe in the freedom of expression, and we are convinced that people shall
        be able to freely share their views, experiences, ideas and information. However, we do not want our Platform
        to be known as meeting place for people with extremist political views”.
      </p>
      <h4 className="text-l font-bold mt-5">Obscene Language </h4>
      <p>
        If language is found in everyday expressions, it will not fall into this category. Language directly aimed at
        sexual, violent or disturbing associations will require a 16 years of age rating.
      </p>
      <h4 className="text-l font-bold mt-5">Drugs </h4>
      <p>All depictions of drug in pictures or dialogues will require a 16 years or above rating.</p>
      <h4 className="text-l font-bold mt-5">Nudity </h4>
      <p>
        On pabolo we generally have a zero-nudity policy. To be exact, videos showing bare breasts, behinds or genitals
        will get rejected.
      </p>
      <h4 className="text-l font-bold mt-5">General </h4>
      <p>
        Please always consider your content in the sense of how suitable it is for people of the age of 16 and younger.
        We cannot list all possible categories and therefore there will be edge cases. We also might be of a different
        opinion as you are, and you have no right to object to our decisions in terms of youth protection
        classification or denial of your movie.
      </p>
      <p className="mt-5">
        In case you do not comply with these Community Guidelines, we might block your video or rate it in a different
        category of youth protection category. In recurring cases of ignoring our Community Guidelines, we are entitled
        to block your creator account permanently.{" "}
      </p>
    </div>
  );
}
