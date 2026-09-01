from enum import Enum
from typing import Optional
import sqlite3

from fastapi import FastAPI, HTTPException, Response, status
from pydantic import BaseModel, Field

app = FastAPI(title="Job Application Tracker API")
DATABASE = "jobtracker.db"


class ApplicationStatus(str, Enum):
    SAVED = "SAVED"
    APPLIED = "APPLIED"
    INTERVIEW = "INTERVIEW"
    TECHNICAL = "TECHNICAL"
    OFFER = "OFFER"
    REJECTED = "REJECTED"


class JobApplicationInput(BaseModel):
    company: str = Field(min_length=1)
    position: str = Field(min_length=1)
    application_date: str = Field(min_length=10, max_length=10)
    status: ApplicationStatus
    salary: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = None


def get_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS job_applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company TEXT NOT NULL,
                position TEXT NOT NULL,
                application_date TEXT NOT NULL,
                status TEXT NOT NULL,
                salary REAL,
                notes TEXT
            )
            """
        )


initialize_database()


@app.get("/applications")
def get_all_applications():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM job_applications ORDER BY application_date DESC"
        ).fetchall()
        return [dict(row) for row in rows]


@app.get("/applications/{application_id}")
def get_application(application_id: int):
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM job_applications WHERE id = ?",
            (application_id,),
        ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Application not found")

    return dict(row)


@app.post("/applications", status_code=status.HTTP_201_CREATED)
def create_application(application: JobApplicationInput):
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO job_applications
            (company, position, application_date, status, salary, notes)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                application.company,
                application.position,
                application.application_date,
                application.status.value,
                application.salary,
                application.notes,
            ),
        )
        new_id = cursor.lastrowid

    return get_application(new_id)


@app.put("/applications/{application_id}")
def update_application(application_id: int, application: JobApplicationInput):
    get_application(application_id)

    with get_connection() as connection:
        connection.execute(
            """
            UPDATE job_applications
            SET company = ?, position = ?, application_date = ?,
                status = ?, salary = ?, notes = ?
            WHERE id = ?
            """,
            (
                application.company,
                application.position,
                application.application_date,
                application.status.value,
                application.salary,
                application.notes,
                application_id,
            ),
        )

    return get_application(application_id)


@app.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(application_id: int):
    get_application(application_id)

    with get_connection() as connection:
        connection.execute(
            "DELETE FROM job_applications WHERE id = ?",
            (application_id,),
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)
