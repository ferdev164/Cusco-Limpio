#!/bin/bash
# Genera un certificado autofirmado para probar HTTPS en local (GPS real del celular).
# Si cambias de red WiFi, tu IP local cambia: edita LAN_IP abajo y vuelve a correr esto.

set -e

LAN_IP="10.204.207.84"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERTS_DIR="$ROOT_DIR/certs"

mkdir -p "$CERTS_DIR"
CERTS_DIR_WIN="$(cygpath -w "$CERTS_DIR")"

MSYS_NO_PATHCONV=1 openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout "$CERTS_DIR_WIN\\dev-key.pem" \
  -out "$CERTS_DIR_WIN\\dev-cert.pem" \
  -days 825 \
  -subj "/CN=cusco-limpio-dev" \
  -addext "subjectAltName=DNS:localhost,DNS:cusco.limpio,IP:127.0.0.1,IP:$LAN_IP"

echo "Certificado generado en $CERTS_DIR (valido para localhost, cusco.limpio, 127.0.0.1 y $LAN_IP)"
