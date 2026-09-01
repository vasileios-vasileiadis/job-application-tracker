# Learning Guide — Job Application Tracker

This file explains the project **block by block**, focusing on what is worth understanding rather than wasting time explaining obvious imports such as `java.lang`.

---

# 1. The problem we are solving

We want to store job applications. Each application has:

- company
- position
- date
- status
- salary (optional)
- notes (optional)

The main operations are usually called **CRUD**:

- **C**reate: add an application
- **R**ead: show applications
- **U**pdate: change an application
- **D**elete: remove an application

---

# 2. Pure Web version — JavaScript fundamentals

Open `web-local/app.js` next to this guide.

## `const STORAGE_KEY = "jobApplications";`

`const` creates a variable whose reference will not be reassigned.

We use one constant for the localStorage key instead of typing the string in five places. If the key ever changes, we change it once.

## `let applications = loadApplications();`

`let` is used because the variable can later point to a new array.

`loadApplications()` is a **function call**. JavaScript runs the function, receives its return value, and stores that value inside `applications`.

## A function

Example:

```js
function loadApplications() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}
```

A function is a named block of reusable instructions.

- `function` says we are defining a function.
- `loadApplications` is its name.
- `()` contains parameters. It is empty because this function needs no outside input.
- `{ ... }` contains the instructions.
- `return` sends a result back to the code that called the function.

### `raw ? JSON.parse(raw) : []`

This is a **ternary expression**. It is a shorter form of:

```js
if (raw) {
  return JSON.parse(raw);
} else {
  return [];
}
```

Meaning:

- if `raw` contains something, convert the JSON text back into a JavaScript array.
- otherwise return an empty array.

## What an `if` really does

Example:

```js
if (!company || !position || !date) {
  showMessage("Fill in company, position and date.");
  return;
}
```

`if` asks a yes/no question.

The expression inside `(...)` must become either truthy or falsy.

`!company` means "company is missing/empty".

`||` means OR.

So this condition means:

> If company is empty OR position is empty OR date is empty, execute the code inside the braces.

The `{ ... }` braces define exactly which statements belong to that `if`.

`return;` stops the current function immediately. Without it, the function would continue and might save invalid data.

## Objects

```js
const application = {
  id: crypto.randomUUID(),
  company,
  position,
  date,
  status,
  salary,
  notes
};
```

An object groups related values under named properties.

Instead of six unrelated variables, one object represents **one job application**.

`company,` is shorthand for `company: company` when the property name and variable name are identical.

## Arrays and `.push()`

```js
applications.push(application);
```

`applications` is an array: an ordered collection of values.

`.push(...)` adds one value to the end of the array.

## `.filter()`

```js
applications.filter(app => app.status === statusFilter)
```

`.filter()` creates a new array containing only items that pass a condition.

`app => ...` is an arrow function. It receives one application at a time.

`===` means strict equality: both value and type must match.

## `.reduce()`

```js
const total = applications.reduce((sum, app) => sum + Number(app.salary || 0), 0);
```

`.reduce()` combines many values into one final value.

Here:

- `sum` is the running total.
- `app` is the current application.
- `Number(...)` converts salary to a number.
- `app.salary || 0` means use salary if it exists, otherwise zero.
- the final `0` is the starting value of `sum`.

## Event listeners

```js
form.addEventListener("submit", handleSubmit);
```

The browser emits events such as `click`, `input`, and `submit`.

This line means:

> When the form emits a submit event, call the `handleSubmit` function.

Notice that we pass `handleSubmit`, not `handleSubmit()`. We give the browser the function so it can call it later.

## DOM manipulation

```js
applicationsBody.innerHTML = rows;
```

The DOM is the browser's in-memory representation of the HTML page.

`innerHTML` replaces the HTML inside an element. Here we rebuild the table rows from the current application data.

---

# 3. Java / Spring Boot version

The Java version is split into layers. This matters because real projects become difficult to maintain if database code, HTTP code and business rules are all mixed in one class.

Flow:

```text
Browser
  -> Controller
  -> Service
  -> Repository
  -> Database
```

And the response travels back in the opposite direction.

---

## `JobTrackerApplication.java`

```java
@SpringBootApplication
public class JobTrackerApplication {
    public static void main(String[] args) {
        SpringApplication.run(JobTrackerApplication.class, args);
    }
}
```

