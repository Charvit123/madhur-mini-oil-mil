-- No coupon system: discounting stays at the catalogue level (price vs mrp
-- per variant). Admin logins move from a single env-configured account to
-- real rows, so there can be a handful of named admins with roles.

drop table if exists coupon;
alter table orders drop column if exists coupon_code;

-- Real refund tracking: which Razorpay refund paid this back, and how much.
alter table payment add column if not exists refunded_amount numeric(10,2);
alter table payment add column if not exists razorpay_refund_id varchar(60);

create table admin_user (
    id             uuid primary key default gen_random_uuid(),
    username       varchar(60)  not null unique,
    password_hash  varchar(100) not null,
    full_name      varchar(120),
    role           varchar(20)  not null default 'ADMIN' check (role in ('ADMIN','SUPER_ADMIN')),
    active         boolean      not null default true,
    created_at     timestamptz  not null default now(),
    last_login_at  timestamptz
);

-- First account: username "admin", password "admin123" (bcrypt below matches
-- exactly that password — same hash the old app.admin.password-hash default
-- used). Log in with this once, then create real named accounts via
-- POST /api/admin/admins and deactivate this one.
insert into admin_user (username, password_hash, full_name, role)
values ('admin', '$2b$10$NIPZUv9I83CXZ3tIKjNmIOmTuyvYG7fJzo1PBkCoAjX.kw0x1LnkK', 'Default Admin', 'SUPER_ADMIN');
