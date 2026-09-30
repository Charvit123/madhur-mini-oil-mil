-- Madhur Mini Oil Mill — catalogue schema (PostgreSQL)
-- Oil Category -> Product -> Product Variant, with Packaging joined onto the variant.

create extension if not exists "pgcrypto";

create table oil_category (
    id               uuid primary key default gen_random_uuid(),
    name             varchar(120) not null,
    slug             varchar(140) not null unique,
    tagline          varchar(200),
    description      text,
    oil_color        varchar(7)  not null,
    seed_color       varchar(7),
    hero_image_url   varchar(500),
    sort_order       int          not null default 100,
    active           boolean      not null default true,
    meta_title       varchar(200),
    meta_description varchar(320),
    created_at       timestamptz  not null default now(),
    updated_at       timestamptz  not null default now()
);

create table oil_feature (
    oil_id   uuid not null references oil_category(id) on delete cascade,
    position int  not null,
    feature  varchar(300) not null,
    primary key (oil_id, position)
);

create table oil_benefit (
    oil_id   uuid not null references oil_category(id) on delete cascade,
    position int  not null,
    title    varchar(80),
    body     varchar(400),
    primary key (oil_id, position)
);

create table oil_faq (
    oil_id   uuid not null references oil_category(id) on delete cascade,
    position int  not null,
    question varchar(250),
    answer   varchar(1200),
    primary key (oil_id, position)
);

create table packaging (
    id              uuid primary key default gen_random_uuid(),
    name            varchar(80)  not null,
    code            varchar(100) not null unique,
    kind            varchar(20)  not null check (kind in ('TIN','BUCKET','JAR','BOTTLE','POUCH','CARTON')),
    size            numeric(8,3) not null,
    unit            varchar(10)  not null check (unit in ('KG','LITRE','ML','GRAM')),
    gross_weight_kg numeric(8,3),
    length_cm       int, width_cm int, height_cm int,
    sort_order      int     not null default 100,
    active          boolean not null default true
);

create table product (
    id                uuid primary key default gen_random_uuid(),
    oil_category_id   uuid not null references oil_category(id),
    name              varchar(180) not null,
    slug              varchar(200) not null unique,
    short_description varchar(400),
    description       text,
    extraction_method varchar(120),
    shelf_life_months int,
    made_at           varchar(120),
    rating_average    numeric(3,2) not null default 0,
    rating_count      int          not null default 0,
    active            boolean      not null default true,
    featured          boolean      not null default false,
    sort_order        int          not null default 100,
    created_at        timestamptz  not null default now(),
    updated_at        timestamptz  not null default now()
);
create index ix_product_oil on product(oil_category_id);

create table product_spec (
    product_id uuid not null references product(id) on delete cascade,
    position   int  not null,
    spec_key   varchar(80),
    spec_value varchar(300),
    primary key (product_id, position)
);

create table product_variant (
    id                  uuid primary key default gen_random_uuid(),
    product_id          uuid not null references product(id),
    packaging_id        uuid not null references packaging(id),
    sku                 varchar(60) not null unique,
    price               numeric(10,2) not null check (price >= 0),
    mrp                 numeric(10,2),
    gst_rate            numeric(5,2) not null default 5.00,
    stock               int not null default 0 check (stock >= 0),
    low_stock_threshold int not null default 10,
    batch_code          varchar(40),
    pressed_on          date,
    best_before         date,
    active              boolean not null default true,
    version             bigint  not null default 0,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    constraint uq_variant_product_packaging unique (product_id, packaging_id),
    constraint ck_mrp_ge_price check (mrp is null or mrp >= price)
);
create index ix_variant_product on product_variant(product_id);
create index ix_variant_stock   on product_variant(stock) where active;

create table variant_image (
    variant_id uuid not null references product_variant(id) on delete cascade,
    position   int  not null,
    url        varchar(500) not null,
    primary key (variant_id, position)
);

create table review (
    id                uuid primary key default gen_random_uuid(),
    product_id        uuid not null references product(id) on delete cascade,
    order_id          uuid,
    verified_purchase boolean not null default false,
    author_name       varchar(120) not null,
    city              varchar(120),
    rating            int not null check (rating between 1 and 5),
    title             varchar(160),
    body              text,
    status            varchar(20) not null default 'PENDING',
    created_at        timestamptz not null default now()
);
create index ix_review_product on review(product_id, status);
