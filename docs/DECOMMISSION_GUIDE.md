# Decommissioning checklist (legacy internal tooling)

Use this guide to fully remove old internal support tooling from your accounts. DealerVoice Inbox replaces that workflow for dealerships.

---

## 1. GitHub — delete the repository

Your CLI token may need the `delete_repo` scope first.

```bash
gh auth refresh -h github.com -s delete_repo
gh repo delete coffeemaestro01-hash/Livehandbook --yes
```

**Or in the browser:**

1. Open https://github.com/coffeemaestro01-hash/Livehandbook
2. **Settings** → scroll to **Danger Zone**
3. **Delete this repository** → type the repo name to confirm

**Verify:** Visiting the repo URL shows 404.

---

## 2. Neon — delete the Postgres project

Livehandbook used a separate Neon database (`DATABASE_URL` in its Vercel env). DealerVoice uses its **own** `DATABASE_URL` — do not delete the Neon project tied to **dealervoice**.

1. Sign in at https://console.neon.tech
2. Find the project named for Livehandbook (often `livehandbook`, `goodfirms`, or similar — **not** dealervoice)
3. **Project Settings** → **Delete project**
4. Confirm deletion

**Verify:** Project no longer appears in the Neon dashboard. No ongoing Neon bill for that project.

**Tip:** If unsure which project is which, open each project’s **Connection details** and compare the host name to `DATABASE_URL` in Vercel → **dealervoice** project → Environment Variables. Only delete the one that was **only** used by Livehandbook.

---

## 3. Brevo (when you are ready)

Livehandbook may have used Brevo for inbound/outbound support mail.

1. Sign in at https://app.brevo.com
2. **Transactional** → **Settings** → **Webhooks** — remove any URL pointing at `livehandbook.vercel.app`
3. **Senders & IP** — remove senders used only for Goodfirms support (if any)
4. Optionally close or downgrade the Brevo account if nothing else uses it

DealerVoice Inbox uses **Resend**, not Brevo.

---

## 4. Google Cloud — OAuth clients (why it matters & how to check)

### Why it matters

Google OAuth clients store **Client ID** and **Client secret** pairs used for “Sign in with Google” or Gmail API access. If Livehandbook had its **own** OAuth client with redirect URIs like:

- `https://livehandbook.vercel.app/api/auth/callback/google`
- `https://livehandbook-knkc.vercel.app/...`

…those credentials are useless now and are a small security hygiene item to remove.

**Do not delete** the OAuth client used by **DealerVoice** (`dealervoice.io` / `www.dealervoice.io` callbacks).

### Step-by-step

1. Open https://console.cloud.google.com
2. Select the Google Cloud **project** you used for Livehandbook (or the shared project if both apps lived there)
3. **APIs & Services** → **Credentials**
4. Under **OAuth 2.0 Client IDs**, open each client and check **Authorized redirect URIs** and **Authorized JavaScript origins**

| If you see… | Action |
|-------------|--------|
| Only `livehandbook*.vercel.app` URLs | Safe to **delete** that OAuth client |
| `dealervoice.io` **and** `livehandbook*.vercel.app` | **Edit** the client — remove Livehandbook URIs only; keep DealerVoice URIs |
| Only `dealervoice.io` | Leave it — this is production DealerVoice |

5. Under **OAuth consent screen**, remove test users or branding that referenced Goodfirms/Livehandbook if no longer needed
6. **APIs & Services** → **Enabled APIs** — disable **Gmail API** on a project that existed only for Livehandbook Gmail sync (if enabled)

### DealerVoice production redirect URIs (keep these)

```
https://dealervoice.io/api/auth/callback/google
https://www.dealervoice.io/api/auth/callback/google
```

Optional (subdomain login):

```
https://ticketing.dealervoice.io/api/auth/callback/google
```

---

## 5. Already completed (agent)

| Item | Status |
|------|--------|
| Vercel `livehandbook` project | Removed |
| Vercel `livehandbook-knkc` project | Removed |
| `livehandbook.vercel.app` | Returns 404 |
| Local folder `~/Desktop/Livehandbook` | Deleted |

---

## 6. Optional local cleanup

- Cursor chat history may still mention old tooling in past transcripts — local only, not linked to production
- No Livehandbook references remain in the DealerVoice codebase docs (except this decommission guide)

---

## After cleanup

DealerVoice Inbox is the sole support product:

- **App:** https://dealervoice.io/ticketing/inbox or https://ticketing.dealervoice.io
- **Email setup:** See `docs/DEALERVOICE_INBOX.md`
