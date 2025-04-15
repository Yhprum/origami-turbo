FROM oven/bun as turbo

WORKDIR /app

RUN bun add -g turbo
COPY . .
ENV TURBO_TELEMETRY_DISABLED=1
RUN turbo prune --docker origami


FROM oven/bun as installer

WORKDIR /app

COPY --from=turbo /app/out/json .

RUN bun install --frozen-lockfile


FROM oven/bun as builder

WORKDIR /app

COPY --from=installer /app/node_modules ./node_modules
COPY --from=turbo /app/out/full .
RUN bun run build


FROM oven/bun as runner

WORKDIR /app

COPY --from=builder /app/.output ./

ENV PORT 7242
ENV NODE_ENV production

EXPOSE 7242

CMD ["bun", "server/index.mjs"]
