-- phenology_functions.sql
-- Apply once after schema.sql:  psql -d bloom -f phenology_functions.sql
--
-- win(hist, today, lo, hi) sums a species' flowering counts over the day-of-year
-- window [today+lo .. today+hi], wrapping correctly across the Dec/Jan boundary.
-- today is 1..366. doy_histogram is the length-366 array on species_phenology.

CREATE OR REPLACE FUNCTION win(hist int[], today int, lo int, hi int)
RETURNS bigint
LANGUAGE sql IMMUTABLE AS $$
    SELECT COALESCE(SUM(hist[ ((today - 1 + d + 366) % 366) + 1 ]), 0)::bigint
    FROM generate_series(lo, hi) AS d;
$$;
