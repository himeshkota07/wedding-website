-- RAG knowledge base for the chatbot. No public policies: this table is only
-- ever read/written from server code (the /api/chat route and the admin
-- content-sync helper), both using the service-role key, so there's no need
-- for the browser to talk to it directly.
create extension if not exists vector;

create table if not exists content_chunks (
  id uuid primary key default gen_random_uuid(),
  source_type text not null, -- 'event' | 'venue' | 'family' | 'faq' | 'contact' | 'our_story'
  source_id text not null,
  content text not null,
  embedding vector(768) not null,
  updated_at timestamptz not null default now(),
  unique (source_type, source_id)
);

alter table content_chunks enable row level security;

create index if not exists content_chunks_embedding_idx
  on content_chunks using hnsw (embedding vector_cosine_ops);

-- Cosine-similarity search, called from the chat route via .rpc().
create or replace function match_content_chunks(
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  source_type text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    content_chunks.source_type,
    content_chunks.content,
    1 - (content_chunks.embedding <=> query_embedding) as similarity
  from content_chunks
  order by content_chunks.embedding <=> query_embedding
  limit match_count;
$$;
