import {
  getLinkedInCredentials,
  refreshLinkedInTokenIfNeeded,
} from "@/lib/social/linkedin/credentials";

const LINKEDIN_API = "https://api.linkedin.com/rest";
const LINKEDIN_VERSION = "202401";

export async function linkedInConfigured() {
  const creds = await refreshLinkedInTokenIfNeeded();
  return !!creds?.accessToken && !!creds.organizationId;
}

async function getAuth() {
  const creds = await refreshLinkedInTokenIfNeeded();
  if (!creds?.accessToken || !creds.organizationId) {
    throw new Error("LinkedIn not connected — use Admin → LinkedIn autopilot → Connect");
  }
  const id = creds.organizationId.replace(/^urn:li:organization:/, "");
  return { token: creds.accessToken, orgUrn: `urn:li:organization:${id}` };
}

async function linkedInFetch(path: string, init: RequestInit = {}) {
  const { token } = await getAuth();
  const res = await fetch(`${LINKEDIN_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "LinkedIn-Version": LINKEDIN_VERSION,
      "X-Restli-Protocol-Version": "2.0.0",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LinkedIn API ${res.status}: ${text.slice(0, 500)}`);
  }
  return res;
}

/** Register and upload a PNG image; returns image URN for post attachment. */
export async function uploadLinkedInImage(pngBuffer: Buffer): Promise<string> {
  const { orgUrn: owner } = await getAuth();
  const initRes = await linkedInFetch("/images?action=initializeUpload", {
    method: "POST",
    body: JSON.stringify({
      initializeUploadRequest: {
        owner,
      },
    }),
  });
  const init = (await initRes.json()) as {
    value: { uploadUrl: string; image: string };
  };
  const uploadUrl = init.value.uploadUrl;
  const imageUrn = init.value.image;

  const up = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/png" },
    body: new Uint8Array(pngBuffer),
  });
  if (!up.ok) throw new Error(`LinkedIn image upload failed: ${up.status}`);

  return imageUrn;
}

export async function createLinkedInPost(params: {
  commentary: string;
  imageUrn?: string;
  articleUrl?: string;
}) {
  const { orgUrn: author } = await getAuth();
  const body: Record<string, unknown> = {
    author,
    commentary: params.commentary,
    visibility: "PUBLIC",
    lifecycleState: "PUBLISHED",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
  };

  if (params.imageUrn) {
    body.content = {
      media: {
        id: params.imageUrn,
      },
    };
  } else if (params.articleUrl) {
    body.content = {
      article: {
        source: params.articleUrl,
        title: "DealerVoice",
        description: "Trusted car dealership reviews — built in Chicago",
      },
    };
  }

  const res = await linkedInFetch("/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const postId = res.headers.get("x-restli-id") ?? res.headers.get("x-linkedin-id");
  return postId ?? "posted";
}
