export const Range = (n: number) => {
  return Array.from(Array(n).keys());
};

export const cellKey = (colidx: number, rowidx: number) => {
  return `${colidx},${rowidx}`;
};

export const postJSON: (
  url: string,
  body: any
) => Promise<{ data: any | null; error: Error | null }> = async (
  url: string,
  body: any
) => {
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
    console.log(e);
    const error = e as Error;
    return { data: null, error };
  }
};
