const API_BASE = "https://api.almostcrackd.ai";

export type PresignedUrlResponse = {
  presignedUrl: string;
  cdnUrl: string;
};

export type RegisterImageResponse = {
  imageId: string;
  now: number;
};

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function pipelineGeneratePresignedUrl(
  accessToken: string,
  contentType: string
): Promise<PresignedUrlResponse> {
  const res = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType }),
  });
  if (!res.ok) {
    throw new Error(`presigned-url failed: HTTP ${res.status}`);
  }
  return parseJson<PresignedUrlResponse>(res);
}

export async function pipelineUploadBytes(
  presignedUrl: string,
  file: File,
  contentType: string
) {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`upload failed: HTTP ${res.status}`);
  }
}

export async function pipelineRegisterImage(
  accessToken: string,
  imageUrl: string,
  isCommonUse = false
): Promise<RegisterImageResponse> {
  const res = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl, isCommonUse }),
  });
  if (!res.ok) {
    throw new Error(`register image failed: HTTP ${res.status}`);
  }
  return parseJson<RegisterImageResponse>(res);
}

export async function pipelineGenerateCaptions(
  accessToken: string,
  imageId: string,
  humorFlavorId?: string
): Promise<unknown> {
  const res = await fetch(`${API_BASE}/pipeline/generate-captions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageId,
      ...(humorFlavorId ? { humorFlavorId } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`generate-captions failed: HTTP ${res.status}`);
  }
  return parseJson(res);
}
