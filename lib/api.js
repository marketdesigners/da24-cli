const BASE_URL = 'https://mcp.wematch.com';
const TIMEOUT_MS = 30000;

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function callEstimate(items, needPacking) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/rest/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, need_packing: needPacking }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || res.statusText };
    }

    // instruction 필드 제거 (내부 지침, 사용자 노출 불필요)
    const { instruction, ...rest } = data;
    return rest;
  } catch (e) {
    if (e.name === 'AbortError') {
      return { success: false, error: 'API 요청 시간 초과 (30초)' };
    }
    return { success: false, error: e.message };
  }
}

export async function callInquiry(payload, apiKey) {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/rest/inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || res.statusText };
    }

    return data;
  } catch (e) {
    if (e.name === 'AbortError') {
      return { success: false, error: 'API 요청 시간 초과 (30초)' };
    }
    return { success: false, error: e.message };
  }
}
