# syntax=docker/dockerfile:1.7
# ---------- builder ----------
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential libffi-dev libssl-dev \
 && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:${PATH}"

WORKDIR /build
COPY backend/requirements.txt .
RUN pip install --upgrade pip \
 && pip install -r requirements.txt

# ---------- runtime ----------
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:${PATH}" \
    LOGS_DIR="/app/logs" \
    BLACKLIST_PATH="/app/db/blacklist.txt" \
    CHAT_HISTORY_DATABASE_URL="sqlite:////app/db/chat_history.db" \
    DATABASE_URL="sqlite:////app/db/tickets.db"

COPY --from=builder /opt/venv /opt/venv

WORKDIR /app

COPY backend/app /app/app
COPY backend/server.py /app/server.py

RUN mkdir -p /app/logs /app/db

EXPOSE 9098

CMD ["python", "server.py"]
