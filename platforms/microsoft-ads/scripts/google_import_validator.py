#!/usr/bin/env python3
"""
Microsoft Ads — Google Import Validation
==========================================
After importing campaigns from Google Ads to Microsoft Ads,
this script checks for common issues that cause performance
problems post-import.

This is a checklist-style validator, not an API script.
Run it to generate a validation report you can work through.

Usage:
  python google_import_validator.py
"""

def generate_report():
    print("""
Microsoft Ads — Google Import Validation Checklist
====================================================

Run through this checklist after every Google → Microsoft import.

STRUCTURE
─────────
[ ] Campaign names imported correctly (no truncation)
[ ] Ad group structure matches Google (1:1 mapping)
[ ] Shared budgets converted to individual campaign budgets
    (Microsoft doesn't support shared budgets the same way)
[ ] Campaign-level location targeting transferred
    ⚠️  Common issue: Google radius targeting doesn't import cleanly

BIDDING
───────
[ ] Bid strategy reset to manual or Microsoft-native strategy
    ⚠️  Google's Smart Bidding strategies DO NOT import.
    Microsoft has its own: Enhanced CPC, Maximize Clicks, 
    Target CPA, Target ROAS, Maximize Conversions
[ ] Starting bids set appropriately (Google bids may be too high)
    Rule of thumb: Start at 70-80% of Google bids, adjust from there
[ ] Portfolio bid strategies recreated manually if needed

KEYWORDS
────────
[ ] Match types imported correctly
    ⚠️  Close variant behavior differs between Google and Microsoft
[ ] Negative keywords imported at campaign AND ad group level
    ⚠️  Common miss: Negative keyword lists don't import
    You must recreate shared negative keyword lists manually
[ ] Keyword status matches (paused keywords stay paused)

ADS
───
[ ] RSA headlines and descriptions transferred
[ ] Ad extensions imported (sitelinks, callouts, structured snippets)
    ⚠️  Not all extension types have Microsoft equivalents
[ ] Final URLs working (check for Google-specific tracking parameters)
[ ] Display URLs rendering correctly

TRACKING
────────
[ ] UET tag installed on website (Microsoft's equivalent of Google tag)
[ ] Conversion goals created in Microsoft Ads
    ⚠️  Google conversion actions DO NOT import
    You must set up Microsoft conversion tracking separately
[ ] Auto-tagging enabled (or manual UTM parameters updated)
[ ] UTM parameters updated from google/cpc to bing/cpc (or msn/cpc)

AUDIENCES
─────────
[ ] Remarketing lists recreated using UET tag
    ⚠️  Google remarketing audiences DO NOT import
[ ] In-market audiences selected (Microsoft has its own taxonomy)
[ ] LinkedIn Profile Targeting enabled (Microsoft-only feature!)
    This is a major differentiator — target by company, industry, 
    or job function in search campaigns

BUDGET
──────
[ ] Daily budgets set appropriately
    Rule of thumb: Start at 20-30% of Google budget
    Microsoft search volume is ~30% of Google's in most markets
[ ] Bid adjustments reviewed (device, location, schedule)
[ ] Audience bid adjustments set to observation mode initially

POST-IMPORT MONITORING (First 7 Days)
──────────────────────────────────────
[ ] Check impression share — if very low, bids may be too conservative
[ ] Monitor search terms report — Microsoft's broad match is often broader
[ ] Verify conversion tracking is firing correctly
[ ] Compare CPC to Google — Microsoft CPCs are typically 30-40% lower
[ ] Check for any disapproved ads (editorial policies differ slightly)
""")

if __name__ == "__main__":
    generate_report()
