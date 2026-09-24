import { IconEnvelope, IconMap, IconPhone } from "@/components/icons/icons";
import {
  formatSupportPhoneDisplay,
  SUPPORT_ADDRESS,
  SUPPORT_EMAIL,
  supportPhoneE164,
  supportWhatsAppUrlFromPhone,
} from "@/constants/site";

type ContactDetailsProps = {
  supportPhone?: string;
};

export function ContactDetails({ supportPhone }: ContactDetailsProps) {
  const display = formatSupportPhoneDisplay(supportPhone);
  const tel = supportPhoneE164(supportPhone);
  const whatsapp = supportWhatsAppUrlFromPhone(supportPhone);
  return (
    <ul className="info-page-contact-list">
      <li className="info-page-contact-item">
        <IconMap className="info-page-contact-icon" />
        <div>
          <p className="info-page-contact-label">Visit</p>
          <p className="info-page-contact-value">{SUPPORT_ADDRESS}</p>
        </div>
      </li>
      <li className="info-page-contact-item">
        <IconPhone className="info-page-contact-icon" />
        <div>
          <p className="info-page-contact-label">Call / WhatsApp</p>
          <p className="info-page-contact-value">
            <a href={`tel:${tel}`} className="info-page-link">
              {display}
            </a>
          </p>
          <p className="info-page-contact-value">
            <a href={whatsapp} target="_blank" rel="noreferrer" className="info-page-link">
              Chat on WhatsApp
            </a>
          </p>
        </div>
      </li>
      <li className="info-page-contact-item">
        <IconEnvelope className="info-page-contact-icon" />
        <div>
          <p className="info-page-contact-label">Email</p>
          <p className="info-page-contact-value">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="info-page-link">
              {SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </li>
    </ul>
  );
}