### `public class JobTrackerApplication`

A **class** is a blueprint that groups data and/or behavior.

This class is the entry point of the application.

### `public static void main(String[] args)`

This is the standard Java entry method.

- `public`: the JVM is allowed to call it.
- `static`: Java can call it without first creating a `JobTrackerApplication` object.
- `void`: the method returns no value.
- `main`: special method name recognized as the program entry point.
- `String[] args`: optional command-line arguments.

### `SpringApplication.run(...)`

Starts Spring, creates the application context, starts the embedded web server and discovers our annotated components.

---

## `ApplicationStatus.java`

```java
public enum ApplicationStatus {
    SAVED,
    APPLIED,
    INTERVIEW,
    TECHNICAL,
    OFFER,
    REJECTED
}
```

An `enum` represents a fixed set of allowed values.

This is safer than accepting arbitrary strings like `"intervew"` with a typo.

---

## `JobApplication.java`

This is our **Entity**: the Java object that maps to a database table.

### `@Entity`

Tells JPA/Hibernate that this class must be stored in the database.

### `@Id`

Marks the primary key.

### `@GeneratedValue(strategy = GenerationType.IDENTITY)`

We do not manually choose the numeric ID. The database generates it.

### Validation annotations

```java
@NotBlank
private String company;
```

`@NotBlank` rejects `null`, empty string and whitespace-only text.

```java
@NotNull
private LocalDate applicationDate;
```

`@NotNull` means the value must exist.

### Constructors

The empty constructor is required by JPA so it can create objects when reading database rows.

The second constructor is convenient for our own code and tests.

### Getters and setters

The fields are `private`, so outside classes should not directly modify internal state.

A getter returns a field. A setter changes a field.

Example:

```java
public String getCompany() {
    return company;
}

public void setCompany(String company) {
    this.company = company;
}
```

`this.company` means "the field that belongs to this object".

The right-side `company` is the method parameter.

---

## `JobApplicationRepository.java`

```java
public interface JobApplicationRepository
        extends JpaRepository<JobApplication, Long> {
}
```

An `interface` describes capabilities without implementing all the details itself.

By extending `JpaRepository<JobApplication, Long>`, Spring Data automatically gives us methods such as:

```java
findAll()
findById(id)
save(entity)
delete(entity)
```

`JobApplication` says which entity this repository manages.

`Long` says the type of its primary key.

We do **not** manually write SQL for basic CRUD because Spring Data generates it.

---

## `JobApplicationService.java`

The service contains the **business logic**.

Why not put everything in the controller?

Because the controller should care mainly about HTTP. The service should care about what the application is allowed to do.

### Dependency injection

```java
private final JobApplicationRepository repository;

public JobApplicationService(JobApplicationRepository repository) {
    this.repository = repository;
}
```

The service needs a repository.

Instead of creating one with `new`, Spring creates the repository and passes it into this constructor.

This is called **dependency injection**.

`final` means the repository reference cannot be changed after construction.

### `findAll()`

```java
public List<JobApplication> findAll() {
    return repository.findAll(Sort.by(Sort.Direction.DESC, "applicationDate"));
}
```

`List<JobApplication>` means the method returns a list containing `JobApplication` objects.

We ask the repository for all records, sorted newest date first.

### `findById()` and `orElseThrow`

```java
return repository.findById(id)
    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
```

`findById` returns an `Optional<JobApplication>` because the ID may not exist.

`orElseThrow(...)` means:

> If a value exists, return it. Otherwise throw this exception.

The exception becomes HTTP 404.

### Update

For an update we first load the existing database object, then change its fields, then save it again.

This prevents accidentally treating an update as a completely unrelated new object.

---

## `JobApplicationController.java`

The controller maps HTTP requests to Java methods.

### `@RestController`

Tells Spring that this class handles HTTP requests and normally returns JSON data.

### `@RequestMapping("/api/applications")`

All routes in this controller begin with `/api/applications`.

### GET

```java
@GetMapping
public List<JobApplication> getAll() {
    return service.findAll();
}
```

When a browser/client sends:

```text
GET /api/applications
```

Spring calls `getAll()`.

The returned Java list is automatically converted into JSON.

### POST

