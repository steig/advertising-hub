#!/usr/bin/env python3
"""
Budget Pacing Checker
=====================
Shows which campaigns are under/over pacing their daily budgets.
Flags campaigns at risk of running out or underspending.

Usage:
  python budget_pacing.py --customer-id 1234567890
"""
import argparse
import os
import sys
from datetime import date

def get_client():
    from google.ads.googleads.client import GoogleAdsClient
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


def check_pacing(client, customer_id: str):
    ga_service = client.get_service("GoogleAdsService")
    today = date.today()
    day_of_month = today.day
    days_in_month = 30  # approximate

    query = """
        SELECT
            campaign.name,
            campaign.status,
            campaign_budget.amount_micros,
            metrics.cost_micros
        FROM campaign
        WHERE campaign.status = 'ENABLED'
            AND campaign_budget.amount_micros > 0
            AND segments.date DURING THIS_MONTH
    """

    # Aggregate cost by campaign
    campaigns = {}
    response = ga_service.search(customer_id=customer_id, query=query)
    for row in response:
        name = row.campaign.name
        if name not in campaigns:
            campaigns[name] = {
                "daily_budget": row.campaign_budget.amount_micros / 1_000_000,
                "mtd_spend": 0,
            }
        campaigns[name]["mtd_spend"] += row.metrics.cost_micros / 1_000_000

    print(f"Budget Pacing Report — {today.strftime('%B %d, %Y')} (Day {day_of_month})")
    print(f"{'Campaign':<45} {'Budget':>10} {'MTD Spend':>12} {'Pace':>8} {'Status':>10}")
    print("-" * 90)

    for name, data in sorted(campaigns.items(), key=lambda x: x[1]["mtd_spend"], reverse=True):
        monthly_budget = data["daily_budget"] * days_in_month
        expected_spend = monthly_budget * (day_of_month / days_in_month)
        pace = data["mtd_spend"] / expected_spend if expected_spend > 0 else 0

        if pace > 1.15:
            status = "OVERPACING"
        elif pace < 0.85:
            status = "UNDERPACING"
        else:
            status = "ON PACE"

        print(f"{name:<45} ${data['daily_budget']:>8.2f} ${data['mtd_spend']:>10.2f} {pace:>7.0%} {status:>10}")


def main():
    parser = argparse.ArgumentParser(description="Check campaign budget pacing")
    parser.add_argument("--customer-id", required=True)
    args = parser.parse_args()
    client = get_client()
    check_pacing(client, args.customer_id.replace("-", ""))


if __name__ == "__main__":
    main()
