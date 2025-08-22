export function setPatientToken(data: Record<string, unknown>) {
  if (!data) return;

  try {
    const token = btoa(JSON.stringify(data));
    localStorage.setItem("token-patient", token);
  } catch {
    return;
  }
}

export function getPatientToken() {
  const token = localStorage.getItem("token-patient");

  if (!token) return;

  try {
    const decoded = atob(token);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}
