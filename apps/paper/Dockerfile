FROM oven/bun as turbo

WORKDIR /app

RUN bun add -g turbo
COPY . .
RUN turbo prune --docker


FROM oven/bun as installer

WORKDIR /app

COPY --from=turbo /app/out/json .

RUN bun install


FROM oven/bun as builder

WORKDIR /app
ENV NODE_ENV=production

COPY --from=installer /app/node_modules ./node_modules
COPY --from=turbo /app/out/full .

RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun \
	--outfile server \
	./src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=builder /app/server server

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 3000
