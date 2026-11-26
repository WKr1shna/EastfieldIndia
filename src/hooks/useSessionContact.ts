"use client";

import { useCallback, useState } from "react";

export interface SessionBusinessContact {
  leadId: string;
  name: string;
  phone: string;
  company: string;
  email: string;
}

export interface VisitorLeadState {
  visitorId: string;
  firstVisitAt: string;
  latestVisitAt: string;
  skippedInitial: boolean;
  submittedLead: SessionBusinessContact | null;
}

const STORAGE_KEY = "eastfield_visitor_lead_v1";

function generateVisitorId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `v_${crypto.randomUUID()}`;
  }
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function readVisitorState(): VisitorLeadState {
  const now = new Date().toISOString();
  if (typeof window === "undefined") {
    return {
      visitorId: "",
      firstVisitAt: now,
      latestVisitAt: now,
      skippedInitial: false,
      submittedLead: null,
    };
  }

  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) || window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<VisitorLeadState>;
      return {
        visitorId: typeof parsed.visitorId === "string" && parsed.visitorId ? parsed.visitorId : generateVisitorId(),
        firstVisitAt: typeof parsed.firstVisitAt === "string" ? parsed.firstVisitAt : now,
        latestVisitAt: now,
        skippedInitial: Boolean(parsed.skippedInitial),
        submittedLead:
          parsed.submittedLead &&
          parsed.submittedLead.name &&
          parsed.submittedLead.phone &&
          parsed.submittedLead.company &&
          parsed.submittedLead.email
            ? parsed.submittedLead
            : null,
      };
    }
  } catch {
    // Ignore storage access errors
  }

  return {
    visitorId: generateVisitorId(),
    firstVisitAt: now,
    latestVisitAt: now,
    skippedInitial: false,
    submittedLead: null,
  };
}

function persistVisitorState(next: VisitorLeadState) {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Ignore localStorage failures
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Ignore sessionStorage failures
  }
}

export function useSessionContact() {
  const [visitorState, setVisitorState] = useState<VisitorLeadState>(() => readVisitorState());

  const saveContact = useCallback((contact: Omit<SessionBusinessContact, "leadId"> & { leadId?: string }) => {
    setVisitorState((prev) => {
      const next: VisitorLeadState = {
        ...prev,
        latestVisitAt: new Date().toISOString(),
        submittedLead: {
          leadId: contact.leadId || prev.submittedLead?.leadId || "",
          name: contact.name.trim(),
          phone: contact.phone.trim(),
          company: contact.company.trim(),
          email: contact.email.trim(),
        },
      };
      persistVisitorState(next);
      return next;
    });
  }, []);

  const markSkippedInitial = useCallback(() => {
    setVisitorState((prev) => {
      const next: VisitorLeadState = {
        ...prev,
        latestVisitAt: new Date().toISOString(),
        skippedInitial: true,
      };
      persistVisitorState(next);
      return next;
    });
  }, []);

  const clearContact = useCallback(() => {
    setVisitorState((prev) => {
      const next: VisitorLeadState = {
        ...prev,
        submittedLead: null,
      };
      persistVisitorState(next);
      return next;
    });
  }, []);

  const savedContact: SessionBusinessContact = visitorState.submittedLead ?? {
    leadId: "",
    name: "",
    phone: "",
    company: "",
    email: "",
  };

  const hasSavedContact = Boolean(visitorState.submittedLead);

  return {
    visitorState,
    savedContact,
    hasSavedContact,
    saveContact,
    markSkippedInitial,
    clearContact,
  };
}
