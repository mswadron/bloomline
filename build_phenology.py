#!/usr/bin/env python3
"""
build_phenology.py
Populate the species_phenology cache.

Strategy: ONE sweep per ecoregion. For each ecoregion we page through every
flowering plant observation inside its bounding box, keep only the points that
fall inside the actual polygon, and bin each by day-of-year. A single pass
yields BOTH which species flower there AND when, with no per-species API calls.

Deep pagination uses id_above (iNat caps page*per_page at 10,000). For large
ecoregions, tile the bounding box and run per tile; MAX_PAGES is a safety guard.

Requires: requests, psycopg2-binary, shapely
"""

import time
import requests
import psycopg2
from datetime import datetime
from shapely import wkt
from shapely.geometry import Point
from shapely.prepared import prep

INAT = "https://api.inaturalist.org/v1/observations"
DB   = dict(host="localhost", dbname="bloom", user="bloom", password="CHANGE_ME")

TERM_ID, TERM_VALUE_ID = 12, 13     # Plant Phenology = Flowering
PER_PAGE  = 200
SLEEP_SEC = 1.1
MAX_PAGES = 200                     # guard; tile big regions for a full run


def sweep_ecoregion(bbox, inside):
    """Yield (taxon_id, sci_name, common, day_of_year) for flowering plants
    whose point lies inside the ecoregion polygon."""
    swlat, swlng, nelat, nelng = bbox
    id_above = 0
    for _ in range(MAX_PAGES):
        params = {
            "iconic_taxa": "Plantae",
            "term_id": TERM_ID, "term_value_id": TERM_VALUE_ID,
            "captive": "false", "quality_grade": "research",
            "swlat": swlat, "swlng": swlng, "nelat": nelat, "nelng": nelng,
            "order_by": "id", "order": "asc",
            "id_above": id_above, "per_page": PER_PAGE,
        }
        resp = requests.get(INAT, params=params, timeout=60)
        resp.raise_for_status()
        results = resp.json().get("results", [])
        if not results:
            break
        for o in results:
            id_above = o["id"]
            geo, on, t = o.get("geojson"), o.get("observed_on"), o.get("taxon")
            if not (geo and on and t and t.get("id") and t.get("name")):
                continue
            lng, lat = geo["coordinates"]
            if not inside.contains(Point(lng, lat)):
                continue
            doy = datetime.strptime(on, "%Y-%m-%d").timetuple().tm_yday
            yield (t["id"], t["name"],
                   (t.get("preferred_common_name") or ""), doy)
        time.sleep(SLEEP_SEC)


def main():
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()
    cur.execute("""
        SELECT id, ST_AsText(geom),
               ST_YMin(geom), ST_XMin(geom), ST_YMax(geom), ST_XMax(geom)
        FROM ecoregions WHERE geom IS NOT NULL
    """)
    regions = cur.fetchall()

    for eco_id, geom_wkt, swlat, swlng, nelat, nelng in regions:
        inside = prep(wkt.loads(geom_wkt))
        hist = {}   # taxon_id -> {"name", "common", "doy": [0]*366}

        for tid, name, common, doy in sweep_ecoregion(
                (swlat, swlng, nelat, nelng), inside):
            h = hist.setdefault(tid, {"name": name, "common": common,
                                      "doy": [0] * 366})
            if 1 <= doy <= 366:
                h["doy"][doy - 1] += 1

        for tid, h in hist.items():
            cur.execute("""
                INSERT INTO species (inat_taxon_id, scientific_name, common_name)
                VALUES (%s, %s, %s)
                ON CONFLICT (inat_taxon_id) DO UPDATE
                  SET common_name = COALESCE(EXCLUDED.common_name, species.common_name)
                RETURNING id
            """, (tid, h["name"], h["common"] or None))
            species_id = cur.fetchone()[0]
            cur.execute("""
                INSERT INTO species_phenology
                  (species_id, ecoregion_id, doy_histogram, sample_size)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (species_id, ecoregion_id) DO UPDATE
                  SET doy_histogram = EXCLUDED.doy_histogram,
                      sample_size   = EXCLUDED.sample_size,
                      computed_at   = now()
            """, (species_id, eco_id, h["doy"], sum(h["doy"])))

        conn.commit()
        print(f"ecoregion {eco_id}: cached {len(hist)} flowering species")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
