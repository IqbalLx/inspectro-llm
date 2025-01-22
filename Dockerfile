FROM node:20-slim AS ui-build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY ./ui /app
WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile &&\
    pnpm run build

FROM golang:1.23.0-alpine3.20 AS server-build

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download

COPY --from=ui-build /server/_ui ./server/_ui/
COPY ./server/embed.go ./server
COPY ./server/src ./server/src

# Set necessary environment variables needed for our image and build the API server.
ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64

RUN go build -ldflags="-s -w" -o app ./server/src/main.go

FROM scratch

LABEL maintainer="Iqbal Maulana <iqbal@mbts.dev>"

COPY --from=server-build etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

COPY --from=server-build /build/app .

ENTRYPOINT ["/app"]