```java
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public JobApplication create(@Valid @RequestBody JobApplication application) {
    return service.create(application);
}
```

- `@PostMapping`: handles POST.
- `@RequestBody`: convert incoming JSON into a `JobApplication` object.
- `@Valid`: run validation annotations such as `@NotBlank`.
- `201 CREATED`: appropriate status for successful creation.

### Path variables

```java
@GetMapping("/{id}")
public JobApplication getOne(@PathVariable Long id)
```

For `/api/applications/5`, Spring puts the number `5` inside the Java variable `id`.

### DELETE

A successful deletion returns HTTP `204 NO CONTENT`, which means the action succeeded and there is no response body to send back.

---

# 4. The Java frontend

The files under:

```text
java-spring/src/main/resources/static/
```

are automatically served by Spring Boot.

The main difference from the pure-web version is persistence.

Pure web:

```js
localStorage.setItem(...)
```

Java/Spring version:

```js
fetch("/api/applications")
```

`fetch` sends an HTTP request to our Java backend.

Example:

```js
const response = await fetch(API_URL);
const data = await response.json();
```

`await` pauses this async function until the Promise completes, without blocking the entire browser UI.

The first line waits for the HTTP response.

The second line reads the JSON body and converts it into JavaScript data.

---

# 5. Python comparison

The Python version intentionally stays small.

Spring:

```java
@GetMapping
public List<JobApplication> getAll() { ... }
```

FastAPI:

```python
@app.get("/applications")
def get_all():
    ...
```

Same idea: map an HTTP method + URL to a function.

Java uses more explicit types and architectural structure. Python is shorter and more dynamic.

Neither fact makes one universally "better". They optimize for different styles and ecosystems.

---

# 6. Important syntax — your `if (int < 4)` example

A correct Java example would be:

```java
int number = 5;

if (number < 4) {
    System.out.println("number is smaller than 4");
} else {
    System.out.println("number is 4 or greater");
}
```

Breakdown:

### `int number = 5;`

- `int`: the variable stores an integer.
- `number`: variable name.
- `=`: assignment operator; put the value on the right into the variable on the left.
- `5`: the integer value.
- `;`: ends the statement.

### `if (number < 4)`

- `if`: make a decision.
- `(` and `)`: contain the condition.
- `number < 4`: asks whether `number` is less than 4.
- The answer can only be `true` or `false`.

With `number = 5`, `5 < 4` is `false`.

So Java skips the first `{ ... }` block.

### `else`

`else` means:

> Run this block when the preceding `if` condition was false.

Therefore the program prints:

```text
number is 4 or greater
```

### Why braces `{ }`?

They group multiple statements into one block.

```java
if (condition) {
    statementOne();
    statementTwo();
}
```

Both statements belong to the `if`.

---

# 7. Method/function parameters and return values

Java:

```java
public int add(int a, int b) {
    int result = a + b;
    return result;
}
```

- `public`: visibility.
- `int`: return type.
- `add`: method name.
- `(int a, int b)`: two required inputs.
- `int result = a + b`: perform calculation.
- `return result`: send the integer back to the caller.

Calling it:

```java
int answer = add(2, 3);
```

Execution becomes conceptually:

```text
a = 2
b = 3
result = 5
return 5
answer = 5
```

If a method returns nothing, its return type is `void`.

---

# 8. What to learn first from this repository

Recommended order:

1. Run `web-local/`.
2. Read `web-local/app.js` function by function.
3. Change one feature yourself, e.g. add a `location` field.
4. Run `java-spring/`.
5. Trace one POST request from Controller -> Service -> Repository.
6. Add the same `location` field to the Java entity and frontend.
7. Compare the Python API only after the Java flow makes sense.

Do not try to memorize annotations. Understand the responsibility of each layer first.

---

# 9. `web-local/index.html` — every structural block

## `<!DOCTYPE html>`

Tells the browser to interpret the file as modern HTML5. It is not a visible element.

## `<html lang="en"> ... </html>`

This is the root element of the page. Everything else lives inside it. `lang="en"` describes the language for browsers and accessibility tools.

## `<head> ... </head>`

The `head` contains page metadata and resources, not the visible application UI.

```html
<meta charset="UTF-8">
```

Allows Unicode characters, including Greek.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

