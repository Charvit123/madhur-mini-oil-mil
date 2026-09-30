-- Soft-delete flag for customers, matching the pattern used everywhere else
-- (nothing is ever hard-deleted — orders keep a customer_id FK and must stay
-- resolvable forever, even for a customer the admin has since deactivated).
alter table customer add column if not exists active boolean not null default true;

-- The new admin Reviews screen lists/filters by status; this was previously
-- only ever queried per-product.
create index if not exists ix_review_status on review(status);
