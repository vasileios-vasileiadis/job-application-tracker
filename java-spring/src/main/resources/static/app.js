const API_URL = "/api/applications";

const form = document.querySelector("#applicationForm");
const applicationsBody = document.querySelector("#applicationsBody");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const message = document.querySelector("#message");
const cancelEditButton = document.querySelector("#cancelEditButton");

let applications = [];
let editingId = null;

async function loadApplications() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Could not load applications.");
    }

    applications = await response.json();
    render();
  } catch (error) {
    showMessage(error.message, true);
  }
}

function getFormValues() {
  const salaryValue = document.querySelector("#salary").value;

  return {
    company: document.querySelector("#company").value.trim(),
    position: document.querySelector("#position").value.trim(),
    applicationDate: document.querySelector("#applicationDate").value,
    status: document.querySelector("#status").value,
    salary: salaryValue ? Number(salaryValue) : null,
    notes: document.querySelector("#notes").value.trim()
  };
}

async function handleSubmit(event) {
  event.preventDefault();

  const payload = getFormValues();
  const isEditing = editingId !== null;
  const url = isEditing ? `${API_URL}/${editingId}` : API_URL;
  const method = isEditing ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || "Could not save application.");
    }

    showMessage(isEditing ? "Application updated." : "Application created.");
    resetForm();
    await loadApplications();
  } catch (error) {
    showMessage(error.message, true);
  }
}

function render() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filtered = applications.filter(app => {
    const matchesText =
      app.company.toLowerCase().includes(searchTerm) ||
      app.position.toLowerCase().includes(searchTerm);

    const matchesStatus = selectedStatus === "ALL" || app.status === selectedStatus;
    return matchesText && matchesStatus;
  });

  applicationsBody.innerHTML = filtered.map(app => `
    <tr>
      <td><strong>${escapeHtml(app.company)}</strong></td>
      <td>${escapeHtml(app.position)}</td>
      <td>${escapeHtml(app.applicationDate)}</td>
      <td><span class="badge">${escapeHtml(app.status)}</span></td>
      <td>${formatSalary(app.salary)}</td>
      <td>
        <div class="row-actions">
          <button type="button" onclick="editApplication(${app.id})">Edit</button>
          <button type="button" class="danger-button" onclick="deleteApplication(${app.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");

  emptyState.classList.toggle("hidden", filtered.length !== 0);
  updateStats();
}

function updateStats() {
  const total = applications.length;
  const interviews = applications.filter(app => ["INTERVIEW", "TECHNICAL"].includes(app.status)).length;
  const offers = applications.filter(app => app.status === "OFFER").length;
  const responses = applications.filter(app => ["INTERVIEW", "TECHNICAL", "OFFER", "REJECTED"].includes(app.status)).length;
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
  document.querySelector("#applicationDate").value = app.applicationDate;
  document.querySelector("#status").value = app.status;
  document.querySelector("#salary").value = app.salary ?? "";
  document.querySelector("#notes").value = app.notes ?? "";

  editingId = id;
  cancelEditButton.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteApplication(id) {
  if (!window.confirm("Delete this application?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

    if (!response.ok) {
      throw new Error("Could not delete application.");
    }

    showMessage("Application deleted.");
    await loadApplications();
  } catch (error) {
    showMessage(error.message, true);
  }
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
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

form.addEventListener("submit", handleSubmit);
searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);
cancelEditButton.addEventListener("click", resetForm);

loadApplications();
