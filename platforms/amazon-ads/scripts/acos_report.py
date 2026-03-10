#!/usr/bin/env python3
"""
Amazon Ads ACOS Report
=======================
Pulls Advertising Cost of Sale (ACOS) and Total ACOS (TACOS) 
broken down by campaign type (Sponsored Products, Brands, Display).

This is a template/reference — Amazon Ads API authentication 
requires Login with Amazon (LWA) which is separate from AWS.

Requires:
  pip install httpx

Usage:
  python acos_report.py --profile-id YOUR_PROFILE_ID

Environment:
  AMAZON_ADS_CLIENT_ID
  AMAZON_ADS_CLIENT_SECRET  
  AMAZON_ADS_REFRESH_TOKEN
"""
import argparse
import json
import os
import sys
from datetime import date, timedelta

import httpx

TOKEN_URL = "https://api.amazon.com/auth/o2/token"
API_BASE = "https://advertising-api.amazon.com"


def get_access_token() -> str:
    """Exchange refresh token for access token via Login with Amazon."""
    resp = httpx.post(TOKEN_URL, data={
        "grant_type": "refresh_token",
        "client_id": os.environ["AMAZON_ADS_CLIENT_ID"],
        "client_secret": os.environ["AMAZON_ADS_CLIENT_SECRET"],
        "refresh_token": os.environ["AMAZON_ADS_REFRESH_TOKEN"],
    })
    resp.raise_for_status()
    return resp.json()["access_token"]


def get_campaign_report(access_token: str, profile_id: str, days: int = 30):
    """Pull campaign-level performance data."""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Amazon-Advertising-API-ClientId": os.environ["AMAZON_ADS_CLIENT_ID"],
        "Amazon-Advertising-API-Scope": profile_id,
        "Content-Type": "application/json",
    }

    end_date = date.today() - timedelta(days=1)
    start_date = end_date - timedelta(days=days - 1)

    # Request async report
    report_config = {
        "startDate": start_date.strftime("%Y-%m-%d"),
        "endDate": end_date.strftime("%Y-%m-%d"),
        "configuration": {
            "adProduct": "SPONSORED_PRODUCTS",
            "groupBy": ["campaign"],
            "columns": ["campaignName", "impressions", "clicks", "cost", "purchases1d", "sales1d"],
            "reportTypeId": "spCampaigns",
            "timeUnit": "SUMMARY",
            "format": "GZIP_JSON",
        }
    }

    print(f"Amazon Ads ACOS Report — {start_date} to {end_date}")
    print(f"Profile: {profile_id}")
    print("=" * 70)
    print()
    print("Note: This script demonstrates the API structure.")
    print("Full implementation requires async report polling.")
    print()
    print("Key metrics to track:")
    print(f"  ACOS  = Ad Spend / Ad Revenue (target: <25% for most categories)")
    print(f"  TACOS = Ad Spend / Total Revenue (measures organic halo effect)")
    print(f"  Tip: If ACOS is rising but TACOS is flat, ads are driving organic growth")


def main():
    parser = argparse.ArgumentParser(description="Amazon Ads ACOS report")
    parser.add_argument("--profile-id", required=True, help="Amazon Ads profile ID")
    parser.add_argument("--days", type=int, default=30)
    args = parser.parse_args()

    for var in ["AMAZON_ADS_CLIENT_ID", "AMAZON_ADS_CLIENT_SECRET", "AMAZON_ADS_REFRESH_TOKEN"]:
        if var not in os.environ:
            print(f"Error: Set {var} environment variable")
            print("Get credentials at: https://advertising.amazon.com/API/docs/en-us/setting-up/step-1-create-lwa-app")
            sys.exit(1)

    token = get_access_token()
    get_campaign_report(token, args.profile_id, args.days)


if __name__ == "__main__":
    main()
