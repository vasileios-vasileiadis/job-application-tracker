const STORAGE_KEY = "jobApplications";

const form = document.querySelector("#applicationForm");
const applicationsBody = document.querySelector("#applicationsBody");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const message = document.querySelector("#message");
const cancelEditButton = document.querySelector("#cancelEditButton");
const seedButton = document.querySelector("#seedButton");

let applications = loadApplications();
let editingId = null;

function loadApplications() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveApplications() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

function getFormValues() {
  return {
    company: document.querySelector("#company").value.trim(),
    position: document.querySelector("#position").value.trim(),
    date: document.querySelector("#date").value,
    status: document.querySelector("#status").value,
    salary: document.querySelector("#salary").value,
    notes: document.querySelector("#notes").value.trim()
  };
}

function handleSubmit(event) {
  event.preventDefault();

  const values = getFormValues();

  if (!values.company || !values.position || !values.date) {
    showMessage("Fill in company, position and date.", true);
    return;
  }

  if (editingId) {
    applications = applications.map(app =>
      app.id === editingId ? { ...app, ...values } : app
    );
    showMessage("Application updated.");
  } else {
    const application = {
      id: crypto.randomUUID(),
      ...values
    };
    applications.push(application);
    showMessage("Application saved.");
  }

  saveApplications();
  resetForm();
  render();
}

function render() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filtered = applications.filter(app => {
    const matchesText =
      app.company.toLowerCase().includes(searchTerm) ||
      app.position.toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "ALL" || app.status === selectedStatus;

    return matchesText && matchesStatus;
  });

  applicationsBody.innerHTML = filtered
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(app => `
      <tr>
        <td><strong>${escapeHtml(app.company)}</strong></td>
        <td>${escapeHtml(app.position)}</td>
        <td>${escapeHtml(app.date)}</td>
        <td><span class="badge">${escapeHtml(app.status)}</span></td>
        <td>${formatSalary(app.salary)}</td>
        <td>
          <div class="row-actions">
            <button type="button" onclick="editApplication('${app.id}')">Edit</button>
            <button type="button" class="danger-button" onclick="deleteApplication('${app.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `)
    .join("");

  emptyState.classList.toggle("hidden", filtered.length !== 0);
  updateStats();
}

function updateStats() {
  const total = applications.length;
  const interviews = applications.filter(app =>
    ["INTERVIEW", "TECHNICAL"].includes(app.status)
  ).length;
  const offers = applications.filter(app => app.status === "OFFER").length;
  const responses = applications.filter(app =>
    ["INTERVIEW", "TECHNICAL", "OFFER", "REJECTED"].includes(app.status)
  ).length;

  const responseRate = total === 0 ? 0 : Math.round((responses / total) * 100);

  document.querySelector("#totalStat").textContent = total;
  document.querySelector("#interviewStat").textContent = interviews;
  document.querySelector("#offerStat").textContent = offers;
  document.querySelector("#responseRateStat").textContent = `${responseRate}%`;
}

function editApplication(id) {
  const app = applications.find(item => item.id === id);

  if (!app) {
    showMessage("Application not found.", true);
    return;
  }

  document.querySelector("#company").value = app.company;
  document.querySelector("#position").value = app.position;
  document.querySelector("#date").value = app.date;
  document.querySelector("#status").value = app.status;
  document.querySelector("#salary").value = app.salary;
  document.querySelector("#notes").value = app.notes;

  editingId = id;
  cancelEditButton.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteApplication(id) {
  const confirmed = window.confirm("Delete this application?");

  if (!confirmed) {
    return;
  }

  applications = applications.filter(app => app.id !== id);
  saveApplications();
  render();
  showMessage("Application deleted.");
}

function resetForm() {
  form.reset();
  document.querySelector("#status").value = "APPLIED";
  editingId = null;
  cancelEditButton.classList.add("hidden");
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#a92d3a" : "#245c32";
}

function formatSalary(value) {
  if (!value) {
    return "—";
  }

  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function seedDemoData() {
  if (applications.length > 0) {
    showMessage("Demo data is only added to an empty tracker.", true);
    return;
  }

  applications = [
    {
      id: crypto.randomUUID(),
      company: "Northstar Labs",
      position: "Junior Java Developer",
      date: "2026-08-18",
      status: "INTERVIEW",
      salary: "26000",
      notes: "First technical interview scheduled."
    },
    {
      id: crypto.randomUUID(),
      company: "Acme Systems",
      position: "Backend Developer",
      date: "2026-08-25",
      status: "APPLIED",
      salary: "24000",
      notes: "Spring Boot / SQL role."
    }
  ];

  saveApplications();
  render();
  showMessage("Demo data loaded.");
}

form.addEventListener("submit", handleSubmit);
searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);
cancelEditButton.addEventListener("click", resetForm);
seedButton.addEventListener("click", seedDemoData);

render();
