const BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log(BASE_URL)

export async function postWithToken(path, token, body) {
  console.log("Bhej raha request!")
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

   const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export async function getWithToken(path, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export async function putWithToken(path, token, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export async function uploadPdfWithToken(path, token, file) {
  const formData = new FormData();
  formData.append("report", file);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  console.log(res);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}
