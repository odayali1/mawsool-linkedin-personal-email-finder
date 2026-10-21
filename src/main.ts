import { Actor, log } from 'apify';
import { createHash } from 'node:crypto';

type Input = {
    lawfulUse?: boolean;
    urls?: string[];
    urlsCsv?: string;
    fileUrl?: string;
    maxUrls?: number;
    concurrency?: number;
    resumeId?: string;
    freshStart?: boolean;
};

const API_BASE = (process.env.EXACT_API_BASE_URL || 'https://api-v2.mawsool.tech').replace(/\/+$/, '');
const API_KEY = process.env.EXACT_API_KEY?.trim();
const EVENT = process.env.CHARGE_EVENT || 'profile-personal-email';
const HARD_MAX = 50_000;
const SAMPLE_SLUGS = new Set([
    'gopalika-barwal',
    'osama-abdelhadi',
    'example',
    'your-profile',
    'the-profile-you-already-have',
]);
const DIRECT_ATTEMPTS = 5;
const LOOKUP_TIMEOUT_MS = 45_000;

function normalizeUrl(raw: unknown): string | null {
    if (typeof raw !== 'string') return null;
    const value = raw.trim();
    if (!value) return null;
    try {
        const url = new URL(value.startsWith('http') ? value : `https://${value}`);
        if (!/(^|\.)linkedin\.com$/i.test(url.hostname) || !url.pathname.toLowerCase().includes('/in/')) return null;
        url.protocol = 'https:';
        url.hostname = 'www.linkedin.com';
        url.search = '';
        url.hash = '';
        url.pathname = url.pathname.replace(/\/+$/, '');
        return url.toString();
    } catch {
        return null;
    }
}

function parseCsv(text: string): string[] {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return [];
    const split = (line: string) => line.split(',').map((part) => part.trim().replace(/^"|"$/g, ''));
    const first = split(lines[0]).map((part) => part.toLowerCase());
    const names = ['url', 'linkedinurl', 'linkedin_url', 'profileurl', 'profile_url', 'linkedin'];
    const hasHeader = first.some((part) => names.includes(part));
    const urlIndex = hasHeader ? Math.max(first.findIndex((part) => names.includes(part)), 0) : 0;
    return lines.slice(hasHeader ? 1 : 0).map((line) => split(line)[urlIndex] || '');
}

