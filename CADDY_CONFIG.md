# Caddy Configuration for aikos-home.sytko.de

# Add this to your Caddyfile:

aiko-home.sytko.de {
    reverse_proxy localhost:3001

    # WebSocket support (automatic in Caddy 2.x)
    # No extra config needed - Caddy handles WebSocket upgrades automatically
}

# After updating Caddyfile:
# sudo systemctl reload caddy

# Check logs:
# sudo journalctl -u caddy -f
