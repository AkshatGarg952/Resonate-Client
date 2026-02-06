const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function postAuth(path, token, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export async function getWithCookie(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}


export async function postWithCookie(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}


export async function putWithCookie(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}




export async function patchWithCookie(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}


export async function uploadPdfWithCookie(path, file) {
  const formData = new FormData();
  formData.append("report", file);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}


export async function analyzeFoodImage(file, cuisine) {
  const formData = new FormData();
  formData.append("image", file);
  if (cuisine) formData.append("cuisine", cuisine);

  const res = await fetch(`${BASE_URL}/food/analyze`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}


export async function createIntervention(body) {
  return postWithCookie("/api/interventions", body);
}

export async function getActiveInterventions() {
  return getWithCookie("/api/interventions/active");
}

export async function getAllInterventions() {
  return getWithCookie("/api/interventions");
}


export async function stopIntervention(id, status = 'discontinued', reason = null) {
  return patchWithCookie(`/api/interventions/${id}/stop`, { status, reason });
}

export async function updateIntervention(id, body) {
  return putWithCookie(`/api/interventions/${id}`, body);
}



export async function createDailyLog(body) {
  return postWithCookie("/api/daily-logs", body);
}

export async function fetchWeeklyLogs() {
  return getWithCookie("/api/daily-logs/weekly");
}
