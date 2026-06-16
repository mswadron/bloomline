-- schema.sql
-- Bloomline core schema (PostgreSQL + PostGIS).
--
-- Apply order:
--   1) createdb bloom && psql -d bloom -c "CREATE EXTENSION postgis;"
--   2) psql -d bloom -f schema.sql
--   3) psql -d bloom -f phenology_functions.sql
--   4) load ecoregion polygons into the ecoregions table (shp2pgsql / ogr2ogr)
--   5) python pipeline/build_phenology.py        -- fills species_phenology cache
--
-- Design notes:
--   * Contributions are APPEND-ONLY rows, never edits to a shared blob, so many
--     people can write at once without colliding (Postgres MVCC + row locks).
--   * Rows that can be edited carry a `version` column for optimistic concurrency:
--     UPDATE ... WHERE id = :id AND version = :v;  0 rows => someone beat you, retry.
--   * Moderation is a `status` column, not a write gate: submissions land instantly
--     as 'pending' and go live when 'approved'.

CREATE EXTENSION IF NOT EXISTS postgis;

-- ---------------------------------------------------------------------------
-- People who can submit links / flags. Identity (login) is handled by an
-- external provider (Auth0 / Clerk / Supabase Auth); we just store their id.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contributors (
    id          bigserial PRIMARY KEY,
    handle      text UNIQUE NOT NULL,        -- external auth user id / username
    display_name text,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- EPA Level III/IV ecoregions (the "why it grows here" geography layer).
-- Populate geom from the EPA shapefiles. SRID 4326 (lat/lng).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ecoregions (
    id        bigserial PRIMARY KEY,
    code      text,                          -- e.g. EPA Level III/IV code
    name      text,
    geom      geometry(MultiPolygon, 4326)
);
CREATE INDEX IF NOT EXISTS ecoregions_geom_gix ON ecoregions USING gist (geom);

-- ---------------------------------------------------------------------------
-- Species: the synced "truth" layer. inat_taxon_id is the join key for the
-- USDA PLANTS / GBIF enrichment sync that backfills the metadata columns.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS species (
    id              bigserial PRIMARY KEY,
    inat_taxon_id   bigint UNIQUE NOT NULL,
    scientific_name text NOT NULL,
    common_name     text,
    family          text,                    -- from POWO / GBIF backbone
    native_status   text,                    -- 'native' | 'introduced' | ... (USDA)
    invasive_flag   boolean NOT NULL DEFAULT false,
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Phenology cache: one flowering histogram per species per ecoregion.
-- doy_histogram is a length-366 array; index d = count on day-of-year d+1.
-- Populated by pipeline/build_phenology.py; read by api/route_species.py.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS species_phenology (
    id             bigserial PRIMARY KEY,
    species_id     bigint NOT NULL REFERENCES species(id) ON DELETE CASCADE,
    ecoregion_id   bigint NOT NULL REFERENCES ecoregions(id) ON DELETE CASCADE,
    doy_histogram  int[]  NOT NULL,
    sample_size    integer NOT NULL DEFAULT 0,
    computed_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (species_id, ecoregion_id)
);
CREATE INDEX IF NOT EXISTS species_phenology_eco_idx
    ON species_phenology (ecoregion_id);

-- ---------------------------------------------------------------------------
-- Contributor-submitted educational resources (YouTube links, articles, etc).
-- APPEND-ONLY: each submission is its own row. `status` gates visibility;
-- `version` supports safe edits/moderation via optimistic concurrency.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resources (
    id             bigserial PRIMARY KEY,
    species_id     bigint NOT NULL REFERENCES species(id) ON DELETE CASCADE,
    title          text NOT NULL,
    url            text NOT NULL,
    kind           text,                      -- 'video' | 'article' | 'guide' | ...
    score          integer NOT NULL DEFAULT 0,-- upvotes, for ORDER BY
    status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected')),
    submitted_by   bigint REFERENCES contributors(id),
    version        integer NOT NULL DEFAULT 1,
    created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS resources_species_status_idx
    ON resources (species_id, status);

-- ---------------------------------------------------------------------------
-- Curation flags: the human-judgment layer no dataset provides, e.g.
-- 'roadside_conspicuous' = "you'd actually notice this from a car".
-- Same append-only + status + version pattern as resources.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS curation_flags (
    id             bigserial PRIMARY KEY,
    species_id     bigint NOT NULL REFERENCES species(id) ON DELETE CASCADE,
    flag           text NOT NULL,             -- e.g. 'roadside_conspicuous'
    status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected')),
    submitted_by   bigint REFERENCES contributors(id),
    version        integer NOT NULL DEFAULT 1,
    created_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (species_id, flag)
);
CREATE INDEX IF NOT EXISTS curation_flags_species_idx
    ON curation_flags (species_id, flag, status);
