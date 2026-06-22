-- Enable PostGIS Extension
create extension if not exists postgis;

-- 1. Create geologic_units table
create table if not exists public.geologic_units (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    lithology text not null,
    age text not null,
    description text,
    geom geometry(Geometry, 4326) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and Create Policy
alter table public.geologic_units enable row level security;
create policy "Allow public read access to geologic_units" on public.geologic_units
    for select using (true);

-- Spatial index
create index if not exists geologic_units_geom_idx on public.geologic_units using gist (geom);


-- 2. Create public_collection_sites table
create table if not exists public.public_collection_sites (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    material_types text[] not null, -- array of material names
    access_notes text,
    difficulty text,
    best_season text,
    geom geometry(Point, 4326) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and Create Policy
alter table public.public_collection_sites enable row level security;
create policy "Allow public read access to public_collection_sites" on public.public_collection_sites
    for select using (true);

-- Spatial index
create index if not exists public_collection_sites_geom_idx on public.public_collection_sites using gist (geom);


-- 3. Create paid_digs table
create table if not exists public.paid_digs (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    business_type text, -- e.g., 'mine', 'guided tour', 'fee dig'
    material_types text[] not null, -- array of material names
    price_text text, -- price or fee details
    booking_link text,
    geom geometry(Point, 4326) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and Create Policy
alter table public.paid_digs enable row level security;
create policy "Allow public read access to paid_digs" on public.paid_digs
    for select using (true);

-- Spatial index
create index if not exists paid_digs_geom_idx on public.paid_digs using gist (geom);


-- 4. Create public_access_boundaries table
create table if not exists public.public_access_boundaries (
    id uuid primary key default gen_random_uuid(),
    owner_agency_type text not null, -- e.g., 'BLM', 'USFS', 'State', 'Private'
    description text,
    geom geometry(Geometry, 4326) not null, -- Supports Polygon or MultiPolygon (SRID 4326)
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS and Create Policy
alter table public.public_access_boundaries enable row level security;
create policy "Allow public read access to public_access_boundaries" on public.public_access_boundaries
    for select using (true);

-- Spatial index
create index if not exists public_access_boundaries_geom_idx on public.public_access_boundaries using gist (geom);


-- =========================================================================
-- DATABASE SPATIAL QUERY FUNCTIONS (RPC)
-- =========================================================================

-- Function: Find Geologic Unit containing a point (lng/lat)
create or replace function public.get_geologic_unit_at(lng double precision, lat double precision)
returns table (
    id uuid,
    name text,
    lithology text,
    age text,
    description text,
    geom_geojson text
) language plpgsql stable as $$
begin
    return query
    select 
        gu.id,
        gu.name,
        gu.lithology,
        gu.age,
        gu.description,
        st_asgeojson(gu.geom) as geom_geojson
    from public.geologic_units gu
    where st_contains(gu.geom, st_setsrid(st_point(lng, lat), 4326))
    limit 1;
end;
$$;


-- Function: Find Public Sites within distance of a point (lng/lat) ordered by distance
create or replace function public.get_sites_near(lng double precision, lat double precision, radius_meters double precision)
returns table (
    id uuid,
    name text,
    material_types text[],
    access_notes text,
    difficulty text,
    best_season text,
    geom_geojson text,
    distance_meters double precision
) language plpgsql stable as $$
begin
    return query
    select 
        pcs.id,
        pcs.name,
        pcs.material_types,
        pcs.access_notes,
        pcs.difficulty,
        pcs.best_season,
        st_asgeojson(pcs.geom) as geom_geojson,
        st_distance(
            pcs.geom::geography,
            st_setsrid(st_point(lng, lat), 4326)::geography
        ) as distance_meters
    from public.public_collection_sites pcs
    where st_dwithin(
        pcs.geom::geography,
        st_setsrid(st_point(lng, lat), 4326)::geography,
        radius_meters
    )
    order by distance_meters;
end;
$$;


-- Function: Find Paid Digs within distance of a point (lng/lat) ordered by distance
create or replace function public.get_digs_near(lng double precision, lat double precision, radius_meters double precision)
returns table (
    id uuid,
    name text,
    business_type text,
    material_types text[],
    price_text text,
    booking_link text,
    geom_geojson text,
    distance_meters double precision
) language plpgsql stable as $$
begin
    return query
    select 
        pd.id,
        pd.name,
        pd.business_type,
        pd.material_types,
        pd.price_text,
        pd.booking_link,
        st_asgeojson(pd.geom) as geom_geojson,
        st_distance(
            pd.geom::geography,
            st_setsrid(st_point(lng, lat), 4326)::geography
        ) as distance_meters
    from public.paid_digs pd
    where st_dwithin(
        pd.geom::geography,
        st_setsrid(st_point(lng, lat), 4326)::geography,
        radius_meters
    )
    order by distance_meters;
end;
$$;


-- Function: Find Public Access Boundaries containing a point (lng/lat)
create or replace function public.get_access_boundaries_at(lng double precision, lat double precision)
returns table (
    id uuid,
    owner_agency_type text,
    description text,
    geom_geojson text
) language plpgsql stable as $$
begin
    return query
    select 
        pab.id,
        pab.owner_agency_type,
        pab.description,
        st_asgeojson(pab.geom) as geom_geojson
    from public.public_access_boundaries pab
    where st_contains(pab.geom, st_setsrid(st_point(lng, lat), 4326));
end;
$$;


-- Function: Find Public Sites inside a bounding box (bbox)
create or replace function public.get_sites_in_bbox(min_lng double precision, min_lat double precision, max_lng double precision, max_lat double precision)
returns table (
    id uuid,
    name text,
    material_types text[],
    access_notes text,
    difficulty text,
    best_season text,
    geom_geojson text
) language plpgsql stable as $$
begin
    return query
    select 
        pcs.id,
        pcs.name,
        pcs.material_types,
        pcs.access_notes,
        pcs.difficulty,
        pcs.best_season,
        st_asgeojson(pcs.geom) as geom_geojson
    from public.public_collection_sites pcs
    where pcs.geom && st_makeenvelope(min_lng, min_lat, max_lng, max_lat, 4326);
end;
$$;


-- Function: Find Paid Digs inside a bounding box (bbox)
create or replace function public.get_digs_in_bbox(min_lng double precision, min_lat double precision, max_lng double precision, max_lat double precision)
returns table (
    id uuid,
    name text,
    business_type text,
    material_types text[],
    price_text text,
    booking_link text,
    geom_geojson text
) language plpgsql stable as $$
begin
    return query
    select 
        pd.id,
        pd.name,
        pd.business_type,
        pd.material_types,
        pd.price_text,
        pd.booking_link,
        st_asgeojson(pd.geom) as geom_geojson
    from public.paid_digs pd
    where pd.geom && st_makeenvelope(min_lng, min_lat, max_lng, max_lat, 4326);
end;
$$;


-- Function: Find Geologic Units intersecting a bounding box (bbox)
create or replace function public.get_geologic_units_in_bbox(min_lng double precision, min_lat double precision, max_lng double precision, max_lat double precision)
returns table (
    id uuid,
    name text,
    lithology text,
    age text,
    description text,
    geom_geojson text
) language plpgsql stable as $$
begin
    return query
    select 
        gu.id,
        gu.name,
        gu.lithology,
        gu.age,
        gu.description,
        st_asgeojson(gu.geom) as geom_geojson
    from public.geologic_units gu
    where gu.geom && st_makeenvelope(min_lng, min_lat, max_lng, max_lat, 4326);
end;
$$;


-- =========================================================================
-- SEED DATA (WASHINGTON STATE REPRESENTATIVE GEOLOGY)
-- =========================================================================

-- Seed Geologic Units
insert into public.geologic_units (name, lithology, age, description, geom)
values
(
    'Columbia River Basalt Group',
    'Basaltic lava flows, vesicular and columnar jointed',
    'Miocene (15-17 Ma)',
    'Extensive basaltic flows covering central and eastern Washington. Known for hosting agates, jaspers, and petrified wood within cavities, vesicles, and pillow-basalt sedimentary interbeds (such as the Vantage Member).',
    st_geomfromtext('POLYGON((-121.0 45.8, -121.0 48.0, -118.0 48.0, -118.0 45.8, -121.0 45.8))', 4326)
),
(
    'Cascade Volcanic Arc (Cenozoic)',
    'Andesite, dacite, tuff, and volcanic breccia',
    'Eocene to Holocene',
    'Mountainous volcanic chain stretching North-South through Washington. Active hydrothermal systems have precipitated high-quality quartz crystals, amethyst scepters, chalcedony, and opal in fault fractures and metamorphic contacts.',
    st_geomfromtext('POLYGON((-122.2 45.6, -122.2 49.0, -121.0 49.0, -121.0 45.6, -122.2 45.6))', 4326)
),
(
    'Olympic Subduction Complex',
    'Sandstone, siltstone, turbidites, and tectonic melange with chert lenses',
    'Eocene to Miocene',
    'Accretionary wedge sediments uplifted to form the Olympic Mountains. Famous for marine fossils, orbicular jaspers, and iron-rich cherts in river gravels and costal beaches.',
    st_geomfromtext('POLYGON((-124.6 46.9, -124.6 48.4, -123.0 48.4, -123.0 46.9, -124.6 46.9))', 4326)
);


-- Seed Public Collection Sites
insert into public.public_collection_sites (name, material_types, access_notes, difficulty, best_season, geom)
values
(
    'Damon Point',
    array['Agate', 'Jasper', 'Carnelian', 'Petrified Wood'],
    'Easy walking access along the sandy spit. Best hunting is on the gravel bars exposed during low tide, particularly after major winter storms. No fee or special permits required for recreational hand-picking.',
    'Easy',
    'Winter & Fall',
    st_geomfromtext('POINT(-124.15 46.94)', 4326)
),
(
    'Saddle Mountain Recreation Area',
    array['Petrified Wood', 'Opalized Wood'],
    'A designated BLM rockhounding area. A rugged dirt road leads to the ridge; 4WD or high clearance is highly recommended. Personal collection is limited to 250 lbs per person per year. No fee.',
    'Medium',
    'Spring & Autumn',
    st_geomfromtext('POINT(-119.98 46.80)', 4326)
),
(
    'First Creek (Liberty Blue)',
    array['Blue Agate', 'Jasper', 'Geodes'],
    'Located in the historic Liberty Mining District on USFS land. Steep, mountainous terrain. Watch out for active mining claims in the surrounding area; collect only on unclaimed, public Forest Service land.',
    'Hard',
    'Summer & Fall',
    st_geomfromtext('POINT(-120.65 47.25)', 4326)
),
(
    'Hansen Creek Quartz Location',
    array['Quartz Crystals', 'Amethyst', 'Scepter Quartz'],
    'A world-famous crystal digging location on the slopes of Humpback Mountain. Located on USFS land. Involves a moderate but steep hike from the parking area. Excavation is on a steep talus slope. Hand tools only.',
    'Hard',
    'Summer & Fall',
    st_geomfromtext('POINT(-121.52 47.38)', 4326)
),
(
    'Red Top Mountain designated rockhounding area',
    array['Agate', 'Geodes', 'Jasper'],
    'Designated collecting area managed by the Okanogan-Wenatchee National Forest. Hand tools only. Agate-filled geodes occur in clay layers. Beautiful panoramic views. Forest roads are usually snowed-in until late June.',
    'Medium',
    'Summer & Fall',
    st_geomfromtext('POINT(-120.61 47.32)', 4326)
);


-- Seed Paid Digs / Commercial Sites
insert into public.paid_digs (name, business_type, material_types, price_text, booking_link, geom)
values
(
    'Stonerose Fossil Center',
    'Public Fossil Dig',
    array['Eocene Plant Fossils', 'Insect Fossils', 'Fish Fossils'],
    '$15 for adults, $10 for children. Includes admission to the museum and fossil site, plus tool rental (hammer and chisel). Users are allowed to keep up to 3 fossils per day under scientific review.',
    'https://stonerosefossil.org',
    st_geomfromtext('POINT(-118.73 48.64)', 4326)
),
(
    'Columbia Basin Agates (Fee Dig)',
    'Private Fee Dig',
    array['Agate', 'Jasper', 'Petrified Wood'],
    '$25 entry fee per vehicle, plus $2 per pound for any material taken. Access to private ranches containing undisturbed Miocene gravel beds. Tools available for rent. Appointment required.',
    'https://example.com/columbia-basin-digs',
    st_geomfromtext('POINT(-119.55 46.95)', 4326)
);


-- Seed Public Access Boundaries
insert into public.public_access_boundaries (owner_agency_type, description, geom)
values
(
    'BLM',
    'Bureau of Land Management (Saddle Mountain District). Multi-use public land generally open to personal-use mineral collecting up to 250 pounds per year without fee.',
    st_geomfromtext('MULTIPOLYGON(((-120.1 46.75, -120.1 46.85, -119.9 46.85, -119.9 46.75, -120.1 46.75)))', 4326)
),
(
    'USFS',
    'Mount Baker-Snoqualmie National Forest. Managed by the US Forest Service. Recreational panning and mineral collection of rock/mineral specimens with hand tools is permitted under general forest rules.',
    st_geomfromtext('MULTIPOLYGON(((-121.6 47.3, -121.6 47.5, -121.4 47.5, -121.4 47.3, -121.6 47.3)))', 4326)
),
(
    'USFS',
    'Okanogan-Wenatchee National Forest. Managed by the US Forest Service. Contains designated rockhounding zones and historic mining districts. Personal, non-commercial collecting is permitted.',
    st_geomfromtext('MULTIPOLYGON(((-120.8 47.2, -120.8 47.4, -120.4 47.4, -120.4 47.2, -120.8 47.2)))', 4326)
);
