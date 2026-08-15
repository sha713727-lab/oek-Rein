import { IconEnvelope, IconMap, IconPhone } from "@/components/icons/icons";
import { SUPPORT_ADDRESS, SUPPORT_EMAIL, SUPPORT_PHONE } from "@/constants/site";

export function ContactDetails() {
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
          <p className="info-page-contact-label">Call</p>
          <p className="info-page-contact-value">
            <a href="tel:+923001234567" className="info-page-link">
              {SUPPORT_PHONE}
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
