export const Range = (n: number) => {
  return Array.from(Array(n).keys());
};

export const cellKey = (colidx: number, rowidx: number) => {
  return `${colidx},${rowidx}`;
};

export async function getJSON<Type>(
  url: string,
  params?: any
): Promise<{ data: Type | null; error: Error | null }> {
  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    if (resp.status !== 200) {
      throw new Error("Bad response from server");
    }
    const json = await resp.json();
    return { data: json, error: null };
  } catch (e) {
    const error = e as Error;
    return { data: null, error };
  }
}

export async function postJSON<Type>(
  url: string,
  body: any
): Promise<{ data: Type | null; error: Error | null }> {
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (resp.status !== 200) {
      throw new Error("Bad response from server");
    }
    const json = await resp.json();
    return { data: json, error: null };
  } catch (e) {
    const error = e as Error;
    return { data: null, error };
  }
}
