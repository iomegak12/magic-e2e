"""Inline utility @tool functions: weather, time, location."""

from __future__ import annotations

from datetime import datetime
from random import randint
from typing import Annotated

from agent_framework import tool
from pydantic import Field


@tool(approval_mode="never_require")
def get_weather(
    location: Annotated[str, Field(description="The location to get the weather for.")],
) -> str:
    """Get the weather for a given location."""
    conditions = ["sunny", "cloudy", "rainy", "stormy"]
    return (
        f"The weather in {location} is {conditions[randint(0, 3)]} "
        f"with a high of {randint(20, 38)}\u00b0C."
    )


@tool(approval_mode="never_require")
def get_current_time(
    location: Annotated[
        str,
        Field(description="Free-form location label, e.g. 'Bengaluru' or 'New York'."),
    ],
) -> str:
    """Return the current local server time alongside the requested location label."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return f"The current time (server clock) is {now} for location '{location}'."


@tool(approval_mode="never_require")
def get_current_location() -> str:
    """Return the agent's best-effort assumed user location (demo stub)."""
    return "User is currently in Bengaluru, India."
