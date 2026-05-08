"""SQLAlchemy ORM model for IT support tickets."""

from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    ticket_id: Mapped[str] = mapped_column(String(12), primary_key=True)
    ticket_description: Mapped[str] = mapped_column(String(2000), nullable=False)
    registered_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    registered_by: Mapped[str] = mapped_column(String(150), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Open")
    resolved_by: Mapped[str | None] = mapped_column(String(150), nullable=True)
    resolution_remarks: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    resolved_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def to_dict(self) -> dict:
        return {
            "ticket_id": self.ticket_id,
            "ticket_description": self.ticket_description,
            "registered_date": self.registered_date.isoformat(),
            "registered_by": self.registered_by,
            "priority": self.priority,
            "status": self.status,
            "resolved_by": self.resolved_by,
            "resolution_remarks": self.resolution_remarks,
            "resolved_date": self.resolved_date.isoformat() if self.resolved_date else None,
        }
