# LinkedIn Email Finder | Exact Personal Match

**LinkedIn email finder.** Paste a profile URL you already have and get the personal email from that LinkedIn URL when the match is 100% exact. No match, no charge. Starting from $30 per 1,000 emails found. This is the cheap exact alternative to a LinkedIn email finder that guesses `first.last@company.com`.

## If you need a different Mawsool Actor

| If this is what you need | Open |
| --- | --- |
| Your LinkedIn URLs are old, stale, or no longer open. | [Fix Broken LinkedIn URLs](https://apify.com/oday/mawsool-fix-broken-linkedin-urls) |
| You have an email and want the LinkedIn profile. | [Reverse Email Lookup](https://apify.com/oday/mawsool-email-linkedin-lookup) |
| You have a name and company and want the profile URL. | [LinkedIn Profile Finder](https://apify.com/oday/mawsool-linkedin-profile-finder) |
| You only need the current employer, before paying for a full profile. | [Current Company Checker](https://apify.com/oday/mawsool-linkedin-company-checker) |
| You want the current company and headline, and you will compare them to your CRM yourself. | [Profile Freshness Check](https://apify.com/oday/mawsool-linkedin-profile-freshness) |
| You want an alert when the employer or headline changes. | [Job Change Tracker](https://apify.com/oday/mawsool-linkedin-job-change-watch) |
| You have a profile URL and want the full profile. | [LinkedIn Profile Scraper](https://apify.com/oday/mawsool-linkedin-profile-details) |
| You have a large file of profile URLs. | [Mass Profile Scraper](https://apify.com/oday/mawsool-mass-linkedin-profile-scraper) |
| You want the current employer's website from a profile URL. | [Profile to Company Website](https://apify.com/oday/mawsool-linkedin-profile-to-company-website) |
| You want the job history only. | [Work Experience](https://apify.com/oday/mawsool-linkedin-profile-experience) |
| You want schools and degrees only. | [Education](https://apify.com/oday/mawsool-linkedin-profile-education) |
| You want a yes or no for one certificate. | [Certification Checker](https://apify.com/oday/mawsool-linkedin-certification-checker) |
| You want certificates, patents, courses, and publications. | [Certifications and Patents](https://apify.com/oday/mawsool-linkedin-profile-credentials) |
| You want likes and comments for outreach. | [Profile Activity](https://apify.com/oday/mawsool-linkedin-profile-activity) |
| You have a company URL and want the full company record. | [Company Details](https://apify.com/oday/mawsool-linkedin-company-details) |
| You have a large file of company URLs. | [Mass Company Scraper](https://apify.com/oday/mawsool-mass-linkedin-company-scraper) |
| You want the website, industry, and employee range. | [Firmographics and Website](https://apify.com/oday/mawsool-linkedin-company-firmographics) |
| You want office addresses. | [Company Locations](https://apify.com/oday/mawsool-linkedin-company-locations) |
| You want lookalike companies. | [Similar Companies](https://apify.com/oday/mawsool-linkedin-similar-companies) |
| You want the recent posts on a company page. | [Company Posts](https://apify.com/oday/mawsool-linkedin-company-posts) |
| You want only new posts on the next scheduled run. | [Company Post Monitor](https://apify.com/oday/mawsool-linkedin-company-post-watch) |

The same list is on [Mawsool's Apify profile](https://apify.com/oday).

## Use with AI agents

Paste this to Claude, ChatGPT, Cursor, or any client that can call an Apify Actor:

```
Use oday/mawsool-linkedin-personal-email-finder. Pass a LinkedIn profile URL you already have. Return the personal email only on a 100% exact match. No match, no charge. Starting from $30 per 1,000 found. No cookies.
```

To load the Actors without a Store search, add this MCP server:

`https://mcp.apify.com?tools=oday/mawsool-fix-broken-linkedin-urls,oday/mawsool-email-linkedin-lookup,oday/mawsool-linkedin-personal-email-finder,oday/mawsool-linkedin-profile-freshness`


This is a personal mailbox on record: Gmail, Outlook, Hotmail, Yahoo, and the same kind of address people keep for years. It is not a guessed `first.last@company.com`. A 99% match is dropped. You never pay for it, and it never appears in the dataset.

Mawsool holds **400M+ LinkedIn profiles with an exact personal email on record**. Most matches are Gmail, Outlook, Yahoo, or Hotmail.

Mawsool is not affiliated with LinkedIn. You supply the profile URL. This Actor does not log into LinkedIn, does not crawl LinkedIn pages, and does not ask you for a LinkedIn cookie or password.

## Who this is for

Sales and GTM teams who already have the profile URL and need a mailbox that still works after the person changes jobs.

Recruiters, HR, and headhunters who should not write to the company inbox. A message to the work address can land with the current employer. A personal mailbox reaches the person.

RevOps cleaning a list after the work email bounced.

Account-based marketing teams who already know the buying committee and need a personal address for a lawful customer list on an ad platform. Building that audience from a search is a later Mawsool Actor. This one enriches URLs you already have.

## Why a personal email beats a work email

A work address belongs to the employer. It dies on the day they leave, and it is the wrong door for a recruiter.

A primary personal address is different. People open their bank, their phone, their recovery codes, and ten years of accounts on that Gmail, Outlook, Yahoo, or Hotmail. They almost never retire it. The address stays the person, while the job title and the company domain change.

The second reason it is priced starting from $30 per 1,000 found, not like a pattern-guess tool: the address is exact-matched to that LinkedIn profile. It is not a formula. If we are not certain, we return nothing and we do not charge.

## How to run it

Add the profile URLs you already have. The professional-use box is on by default and does not block the run.

```json
{
  "lawfulUse": true,
  "urls": ["https://www.linkedin.com/in/the-profile-you-already-have"]
}
```

Paste a CSV with a `url` or `linkedinUrl` column, or upload the export from HubSpot, Salesforce, Clay, or a recruiter tool. Lists over 200 continue if the run stops. Set `resumeId` to skip profiles that already returned an email.

## What a row looks like

A match. You are charged once for this profile. Extra addresses on the same profile are included in that charge.

```json
{
  "inputUrl": "https://www.linkedin.com/in/the-profile-you-already-have",
  "hasPersonalEmail": true,
  "personalEmail": "person@gmail.com",
  "personalEmails": "person@gmail.com",
  "emailCount": 1,
  "emailProvider": "Gmail",
  "matchType": "exact",
  "success": true
}
```

No exact match. The row is successful, the email is empty, and you are not charged.

```json
{
  "inputUrl": "https://www.linkedin.com/in/the-profile-you-already-have",
  "hasPersonalEmail": false,
  "personalEmail": null,
  "emailCount": 0,
  "emailProvider": null,
  "matchType": "none",
  "success": true
}
```

Filter the dataset to `hasPersonalEmail` = true. That is the list you load into the sequence, the ATS, or the ad platform.

## Check the exact match

Take `personalEmail` from a row where `hasPersonalEmail` is true and paste it into [Email to LinkedIn](https://apify.com/oday/mawsool-email-linkedin-lookup) ([reverse email lookup demo](https://apify.com/oday/mawsool-email-linkedin-lookup/examples/reverse-email-lookup-demo)).

That Actor goes the other way: mailbox to profile. When `hasLinkedIn` is true and the profile URL is the one you started with, the exact match checks out. A miss on that lookup means this Actor had no certain personal email for that URL, so you were not charged here.

## Price

You pay only when a personal email is found. One profile is one charge, even if that profile has more than one address on record. Starting from $30 per 1,000. Gold, Platinum, and Diamond are $30. The free plan is $50.

| Plan | Per 1,000 emails found |
| --- | --- |
| Free | $50 |
| Bronze | $46 |
| Silver | $42 |
| Gold, Platinum, and Diamond | $30 |

Paid Apify plans get the lower price automatically. A list of 1,000 URLs that matches 400 profiles costs 400 charges, not 1,000.

Runs of this Actor on Apify are billed here. A flat file, a private deployment, or a volume contract is a separate delivery, not a way to skip Store charges for the same runs. For that separate delivery, email [info@mawsool.tech](mailto:info@mawsool.tech).

## Where each team uses the match

**GTM and sales.** The work email bounced, or the champion changed jobs. You still have the LinkedIn URL. This Actor returns the mailbox they actually read.

**Recruiting, HR, and headhunting.** Do not send a confidential approach to the company domain. The personal address is the one that does not notify the current employer.

**Account-based marketing and marketing intelligence.** You already have the LinkedIn URLs of a buying committee. The personal emails can be uploaded as a customer list on Google Ads, Meta, LinkedIn Campaign Manager, or X, where that platform allows a customer list and you have a lawful basis. This Actor does not build the audience. It enriches the URLs you bring. A search Actor for net-new accounts can come later.

**Clay, HubSpot, Salesforce, Make, Zapier.** Put this step after a profile-URL column. Map `personalEmail` when `hasPersonalEmail` is true.

## Example tasks

Open one, press Start, then replace the example URL with your own list.

| Task | Search it answers |
| --- | --- |
| LinkedIn URL to Gmail demo | linkedin url to gmail |
| Find personal email from LinkedIn profile URLs | find personal email from linkedin |
| Sales list after the work email bounced | linkedin email for outreach |
| Recruiter and headhunter shortlist | linkedin email finder recruiting |
| HR outreach off the company inbox | personal email for recruiting |
| Clay waterfall step | clay linkedin personal email |
| HubSpot or Salesforce backfill | hubspot linkedin email |
| Customer list for Google and Meta | linkedin emails for custom audience |
| ABM buying committee | account based marketing personal email |
| Saudi and GCC list, PDPL-aware | linkedin email saudi arabia |

## FAQ

### How do I find a LinkedIn profile from an email?
Use [Reverse Email Lookup](https://apify.com/oday/mawsool-email-linkedin-lookup). It returns the profile only on an exact match. Starting from $0.60 per 1,000 emails. No cookies.

### How do I check that an email belongs to a specific person?
Run the email through [Reverse Email Lookup](https://apify.com/oday/mawsool-email-linkedin-lookup) and compare `linkedinUrl` with the profile you already know. Starting from $0.60 per 1,000 emails.

### How do I get a personal email from a LinkedIn URL?
Paste the profile URL here. A personal Gmail, Outlook, Yahoo, or Hotmail comes back only on a 100% match, and a miss is free. Starting from $30 per 1,000 found. No cookies.

### What is a cheaper way to refresh LinkedIn company and headline data?
Use [Profile Freshness Check](https://apify.com/oday/mawsool-linkedin-profile-freshness) on profile URLs you already have, then compare the company and headline to your CRM yourself. Starting from $0.40 per 1,000. No cookies.

### How do I find a LinkedIn profile from a name and company?
Use [LinkedIn Profile Finder](https://apify.com/oday/mawsool-linkedin-profile-finder) with the name and company. Exact and confident matches only. Starting from $0.40 per 1,000 lookups.

### Can I run this from Clay, Make, or n8n?
Yes. Clay and Make run `oday/mawsool-linkedin-personal-email-finder` with the profile URL in `urls`, and n8n can call the same Actor through the Apify API. Starting from $30 per 1,000 found. No match, no charge.

### Do you charge when there is no email?

No. `success` is true, `hasPersonalEmail` is false, and that row is free.

### Do you return guessed addresses?

No. `first.last@company.com` and any match under 100% are dropped. They are not a row.

### Is this a LinkedIn scraper?

No. Mawsool is not affiliated with LinkedIn. There is no LinkedIn login, no cookie, and no page crawl. You provide a profile URL. The Actor looks that URL up in Mawsool’s own exact-match records.

### Why do these emails stay valid?

They are primary personal mailboxes. People build the rest of their accounts on them, so they rarely change. A work email often dies at the next job.

### Why is a personal email better for recruiting?

A recruiter who writes to the company address can expose the approach to the current employer. The personal mailbox reaches the candidate.

### What is the coverage?

400M+ LinkedIn profiles with an exact personal email on record. Most returned mailboxes are Gmail, Outlook, Yahoo, or Hotmail.

### Is this GDPR, CCPA, and PDPL compliant?

Mawsool publishes a [privacy policy](https://mawsool.tech/privacy-policy), a [CCPA notice](https://mawsool.tech/CCPA), and a [Saudi PDPL notice](https://mawsool.tech/PDPL). You are the controller of your outreach or ad audience. You confirm a lawful basis before the run. This Actor does not send the email and does not upload the list to an ad platform for you.

### Is the matching patented?

The matching, sourcing, and verification system is USPTO patent pending, application 63/756,973. That is a filed application, not a granted patent.

### How do I check that the email really matches this profile?

Paste the returned personal email into [Email to LinkedIn](https://apify.com/oday/mawsool-email-linkedin-lookup). That reverse lookup is the quality check. `hasLinkedIn: true` plus the same profile URL means the exact match holds. Use this Actor when you have the profile and want the personal mailbox. Use [Email to LinkedIn](https://apify.com/oday/mawsool-email-linkedin-lookup) when you have the mailbox and want the profile.

### Can I buy a flat file or a very large volume?

Yes, as a separate delivery. Email [info@mawsool.tech](mailto:info@mawsool.tech). Runs you start on Apify stay on the prices above.

### Does a long list keep going?

Yes. Up to 50,000 URLs. A list over 200 resumes on the next run. After 15 lookup outages in a row the run stops so finished rows stay saved. A failed lookup is not charged, so you can run it again.

## Related Actors

[Email to LinkedIn](https://apify.com/oday/mawsool-email-linkedin-lookup) when you start from the mailbox, or when you want to check the exact-match quality of an email this Actor just returned. Company Website and Firmographics when you need the employer domain. [Current Company Checker](https://apify.com/oday/mawsool-linkedin-company-checker) when you only need to know if they still work there.

**Support:** [info@mawsool.tech](mailto:info@mawsool.tech)
