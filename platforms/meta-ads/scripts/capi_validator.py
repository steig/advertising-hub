#!/usr/bin/env python3
"""
Meta Conversions API (CAPI) Event Validator
============================================
Validates that server-side events are being received and deduplicated properly.
Checks Event Match Quality score for each event type.

Requires:
  pip install facebook-business

Usage:
  python capi_validator.py --pixel-id 1234567890 --access-token YOUR_TOKEN

Environment:
  META_ACCESS_TOKEN (alternative to --access-token)
"""
import argparse
import json
import os
import sys
from datetime import datetime, timedelta

def validate_capi(pixel_id: str, access_token: str, days: int = 7):
    try:
        from facebook_business.api import FacebookAdsApi
        from facebook_business.adobjects.adspixel import AdsPixel
    except ImportError:
        print("Error: facebook-business package not installed.")
        print("Run: pip install facebook-business")
        sys.exit(1)

    FacebookAdsApi.init(access_token=access_token)
    pixel = AdsPixel(pixel_id)

    # Get event stats
    end_time = datetime.now()
    start_time = end_time - timedelta(days=days)

    print(f"CAPI Validation Report — Pixel {pixel_id}")
    print(f"Date range: {start_time.strftime('%Y-%m-%d')} to {end_time.strftime('%Y-%m-%d')}")
    print("=" * 70)

    try:
        stats = pixel.get_stats(params={
            "start_time": start_time.strftime("%Y-%m-%dT00:00:00"),
            "end_time": end_time.strftime("%Y-%m-%dT23:59:59"),
        })

        for event_stat in stats:
            data = event_stat.export_all_data() if hasattr(event_stat, "export_all_data") else dict(event_stat)
            print(f"\nEvent: {data.get('event', 'unknown')}")
            print(f"  Total events: {data.get('count', 'N/A')}")
            print(f"  Event match quality: {data.get('event_match_quality', 'N/A')}")

    except Exception as e:
        print(f"Error fetching pixel stats: {e}")
        print("\nCommon issues:")
        print("  - Token doesn't have ads_read permission")
        print("  - Pixel ID is incorrect")
        print("  - Token doesn't have access to this pixel's Business Manager")

    print("\n" + "=" * 70)
    print("Validation Checks:")
    print("  [ ] Server events appearing in Events Manager > Test Events")
    print("  [ ] Event match quality score > 6.0 for Purchase events")
    print("  [ ] Deduplication working (no 2x spike in conversions)")
    print("  [ ] event_id present on both browser and server events")


def main():
    parser = argparse.ArgumentParser(description="Validate Meta CAPI setup")
    parser.add_argument("--pixel-id", required=True, help="Meta Pixel ID")
    parser.add_argument("--access-token", default=os.environ.get("META_ACCESS_TOKEN"), help="Access token")
    parser.add_argument("--days", type=int, default=7, help="Lookback days")
    args = parser.parse_args()

    if not args.access_token:
        print("Error: Provide --access-token or set META_ACCESS_TOKEN")
        sys.exit(1)

    validate_capi(args.pixel_id, args.access_token, args.days)


if __name__ == "__main__":
    main()
