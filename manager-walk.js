(function () {
    "use strict";

    const COLLECTION = "manager_walk";
    const TAB_ID = "tab-manager_walk";

    let editingIndex = -1;
    let listenersAttached = false;

    function getRecords() {
        return window.FXData ? window.FXData.get(COLLECTION) : [];
    }

    function createId() {
        return "MW-" + String(getRecords().length + 1).padStart(3, "0");
    }

    function today() {
        return new Date().toISOString().slice(0, 10);
    }

    function now() {
        return new Date().toTimeString().slice(0, 5);
    }

    function escapeHtml(value) {
        if (typeof window.escapeHtml === "function") {
            return window.escapeHtml(value ?? "");
        }

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getAmenities() {
        return window.FXData ? window.FXData.get("amenities") : [];
    }

    function getStaff() {
        return window.FXData ? window.FXData.get("staff_master") : [];
    }

    function getAmenityById(id) {
        return getAmenities().find(item =>
            String(item.id) === String(id) ||
            String(item.amenityId) === String(id)
        );
    }

    function getStaffById(id) {
        return getStaff().find(item =>
            String(item.id) === String(id) ||
            String(item.staffId) === String(id)
        );
    }

    function getRoot() {
        return document.getElementById(TAB_ID);
    }

    function render() {
        const root = getRoot();

        if (!root) {
            console.warn("Manager's Walk: tab container not found:", TAB_ID);
            return;
        }

        root.innerHTML = `
            <section class="manager-walk-module">
                <div class="manager-walk-header">
                    <div>
                        <h2>Manager’s Walk</h2>
                        <p>Record inspections, observations, corrective actions and follow-ups.</p>
                    </div>

                    <button type="button" class="btn btn-primary" id="manager-walk-add">
                        + Add Walk Record
                    </button>
                </div>

                <div class="manager-walk-summary">
                    <div class="summary-card">
                        <span>Total Walks</span>
                        <strong id="manager-walk-total">0</strong>
                    </div>

                    <div class="summary-card">
                        <span>Open Findings</span>
                        <strong id="manager-walk-open">0</strong>
                    </div>

                    <div class="summary-card">
                        <span>High Priority</span>
                        <strong id="manager-walk-high">0</strong>
                    </div>

                    <div class="summary-card">
                        <span>Completed</span>
                        <strong id="manager-walk-completed">0</strong>
                    </div>
                </div>

                <div class="manager-walk-toolbar">
                    <input
                        type="search"
                        id="manager-walk-search"
                        placeholder="Search walk records..."
                    />

                    <select id="manager-walk-status-filter">
                        <option value="">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Closed">Closed</option>
                    </select>

                    <select id="manager-walk-priority-filter">
                        <option value="">All Priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>

                    <input type="date" id="manager-walk-date-filter" />
                </div>

                <div id="manager-walk-register" class="manager-walk-register"></div>

                <section class="manager-walk-history-section">
                    <div class="manager-walk-history-heading">
                        <h3>Record History</h3>
                        <input
                            type="search"
                            id="manager-walk-history-search"
                            placeholder="Search history..."
                        />
                    </div>

                    <div id="manager-walk-history"></div>
                </section>

                <div id="manager-walk-modal" class="manager-walk-modal" hidden>
                    <div class="manager-walk-modal-panel">
                        <div class="manager-walk-modal-header">
                            <h3 id="manager-walk-modal-title">Add Walk Record</h3>

                            <button
                                type="button"
                                class="manager-walk-close"
                                id="manager-walk-close"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <form id="manager-walk-form">
                            <div class="manager-walk-form-grid">
                                <label>
                                    Walk ID
                                    <input id="manager-walk-id" readonly />
                                </label>

                                <label>
                                    Date
                                    <input id="manager-walk-date" type="date" required />
                                </label>

                                <label>
                                    Time
                                    <input id="manager-walk-time" type="time" required />
                                </label>

                                <label>
                                    Inspector / Manager
                                    <input id="manager-walk-inspector" required />
                                </label>

                                <label>
                                    Area / Amenity
                                    <select id="manager-walk-amenity" required>
                                        <option value="">Select Area / Amenity</option>
                                    </select>
                                </label>

                                <label>
                                    Amenity ID
                                    <input id="manager-walk-amenity-id" readonly />
                                </label>

                                <label>
                                    Zone
                                    <input id="manager-walk-zone" readonly />
                                </label>

                                <label>
                                    Issue Category
                                    <select id="manager-walk-category">
                                        <option value="">Select Category</option>
                                        <option value="Cleanliness">Cleanliness</option>
                                        <option value="Safety">Safety</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Staffing">Staffing</option>
                                        <option value="Guest Experience">Guest Experience</option>
                                        <option value="Inventory">Inventory</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </label>

                                <label>
                                    Priority
                                    <select id="manager-walk-priority" required>
                                        <option value="Low">Low</option>
                                        <option value="Medium" selected>Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </label>

                                <label>
                                    Responsible Person
                                    <select id="manager-walk-responsible">
                                        <option value="">Select Responsible Person</option>
                                    </select>
                                </label>

                                <label>
                                    Target Completion Date
                                    <input id="manager-walk-target-date" type="date" />
                                </label>

                                <label>
                                    Status
                                    <select id="manager-walk-status" required>
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </label>

                                <label class="manager-walk-full-width">
                                    Findings and Observations
                                    <textarea
                                        id="manager-walk-findings"
                                        rows="4"
                                        required
                                    ></textarea>
                                </label>

                                <label class="manager-walk-full-width">
                                    Corrective Action
                                    <textarea
                                        id="manager-walk-corrective-action"
                                        rows="4"
                                    ></textarea>
                                </label>

                                <label class="manager-walk-full-width">
                                    Remarks
                                    <textarea
                                        id="manager-walk-remarks"
                                        rows="3"
                                    ></textarea>
                                </label>
                            </div>

                            <div class="manager-walk-form-actions">
                                <button type="button" class="btn btn-secondary" id="manager-walk-cancel">
                                    Cancel
                                </button>

                                <button type="submit" class="btn btn-primary">
                                    Save Walk Record
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        `;

        populateAmenityOptions();
        populateStaffOptions();
        bindEvents();
        renderAll();
    }

    function populateAmenityOptions() {
        const select = document.getElementById("manager-walk-amenity");

        if (!select) return;

        const options = getAmenities()
            .map(item => {
                const name = item.amenity || item.amenityName || "Unnamed Amenity";
                const id = item.amenityId || item.id || "";
                return `
                    <option value="${escapeHtml(item.id || id)}">
                        ${escapeHtml(name)}${id ? " — " + escapeHtml(id) : ""}
                    </option>
                `;
            })
            .join("");

        select.insertAdjacentHTML("beforeend", options);
    }

    function populateStaffOptions() {
        const select = document.getElementById("manager-walk-responsible");

        if (!select) return;

        const options = getStaff()
            .map(item => {
                const name = item.staffName || item.name || "Unnamed Staff";
                const id = item.staffId || item.id || "";

                return `
                    <option value="${escapeHtml(item.id || id)}">
                        ${escapeHtml(name)}${id ? " — " + escapeHtml(id) : ""}
                    </option>
                `;
            })
            .join("");

        select.insertAdjacentHTML("beforeend", options);
    }

    function bindEvents() {
        if (listenersAttached) return;

        const root = getRoot();
        if (!root) return;

        listenersAttached = true;

        root.addEventListener("click", event => {
            const addButton = event.target.closest("#manager-walk-add");
            const closeButton = event.target.closest("#manager-walk-close");
            const cancelButton = event.target.closest("#manager-walk-cancel");
            const editButton = event.target.closest("[data-manager-walk-edit]");
            const deleteButton = event.target.closest("[data-manager-walk-delete]");
            const historyButton = event.target.closest("[data-manager-walk-history]");

            if (addButton) openModal();
            if (closeButton || cancelButton) closeModal();

            if (editButton) {
                openModal(Number(editButton.dataset.managerWalkEdit));
            }

            if (deleteButton) {
                deleteRecord(Number(deleteButton.dataset.managerWalkDelete));
            }

            if (historyButton) {
                const item = historyButton.closest(".manager-walk-history-item");
                if (item) item.classList.toggle("expanded");
            }
        });

        root.addEventListener("input", event => {
            if (
                event.target.id === "manager-walk-search" ||
                event.target.id === "manager-walk-history-search"
            ) {
                renderAll();
            }
        });

        root.addEventListener("change", event => {
            if (
                event.target.id === "manager-walk-status-filter" ||
                event.target.id === "manager-walk-priority-filter" ||
                event.target.id === "manager-walk-date-filter"
            ) {
                renderAll();
            }

            if (event.target.id === "manager-walk-amenity") {
                autofillAmenityFields(event.target.value);
            }
        });

        const form = document.getElementById("manager-walk-form");

        if (form) {
            form.addEventListener("submit", event => {
                event.preventDefault();
                saveRecord();
            });
        }
    }

    function autofillAmenityFields(value) {
        const amenity = getAmenityById(value);

        document.getElementById("manager-walk-amenity-id").value =
            amenity ? amenity.amenityId || amenity.id || "" : "";

        document.getElementById("manager-walk-zone").value =
            amenity ? amenity.zone || "" : "";
    }

    function openModal(index = -1) {
        const modal = document.getElementById("manager-walk-modal");
        const title = document.getElementById("manager-walk-modal-title");

        if (!modal) return;

        editingIndex = index;

        if (index >= 0) {
            const record = getRecords()[index];

            if (!record) return;

            title.textContent = "Edit Walk Record";
            fillForm(record);
        } else {
            title.textContent = "Add Walk Record";

            clearForm();

            document.getElementById("manager-walk-id").value = createId();
            document.getElementById("manager-walk-date").value = today();
            document.getElementById("manager-walk-time").value = now();
        }

        modal.hidden = false;
    }

    function closeModal() {
        const modal = document.getElementById("manager-walk-modal");

        if (modal) modal.hidden = true;

        editingIndex = -1;
    }

    function clearForm() {
        const form = document.getElementById("manager-walk-form");

        if (form) form.reset();

        document.getElementById("manager-walk-amenity-id").value = "";
        document.getElementById("manager-walk-zone").value = "";
    }

    function fillForm(record) {
        document.getElementById("manager-walk-id").value = record.walkId || "";
        document.getElementById("manager-walk-date").value = record.walkDate || "";
        document.getElementById("manager-walk-time").value = record.walkTime || "";
        document.getElementById("manager-walk-inspector").value = record.inspector || "";
        document.getElementById("manager-walk-amenity").value = record.amenityRecordId || "";
        document.getElementById("manager-walk-amenity-id").value = record.amenityId || "";
        document.getElementById("manager-walk-zone").value = record.zone || "";
        document.getElementById("manager-walk-category").value = record.issueCategory || "";
        document.getElementById("manager-walk-priority").value = record.priority || "Medium";
        document.getElementById("manager-walk-responsible").value = record.responsibleRecordId || "";
        document.getElementById("manager-walk-target-date").value = record.targetDate || "";
        document.getElementById("manager-walk-status").value = record.status || "Open";
        document.getElementById("manager-walk-findings").value = record.findings || "";
        document.getElementById("manager-walk-corrective-action").value = record.correctiveAction || "";
        document.getElementById("manager-walk-remarks").value = record.remarks || "";
    }

    function readForm() {
        const amenityRecordId = document.getElementById("manager-walk-amenity").value;
        const responsibleRecordId = document.getElementById("manager-walk-responsible").value;

        const amenity = getAmenityById(amenityRecordId);
        const responsible = getStaffById(responsibleRecordId);

        return {
            id: editingIndex >= 0
                ? getRecords()[editingIndex].id
                : "MW-REC-" + Date.now(),

            walkId: document.getElementById("manager-walk-id").value.trim(),
            walkDate: document.getElementById("manager-walk-date").value,
            walkTime: document.getElementById("manager-walk-time").value,
            inspector: document.getElementById("manager-walk-inspector").value.trim(),

            amenityRecordId,
            amenityId: amenity
                ? amenity.amenityId || amenity.id || ""
                : document.getElementById("manager-walk-amenity-id").value,

            amenity: amenity
                ? amenity.amenity || amenity.amenityName || ""
                : "",

            zone: amenity
                ? amenity.zone || ""
                : document.getElementById("manager-walk-zone").value,

            issueCategory: document.getElementById("manager-walk-category").value,
            priority: document.getElementById("manager-walk-priority").value,

            responsibleRecordId,
            responsible: responsible
                ? responsible.staffName || responsible.name || ""
                : "",

            targetDate: document.getElementById("manager-walk-target-date").value,
            status: document.getElementById("manager-walk-status").value,
            findings: document.getElementById("manager-walk-findings").value.trim(),
            correctiveAction: document.getElementById("manager-walk-corrective-action").value.trim(),
            remarks: document.getElementById("manager-walk-remarks").value.trim(),

            updatedAt: new Date().toISOString()
        };
    }

    function saveRecord() {
        const record = readForm();

        if (!record.walkId || !record.walkDate || !record.inspector || !record.findings) {
            alert("Please complete Walk ID, Date, Inspector and Findings.");
            return;
        }

        const records = getRecords();

        if (editingIndex >= 0) {
            window.FXData.update(COLLECTION, editingIndex, record);
        } else {
            record.createdAt = new Date().toISOString();
            window.FXData.add(COLLECTION, record);
        }

        closeModal();
        renderAll();
    }

    function deleteRecord(index) {
        const record = getRecords()[index];

        if (!record) return;

        const confirmed = confirm(
            "Delete walk record " + (record.walkId || "") + "?"
        );

        if (!confirmed) return;

        window.FXData.remove(COLLECTION, index);
        renderAll();
    }

    function getFilteredRecords() {
        const records = getRecords();

        const search = (
            document.getElementById("manager-walk-search")?.value || ""
        ).toLowerCase();

        const status = document.getElementById("manager-walk-status-filter")?.value || "";
        const priority = document.getElementById("manager-walk-priority-filter")?.value || "";
        const date = document.getElementById("manager-walk-date-filter")?.value || "";

        return records.filter(record => {
            const searchable = [
                record.walkId,
                record.inspector,
                record.amenity,
                record.amenityId,
                record.zone,
                record.findings,
                record.correctiveAction,
                record.responsible,
                record.issueCategory,
                record.status,
                record.priority
            ]
                .join(" ")
                .toLowerCase();

            return (
                (!search || searchable.includes(search)) &&
                (!status || record.status === status) &&
                (!priority || record.priority === priority) &&
                (!date || record.walkDate === date)
            );
        });
    }

    function renderAll() {
        renderSummary();
        renderRegister();
        renderHistory();
    }

    function renderSummary() {
        const records = getRecords();

        document.getElementById("manager-walk-total").textContent = records.length;

        document.getElementById("manager-walk-open").textContent =
            records.filter(item =>
                item.status === "Open" || item.status === "In Progress"
            ).length;

        document.getElementById("manager-walk-high").textContent =
            records.filter(item =>
                item.priority === "High" || item.priority === "Critical"
            ).length;

        document.getElementById("manager-walk-completed").textContent =
            records.filter(item =>
                item.status === "Completed" || item.status === "Closed"
            ).length;
    }

    function renderRegister() {
        const container = document.getElementById("manager-walk-register");

        if (!container) return;

        const records = getFilteredRecords();

        if (!records.length) {
            container.innerHTML = `
                <div class="manager-walk-empty">
                    No walk records found.
                </div>
            `;
            return;
        }

        container.innerHTML = records
            .map(record => {
                const originalIndex = getRecords().indexOf(record);

                return `
                    <article class="manager-walk-record-card">
                        <div class="manager-walk-record-top">
                            <div>
                                <h3>${escapeHtml(record.walkId)}</h3>
                                <p>
                                    ${escapeHtml(record.walkDate)}
                                    ${record.walkTime ? " · " + escapeHtml(record.walkTime) : ""}
                                </p>
                            </div>

                            <div class="manager-walk-badges">
                                <span class="manager-walk-badge priority-${escapeHtml(
                                    (record.priority || "medium").toLowerCase()
                                )}">
                                    ${escapeHtml(record.priority)}
                                </span>

                                <span class="manager-walk-badge status-${escapeHtml(
                                    (record.status || "open").toLowerCase().replace(/\s+/g, "-")
                                )}">
                                    ${escapeHtml(record.status)}
                                </span>
                            </div>
                        </div>

                        <div class="manager-walk-record-grid">
                            <div>
                                <strong>Inspector</strong>
                                <span>${escapeHtml(record.inspector)}</span>
                            </div>

                            <div>
                                <strong>Area / Amenity</strong>
                                <span>${escapeHtml(record.amenity || "Not specified")}</span>
                            </div>

                            <div>
                                <strong>Zone</strong>
                                <span>${escapeHtml(record.zone || "Not specified")}</span>
                            </div>

                            <div>
                                <strong>Responsible</strong>
                                <span>${escapeHtml(record.responsible || "Not assigned")}</span>
                            </div>

                            <div>
                                <strong>Target Date</strong>
                                <span>${escapeHtml(record.targetDate || "Not specified")}</span>
                            </div>

                            <div>
                                <strong>Category</strong>
                                <span>${escapeHtml(record.issueCategory || "Not specified")}</span>
                            </div>
                        </div>

                        <div class="manager-walk-record-section">
                            <strong>Findings and Observations</strong>
                            <p>${escapeHtml(record.findings)}</p>
                        </div>

                        ${
                            record.correctiveAction
                                ? `
                                    <div class="manager-walk-record-section">
                                        <strong>Corrective Action</strong>
                                        <p>${escapeHtml(record.correctiveAction)}</p>
                                    </div>
                                `
                                : ""
                        }

                        ${
                            record.remarks
                                ? `
                                    <div class="manager-walk-record-section">
                                        <strong>Remarks</strong>
                                        <p>${escapeHtml(record.remarks)}</p>
                                    </div>
                                `
                                : ""
                        }

                        <div class="manager-walk-record-actions">
                            <button
                                type="button"
                                class="btn btn-secondary"
                                data-manager-walk-edit="${originalIndex}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="btn btn-danger"
                                data-manager-walk-delete="${originalIndex}"
                            >
                                Delete
                            </button>
                        </div>
                    </article>
                `;
            })
            .join("");
    }

    function renderHistory() {
        const container = document.getElementById("manager-walk-history");

        if (!container) return;

        const search = (
            document.getElementById("manager-walk-history-search")?.value || ""
        ).toLowerCase();

        const records = getRecords().filter(record => {
            const text = [
                record.walkId,
                record.walkDate,
                record.inspector,
                record.amenity,
                record.findings,
                record.status
            ]
                .join(" ")
                .toLowerCase();

            return !search || text.includes(search);
        });

        if (!records.length) {
            container.innerHTML = `
                <div class="manager-walk-empty">
                    No history available.
                </div>
            `;
            return;
        }

        container.innerHTML = records
            .map(record => `
                <div class="manager-walk-history-item">
                    <button
                        type="button"
                        class="manager-walk-history-row"
                        data-manager-walk-history
                    >
                        <span>
                            <strong>${escapeHtml(record.walkId)}</strong>
                            <small>
                                ${escapeHtml(record.walkDate)}
                                · ${escapeHtml(record.amenity || "No amenity")}
                            </small>
                        </span>

                        <span>▾</span>
                    </button>

                    <div class="manager-walk-history-details">
                        <p><strong>Inspector:</strong> ${escapeHtml(record.inspector)}</p>
                        <p><strong>Findings:</strong> ${escapeHtml(record.findings)}</p>
                        <p><strong>Corrective Action:</strong> ${escapeHtml(record.correctiveAction || "—")}</p>
                        <p><strong>Responsible:</strong> ${escapeHtml(record.responsible || "—")}</p>
                        <p><strong>Status:</strong> ${escapeHtml(record.status)}</p>
                        <p><strong>Remarks:</strong> ${escapeHtml(record.remarks || "—")}</p>
                    </div>
                </div>
            `)
            .join("");
    }

    function init() {
        listenersAttached = false;
        render();
    }

    function destroy() {
        const root = getRoot();

        if (root) root.innerHTML = "";

        listenersAttached = false;
        editingIndex = -1;
    }

    if (typeof window.registerFXModule === "function") {
        window.registerFXModule(
            "manager_walk",
            {
                init,
                render,
                destroy
            }
        );
    } else {
        console.warn("Manager’s Walk: registerFXModule is not available.");
    }

    window.FXManagerWalk = {
        init,
        render,
        destroy
    };
})();
