interface ContentListCtx {
  content: {
    list(opts?: { cursor?: string }): Promise<{
      items: Array<{ id: string; data: Record<string, unknown> }>;
      nextCursor?: string;
    }>;
  };
}

export async function fetchAllContent(ctx: ContentListCtx) {
  const all: Array<{ id: string; data: Record<string, unknown> }> = [];
  let cursor: string | undefined;

  do {
    const result = await ctx.content.list(cursor ? { cursor } : undefined);
    all.push(...result.items);
    cursor = result.nextCursor;
  } while (cursor);

  return all;
}
