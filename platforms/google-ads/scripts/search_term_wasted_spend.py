#!/usr/bin/env python3
"""
Search Term Wasted Spend Finder
================================
Pulls search terms with spend but zero conversions from Google Ads.
Outputs a CSV of wasted spend sorted by cost descending.

Requires:
  pip install google-ads

Usage:
  python search_term_wasted_spend.py --customer-id 1234567890 --days 30

Environment:
  GOOGLE_ADS_DEVELOPER_TOKEN
  GOOGLE_ADS_CLIENT_ID
  GOOGLE_ADS_CLIENT_SECRET
  GOOGLE_ADS_REFRESH_TOKEN
  GOOGLE_ADS_LOGIN_CUSTOMER_ID (optional, for MCC)
"""
import argparse
import csv
import os
import sys
from datetime import date, timedelta

def get_client():
    """Initialize Google Ads client from environment variables."""
    try:
        from google.ads.googleads.client import GoogleAdsClient
    except ImportError:
        print("Error: google-ads package not installed.")
        print("Run: pip install google-ads")
        sys.exit(1)

    config = {
        "developer_token": os.environ["GOOGLE_ADS_DEVELOPER_TOKEN"],
        "client_id": os.environ["GOOGLE_ADS_CLIENT_ID"],
        "client_secret": os.environ["GOOGLE_ADS_CLIENT_SECRET"],
        "refresh_token": os.environ["GOOGLE_ADS_REFRESH_TOKEN"],
        "use_proto_plus": True,
    }
    login_id = os.environ.get("GOOGLE_ADS_LOGIN_CUSTOMER_ID")
    if login_id:
        config["login_customer_id"] = login_id

    return GoogleAdsClient.load_from_dict(config)


def find_wasted_spend(client, customer_id: str, days: int, min_cost: float = 0.0):
    """Query search terms with spend but zero conversions."""
    ga_service = client.get_service("GoogleAdsService")

    end_date = date.today() - timedelta(days=1)
    start_date = end_date - timedelta(days=days - 1)

    query = f"""
        SELECT
            search_term_view.search_term,
            search_term_view.status,
            campaign.name,
            ad_group.name,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions
        FROM search_term_view
        WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'
            AND metrics.cost_micros > {int(min_cost * 1_000_000)}
            AND metrics.conversions < 1
        ORDER BY metrics.cost_micros DESC
        LIMIT 500
    """

    results = []
    response = ga_service.search(customer_id=customer_id, query=query)

    for row in response:
        results.append({
            "search_term": row.search_term_view.search_term,
            "status": row.search_term_view.status.name,
            "campaign": row.campaign.name,
            "ad_group": row.ad_group.name,
            "impressions": row.metrics.impressions,
            "clicks": row.metrics.clicks,
            "cost": row.metrics.cost_micros / 1_000_000,
            "conversions": row.metrics.conversions,
        })

    return results


def main():
    parser = argparse.ArgumentParser(description="Find wasted spend in search terms")
    parser.add_argument("--customer-id", required=True, help="Google Ads customer ID (no dashes)")
    parser.add_argument("--days", type=int, default=30, help="Lookback days (default: 30)")
    parser.add_argument("--min-cost", type=float, default=0.0, help="Minimum cost threshold in dollars")
    parser.add_argument("--output", default="wasted_spend.csv", help="Output CSV filename")
    args = parser.parse_args()

    customer_id = args.customer_id.replace("-", "")
    client = get_client()

    print(f"Pulling search terms for customer {customer_id}, last {args.days} days...")
    results = find_wasted_spend(client, customer_id, args.days, args.min_cost)

    if not results:
        print("No wasted spend found. Nice!")
        return

    total_waste = sum(r["cost"] for r in results)
    print(f"Found {len(results)} search terms with ${total_waste:,.2f} total wasted spend")

    with open(args.output, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)

    print(f"Saved to {args.output}")
    print(f"\nTop 10 wasted terms:")
    for r in results[:10]:
        print(f"  ${r['cost']:>8.2f}  {r['clicks']:>4} clicks  {r['search_term']}")


if __name__ == "__main__":
    main()
