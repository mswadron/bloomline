#!/usr/bin/env python3
"""
route_species.py
The read path. Given a route, return what is flowering along it right now:
each species with its bloom STAGE (coming / rising / peak / ending), native or
invasive status, the curated roadside-conspicuous flag, and approved links.

This is the query the front end calls. It joins:
  ecoregions the route touches  ->  cached phenology  ->  species metadata
  ->  approved educational resources  ->  approved roadside flag.

Requires: psycopg2-binary  (plus schema.sql + phenology_functions.sql applied)
"""

import psycopg2
import psycopg2.extras
from datetime import date

DB = dict(host="localhost", dbname="bloom", user="bloom", password="CHANGE_ME")


def route_wkt(waypoints):
    """waypoints = [(lat, lng), ...]  ->  WKT LINESTRING (lng lat order)."""
    return "LINESTRING(" + ", ".join(f"{lng} {lat}" for lat, lng in waypoints) + ")"


QUERY = """
WITH route AS (
    SELECT ST_GeomFromText(%(route)s, 4326) AS geom
),
hit_regions AS (                       -- ecoregions the route passes through
    SELECT e.id
    FROM ecoregions e, route r
    WHERE ST_DWithin(e.geom, r.geom, %(buffer_deg)s)
),
scored AS (                            -- flowering intensity in DOY windows
    SELECT
        sp.species_id,
        SUM( win(sp.doy_histogram, %(today)s,  -7,   7) ) AS now_ct,
        SUM( win(sp.doy_histogram, %(today)s, -21,  -8) ) AS prev_ct,
        SUM( win(sp.doy_histogram, %(today)s,   8,  21) ) AS next_ct,
        SUM( sp.sample_size )                             AS n
    FROM species_phenology sp
    JOIN hit_regions h ON h.id = sp.ecoregion_id
    GROUP BY sp.species_id
)
SELECT
    s.id,
    s.scientific_name,
    s.common_name,
    s.family,
    s.native_status,
    s.invasive_flag,
    sc.now_ct, sc.prev_ct, sc.next_ct, sc.n,
    CASE
        WHEN sc.now_ct = 0 AND sc.next_ct > 0 THEN 'coming'
        WHEN sc.next_ct < sc.prev_ct          THEN 'ending'
        WHEN sc.next_ct > sc.prev_ct          THEN 'rising'
        ELSE 'peak'
    END AS stage,
    EXISTS (
        SELECT 1 FROM curation_flags cf
        WHERE cf.species_id = s.id
          AND cf.flag = 'roadside_conspicuous'
          AND cf.status = 'approved'
    ) AS roadside,
    COALESCE((
        SELECT json_agg(json_build_object('title', r.title, 'url', r.url, 'kind', r.kind)
                        ORDER BY r.score DESC)
        FROM resources r
        WHERE r.species_id = s.id AND r.status = 'approved'
    ), '[]'::json) AS links
FROM scored sc
JOIN species s ON s.id = sc.species_id
WHERE (sc.now_ct > 0 OR sc.next_ct > 0)        -- flowering now or about to
ORDER BY roadside DESC, sc.now_ct DESC
LIMIT %(limit)s;
"""


def flowering_now(waypoints, today=None, buffer_deg=0.05, limit=40):
    today = today or date.today().timetuple().tm_yday
    conn = psycopg2.connect(**DB)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(QUERY, {
        "route": route_wkt(waypoints),
        "buffer_deg": buffer_deg,     # ~0.05 deg ~= 5.5 km corridor
        "today": today,
        "limit": limit,
    })
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows


if __name__ == "__main__":
    route = [(40.4592, -74.3590), (40.5187, -74.4121), (40.5749, -74.4632)]
    rows = flowering_now(route)

    # Narrate the drive: group by stage, like "ending: catalpa / coming: mimosa".
    order = {"ending": 0, "peak": 1, "rising": 2, "coming": 3}
    rows.sort(key=lambda r: (order.get(r["stage"], 9), not r["roadside"]))

    cur_stage = None
    for r in rows:
        if r["stage"] != cur_stage:
            cur_stage = r["stage"]
            print(f"\n== {cur_stage.upper()} ==")
        name = r["common_name"] or r["scientific_name"]
        inv  = " (invasive)" if r["invasive_flag"] else ""
        road = " [roadside]" if r["roadside"] else ""
        print(f"  {name}{inv}{road}  --  {len(r['links'])} link(s)")
