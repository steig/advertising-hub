#!/usr/bin/env python3
"""
Quality Score Distribution Report
===================================
Shows how spend is distributed across Quality Score buckets.
Goal: 70%+ of spend on QS 7+ keywords.

Usage:
  python quality_score_report.py --customer-id 1234567890
"""
import argparse
import os
import sys

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


def quality_score_report(client, customer_id: str):
    ga_service = client.get_service("GoogleAdsService")

    query = """
        SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.quality_info.quality_score,
            metrics.cost_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.conversions
        FROM keyword_view
        WHERE ad_group_criterion.status = 'ENABLED'
            AND campaign.status = 'ENABLED'
            AND segments.date DURING LAST_30_DAYS
        ORDER BY metrics.cost_micros DESC
    """

    buckets = {i: {"keywords": 0, "cost": 0, "clicks": 0, "conversions": 0} for i in range(1, 11)}
    buckets[0] = {"keywords": 0, "cost": 0, "clicks": 0, "conversions": 0}  # no QS

    response = ga_service.search(customer_id=customer_id, query=query)
    for row in response:
        qs = row.ad_group_criterion.quality_info.quality_score or 0
        cost = row.metrics.cost_micros / 1_000_000
        buckets[qs]["keywords"] += 1
        buckets[qs]["cost"] += cost
        buckets[qs]["clicks"] += row.metrics.clicks
        buckets[qs]["conversions"] += row.metrics.conversions

    total_cost = sum(b["cost"] for b in buckets.values())

    print("Quality Score Distribution (Last 30 Days)")
    print(f"{'QS':>4} {'Keywords':>10} {'Cost':>12} {'% Spend':>10} {'Clicks':>10} {'Conv':>8}")
    print("-" * 60)

    high_qs_spend = 0
    for qs in range(10, 0, -1):
        b = buckets[qs]
        pct = b["cost"] / total_cost * 100 if total_cost > 0 else 0
        if qs >= 7:
            high_qs_spend += b["cost"]
        label = f"{qs}" if qs > 0 else "N/A"
        print(f"{label:>4} {b['keywords']:>10} ${b['cost']:>10.2f} {pct:>9.1f}% {b['clicks']:>10} {b['conversions']:>7.1f}")

    if buckets[0]["keywords"] > 0:
        b = buckets[0]
        pct = b["cost"] / total_cost * 100 if total_cost > 0 else 0
        print(f"{'N/A':>4} {b['keywords']:>10} ${b['cost']:>10.2f} {pct:>9.1f}% {b['clicks']:>10} {b['conversions']:>7.1f}")

    print("-" * 60)
    high_pct = high_qs_spend / total_cost * 100 if total_cost > 0 else 0
    status = "HEALTHY" if high_pct >= 70 else "NEEDS WORK"
    print(f"QS 7+ spend: {high_pct:.1f}% of total — {status}")
    print(f"Target: 70%+ of spend on QS 7+ keywords")


def main():
    parser = argparse.ArgumentParser(description="Quality Score distribution report")
    parser.add_argument("--customer-id", required=True)
    args = parser.parse_args()
    client = get_client()
    quality_score_report(client, args.customer_id.replace("-", ""))


if __name__ == "__main__":
    main()
