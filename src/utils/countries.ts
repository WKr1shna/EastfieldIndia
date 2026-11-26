export const COUNTRIES: readonly string[] = [
  "India",
  "United Arab Emirates",
  "United States",
  "United Kingdom",
  "Singapore",
  "Australia",
  "Canada",
  "Germany",
  "Netherlands",
  "France",
  "Japan",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Oman",
  "Bahrain",
  "Malaysia",
  "Nepal",
  "Bangladesh",
  "Sri Lanka",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Cambodia",
  "Cameroon",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Finland",
  "Georgia",
  "Ghana",
  "Greece",
  "Guatemala",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "South Korea",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Maldives",
  "Malta",
  "Mauritius",
  "Mexico",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "New Zealand",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Pakistan",
  "Panama",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Romania",
  "Russia",
  "Rwanda",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Slovakia",
  "Slovenia",
  "South Africa",
  "Spain",
  "Sweden",
  "Switzerland",
  "Taiwan",
  "Tanzania",
  "Thailand",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Uganda",
  "Ukraine",
  "Uruguay",
  "Uzbekistan",
  "Vietnam",
  "Zambia",
  "Zimbabwe",
];

interface PostalRule {
  pattern: RegExp;
  hint: string;
}

const COUNTRY_POSTAL_RULES: Record<string, PostalRule> = {
  India: {
    pattern: /^[1-9]\d{5}$/,
    hint: "Please enter a valid 6-digit Indian PIN code (e.g., 854301).",
  },
  "United States": {
    pattern: /^\d{5}(-\d{4})?$/,
    hint: "Please enter a valid US ZIP code (e.g., 10001 or 10001-1234).",
  },
  "United Kingdom": {
    pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
    hint: "Please enter a valid UK postcode (e.g., SW1A 1AA).",
  },
  Canada: {
    pattern: /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][\s-]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
    hint: "Please enter a valid Canadian postal code (e.g., K1A 0B1).",
  },
  Australia: {
    pattern: /^\d{4}$/,
    hint: "Please enter a valid 4-digit Australian postcode (e.g., 2000).",
  },
  Germany: {
    pattern: /^\d{5}$/,
    hint: "Please enter a valid 5-digit German postal code (e.g., 10115).",
  },
  Singapore: {
    pattern: /^\d{6}$/,
    hint: "Please enter a valid 6-digit Singapore postal code (e.g., 018989).",
  },
  Japan: {
    pattern: /^\d{3}-?\d{4}$/,
    hint: "Please enter a valid Japanese postal code (e.g., 100-0001).",
  },
  Netherlands: {
    pattern: /^\d{4}\s?[A-Z]{2}$/i,
    hint: "Please enter a valid Dutch postal code (e.g., 1012 AB).",
  },
  France: {
    pattern: /^\d{5}$/,
    hint: "Please enter a valid 5-digit French postal code (e.g., 75001).",
  },
};

export function validatePostalCodeForCountry(
  postalCode: string,
  country: string
): { valid: boolean; message?: string } {
  const trimmed = postalCode.trim();
  if (trimmed.length < 2 || trimmed.length > 16) {
    return {
      valid: false,
      message: "Please enter a valid postal / PIN code (2 to 16 characters).",
    };
  }

  const rule = COUNTRY_POSTAL_RULES[country.trim()];
  if (rule) {
    return rule.pattern.test(trimmed) ? { valid: true } : { valid: false, message: rule.hint };
  }

  // General international alphanumeric postal code check
  if (!/^[A-Za-z0-9\s-]{2,16}$/.test(trimmed)) {
    return {
      valid: false,
      message: "Postal code may only contain letters, digits, spaces, or hyphens.",
    };
  }

  return { valid: true };
}