Makes the layout use the real device width on mobile instead of pretending the page is desktop-sized.

```html
<link rel="stylesheet" href="styles.css">
```

Loads our CSS file.

## `<body> ... </body>`

Contains everything visible in the page.

## `<main class="container">`

`main` describes the primary page content semantically.

`class="container"` gives CSS a reusable name that it can style.

## Header block

```html
<header class="hero">
```

`header` groups introductory content. `hero` is our own CSS class name; HTML itself does not give special behavior to the word `hero`.

The demo button has:

```html
id="seedButton"
```

An `id` should uniquely identify one element. JavaScript later finds this exact button with:

```js
document.querySelector("#seedButton")
```

`#` means "find an element by id" in a CSS selector.

## Statistics cards

Each card contains a label and a `<strong>` element whose text is initially `0`.

Example:

```html
<strong id="totalStat">0</strong>
```

JavaScript updates that element later:

```js
document.querySelector("#totalStat").textContent = total;
```

This separation is important: HTML defines structure, JavaScript changes data.

## The `<form>`

```html
<form id="applicationForm" class="form-grid">
```

A form groups fields that belong to one submission.

The `id` lets JavaScript attach the submit event.

### `required`

```html
<input id="company" required>
```

The browser performs basic client-side validation before submission. We still validate in Java too, because browser validation alone can be bypassed.

### `type="date"`

Asks the browser to use a date-aware input.

### `type="number"`

Tells the browser this input represents a number and allows numeric constraints such as `min` and `step`.

### `<select>` and `<option>`

A `select` gives a controlled set of choices. This is better than making users manually type statuses because it prevents spelling variations.

### `type="submit"`

The Save button triggers the form's `submit` event.

### `type="button"`

The Cancel button explicitly does **not** submit the form.

## Search/filter toolbar

These controls do not save data. They only change which existing applications are displayed.

`type="search"` is similar to text input but communicates search intent to the browser.

## Table

`<thead>` contains column headings.

`<tbody id="applicationsBody">` starts empty because JavaScript generates its rows dynamically.

This is why you do not see hardcoded applications inside `index.html`.

## Script at the bottom

```html
<script src="app.js"></script>
```

Loads and executes our JavaScript.

We put it near the end of `body`, so the HTML elements exist before JavaScript tries to select them.

---

# 10. `styles.css` — what each type of rule does

CSS syntax normally looks like:

```css
selector {
  property: value;
}
```

The selector chooses elements. The declarations inside braces describe how they should look/layout.

## `:root`

```css
:root {
  font-family: ...;
  color: ...;
  background: ...;
}
```

`:root` represents the top-level document element. Values such as font and text color are inherited by many child elements.

## Universal selector `*`

```css
* { box-sizing: border-box; }
```

`*` means every element.

`border-box` makes declared width include padding and borders. This makes sizing much easier to reason about.

## `.container`

A selector starting with `.` targets a class.

```css
width: min(1180px, calc(100% - 32px));
```

Use whichever is smaller: 1180px or the screen width minus 32px. This keeps the page wide on desktop but leaves margins on smaller screens.

## Flexbox

```css
display: flex;
justify-content: space-between;
align-items: center;
```

Flexbox arranges children along one main direction.

- `space-between`: push first and last items apart.
- `align-items: center`: center items on the cross-axis.

## CSS Grid

```css
display: grid;
grid-template-columns: repeat(4, 1fr);
```

Creates four equal-width columns.

`1fr` means one fraction of available space.

## `gap`

Adds consistent space between flex/grid children without manually adding margins to every child.

## Borders and radius

```css
border: 1px solid #dfe5ef;
border-radius: 16px;
```

The first line creates a one-pixel solid border. The second rounds corners.

## Focus rule

```css
input:focus { ... }
```

`:focus` is a pseudo-class that applies while the user is actively focused on the control, such as after clicking it or reaching it with Tab.

## `.full-width`

```css
grid-column: 1 / -1;
```

In a grid, start at the first grid line and end at the last one. In practice, span the full row.

## `.hidden`

```css
.hidden { display: none !important; }
```

Completely removes an element from layout when the class is applied.

JavaScript adds/removes this class for things like the Cancel Edit button.

## Media queries

```css
@media (max-width: 800px) { ... }
```

