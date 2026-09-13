/* =========================================================
   FACILITY EXECUTIVE OS
   COMPLAINTS LOG
   ========================================================= */

(function () {

    "use strict";

    const FX = window.FX;
    const Data = window.FXData;

    const COLLECTION = "complaints";

    let initialized = false;
    let expandedHistoryId = null;


    /* =====================================================
       HELPERS
       ===================================================== */

    function get(id) {
        return document.getElementById(id);
    }


    function escape(value) {

        if (window.escapeHtml) {
            return window.escapeHtml(value);
        }

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }


    function records() {
        return Data.get(COLLECTION) || [];
    }


    function amenities() {
        return Data.get("amenities") || [];
    }


    function today() {

        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");

    }


    function nowTime() {

        const date = new Date();

        return [
            String(date.getHours()).padStart(2, "0"),
            String(date.getMinutes()).padStart(2, "0")
        ].join(":");

    }


    function formatDate(value) {

        if (!value) {
            return "";
        }

        const date = new Date(value + "T00:00:00");

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString(
            undefined,
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    function nextComplaintId() {

        const numbers = records()
            .map(function (item) {

                const match =
                    String(item.complaintId || "")
                        .match(/(\d+)$/);

                return match
                    ? Number(match[1])
                    : 0;

            });

        const next =
            Math.max(0, ...numbers) + 1;

        return `CMP-${String(next).padStart(3, "0")}`;

    }


    function getSelectedAmenity() {

        const select = get("complaint-amenity");

        if (!select || !select.value) {
            return null;
        }

        return amenities().find(function (item) {

            return String(item.id) === String(select.value);

        }) || null;

    }


    /* =====================================================
       SUMMARY
       ===================================================== */

    function getSummary() {

        const list = records();

        return {

            total: list.length,

            open: list.filter(function (item) {
                return item.status === "Open";
            }).length,

            inProgress: list.filter(function (item) {
                return item.status === "In Progress";
            }).length,

            resolved: list.filter(function (item) {
                return item.status === "Resolved";
            }).length,

            highPriority: list.filter(function (item) {
                return item.priority === "High";
            }).length,

            today: list.filter(function (item) {
                return item.complaintDate === today();
            }).length

        };

    }


    /* =====================================================
       AMENITY OPTIONS
       ===================================================== */

    function renderAmenityOptions(selectedId) {

        return `
            <option value="">Select facility / amenity</option>

            ${
                amenities().map(function (item) {

                    return `
                        <option
                            value="${escape(item.id)}"
                            ${
                                String(item.id) === String(selectedId || "")
                                    ? "selected"
                                    : ""
                            }
                        >
                            ${escape(item.amenity || item.amenityName)}
                            ${
                                item.amenityId
                                    ? ` — ${escape(item.amenityId)}`
                                    : ""
                            }
                        </option>
                    `;

                }).join("")
            }
        `;

    }


    /* =====================================================
       FORM
       ===================================================== */

    function openForm(index) {

        const existing =
            index >= 0
                ? records()[index]
                : null;

        const modal = get("complaints-modal");

        if (!modal) {
            return;
        }

        modal.dataset.index = String(index);

        get("complaint-modal-title").textContent =
            existing
                ? "Edit Complaint"
                : "Add Complaint";

        get("complaint-id").value =
            existing
                ? existing.complaintId || ""
                : nextComplaintId();

        get("complaint-date").value =
            existing
                ? existing.complaintDate || today()
                : today();

        get("complaint-time").value =
            existing
                ? existing.complaintTime || ""
                : nowTime();

        get("complaint-guest").value =
            existing
                ? existing.guestName || ""
                : "";

        get("complaint-contact").value =
            existing
                ? existing.contactNumber || ""
                : "";

        get("complaint-amenity").innerHTML =
            renderAmenityOptions(
                existing
                    ? existing.amenityRecordId
                    : ""
            );

        get("complaint-category").value =
            existing
                ? existing.category || ""
                : "";

        get("complaint-description").value =
            existing
                ? existing.description || ""
                : "";

        get("complaint-priority").value =
            existing
                ? existing.priority || "Medium"
                : "Medium";

        get("complaint-assigned").value =
            existing
                ? existing.assignedTo || ""
                : "";

        get("complaint-status").value =
            existing
                ? existing.status || "Open"
                : "Open";

        get("complaint-resolution").value =
            existing
                ? existing.resolution || ""
                : "";

        get("complaint-resolution-date").value =
            existing
                ? existing.resolutionDate || ""
                : "";

        get("complaint-remarks").value =
            existing
                ? existing.remarks || ""
                : "";

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");

    }


    function closeForm() {

        const modal = get("complaints-modal");

        if (!modal) {
            return;
        }

        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        modal.dataset.index = "-1";

    }


    /* =====================================================
       SAVE
       ===================================================== */

    function saveForm() {

        const modal = get("complaints-modal");

        if (!modal) {
            return;
        }

        const index =
            Number(modal.dataset.index || -1);

        const complaintId =
            get("complaint-id").value.trim();

        const complaintDate =
            get("complaint-date").value;

        const guestName =
            get("complaint-guest").value.trim();

        const description =
            get("complaint-description").value.trim();

        if (!complaintId || !complaintDate || !description) {

            alert(
                "Complaint ID, Date and Complaint Description are required."
            );

            return;

        }


        const duplicate =
            records().some(function (item, itemIndex) {

                return (
                    itemIndex !== index &&
                    String(item.complaintId).toLowerCase() ===
                    complaintId.toLowerCase()
                );

            });

        if (duplicate) {

            alert("Complaint ID already exists.");

            return;

        }


        const selectedAmenity =
            getSelectedAmenity();


        const record = {

            id:
                index >= 0
                    ? records()[index].id
                    : `complaint-${Date.now()}`,

            complaintId,

            complaintDate,

            complaintTime:
                get("complaint-time").value,

            guestName,

            contactNumber:
                get("complaint-contact").value.trim(),

            amenityRecordId:
                selectedAmenity
                    ? selectedAmenity.id
                    : "",

            amenityId:
                selectedAmenity
                    ? selectedAmenity.amenityId || ""
                    : "",

            amenity:
                selectedAmenity
                    ? selectedAmenity.amenity ||
                      selectedAmenity.amenityName ||
                      ""
                    : "",

            zone:
                selectedAmenity
                    ? selectedAmenity.zone || ""
                    : "",

            category:
                get("complaint-category").value,

            description,

            priority:
                get("complaint-priority").value,

            assignedTo:
                get("complaint-assigned").value.trim(),

            status:
                get("complaint-status").value,

            resolution:
                get("complaint-resolution").value.trim(),

            resolutionDate:
                get("complaint-resolution-date").value,

            remarks:
                get("complaint-remarks").value.trim(),

            createdAt:
                index >= 0
                    ? records()[index].createdAt
                    : new Date().toISOString(),

            updatedAt:
                new Date().toISOString()

        };


        if (index >= 0) {

            Data.update(
                COLLECTION,
                index,
                record
            );

        } else {

            Data.add(
                COLLECTION,
                record
            );

        }


        closeForm();
        render();

    }


    /* =====================================================
       DELETE
       ===================================================== */

    function deleteRecord(index) {

        const record = records()[index];

        if (!record) {
            return;
        }

        const confirmed =
            confirm(
                `Delete complaint "${record.complaintId}"?`
            );

        if (!confirmed) {
            return;
        }

        Data.remove(
            COLLECTION,
            index
        );

        render();

    }


    /* =====================================================
       HISTORY
       ===================================================== */

    function toggleHistory(id) {

        expandedHistoryId =
            expandedHistoryId === id
                ? null
                : id;

        renderHistory();

    }


    function renderHistory() {

        const listElement =
            get("complaints-history-list");

        if (!listElement) {
            return;
        }

        const search =
            (get("complaints-history-search")?.value || "")
                .toLowerCase()
                .trim();

        const date =
            get("complaints-history-date")?.value || "";


        const filtered =
            records().filter(function (item) {

                const searchable = [

                    item.complaintId,
                    item.guestName,
                    item.amenity,
                    item.category,
                    item.description,
                    item.priority,
                    item.status,
                    item.assignedTo

                ].join(" ").toLowerCase();


                return (
                    (!search || searchable.includes(search)) &&
                    (!date || item.complaintDate === date)
                );

            });


        if (!filtered.length) {

            listElement.innerHTML = `
                <div class="complaints-history-empty">
                    No complaint records found.
                </div>
            `;

            return;

        }


        listElement.innerHTML =
            filtered.map(function (item) {

                const expanded =
                    expandedHistoryId === item.id;

                return `

                    <div
                        class="complaints-history-item ${
                            expanded ? "expanded" : ""
                        }"
                    >

                        <button
                            type="button"
                            class="complaints-history-row"
                            data-history-id="${escape(item.id)}"
                        >

                            <span class="complaints-history-row-main">

                                <strong>
                                    ${escape(formatDate(item.complaintDate))}
                                </strong>

                                <span>—</span>

                                <span>
                                    ${escape(
                                        item.description ||
                                        "Complaint"
                                    )}
                                </span>

                            </span>

                            <span class="complaints-history-arrow">
                                ↓
                            </span>

                        </button>


                        <div class="complaints-history-details">

                            <div class="complaints-history-detail-grid">

                                <div>
                                    <span>Complaint ID</span>
                                    <strong>${escape(item.complaintId)}</strong>
                                </div>

                                <div>
                                    <span>Time</span>
                                    <strong>${escape(item.complaintTime)}</strong>
                                </div>

                                <div>
                                    <span>Guest / Resident</span>
                                    <strong>${escape(item.guestName)}</strong>
                                </div>

                                <div>
                                    <span>Contact Number</span>
                                    <strong>${escape(item.contactNumber)}</strong>
                                </div>

                                <div>
                                    <span>Facility / Amenity</span>
                                    <strong>${escape(item.amenity)}</strong>
                                </div>

                                <div>
                                    <span>Zone</span>
                                    <strong>${escape(item.zone)}</strong>
                                </div>

                                <div>
                                    <span>Category</span>
                                    <strong>${escape(item.category)}</strong>
                                </div>

                                <div>
                                    <span>Priority</span>
                                    <strong>${escape(item.priority)}</strong>
                                </div>

                                <div>
                                    <span>Assigned To</span>
                                    <strong>${escape(item.assignedTo)}</strong>
                                </div>

                                <div>
                                    <span>Status</span>
                                    <strong>${escape(item.status)}</strong>
                                </div>

                                <div>
                                    <span>Resolution Date</span>
                                    <strong>${escape(item.resolutionDate)}</strong>
                                </div>

                                <div class="complaints-history-detail-wide">
                                    <span>Complaint Description</span>
                                    <strong>${escape(item.description)}</strong>
                                </div>

                                <div class="complaints-history-detail-wide">
                                    <span>Resolution</span>
                                    <strong>${escape(item.resolution)}</strong>
                                </div>

                                <div class="complaints-history-detail-wide">
                                    <span>Remarks</span>
                                    <strong>${escape(item.remarks)}</strong>
                                </div>

                            </div>

                        </div>

                    </div>

                `;

            }).join("");


        listElement
            .querySelectorAll("[data-history-id]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        toggleHistory(
                            button.dataset.historyId
                        );

                    }
                );

            });

    }


    /* =====================================================
       REGISTER
       ===================================================== */

    function renderRegister() {

        const listElement =
            get("complaints-register");

        if (!listElement) {
            return;
        }

        const search =
            (get("complaints-search")?.value || "")
                .toLowerCase()
                .trim();

        const status =
            get("complaints-status-filter")?.value || "";

        const priority =
            get("complaints-priority-filter")?.value || "";


        const filtered =
            records().filter(function (item) {

                const searchable = [

                    item.complaintId,
                    item.guestName,
                    item.amenity,
                    item.category,
                    item.description,
                    item.assignedTo

                ].join(" ").toLowerCase();


                return (
                    (!search || searchable.includes(search)) &&
                    (!status || item.status === status) &&
                    (!priority || item.priority === priority)
                );

            });


        if (!filtered.length) {

            listElement.innerHTML = `
                <div class="complaints-empty">
                    No complaints recorded.
                </div>
            `;

            return;

        }


        listElement.innerHTML =
            filtered.map(function (item) {

                const index =
                    records().findIndex(function (record) {

                        return record.id === item.id;

                    });


                return `

                    <article class="complaint-record">

                        <div class="complaint-record-main">

                            <div class="complaint-record-title-row">

                                <div>

                                    <div class="complaint-record-title">
                                        ${escape(item.description)}
                                    </div>

                                    <div class="complaint-record-id">
                                        ${escape(item.complaintId)}
                                        ·
                                        ${escape(formatDate(item.complaintDate))}
                                    </div>

                                </div>

                                <span class="
                                    complaint-status
                                    complaint-status-${escape(
                                        String(item.status)
                                            .toLowerCase()
                                            .replaceAll(" ", "-")
                                    )}
                                ">
                                    ${escape(item.status)}
                                </span>

                            </div>


                            <div class="complaint-record-grid">

                                <div>
                                    <span>Guest / Resident</span>
                                    <strong>${escape(item.guestName)}</strong>
                                </div>

                                <div>
                                    <span>Facility / Amenity</span>
                                    <strong>${escape(item.amenity)}</strong>
                                </div>

                                <div>
                                    <span>Category</span>
                                    <strong>${escape(item.category)}</strong>
                                </div>

                                <div>
                                    <span>Priority</span>
                                    <strong>${escape(item.priority)}</strong>
                                </div>

                                <div>
                                    <span>Assigned To</span>
                                    <strong>${escape(item.assignedTo)}</strong>
                                </div>

                                <div>
                                    <span>Contact Number</span>
                                    <strong>${escape(item.contactNumber)}</strong>
                                </div>

                            </div>

                        </div>


                        <div class="complaint-record-actions">

                            <button
                                type="button"
                                class="btn"
                                data-edit-index="${index}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="btn btn-danger"
                                data-delete-index="${index}"
                            >
                                Delete
                            </button>

                        </div>

                    </article>

                `;

            }).join("");


        listElement
            .querySelectorAll("[data-edit-index]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        openForm(
                            Number(button.dataset.editIndex)
                        );

                    }
                );

            });


        listElement
            .querySelectorAll("[data-delete-index]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        deleteRecord(
                            Number(button.dataset.deleteIndex)
                        );

                    }
                );

            });

    }


    /* =====================================================
       RENDER
       ===================================================== */

    function render() {

        if (
            FX &&
            FX.activeTab &&
            FX.activeTab !== "issues"
        ) {
            return;
        }


        const container =
            get("tab-issues");

        if (!container) {
            return;
        }


        const summary =
            getSummary();


        container.innerHTML = `

            <div class="complaints-module">

                <div class="complaints-header">

                    <div>

                        <div class="eyebrow">
                            FACILITY EXECUTIVE OS
                        </div>

                        <h2>
                            Complaints Log
                        </h2>

                        <p>
                            Record, assign, track and resolve complaints.
                        </p>

                    </div>


                    <div class="complaints-header-actions">

                        <button
                            type="button"
                            class="btn btn-primary"
                            id="complaints-add"
                        >
                            + Add Complaint
                        </button>

                    </div>

                </div>


                <div class="complaints-summary">

                    <div class="complaints-kpi">
                        <span>Total Complaints</span>
                        <strong>${summary.total}</strong>
                    </div>

                    <div class="complaints-kpi">
                        <span>Open</span>
                        <strong>${summary.open}</strong>
                    </div>

                    <div class="complaints-kpi">
                        <span>In Progress</span>
                        <strong>${summary.inProgress}</strong>
                    </div>

                    <div class="complaints-kpi">
                        <span>Resolved</span>
                        <strong>${summary.resolved}</strong>
                    </div>

                    <div class="complaints-kpi">
                        <span>High Priority</span>
                        <strong>${summary.highPriority}</strong>
                    </div>

                    <div class="complaints-kpi">
                        <span>Today's Complaints</span>
                        <strong>${summary.today}</strong>
                    </div>

                </div>


                <div class="complaints-toolbar">

                    <input
                        type="search"
                        id="complaints-search"
                        placeholder="Search complaints..."
                    >

                    <select id="complaints-status-filter">
                        <option value="">All statuses</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                    </select>

                    <select id="complaints-priority-filter">
                        <option value="">All priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>

                </div>


                <section class="complaints-section">

                    <div class="complaints-section-header">

                        <div>

                            <h3>
                                Complaints Register
                            </h3>

                            <p>
                                Current complaints and their resolution status.
                            </p>

                        </div>

                    </div>


                    <div id="complaints-register"></div>

                </section>


                <section class="complaints-history">

                    <div class="complaints-history-header">

                        <div>

                            <h3>
                                History
                            </h3>

                            <p>
                                Expand a record to view complete details.
                            </p>

                        </div>

                    </div>


                    <div class="complaints-history-toolbar">

                        <input
                            type="search"
                            id="complaints-history-search"
                            placeholder="Search history..."
                        >

                        <input
                            type="date"
                            id="complaints-history-date"
                        >

                    </div>


                    <div class="complaints-history-title">
                        RECORD DATA
                    </div>


                    <div id="complaints-history-list"></div>

                </section>


                <div
                    class="complaints-modal"
                    id="complaints-modal"
                    aria-hidden="true"
                >

                    <div
                        class="complaints-modal-backdrop"
                        data-close-complaints
                    ></div>


                    <div class="complaints-modal-panel">

                        <div class="complaints-modal-header">

                            <h3 id="complaint-modal-title">
                                Add Complaint
                            </h3>

                            <button
                                type="button"
                                class="complaints-modal-close"
                                data-close-complaints
                            >
                                ×
                            </button>

                        </div>


                        <div class="complaints-modal-body">

                            <div class="complaints-form-grid">


                                <div class="complaints-field">

                                    <label for="complaint-id">
                                        Complaint ID
                                    </label>

                                    <input
                                        id="complaint-id"
                                        type="text"
                                    >

                                </div>


                                <div class="complaints-field">

                                    <label for="complaint-date">
                                        Date
                                    </label>

                                    <input
                                        id="complaint-date"
                                        type="date"
                                    >

                                </div>


                                <div class="complaints-field">

                                    <label for="complaint-time">
                                        Time
                                    </label>

                                    <input
                                        id="complaint-time"
                                        type="time"
                                    >

                                </div>


                                <div class="complaints-field">

                                    <label for="complaint-guest">
                                        Guest / Resident Name
                                    </label>

                                    <input
                                        id="complaint-guest"
                                        type="text"
                                    >

                                </div>


                                <div class="complaints-field">

                                    <label for="complaint-contact">
                                        Contact Number
                                    </label>

                                    <input
                                        id="complaint-contact"
                                        type="tel"
                                    >

                                </div>


                                <div class="complaints-field">

                                    <label for="complaint-amenity">
                                        Facility / Amenity
                                    </label>

                                    <select id="complaint-amenity">
                                        ${renderAmenityOptions("")}
                                    </select>

                                </div>


                                <div class="complaints-field">

                                    <label for="complaint-category">
                                        Complaint Category
                                    </label>

                                    <select id="complaint-category">

                                        <option value="">
                                            Select category
                                        </option>

                                        <option value="Cleanliness">
                                            Cleanliness
                                        </option>

                                        <option value="Maintenance">
                                            Maintenance
                                        </option>

                                        <option value="Staff Behaviour">
                                            Staff Behaviour
                                        </option>

                                        <option value="Safety">
                                            Safety
                                        </option>

                                        <option value="Noise">
                                            Noise
                                        </option>

                                        <option value="Service">
                                            Service
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>


                                <div class="complaints-field">

                                    <label for="complaint-priority">
                                        Priority
                                    </label>

                                    <select id="complaint-priority">

                                        <option value="Low">Low</option>
                                        <option value="Medium" selected>
                                            Medium
                                        </option>
                                        <option value="High">High</option>
                                        <option value="Critical">
                                            Critical
                                        </option>

                                    </select>

                                </div>


                                <div class="complaints-field">

                                    <label for="complaint-assigned">
                                        Assigned To
                                    </label>

                                    <input
                                        id="complaint-assigned"
                                        type="text"
                                    >

                                </div>


                                <div class="complaints-field">

                                    <label for="complaint-status">
                                        Status
                                    </label>

                                    <select id="complaint-status">

                                        <option value="Open">
                                            Open
                                        </option>

                                        <option value="In Progress">
                                            In Progress
                                        </option>

                                        <option value="Resolved">
                                            Resolved
                                        </option>

                                        <option value="Closed">
                                            Closed
                                        </option>

                                    </select>

                                </div>


                                <div class="complaints-field">

                                    <label for="complaint-resolution-date">
                                        Resolution Date
                                    </label>

                                    <input
                                        id="complaint-resolution-date"
                                        type="date"
                                    >

                                </div>


                                <div class="complaints-field complaints-field-wide">

                                    <label for="complaint-description">
                                        Complaint Description
                                    </label>

                                    <textarea
                                        id="complaint-description"
                                        rows="4"
                                    ></textarea>

                                </div>


                                <div class="complaints-field complaints-field-wide">

                                    <label for="complaint-resolution">
                                        Resolution
                                    </label>

                                    <textarea
                                        id="complaint-resolution"
                                        rows="3"
                                    ></textarea>

                                </div>


                                <div class="complaints-field complaints-field-wide">

                                    <label for="complaint-remarks">
                                        Remarks
                                    </label>

                                    <textarea
                                        id="complaint-remarks"
                                        rows="3"
                                    ></textarea>

                                </div>


                            </div>

                        </div>


                        <div class="complaints-modal-footer">

                            <button
                                type="button"
                                class="btn"
                                data-close-complaints
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                class="btn btn-primary"
                                id="complaints-save"
                            >
                                Save Complaint
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `;


        bindEvents();
        renderRegister();
        renderHistory();

    }


    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {

        get("complaints-add")?.addEventListener(
            "click",
            function () {
                openForm(-1);
            }
        );


        get("complaints-save")?.addEventListener(
            "click",
            saveForm
        );


        document
            .querySelectorAll("[data-close-complaints]")
            .forEach(function (element) {

                element.addEventListener(
                    "click",
                    closeForm
                );

            });


        get("complaints-search")?.addEventListener(
            "input",
            renderRegister
        );


        get("complaints-status-filter")?.addEventListener(
            "change",
            renderRegister
        );


        get("complaints-priority-filter")?.addEventListener(
            "change",
            renderRegister
        );


        get("complaints-history-search")?.addEventListener(
            "input",
            renderHistory
        );


        get("complaints-history-date")?.addEventListener(
            "change",
            renderHistory
        );

    }


    /* =====================================================
       LIFECYCLE
       ===================================================== */

    function init() {

        if (initialized) {
            return;
        }

        initialized = true;

    }


    function destroy() {

        expandedHistoryId = null;

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.FXComplaints = {

        getRecords: records,
        getSummary,
        render,
        openForm,
        closeForm

    };


    /* =====================================================
       MODULE REGISTRATION
       ===================================================== */

    registerFXModule(
        "issues",
        {
            init,
            render,
            destroy
        }
    );

})();