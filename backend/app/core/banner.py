"""Colourful startup banner using rich."""

from __future__ import annotations

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from .config import Settings


_console = Console()


def print_banner(
    settings: Settings,
    *,
    tools_summary: list[tuple[str, str]],
    magic_v22_reachable: bool,
) -> None:
    """Render a panel listing the most relevant runtime configuration + endpoints."""
    base_url = f"{settings.scheme}://{settings.host}:{settings.port}"

    title = Text()
    title.append(f"{settings.server_name} ", style="bold white")
    title.append(f"v{settings.server_version}", style="bold cyan")

    config = Table.grid(padding=(0, 2))
    config.add_column(style="bold cyan", no_wrap=True)
    config.add_column()

    config.add_row("Listening", f"[bold green]{base_url}[/bold green]")
    config.add_row("Docs", f"{base_url}/docs")
    config.add_row("OpenAPI", f"{base_url}/openapi.json")
    config.add_row(
        "HTTPS",
        "[green]enabled[/green]" if settings.scheme == "https" else "[yellow]disabled[/yellow]",
    )
    config.add_row(
        "Rate-limit",
        f"[green]enabled[/green] ({settings.rate_limit_default})"
        if settings.rate_limit_enabled
        else "[yellow]disabled[/yellow]",
    )
    config.add_row("CORS", ", ".join(settings.cors_origins_list))

    endpoints = Table.grid(padding=(0, 2))
    endpoints.add_column(style="bold yellow", no_wrap=True)
    endpoints.add_column()
    endpoints.add_row("POST", "/api/v1/chat")
    endpoints.add_row("POST", "/api/v1/chat/stream")
    endpoints.add_row("POST", "/api/v1/sessions")
    endpoints.add_row("GET ", "/api/v1/sessions/{id}/messages")
    endpoints.add_row("GET ", "/api/v1/health")
    endpoints.add_row("GET ", "/api/v1/info")

    tools = Table.grid(padding=(0, 2))
    tools.add_column(style="bold magenta", no_wrap=True)
    tools.add_column()
    for label, value in tools_summary:
        tools.add_row(label, value)
    tools.add_row(
        "MAGIC v22",
        "[green]reachable[/green]"
        if magic_v22_reachable
        else "[red]unreachable[/red] (Scenario D will fail until server is up)",
    )

    body = Table.grid(padding=(1, 0))
    body.add_column()
    body.add_row(config)
    body.add_row(Text("Endpoints", style="bold yellow"))
    body.add_row(endpoints)
    body.add_row(Text("Registered tools", style="bold magenta"))
    body.add_row(tools)

    _console.print(Panel(body, title=title, border_style="cyan", expand=False))