Apply different rules only when the viewport is at most 800px wide.

That is how the page switches from four columns to fewer columns on tablets/phones.

---

# 11. `pom.xml` — Maven and dependencies

Maven is the Java project's build/dependency tool.

`pom.xml` is its project configuration file.

## Parent

```xml
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.5.5</version>
</parent>
```

Spring Boot's parent supplies compatible dependency/plugin defaults so we do not manually version every Spring library.

## Project identity

```xml
<groupId>com.portfolio</groupId>
<artifactId>job-application-tracker</artifactId>
```

Together these identify the Java artifact.

## Java version

```xml
<java.version>21</java.version>
```

Tells Maven/Spring that this project targets Java 21.

## `spring-boot-starter-web`

Adds what we need for a web application and REST controllers, including the embedded server and JSON handling.

## `spring-boot-starter-data-jpa`

Adds Spring Data JPA and Hibernate so Java entities can be persisted without manually writing CRUD SQL.

## `spring-boot-starter-validation`

Enables validation annotations such as `@NotBlank` and `@NotNull`.

## H2

H2 is a small relational database that is excellent for a zero-setup learning project. Later, the portfolio version can be switched to PostgreSQL.

`runtime` scope means the application needs H2 while running but we do not compile our own code directly against H2-specific APIs.

## Test dependency

`spring-boot-starter-test` bundles common testing libraries such as JUnit and Mockito.

## Spring Boot Maven plugin

Makes Spring-specific packaging and execution commands such as `mvn spring-boot:run` available.

---

# 12. `application.properties`

This file configures the running Spring application.

```properties
spring.datasource.url=jdbc:h2:file:./data/jobtracker
```

Use an H2 database stored on disk under `data/jobtracker` rather than an in-memory database that disappears after every restart.

```properties
spring.datasource.username=sa
spring.datasource.password=
```

Local development credentials for this H2 database. This is not how we would configure production secrets.

```properties
spring.jpa.hibernate.ddl-auto=update
```

Hibernate compares the entity model with the database schema and updates the schema for development convenience.

For serious production systems, migrations such as Flyway/Liquibase are preferred.

```properties
spring.jpa.open-in-view=false
```

Disables Open Session in View. This encourages database work to happen intentionally in the application/service flow instead of lazily during HTML/JSON rendering.

```properties
spring.h2.console.enabled=true
```

Enables H2's browser console for learning/debugging.

---

# 13. `JobApplication.java` field-by-field

```java
private Long id;
```

`Long` is the object form of Java's `long`. JPA commonly uses wrapper types because `null` can represent "not generated yet" before insertion.

```java
private String company;
private String position;
```

Strings hold text.

```java
private LocalDate applicationDate;
```

`LocalDate` represents a calendar date with no time-of-day and no timezone. That matches our problem better than storing a full timestamp.

```java
private ApplicationStatus status;
```

Only values defined in our enum are valid.

```java
private BigDecimal salary;
```

`BigDecimal` is preferred over floating-point types for money-like decimal values because binary floating-point can create precision surprises.

```java
private String notes;
```

Optional free text.

## `@Enumerated(EnumType.STRING)`

Store enum values as readable strings such as `INTERVIEW` instead of numeric positions such as `2`.

This is safer because reordering enum values later will not silently reinterpret old database data.

---

# 14. `JobApplicationService.java` method-by-method

## Constructor

```java
public JobApplicationService(JobApplicationRepository repository) {
    this.repository = repository;
}
```

Spring sees that the service requires a repository and injects one.

No `new JobApplicationRepository()` is possible anyway because the repository is an interface whose implementation Spring generates at runtime.

## `findAll`

```java
return repository.findAll(Sort.by(Sort.Direction.DESC, "applicationDate"));
```

- `Sort.Direction.DESC`: descending order.
- `"applicationDate"`: entity field used for sorting.

Newest application dates therefore appear first.

## `findById`

```java
repository.findById(id)
```

The database may or may not contain that id, therefore Spring returns an `Optional`.

The lambda:

```java
() -> new ResponseStatusException(...)
```

means "create this exception only if it is actually needed".

## `create`

```java
return repository.save(application);
```

For a new entity whose generated id is still null, JPA inserts a row and returns the persisted entity, now normally containing its generated id.

## `update`

