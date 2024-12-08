import { Tooltip } from "@material-tailwind/react";

// Display a tooltip icon for the newsletter legal text
export function NewsletterTooltip() {
  return (
    <Tooltip
      placement="top"
      content={
        <div className="w-80 text-xs">
          I would like Pabolo GmbH to regularly send me news about features and promotions and I agree that Pabolo uses
          tracking tools of Mailchimp to analyze my newsletter usage. My data may also be processed in countries
          outside the EEA where the level of data protection is lower than under EU law. I can revoke my consent at any
          time. For further information see Pabolos Privacy Policy.
        </div>
      }
      className="z-50"
    >
      ⓘ
    </Tooltip>
  );
}
