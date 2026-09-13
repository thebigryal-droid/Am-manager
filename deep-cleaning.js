
/* Facility Executive OS — Deep Cleaning Module */

(function () {
    "use strict";

    const COLLECTION = "deep_cleaning";
    const TAB_ID = "tab-deep_clean";

    let editingIndex = -1;
    let listenersBound = false;

    function data() {
        return window.FXData;
    }

    function records() {
        return data().get(COLLECTION);
    }

    function today() {
        return new Date().toISOString().slice(0, 10);
    }

    function now() {
        return new Date().toISOString();
    }

    function uid() {
        return "DC-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    }

    function esc(value) {
        if (typeof window.escapeHtml === "function") {
            return window.escapeHtml(value == null ? "" : String(value));
        }

        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getAmenities() {
        return window.FXData.get("amenities");
    }

    function getStaff() {
        return window.FXData.get("staff_master");
    }

    function getAmenity(id) {
        return getAmenities().find(item => String(item.id) === String(id));
    }

    function getStaffMember(id) {
        return getStaff().find(item => String(item.id) === String(id));
    }

    function statusClass(status) {
        return String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = new Date(value + "T00:00:00");

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function getTab() {
        return document.getElementById(TAB_ID);
    }

    function render() {
        const tab = getTab();

        if (!tab) {
            console.warn(
                "Deep Cleaning: " + TAB_ID + " was not found."
            );
            return;
        }

        tab.innerHTML = `
            <section class="deep-cleaning-module">
                <div class="deep-cleaning-header">
                    <div>
                        <h2>Deep Cleaning</h2>
                        <p>Plan, assign, track and close deep-cleaning activities.</p>
                    </div>

                    <button class="primary-btn" id="deep-cleaning-add-btn">
                        + Add Deep Cleaning
                    </button>
                </div>

                <div class="deep-cleaning-summary" id="deep-cleaning-summary"></div>

                <div class="deep-cleaning-toolbar">
                    <input
                        type="search"
                        id="deep-cleaning-search"
                        placeholder="Search area, amenity, staff or task..."
                    />

                    <select id="deep-cleaning-status-filter">
                        <option value="">All Statuses</option>
                        <option value="Planned">Planned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select id="deep-cleaning-priority-filter">
                        <option value="">All Priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                    </select>

                    <input type="date" id="deep-cleaning-date-filter" />
                </div>

                <div id="deep-cleaning-register"></div>

                <section class="deep-cleaning-history-section">
                    <div class="deep-cleaning-section-heading">
                        <div>
                            <h3>Record History</h3>
                            <p>Previously created deep-cleaning records.</p>
                        </div>

                        <input
                            type="search"
                            id="deep-cleaning-history-search"
                            placeholder="Search history..."
                        />
                    </div>

                    <div id="deep-cleaning-history"></div>
                </section>
            </section>

            <div class="deep-cleaning-modal" id="deep-cleaning-modal" hidden>
                <div class="deep-cleaning-modal-backdrop" data-close-deep-cleaning></div>

                <div class="deep-cleaning-modal-card">
                    <div class="deep-cleaning-modal-header">
                        <div>
                            <h3 id="deep-cleaning-modal-title">Add Deep Cleaning</h3>
                            <p>Enter the activity details below.</p>
                        </div>

                        <button
                            type="button"
                            class="icon-btn"
                            data-close-deep-cleaning
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>

                    <form id="deep-cleaning-form">
                        <div class="deep-cleaning-form-grid">
                            <label>
                                Deep Cleaning ID
                                <input id="dc-id" readonly />
                            </label>

                            <label>
                                Date *
                                <input id="dc-date" type="date" required />
                            </label>

                            <label>
                                Facility / Amenity *
                                <select id="dc-amenity" required>
                                    <option value="">Select amenity</option>
                                </select>
                            </label>

                            <label>
                                Amenity ID
                                <input id="dc-amenity-id" readonly />
                            </label>

                            <label>
                                Zone
                                <input id="dc-zone" readonly />
                            </label>

                            <label>
                                Assigned Staff *
                                <select id="dc-staff" required>
                                    <option value="">Select staff</option>
                                </select>
                            </label>

                            <label>
                                Department
                                <input id="dc-department" readonly />
                            </label>

                            <label>
                                Cleaning Type *
                                <select id="dc-cleaning-type" required>
                                    <option value="">Select type</option>
                                    <option value="Routine Deep Cleaning">Routine Deep Cleaning</option>
                                    <option value="Scheduled Deep Cleaning">Scheduled Deep Cleaning</option>
                                    <option value="Post-Event Cleaning">Post-Event Cleaning</option>
                                    <option value="Seasonal Cleaning">Seasonal Cleaning</option>
                                    <option value="Emergency Cleaning">Emergency Cleaning</option>
                                    <option value="Specialized Cleaning">Specialized Cleaning</option>
                                </select>
                            </label>

                            <label>
                                Priority
                                <select id="dc-priority">
                                    <option value="Low">Low</option>
                                    <option value="Medium" selected>Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </label>

                            <label>
                                Start Time
                                <input id="dc-start-time" type="time" />
                            </label>

                            <label>
                                End Time
                                <input id="dc-end-time" type="time" />
                            </label>

                            <label>
                                Status
                                <select id="dc-status">
                                    <option value="Planned">Planned</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </label>

                            <label class="full-width">
                                Cleaning Checklist / Tasks *
                                <textarea
                                    id="dc-tasks"
                                    rows="4"
                                    required
                                    placeholder="List the cleaning tasks to be completed..."
                                ></textarea>
                            </label>

                            <label class="full-width">
                                Materials Used
                                <textarea
                                    id="dc-materials"
                                    rows="3"
                                    placeholder="Chemicals, tools, consumables or equipment used..."
                                ></textarea>
                            </label>

                            <label class="full-width">
                                Remarks
                                <textarea
                                    id="dc-remarks"
                                    rows="3"
                                    placeholder="Additional observations or instructions..."
                                ></textarea>
                            </label>

                            <label class="full-width dc-checkbox-label">
                                <input type="checkbox" id="dc-confirmed" />
                                Completion confirmed by responsible person
                            </label>
                        </div>

                        <div class="deep-cleaning-form-actions">
                            <button type="button" class="secondary-btn" data-close-deep-cleaning>
                                Cancel
                            </button>

                            <button type="submit" class="primary-btn">
                                Save Deep Cleaning
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        populateAmenityOptions();
        populateStaffOptions();
        bindEvents();
        renderAll();
    }

    function populateAmenityOptions() {
        const select = document.getElementById("dc-amenity");

        if (!select) return;

        const options = getAmenities()
            .map(item => {
                const name = item.amenity || item.amenityName || "Unnamed Amenity";
                const id = item.amenityId || item.id || "";
                return `
                    <option value="${esc(item.id)}">
                        ${esc(name)}${id ? " — " + esc(id) : ""}
                    </option>
                `;
            })
            .join("");

        select.innerHTML = `
            <option value="">Select amenity</option>
            ${options}
        `;
    }

    function populateStaffOptions() {
        const select = document.getElementById("dc-staff");

        if (!select) return;

        select.innerHTML = `
            <option value="">Select staff</option>
            ${getStaff()
                .map(item => `
                    <option value="${esc(item.id)}">
                        ${esc(item.staffName || "Unnamed Staff")}
                        ${item.staffId ? " — " + esc(item.staffId) : ""}
                    </option>
                `)
                .join("")}
        `;
    }

    function bindEvents() {
        if (listenersBound) return;

        listenersBound = true;

        document.addEventListener("click", event => {
            const addButton = event.target.closest("#deep-cleaning-add-btn");

            if (addButton) {
                openAddModal();
                return;
            }

            const editButton = event.target.closest("[data-edit-deep-cleaning]");

            if (editButton) {
                openEditModal(Number(editButton.dataset.editDeepCleaning));
                return;
            }

            const deleteButton = event.target.closest("[data-delete-deep-cleaning]");

            if (deleteButton) {
                deleteRecord(Number(deleteButton.dataset.deleteDeepCleaning));
                return;
            }

            const historyButton = event.target.closest("[data-toggle-deep-cleaning-history]");

            if (historyButton) {
                const index = Number(historyButton.dataset.toggleDeepCleaningHistory);
                const details = document.querySelector(
                    `[data-deep-cleaning-history-details="${index}"]`
                );

                if (details) {
                    details.hidden = !details.hidden;
                    historyButton.textContent = details.hidden ? "View Details" : "Hide Details";
                }

                return;
            }

            if (event.target.closest("[data-close-deep-cleaning]")) {
                closeModal();
            }
        });

        document.addEventListener("change", event => {
            if (event.target.id === "dc-amenity") {
                fillAmenityDetails(event.target.value);
            }

            if (event.target.id === "dc-staff") {
                fillStaffDetails(event.target.value);
            }

            if (
                event.target.id === "deep-cleaning-search" ||
                event.target.id === "deep-cleaning-status-filter" ||
                event.target.id === "deep-cleaning-priority-filter" ||
                event.target.id === "deep-cleaning-date-filter" ||
                event.target.id === "deep-cleaning-history-search"
            ) {
                renderAll();
            }
        });

        document.addEventListener("input", event => {
            if (
                event.target.id === "deep-cleaning-search" ||
                event.target.id === "deep-cleaning-history-search"
            ) {
                renderAll();
            }
        });

        document.addEventListener("submit", event => {
            if (event.target.id === "deep-cleaning-form") {
                event.preventDefault();
                saveRecord();
            }
        });
    }

    function fillAmenityDetails(id) {
        const item = getAmenity(id);

        document.getElementById("dc-amenity-id").value =
            item ? item.amenityId || item.id || "" : "";

        document.getElementById("dc-zone").value =
            item ? item.zone || "" : "";
    }

    function fillStaffDetails(id) {
        const item = getStaffMember(id);

        document.getElementById("dc-department").value =
            item ? item.department || "" : "";
    }

    function openAddModal() {
        editingIndex = -1;

        document.getElementById("deep-cleaning-modal-title").textContent =
            "Add Deep Cleaning";

        document.getElementById("deep-cleaning-form").reset();

        document.getElementById("dc-id").value = uid();
        document.getElementById("dc-date").value = today();
        document.getElementById("dc-priority").value = "Medium";
        document.getElementById("dc-status").value = "Planned";

        document.getElementById("deep-cleaning-modal").hidden = false;
    }

    function openEditModal(index) {
        const item = records()[index];

        if (!item) return;

        editingIndex = index;

        document.getElementById("deep-cleaning-modal-title").textContent =
            "Edit Deep Cleaning";

        document.getElementById("dc-id").value = item.deepCleaningId || item.id || "";
        document.getElementById("dc-date").value = item.cleaningDate || "";
        document.getElementById("dc-amenity").value = item.amenityRecordId || "";
        document.getElementById("dc-staff").value = item.staffRecordId || "";
        document.getElementById("dc-cleaning-type").value = item.cleaningType || "";
        document.getElementById("dc-priority").value = item.priority || "Medium";
        document.getElementById("dc-start-time").value = item.startTime || "";
        document.getElementById("dc-end-time").value = item.endTime || "";
        document.getElementById("dc-status").value = item.status || "Planned";
        document.getElementById("dc-tasks").value = item.tasks || "";
        document.getElementById("dc-materials").value = item.materials || "";
        document.getElementById("dc-remarks").value = item.remarks || "";
        document.getElementById("dc-confirmed").checked = Boolean(item.completionConfirmed);

        fillAmenityDetails(item.amenityRecordId);
        fillStaffDetails(item.staffRecordId);

        document.getElementById("deep-cleaning-modal").hidden = false;
    }

    function closeModal() {
        const modal = document.getElementById("deep-cleaning-modal");

        if (modal) {
            modal.hidden = true;
        }
    }

    function saveRecord() {
        const amenity = getAmenity(document.getElementById("dc-amenity").value);
        const staff = getStaffMember(document.getElementById("dc-staff").value);

        if (!amenity) {
            alert("Please select a facility or amenity.");
            return;
        }

        if (!staff) {
            alert("Please select assigned staff.");
            return;
        }

        const record = {
            id: document.getElementById("dc-id").value || uid(),
            deepCleaningId: document.getElementById("dc-id").value || uid(),
            cleaningDate: document.getElementById("dc-date").value,
            amenityRecordId: amenity.id,
            amenityId: amenity.amenityId || amenity.id || "",
            amenity: amenity.amenity || amenity.amenityName || "",
            zone: amenity.zone || "",
            staffRecordId: staff.id,
            staffId: staff.staffId || staff.id || "",
            staffName: staff.staffName || "",
            department: staff.department || "",
            cleaningType: document.getElementById("dc-cleaning-type").value,
            priority: document.getElementById("dc-priority").value,
            startTime: document.getElementById("dc-start-time").value,
            endTime: document.getElementById("dc-end-time").value,
            status: document.getElementById("dc-status").value,
            tasks: document.getElementById("dc-tasks").value.trim(),
            materials: document.getElementById("dc-materials").value.trim(),
            remarks: document.getElementById("dc-remarks").value.trim(),
            completionConfirmed: document.getElementById("dc-confirmed").checked,
            updatedAt: now()
        };

        if (!record.cleaningDate || !record.cleaningType || !record.tasks) {
            alert("Please complete all required fields.");
            return;
        }

        if (editingIndex === -1) {
            record.createdAt = now();
            data().add(COLLECTION, record);
        } else {
            data().update(COLLECTION, editingIndex, record);
        }

        closeModal();
        renderAll();
    }

    function deleteRecord(index) {
        const item = records()[index];

        if (!item) return;

        const name = item.amenity || "this deep-cleaning record";

        if (!confirm("Delete " + name + "?")) {
            return;
        }

        data().remove(COLLECTION, index);
        renderAll();
    }

    function filteredRecords() {
        const search = (
            document.getElementById("deep-cleaning-search")?.value || ""
        ).toLowerCase().trim();

        const status = document.getElementById("deep-cleaning-status-filter")?.value || "";
        const priority = document.getElementById("deep-cleaning-priority-filter")?.value || "";
        const date = document.getElementById("deep-cleaning-date-filter")?.value || "";

        return records()
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => {
                const searchable = [
                    item.deepCleaningId,
                    item.amenity,
                    item.amenityId,
                    item.zone,
                    item.staffName,
                    item.staffId,
                    item.cleaningType,
                    item.tasks,
                    item.remarks
                ]
                    .join(" ")
                    .toLowerCase();

                return (
                    (!search || searchable.includes(search)) &&
                    (!status || item.status === status) &&
                    (!priority || item.priority === priority) &&
                    (!date || item.cleaningDate === date)
                );
            });
    }

    function renderAll() {
        renderSummary();
        renderRegister();
        renderHistory();
    }

    function renderSummary() {
        const list = records();
        const currentDate = today();

        const total = list.length;
        const planned = list.filter(item => item.status === "Planned").length;
        const inProgress = list.filter(item => item.status === "In Progress").length;
        const completed = list.filter(item => item.status === "Completed").length;
        const highPriority = list.filter(
            item => item.priority === "High" || item.priority === "Urgent"
        ).length;
        const todayCount = list.filter(item => item.cleaningDate === currentDate).length;

        document.getElementById("deep-cleaning-summary").innerHTML = `
            <div class="deep-cleaning-summary-card">
                <span>Total Records</span>
                <strong>${total}</strong>
            </div>

            <div class="deep-cleaning-summary-card">
                <span>Planned</span>
                <strong>${planned}</strong>
            </div>

            <div class="deep-cleaning-summary-card">
                <span>In Progress</span>
                <strong>${inProgress}</strong>
            </div>

            <div class="deep-cleaning-summary-card">
                <span>Completed</span>
                <strong>${completed}</strong>
            </div>

            <div class="deep-cleaning-summary-card">
                <span>High Priority</span>
                <strong>${highPriority}</strong>
            </div>

            <div class="deep-cleaning-summary-card">
                <span>Today</span>
                <strong>${todayCount}</strong>
            </div>
        `;
    }

    function renderRegister() {
        const container = document.getElementById("deep-cleaning-register");
        const list = filteredRecords();

        if (!list.length) {
            container.innerHTML = `
                <div class="deep-cleaning-empty">
                    <h3>No deep-cleaning records found</h3>
                    <p>Use “+ Add Deep Cleaning” to create the first record.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="deep-cleaning-record-list">
                ${list.map(({ item, index }) => `
                    <article class="deep-cleaning-record-card">
                        <div class="deep-cleaning-record-top">
                            <div>
                                <h3>${esc(item.amenity || "Unnamed Amenity")}</h3>
                                <p>
                                    ${esc(item.amenityId || "")}
                                    ${item.zone ? " · " + esc(item.zone) : ""}
                                </p>
                            </div>

                            <span class="deep-cleaning-status ${statusClass(item.status)}">
                                ${esc(item.status || "Planned")}
                            </span>
                        </div>

                        <div class="deep-cleaning-record-meta">
                            <span><strong>Date:</strong> ${formatDate(item.cleaningDate)}</span>
                            <span><strong>Staff:</strong> ${esc(item.staffName || "—")}</span>
                            <span><strong>Type:</strong> ${esc(item.cleaningType || "—")}</span>
                            <span><strong>Priority:</strong> ${esc(item.priority || "—")}</span>
                            <span><strong>Time:</strong> ${esc(item.startTime || "—")} – ${esc(item.endTime || "—")}</span>
                        </div>

                        <div class="deep-cleaning-record-description">
                            <strong>Tasks</strong>
                            <p>${esc(item.tasks || "—")}</p>
                        </div>

                        ${
                            item.remarks
                                ? `
                                    <div class="deep-cleaning-record-description">
                                        <strong>Remarks</strong>
                                        <p>${esc(item.remarks)}</p>
                                    </div>
                                `
                                : ""
                        }

                        <div class="deep-cleaning-record-actions">
                            <button
                                class="secondary-btn"
                                data-edit-deep-cleaning="${index}"
                            >
                                Edit
                            </button>

                            <button
                                class="danger-btn"
                                data-delete-deep-cleaning="${index}"
                            >
                                Delete
                            </button>
                        </div>
                    </article>
                `).join("")}
            </div>
        `;
    }

    function renderHistory() {
        const container = document.getElementById("deep-cleaning-history");
        const search = (
            document.getElementById("deep-cleaning-history-search")?.value || ""
        ).toLowerCase().trim();

        const list = records()
            .map((item, index) => ({ item, index }))
            .filter(({ item }) => {
                const searchable = [
                    item.deepCleaningId,
                    item.amenity,
                    item.amenityId,
                    item.staffName,
                    item.cleaningType,
                    item.cleaningDate,
                    item.status
                ]
                    .join(" ")
                    .toLowerCase();

                return !search || searchable.includes(search);
            });

        if (!list.length) {
            container.innerHTML = `
                <div class="deep-cleaning-history-empty">
                    No history records found.
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="deep-cleaning-history-list">
                ${list.map(({ item, index }) => `
                    <div class="deep-cleaning-history-item">
                        <div class="deep-cleaning-history-row">
                            <div>
                                <strong>${formatDate(item.cleaningDate)}</strong>
                                <span>${esc(item.amenity || "Unnamed Amenity")}</span>
                            </div>

                            <div>
                                <span>${esc(item.status || "Planned")}</span>
                                <button
                                    class="secondary-btn small-btn"
                                    data-toggle-deep-cleaning-history="${index}"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>

                        <div
                            class="deep-cleaning-history-details"
                            data-deep-cleaning-history-details="${index}"
                            hidden
                        >
                            <p><strong>Deep Cleaning ID:</strong> ${esc(item.deepCleaningId || item.id)}</p>
                            <p><strong>Amenity ID:</strong> ${esc(item.amenityId || "—")}</p>
                            <p><strong>Zone:</strong> ${esc(item.zone || "—")}</p>
                            <p><strong>Staff:</strong> ${esc(item.staffName || "—")}</p>
                            <p><strong>Department:</strong> ${esc(item.department || "—")}</p>
                            <p><strong>Cleaning Type:</strong> ${esc(item.cleaningType || "—")}</p>
                            <p><strong>Priority:</strong> ${esc(item.priority || "—")}</p>
                            <p><strong>Start Time:</strong> ${esc(item.startTime || "—")}</p>
                            <p><strong>End Time:</strong> ${esc(item.endTime || "—")}</p>
                            <p><strong>Tasks:</strong> ${esc(item.tasks || "—")}</p>
                            <p><strong>Materials Used:</strong> ${esc(item.materials || "—")}</p>
                            <p><strong>Remarks:</strong> ${esc(item.remarks || "—")}</p>
                            <p>
                                <strong>Completion Confirmed:</strong>
                                ${item.completionConfirmed ? "Yes" : "No"}
                            </p>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    function init() {
        render();
    }

    function destroy() {
        listenersBound = false;
    }

    window.FXDeepCleaning = {
        render,
        init,
        destroy
    };

    if (typeof window.registerFXModule === "function") {
    window.registerFXModule(
        "deep_clean",
        {
            init,
            render,
            destroy
        }
    );
} else {
    console.warn("Deep Cleaning: registerFXModule is not available.");
}

})();
