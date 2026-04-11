FROM golang:1.26 AS builder

WORKDIR /src

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /out/api ./cmd/api

FROM alpine:3.21

WORKDIR /app

COPY --from=builder /out/api ./api

ENV PORT=8080

EXPOSE 8080

CMD ["./api"]
