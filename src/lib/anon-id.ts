const KEY = "cs_agent_anon_id";

// Anonymous, device-local id so repeat visits/clicks from the same browser
// tie together in the backend (community clicks, scorecard submissions)
// without requiring sign-in.
export function getAnonId(): string {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
