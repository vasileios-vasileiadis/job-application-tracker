# Job Application Tracker

A portfolio project implemented in three ways so the same business problem can be studied across technologies.

## Recommended portfolio version

**`java-spring/`** is the version I would publish/pin first for a Junior Java / Backend role.

It demonstrates:
- Java 21
- Spring Boot
- REST API design
- Layered architecture: Controller -> Service -> Repository
- JPA / Hibernate
- H2 persistence for zero-setup local development
- Validation and HTTP status codes
- HTML/CSS/JavaScript frontend consuming the REST API

## Learning variants

### `web-local/`
Pure HTML/CSS/JavaScript. No backend. Data is stored in the browser with `localStorage`.

Use this version first to understand:
- variables
- functions
- arrays
- objects
- `if`
- event listeners
- DOM manipulation
- filtering and calculations

### `python-fastapi/`
The same core CRUD idea implemented as a small FastAPI + SQLite REST API.

Use it to compare Java/Spring concepts with Python/FastAPI concepts.

## Run the pure web version

Open `web-local/index.html` in a browser.

## Run the Java version

Requirements: Java 21 and Maven.

```bash
cd java-spring
mvn spring-boot:run
```

Then open:

`http://localhost:8080`

H2 console:

`http://localhost:8080/h2-console`

JDBC URL: `jdbc:h2:file:./data/jobtracker`

## Run the Python version

```bash
cd python-fastapi
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API docs:

`http://127.0.0.1:8000/docs`

## Suggested Git history

Do not upload everything as one anonymous commit when learning this project. A good rebuild history is:

```text
chore: initialize job application tracker
feat: add application form and table
feat: persist applications in local storage
feat: add status and search filters
feat: add dashboard statistics
feat: add Spring Boot application entity
feat: add repository and service layers
feat: expose REST CRUD endpoints
feat: connect frontend to REST API
test: add service tests
docs: add architecture and learning guide
```

See `LEARNING_GUIDE.md` for the detailed explanation.
