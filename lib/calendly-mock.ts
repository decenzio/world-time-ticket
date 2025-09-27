// Lightweight Calendly mock for local development and testing
// Returns a fake event ID and basic metadata. Toggle with CALENDLY_MOCK env var.

export function createMockCalendlyEvent({
  uri,
  start_time,
  end_time,
  invitee_name,
}: {
  uri?: string;
  start_time?: string;
  end_time?: string;
  invitee_name?: string;
}) {
  const id = `mock_evt_${Math.random().toString(36).slice(2, 10)}`;
  return {
    id,
    uri: uri || `https://calendly.mock/event/${id}`,
    start_time: start_time || new Date().toISOString(),
    end_time: end_time || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    invitee_name: invitee_name || "Mock User",
  };
}

export function isMockEnabled() {
  return (process.env.CALENDLY_MOCK || "false").toLowerCase() === "true";
}
