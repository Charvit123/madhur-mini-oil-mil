-- Customers, addresses, OTP login, orders, payments, coupons.
-- Builds on V1's oil_category / product / product_variant.

create table customer (
    id             uuid primary key default gen_random_uuid(),
    phone          varchar(10)  not null unique,
    name           varchar(120),
    email          varchar(160),
    phone_verified boolean      not null default false,
    created_at     timestamptz  not null default now(),
    updated_at     timestamptz  not null default now()
);

create table address (
    id         uuid primary key default gen_random_uuid(),
    customer_id uuid not null references customer(id) on delete cascade,
    full_name  varchar(120) not null,
    phone      varchar(10)  not null,
    line1      varchar(240) not null,
    line2      varchar(240),
    city       varchar(100) not null,
    state      varchar(100) not null,
    pincode    varchar(6)   not null,
    is_default boolean      not null default false
);
create index ix_address_customer on address(customer_id);

create table otp_token (
    id             uuid primary key default gen_random_uuid(),
    phone          varchar(10)  not null,
    code_hash      varchar(100) not null,
    expires_at     timestamptz  not null,
    consumed       boolean      not null default false,
    attempt_count  int          not null default 0,
    created_at     timestamptz  not null default now()
);
create index ix_otp_phone on otp_token(phone);

create table orders (
    id               uuid primary key default gen_random_uuid(),
    order_number     varchar(20)  not null unique,
    customer_id      uuid references customer(id),

    contact_name     varchar(120) not null,
    contact_phone    varchar(10)  not null,
    contact_email    varchar(160),

    ship_line1       varchar(240) not null,
    ship_line2       varchar(240),
    ship_city        varchar(100) not null,
    ship_state       varchar(100) not null,
    ship_pincode     varchar(6)   not null,

    delivery_method  varchar(20)  not null check (delivery_method in ('STANDARD','MILL_PICKUP')),
    payment_method   varchar(20)  not null check (payment_method in ('UPI','CARD','NETBANKING','COD')),
    status           varchar(20)  not null default 'PENDING_PAYMENT'
                       check (status in ('PENDING_PAYMENT','PAID','PACKED','DISPATCHED','DELIVERED','CANCELLED','PAYMENT_FAILED','REFUNDED')),

    subtotal         numeric(10,2) not null check (subtotal >= 0),
    shipping_fee     numeric(10,2) not null default 0,
    discount_amount  numeric(10,2) not null default 0,
    total            numeric(10,2) not null check (total >= 0),

    coupon_code      varchar(40),
    razorpay_order_id varchar(60),

    placed_at        timestamptz  not null default now(),
    updated_at       timestamptz  not null default now()
);
create index ix_order_customer on orders(customer_id);
create index ix_order_status   on orders(status);
create index ix_order_placed   on orders(placed_at);

create table order_item (
    id              uuid primary key default gen_random_uuid(),
    order_id        uuid not null references orders(id) on delete cascade,
    variant_id      uuid not null,
    sku             varchar(60)  not null,
    product_name    varchar(200) not null,
    packaging_name  varchar(80)  not null,
    unit_price      numeric(10,2) not null,
    quantity        int not null check (quantity > 0),
    line_total      numeric(10,2) not null
);
create index ix_order_item_order on order_item(order_id);

create table payment (
    id                   uuid primary key default gen_random_uuid(),
    order_id             uuid not null,
    razorpay_order_id    varchar(60) not null,
    razorpay_payment_id  varchar(60),
    razorpay_signature   varchar(200),
    status               varchar(20) not null check (status in ('CREATED','AUTHORIZED','CAPTURED','FAILED','REFUNDED')),
    amount               numeric(10,2) not null,
    method               varchar(20),
    failure_reason       varchar(300),
    created_at           timestamptz not null default now(),
    updated_at           timestamptz not null default now()
);
create index ix_payment_order        on payment(order_id);
create index ix_payment_rzp_order    on payment(razorpay_order_id);
create index ix_payment_rzp_payment  on payment(razorpay_payment_id);

create table coupon (
    id              uuid primary key default gen_random_uuid(),
    code            varchar(40) not null unique,
    type            varchar(10) not null check (type in ('PERCENT','FLAT')),
    value           numeric(10,2) not null,
    min_order_value numeric(10,2),
    max_discount    numeric(10,2),
    expires_at      timestamptz,
    usage_limit     int,
    used_count      int not null default 0,
    active          boolean not null default true
);

-- A couple of coupons so the checkout's coupon field has something to try locally.
insert into coupon (code, type, value, min_order_value, max_discount, active) values
 ('WELCOME10', 'PERCENT', 10, 500, 300, true),
 ('FLAT100',   'FLAT',    100, 1000, null, true);