```java
JobApplication existing = findById(id);
```

First prove the row exists.

Then each setter copies allowed incoming changes into the managed entity.

Finally:

```java
return repository.save(existing);
```

persists the new state.

## `delete`

We again call `findById(id)` first so deleting an unknown id results in a clean 404 rather than ambiguous behavior.

---

# 15. Java REST controller — URL examples

The base mapping is:

```text
/api/applications
```

Therefore:

```text
GET    /api/applications
GET    /api/applications/5
POST   /api/applications
PUT    /api/applications/5
DELETE /api/applications/5
```

HTTP method is part of the meaning. The same URL can perform different operations depending on GET/POST/PUT/DELETE.

Example POST JSON:

```json
{
  "company": "Example Ltd",
  "position": "Junior Java Developer",
  "applicationDate": "2026-09-01",
  "status": "APPLIED",
  "salary": 25000,
  "notes": "Applied through company website"
}
```

Spring/Jackson converts this JSON object into a `JobApplication` Java object before our method runs.

---

# 16. Java frontend `fetch()` block in detail

```js
const response = await fetch(url, {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
});
```

- `url`: endpoint we are calling.
- `method`: either `POST` or `PUT` in this function.
- `Content-Type`: tells the Java server that the body is JSON.
- `JSON.stringify(payload)`: converts a JavaScript object into JSON text for transmission.

## `response.ok`

True for HTTP success status codes in the 200-299 range.

```js
if (!response.ok) {
```

The `!` reverses true/false. So this block runs when the request was **not** successful.

## `try / catch`

```js
try {
   // code that may fail
} catch (error) {
   // what to do after a failure
}
```

`try` is not the same as `if`.

- `if` handles a condition we explicitly test.
- `catch` handles an exception/error thrown while code was running.

---

# 17. Java test file

```java
@ExtendWith(MockitoExtension.class)
```

Activates Mockito support for this JUnit test class.

```java
@Mock
private JobApplicationRepository repository;
```

Creates a fake repository. The test does not need a real database.

```java
@InjectMocks
private JobApplicationService service;
```

Creates the service and injects the fake repository into its constructor.

Then:

```java
service.create(application);
```

runs the behavior being tested.

Finally:

```java
verify(repository).save(application);
```

asserts that the service really asked the repository to save exactly that application.

This test is simple on purpose. Later we should add tests for not-found cases, updates, validation and controller endpoints.

---

# 18. Python/FastAPI version block-by-block

## `class ApplicationStatus(str, Enum)`

Defines the same fixed statuses as Java's enum.

Inheriting from `str` makes values serialize naturally as JSON strings.

## Pydantic model

```python
class JobApplicationInput(BaseModel):
```

This class describes and validates incoming API JSON.

For example:

```python
company: str = Field(min_length=1)
```

means `company` must be a string with at least one character.

`Optional[float]` means the value can be a number or `None`.

## Database connection

```python
def get_connection():
```

Defines a reusable function that opens SQLite.

```python
connection.row_factory = sqlite3.Row
```

Makes rows accessible with column names and easy to convert to dictionaries.

## Parameterized SQL

```python
WHERE id = ?
```

and

```python
(application_id,)
```

keep data separate from SQL syntax. Do not build SQL by directly concatenating untrusted user input.

## FastAPI decorator

```python
@app.get("/applications")
```

Registers the function immediately below as the handler for GET requests to `/applications`.

Java uses annotations; Python/FastAPI uses decorators. Architecturally they solve a similar mapping problem.

## Python `if`

```python
if row is None:
    raise HTTPException(...)
```

Same decision concept as Java/JavaScript `if`, but Python uses indentation rather than `{ }` braces to define the block.

---

# 19. Git commands — what they actually do

```bash
git init
```

Turns the current folder into a local Git repository by creating hidden Git metadata.

```bash
git add .
```

Stages current changes. It does **not** upload them.

```bash
git commit -m "..."
```

Creates a local snapshot from the staged changes.

```bash
git remote add origin ...
```

Saves the GitHub repository URL under the conventional nickname `origin`.

```bash
git push -u origin main
```

Uploads your local `main` branch and connects it with the remote `main` branch.

After that, future uploads are normally:

```bash
git add .
git commit -m "feat: ..."
git push
```
