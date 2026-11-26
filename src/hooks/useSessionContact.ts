"use client";

import { useCallback, useState } from "react";

export interface SessionBusinessContact {
  company: string;
  name: string;
  phone: string;
  email: string;
}

const SESSION_KEY = "eastfield_session_contact_v1";

const EMPTY_CONTACT: SessionBusinessContact = {
  company: "",
  name: "",
  phone: "",
  email: "",
};

function readStoredContact(): SessionBusinessContact {
  if (typeof window === "undefined") return EMPTY_CONTACT;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return EMPTY_CONTACT;
    const parsed = JSON.parse(raw) as Partial<SessionBusinessContact>;
    return {
      company: typeof parsed.company === "string" ? parsed.company : "",
      name: typeof parsed.name === "string" ? parsed.name : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
    };
  } catch {
    return EMPTY_CONTACT;
  }
}

export function useSessionContact() {
  const [savedContact, setSavedContact] = useState<SessionBusinessContact>(() =>
    readStoredContact()
  );

  const saveContact = useCallback((contact: SessionBusinessContact) => {
    const clean: SessionBusinessContact = {
      company: contact.company.trim(),
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      email: contact.email.trim(),
    };
    setSavedContact(clean);
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(clean));
      } catch {
        // Ignore storage quota or restricted-context failures
      }
    }
  }, []);

  const clearContact = useCallback(() => {
    setSavedContact(EMPTY_CONTACT);
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(SESSION_KEY);
      } catch {
        // Ignore storage failures
      }
    }
  }, []);

  const hasSavedContact = Boolean(
    savedContact.company && savedContact.name && savedContact.phone && savedContact.email
  );

  return {
    savedContact,
    hasSavedContact,
    saveContact,
    clearContact,
  };
}
