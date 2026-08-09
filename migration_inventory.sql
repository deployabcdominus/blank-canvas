create table public.inventory_items (
    id uuid primary key default gen_random_uuid(),
    company_id uuid references public.companies(id) on delete cascade not null,
    name text not null,
    sku text,
    category text,
    quantity decimal not null default 0,
    min_quantity decimal not null default 0,
    unit text not null default 'units',
    cost_price decimal,
    sale_price decimal,
    supplier_info jsonb,
    location text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

grant select, insert, update, delete on public.inventory_items to authenticated;
grant all on public.inventory_items to service_role;

alter table public.inventory_items enable row level security;

create policy "Users can only access their company's inventory"
    on public.inventory_items
    for all
    to authenticated
    using (company_id = (select company_id from profiles where id = auth.uid()));

create table public.inventory_logs (
    id uuid primary key default gen_random_uuid(),
    item_id uuid references public.inventory_items(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete set null,
    change_type text not null, -- 'in', 'out', 'adjustment'
    quantity decimal not null,
    previous_quantity decimal not null,
    reason text,
    created_at timestamptz default now()
);

grant select, insert on public.inventory_logs to authenticated;
grant all on public.inventory_logs to service_role;

alter table public.inventory_logs enable row level security;

create policy "Users can see logs for items they have access to"
    on public.inventory_logs
    for select
    to authenticated
    using (exists (select 1 from public.inventory_items where id = item_id));