async function collectUrls(input: Input): Promise<string[]> {
    const raw = [...(input.urls || [])];
    if (input.urlsCsv) raw.push(...parseCsv(input.urlsCsv));
    if (input.fileUrl) {
        const response = await fetch(input.fileUrl, { signal: AbortSignal.timeout(120_000) });
        if (!response.ok) throw new Error(`Could not download input file (HTTP ${response.status}).`);
        raw.push(...parseCsv(await response.text()));
    }
    const seen = new Set<string>();
    const urls: string[] = [];
    let skippedSamples = 0;
    for (const value of raw) {
        const url = normalizeUrl(value);
        if (!url || seen.has(url)) continue;
        seen.add(url);
        const slug = decodeURIComponent(new URL(url).pathname.match(/\/in\/([^/]+)/i)?.[1] || '').toLowerCase();
        if (SAMPLE_SLUGS.has(slug)) {
            skippedSamples += 1;
            continue;
        }
        urls.push(url);
    }
    if (skippedSamples) log.info(`Skipped ${skippedSamples} sample profile URL(s). They are not sent to the lookup.`);
    return urls;
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanError(error: unknown, fallback: string): string {
    const message = error instanceof Error ? error.message : fallback;
    return message.replace(/https?:\/\/\S+/gi, 'the lookup service').replace(/[\w.+-]+@[\w.-]+/g, '[email]');
}

function permanentStatus(status: number): boolean {
    return status === 400 || status === 401 || status === 402 || status === 403 || status === 404 || status === 409 || status === 422;
}

function stalled(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return error.name === 'TimeoutError' || error.name === 'AbortError' || message.includes('fetch failed') || message.includes('network') || message.includes('timed out');
}

function backoff(attempt: number): number {
    return Math.min(8000, 1000 * (2 ** attempt));
}

function provider(email: string): string {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    if (domain === 'gmail.com' || domain === 'googlemail.com') return 'Gmail';
    if (domain === 'hotmail.com' || domain === 'outlook.com' || domain === 'live.com' || domain === 'msn.com') return 'Outlook';
    if (domain.startsWith('yahoo.')) return 'Yahoo';
    if (domain === 'icloud.com' || domain === 'me.com' || domain === 'mac.com') return 'iCloud';
    if (domain === 'aol.com') return 'AOL';
    if (domain === 'proton.me' || domain === 'protonmail.com') return 'Proton';
    return 'Other';
}

async function lookup(url: string): Promise<{ found: boolean; emails: string[]; truncated: boolean }> {
    let lastError = 'Lookup failed';
    for (let attempt = 0; attempt < DIRECT_ATTEMPTS; attempt += 1) {
        try {
            const response = await fetch(`${API_BASE}/v1/linkedin`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${API_KEY}`,
                    'User-Agent': 'Mozilla/5.0',
                },
                body: JSON.stringify({ url }),
                signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
            });
            const raw = await response.text();
            let body: Record<string, unknown> | null = null;
            try { body = JSON.parse(raw) as Record<string, unknown>; } catch { /* handled below */ }
            if (response.ok && body) {
                const emails = Array.isArray(body.emails)
                    ? body.emails.filter((item): item is string => typeof item === 'string' && item.includes('@'))
                    : [];
                return { found: body.found === true && emails.length > 0, emails, truncated: body.truncated === true };
            }
            const apiError = body && typeof body.error === 'string' ? body.error : null;
            lastError = apiError || (body ? `Lookup failed with HTTP ${response.status}` : `Lookup edge rejected the caller with HTTP ${response.status}`);
            if (permanentStatus(response.status)) break;
            log.warning(`Lookup attempt ${attempt + 1} of ${DIRECT_ATTEMPTS} did not succeed. Retrying.`);
        } catch (error) {
            lastError = stalled(error) ? 'The lookup did not answer in time.' : cleanError(error, 'Network request failed');
            log.warning(`Lookup attempt ${attempt + 1} of ${DIRECT_ATTEMPTS} did not succeed. Retrying.`);
        }
        if (attempt < DIRECT_ATTEMPTS - 1) await sleep(backoff(attempt));
    }
    throw new Error(lastError.replace(/https?:\/\/\S+/gi, 'the lookup service'));
}

function slugHash(url: string): string {
    return createHash('sha256').update(url).digest('hex');
}

function rowFor(url: string, hit: { found: boolean; emails: string[]; truncated: boolean } | null, error?: string): Record<string, unknown> {
    const emails = hit?.emails || [];
    const primary = emails[0] || null;
    return {
        inputUrl: url,
        profileUrl: url,
        hasPersonalEmail: !!primary,
        personalEmail: primary,
        personalEmails: emails.length ? emails.join('; ') : null,
        emailCount: emails.length,
        emailProvider: primary ? provider(primary) : null,
        matchType: primary ? 'exact' : 'none',
        truncated: hit?.truncated === true,
        success: !error,
        error: error || null,
        checkedAt: new Date().toISOString(),
    };
}

await Actor.init();
if (!API_KEY) throw new Error('EXACT_API_KEY is not configured as an Apify secret.');

const input = (await Actor.getInput<Input>()) || {};

const maxUrls = Math.min(Math.max(Number(input.maxUrls ?? 100), 1), HARD_MAX);
const urls = (await collectUrls(input)).slice(0, maxUrls);
if (!urls.length) throw new Error('Add your own LinkedIn profile URLs. Sample profiles are not looked up, including rows left in the CSV box.');

const concurrency = Math.min(Math.max(Number(input.concurrency ?? 8), 1), 20);
const progressId = (input.resumeId || 'auto').replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 60) || 'auto';
const saveProgress = urls.length > 20 || !!input.resumeId;
const skipFinished = saveProgress && !input.freshStart && (urls.length > 200 || !!input.resumeId);
const resumeStore = saveProgress
    ? await Actor.openKeyValueStore(input.resumeId ? `mawsool-personal-email-resume-${progressId}` : 'mawsool-personal-email-progress-auto')
    : null;

log.info(`Starting ${urls.length} personal-email lookup(s), concurrency=${concurrency}`);
if (skipFinished) log.info('Profiles that already returned an email are skipped. Set freshStart to look them up again.');

let batch = urls;
let deferFailures = urls.length > 1;
let nextIndex = 0;
const deferred: string[] = [];
let processed = 0;
let found = 0;
let missed = 0;
let failed = 0;
let skipped = 0;
let stop = false;
let consecutiveOutages = 0;

function noteOutcome(message: string | null): void {
    if (!message) {
        consecutiveOutages = 0;
        return;
    }
    const textValue = message.toLowerCase();
    const outage = textValue.includes('did not answer') || textValue.includes('timed out') || textValue.includes('fetch failed') || textValue.includes('network') || textValue.includes('unavailable') || textValue.includes('429') || textValue.includes('502') || textValue.includes('503') || textValue.includes('504');
    if (!outage) {
        consecutiveOutages = 0;
        return;
    }
    consecutiveOutages += 1;
    if (consecutiveOutages >= 15 && !stop) {
        stop = true;
        log.error('The lookup service looks unavailable. Stopping so finished rows stay saved and the next run can continue.');
    }
}

async function worker(): Promise<void> {
    while (!stop) {
        const index = nextIndex++;
        if (index >= batch.length) return;
        const url = batch[index];
        const recordKey = slugHash(url);
        if (skipFinished && resumeStore && await resumeStore.getValue(`done-${recordKey}`)) {
            skipped += 1;
            continue;
        }
        try {
            const hit = await lookup(url);
            const row = rowFor(url, hit);
            const pushed = hit.found
                ? await Actor.pushData(row, EVENT)
                : await Actor.pushData(row);
            if (pushed?.eventChargeLimitReached) {
                stop = true;
                return;
            }
            if (hit.found) {
                found += 1;
                if (resumeStore) await resumeStore.setValue(`done-${recordKey}`, { at: new Date().toISOString() });
            } else {
                missed += 1;
            }
            noteOutcome(null);
            processed += 1;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unexpected lookup error';
            noteOutcome(message);
            if (deferFailures && !stop) {
                deferred.push(url);
                log.warning(`Lookup failed and will be retried at the end: ${message}`);
                continue;
            }
            await Actor.pushData(rowFor(url, null, message));
            processed += 1;
            failed += 1;
            log.warning(`Failed lookup: ${message}`);
        }
    }
}

async function runBatch(): Promise<void> {
    nextIndex = 0;
    const workers = Math.min(concurrency, batch.length);
    if (workers > 0) await Promise.all(Array.from({ length: workers }, () => worker()));
}

await runBatch();
if (deferred.length && !stop) {
    log.info(`Retrying ${deferred.length} lookup(s) that failed on the first pass.`);
    await sleep(3000);
    batch = deferred.splice(0, deferred.length);
    deferFailures = false;
    await runBatch();
}

await Actor.setValue('OUTPUT', {
    requested: urls.length,
    processed,
    found,
    missed,
    failed,
    skipped,
    stoppedByChargeLimit: stop,
});
log.info(`Finished. Processed=${processed}, found=${found}, missed=${missed}, failed=${failed}, skipped=${skipped}`);
await Actor.exit();
