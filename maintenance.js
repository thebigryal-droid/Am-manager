/* =========================================================
   FACILITY EXECUTIVE OS
   MAINTENANCE MODULE
   ========================================================= */

(function () {

    "use strict";

    const FX = window.FX;
    const Data = window.FXData;

    const COLLECTION = "maintenance";

    let initialized = false;
    let handlersBound = false;


    /* =====================================================
       HELPERS
       ===================================================== */

    function getRecords() {
        return Data.get(COLLECTION);
    }


    function getAmenities() {
        return Data.get("amenities");
    }


    function escape(value) {
        return window.escapeHtml
            ? window.escapeHtml(value)
            : String(value == null ? "" : value);
    }


    function now() {
        return new Date().toISOString();
    }


    function today() {

        const d = new Date();

        return [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0"),
            String(d.getDate()).padStart(2, "0")
        ].join("-");

    }


    function formatDate(value) {

        if (!value) return "—";

        const parts = String(value).split("-");

        if (parts.length !== 3) {
            return escape(value);
        }

        return `${parts[2]}-${parts[1]}-${parts[0]}`;

    }


    function generateId() {
        return "MNT-" + Date.now();
    }


    function getAmenityById(id) {

        return getAmenities().find(
            amenity =>
                String(amenity.id) === String(id)
        );

    }


    function getSelectedAmenity() {

        const select =
            document.getElementById("maintenance-amenity");

        if (!select || !select.value) {
            return null;
        }

        return getAmenityById(select.value);

    }


    /* =====================================================
       SUMMARY
       ===================================================== */

    function getSummary(records) {

        return {

            total:
                records.length,

            open:
                records.filter(
                    record =>
                        record.status === "Open"
                ).length,

            progress:
                records.filter(
                    record =>
                        record.status === "In Progress"
                ).length,

            completed:
                records.filter(
                    record =>
                        record.status === "Completed"
                ).length,

            high:
                records.filter(
                    record =>
                        record.priority === "High"
                        ||
                        record.priority === "Critical"
                ).length,

            attention:
                records.filter(
                    record =>
                        record.status === "Open"
                        ||
                        record.status === "In Progress"
                ).length

        };

    }


    /* =====================================================
       RENDER
       ===================================================== */

    function render() {

        const root =
            document.getElementById("tab-maintenance");

        if (!root) return;


        const records = getRecords();


        root.innerHTML = `

            <div class="maintenance-module">


                <div class="maintenance-header">

                    <div>

                        <div class="maintenance-eyebrow">
                            OPERATIONS
                        </div>

                        <h2>Maintenance</h2>

                        <p>
                            Track preventive and corrective
                            maintenance, work status, priorities,
                            responsible personnel and costs.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="btn btn-primary"
                        data-maintenance-action="add"
                    >
                        + Add Maintenance
                    </button>

                </div>


                ${renderSummary(records)}


                ${renderToolbar()}


                <div
                    id="maintenance-register"
                    class="maintenance-register"
                >
                    ${renderRegister(records)}
                </div>


                ${renderHistory(records)}


                ${renderModal()}


            </div>

        `;


        bindEvents();

    }


    /* =====================================================
       SUMMARY
       ===================================================== */

    function renderSummary(records) {

        const summary =
            getSummary(records);


        return `

            <div class="maintenance-summary">


                <div class="maintenance-kpi">
                    <span>Total Records</span>
                    <strong>${summary.total}</strong>
                </div>


                <div class="maintenance-kpi">
                    <span>Open</span>
                    <strong>${summary.open}</strong>
                </div>


                <div class="maintenance-kpi">
                    <span>In Progress</span>
                    <strong>${summary.progress}</strong>
                </div>


                <div class="maintenance-kpi">
                    <span>Completed</span>
                    <strong>${summary.completed}</strong>
                </div>


                <div class="maintenance-kpi">
                    <span>High Priority</span>
                    <strong>${summary.high}</strong>
                </div>


                <div class="maintenance-kpi">
                    <span>Attention Required</span>
                    <strong>${summary.attention}</strong>
                </div>


            </div>

        `;

    }


    /* =====================================================
       TOOLBAR
       ===================================================== */

    function renderToolbar() {

        return `

            <div class="maintenance-toolbar">


                <div class="maintenance-search">

                    <input
                        type="search"
                        id="maintenance-search"
                        placeholder="Search asset, issue, ID or responsible person..."
                    >

                </div>


                <div class="maintenance-filters">


                    <input
                        type="date"
                        id="maintenance-date-filter"
                    >


                    <select id="maintenance-priority-filter">

                        <option value="">
                            All Priorities
                        </option>

                        <option value="Low">
                            Low
                        </option>

                        <option value="Medium">
                            Medium
                        </option>

                        <option value="High">
                            High
                        </option>

                        <option value="Critical">
                            Critical
                        </option>

                    </select>


                    <select id="maintenance-status-filter">

                        <option value="">
                            All Status
                        </option>

                        <option value="Open">
                            Open
                        </option>

                        <option value="In Progress">
                            In Progress
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>

                    </select>


                </div>


            </div>

        `;

    }


    /* =====================================================
       FILTERING
       ===================================================== */

    function getFilteredRecords() {

        const search =
            document.getElementById("maintenance-search")
                ?.value
                .trim()
                .toLowerCase() || "";


        const date =
            document.getElementById("maintenance-date-filter")
                ?.value || "";


        const priority =
            document.getElementById("maintenance-priority-filter")
                ?.value || "";


        const status =
            document.getElementById("maintenance-status-filter")
                ?.value || "";


        return getRecords().filter(record => {


            const searchMatch =
                !search
                ||
                String(record.amenity || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.amenityId || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.issue || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.maintenanceId || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.responsible || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.zone || "")
                    .toLowerCase()
                    .includes(search);


            return (
                searchMatch
                &&
                (!date || record.maintenanceDate === date)
                &&
                (!priority || record.priority === priority)
                &&
                (!status || record.status === status)
            );

        });

    }


    function renderRegister(records) {

        const filtered =
            filterRecords(records);


        if (!filtered.length) {

            return `

                <div class="maintenance-empty">

                    <strong>
                        No maintenance records found
                    </strong>

                    <span>
                        Add a maintenance record or
                        change the current filters.
                    </span>

                </div>

            `;

        }


        return filtered.map(record => {

            const index =
                records.indexOf(record);

            return renderRecord(
                record,
                index
            );

        }).join("");

    }


    function filterRecords(records) {

        const search =
            document.getElementById("maintenance-search")
                ?.value
                .trim()
                .toLowerCase() || "";


        const date =
            document.getElementById("maintenance-date-filter")
                ?.value || "";


        const priority =
            document.getElementById("maintenance-priority-filter")
                ?.value || "";


        const status =
            document.getElementById("maintenance-status-filter")
                ?.value || "";


        return records.filter(record => {


            const searchMatch =
                !search
                ||
                String(record.amenity || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.amenityId || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.issue || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.maintenanceId || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.responsible || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.zone || "")
                    .toLowerCase()
                    .includes(search);


            return (
                searchMatch
                &&
                (!date || record.maintenanceDate === date)
                &&
                (!priority || record.priority === priority)
                &&
                (!status || record.status === status)
            );

        });

    }


    /* =====================================================
       REGISTER CARD
       ===================================================== */

    function renderRecord(record, index) {

        const priorityClass =
            String(record.priority || "")
                .toLowerCase();


        const statusClass =
            String(record.status || "")
                .toLowerCase()
                .replace(/\s+/g, "-");


        return `

            <div class="maintenance-record">


                <div class="maintenance-record-main">


                    <div class="maintenance-record-title">


                        <div>

                            <strong>
                                ${escape(
                                    record.amenity ||
                                    "Unnamed Asset"
                                )}
                            </strong>

                            <span class="maintenance-record-id">

                                ${escape(
                                    record.maintenanceId ||
                                    "—"
                                )}

                                ${
                                    record.amenityId
                                    ? ` · ${escape(record.amenityId)}`
                                    : ""
                                }

                            </span>

                        </div>


                        <div class="maintenance-badges">


                            <span
                                class="
                                    maintenance-priority
                                    maintenance-priority-${priorityClass}
                                "
                            >
                                ${escape(
                                    record.priority || "—"
                                )}
                            </span>


                            <span
                                class="
                                    maintenance-status
                                    maintenance-status-${statusClass}
                                "
                            >
                                ${escape(
                                    record.status || "—"
                                )}
                            </span>


                        </div>


                    </div>


                    <div class="maintenance-record-description">

                        <small>
                            Work / Issue
                        </small>

                        <span>
                            ${escape(
                                record.issue ||
                                "No description"
                            )}
                        </span>

                    </div>


                    <div class="maintenance-record-grid">


                        <div>

                            <small>Date</small>

                            <span>
                                ${formatDate(
                                    record.maintenanceDate
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Zone</small>

                            <span>
                                ${escape(
                                    record.zone || "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Maintenance Type</small>

                            <span>
                                ${escape(
                                    record.maintenanceType ||
                                    "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Responsible</small>

                            <span>
                                ${escape(
                                    record.responsible ||
                                    "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Start Time</small>

                            <span>
                                ${escape(
                                    record.startTime ||
                                    "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>End Time</small>

                            <span>
                                ${escape(
                                    record.endTime ||
                                    "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Cost</small>

                            <span>
                                ${
                                    record.cost !== ""
                                    &&
                                    record.cost != null
                                    ? escape(record.cost)
                                    : "—"
                                }
                            </span>

                        </div>


                        <div>

                            <small>Materials</small>

                            <span>
                                ${escape(
                                    record.materials ||
                                    "—"
                                )}
                            </span>

                        </div>


                    </div>


                    ${
                        record.remarks
                        ?
                        `
                            <div class="maintenance-record-notes">

                                <strong>
                                    Remarks:
                                </strong>

                                ${escape(
                                    record.remarks
                                )}

                            </div>
                        `
                        :
                        ""
                    }


                </div>


                <div class="maintenance-record-actions">


                    <button
                        type="button"
                        class="btn"
                        data-maintenance-edit="${index}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="btn btn-danger"
                        data-maintenance-delete="${index}"
                    >
                        Delete
                    </button>


                </div>


            </div>

        `;

    }


    /* =====================================================
       HISTORY
       ===================================================== */

    function renderHistory(records) {

        return `

            <section class="maintenance-history">


                <div class="maintenance-history-header">

                    <div>

                        <div class="maintenance-eyebrow">
                            HISTORY
                        </div>

                        <h3>Record Data</h3>

                    </div>

                </div>


                <div class="maintenance-history-toolbar">


                    <div class="maintenance-history-search">

                        <input
                            type="search"
                            id="maintenance-history-search"
                            placeholder="Search history..."
                        >

                    </div>


                    <input
                        type="date"
                        id="maintenance-history-date"
                        aria-label="History date"
                    >


                </div>


                <div
                    id="maintenance-history-list"
                    class="maintenance-history-list"
                >

                    ${renderHistoryList(records)}

                </div>


            </section>

        `;

    }


    function renderHistoryList(records) {

        const search =
            document.getElementById(
                "maintenance-history-search"
            )
            ?.value
            .trim()
            .toLowerCase() || "";


        const date =
            document.getElementById(
                "maintenance-history-date"
            )
            ?.value || "";


        const filtered =
            records.filter(record => {


                const searchMatch =
                    !search
                    ||
                    String(record.amenity || "")
                        .toLowerCase()
                        .includes(search)
                    ||
                    String(record.amenityId || "")
                        .toLowerCase()
                        .includes(search)
                    ||
                    String(record.maintenanceId || "")
                        .toLowerCase()
                        .includes(search)
                    ||
                    String(record.issue || "")
                        .toLowerCase()
                        .includes(search)
                    ||
                    String(record.responsible || "")
                        .toLowerCase()
                        .includes(search)
                    ||
                    String(record.zone || "")
                        .toLowerCase()
                        .includes(search);


                return (
                    searchMatch
                    &&
                    (!date ||
                        record.maintenanceDate === date)
                );

            });


        if (!filtered.length) {

            return `

                <div class="maintenance-history-empty">

                    No history records found.

                </div>

            `;

        }


        return filtered.map(
            (record, index) => `

                <div
                    class="maintenance-history-item"
                    data-maintenance-history-index="${index}"
                >


                    <button
                        type="button"
                        class="maintenance-history-row"
                        data-maintenance-history-toggle
                    >


                        <span class="maintenance-history-row-main">

                            <strong>
                                ${formatDate(
                                    record.maintenanceDate
                                )}
                            </strong>

                            <span>
                                ${escape(
                                    record.amenity ||
                                    "Asset"
                                )}
                            </span>

                        </span>


                        <span class="maintenance-history-arrow">
                            ↓
                        </span>


                    </button>


                    <div class="maintenance-history-details">

                        ${renderHistoryDetails(record)}

                    </div>


                </div>

            `
        ).join("");

    }


    function renderHistoryDetails(record) {

        return `

            <div class="maintenance-history-detail-grid">


                <div>
                    <small>Maintenance ID</small>
                    <span>
                        ${escape(
                            record.maintenanceId || "—"
                        )}
                    </span>
                </div>


                <div>
                    <small>Date</small>
                    <span>
                        ${formatDate(
                            record.maintenanceDate
                        )}
                    </span>
                </div>


                <div>
                    <small>Amenity ID</small>
                    <span>
                        ${escape(
                            record.amenityId || "—"
                        )}
                    </span>
                </div>


                <div>
                    <small>Amenity / Asset</small>
                    <span>
                        ${escape(
                            record.amenity || "—"
                        )}
                    </span>
                </div>


                <div>
                    <small>Zone</small>
                    <span>
                        ${escape(
                            record.zone || "—"
                        )}
                    </span>
                </div>


                <div>
                    <small>Responsible</small>
                    <span>
                        ${escape(
                            record.responsible || "—"
                        )}
                    </span>
                </div>


                <div>
                    <small>Maintenance Type</small>
                    <span>
                        ${escape(
                            record.maintenanceType || "—"
                        )}
                    </span>
                </div>


                <div>
                    <small>Priority</small>
                    <span>
                        ${escape(
                            record.priority || "—"
                        )}
                    </span>
                </div>


                <div class="maintenance-history-detail-wide">

                    <small>
                        Issue / Work Description
                    </small>

                    <span>
                        ${escape(
                            record.issue || "—"
                        )}
                    </span>

                </div>


                <div>
                    <small>Start Time</small>
                    <span>
                        ${escape(
                            record.startTime || "—"
                        )}
                    </span>
                </div>


                <div>
                    <small>End Time</small>
                    <span>
                        ${escape(
                            record.endTime || "—"
                        )}
                    </span>
                </div>


                <div>
                    <small>Status</small>
                    <span>
                        ${escape(
                            record.status || "—"
                        )}
                    </span>
                </div>


                <div>
                    <small>Cost</small>
                    <span>
                        ${
                            record.cost !== ""
                            &&
                            record.cost != null
                            ? escape(record.cost)
                            : "—"
                        }
                    </span>
                </div>


                <div class="maintenance-history-detail-wide">

                    <small>
                        Parts / Materials Used
                    </small>

                    <span>
                        ${escape(
                            record.materials || "—"
                        )}
                    </span>

                </div>


                <div class="maintenance-history-detail-wide">

                    <small>
                        Remarks
                    </small>

                    <span>
                        ${escape(
                            record.remarks || "—"
                        )}
                    </span>

                </div>


            </div>

        `;

    }


    /* =====================================================
       MODAL
       ===================================================== */

    function renderModal() {

        return `

            <div
                class="maintenance-modal"
                id="maintenance-modal"
                aria-hidden="true"
            >


                <div
                    class="maintenance-modal-backdrop"
                    data-maintenance-close
                ></div>


                <div class="maintenance-modal-panel">


                    <div class="maintenance-modal-header">

                        <div>

                            <div class="maintenance-eyebrow">
                                MAINTENANCE RECORD
                            </div>

                            <h3 id="maintenance-modal-title">
                                Add Maintenance
                            </h3>

                        </div>


                        <button
                            type="button"
                            class="maintenance-modal-close"
                            data-maintenance-close
                        >
                            &times;
                        </button>

                    </div>


                    <form id="maintenance-form">


                        <div class="maintenance-form-grid">


                            <div class="maintenance-field">

                                <label for="maintenance-date">
                                    Date
                                </label>

                                <input
                                    type="date"
                                    id="maintenance-date"
                                    required
                                >

                            </div>


                            <div class="maintenance-field">

                                <label for="maintenance-amenity">
                                    Amenity / Asset
                                </label>

                                <select
                                    id="maintenance-amenity"
                                    required
                                >

                                    <option value="">
                                        Select Amenity / Asset
                                    </option>

                                    ${renderAmenityOptions()}

                                </select>

                            </div>


                            <div class="maintenance-field">

                                <label for="maintenance-id">
                                    Maintenance ID
                                </label>

                                <input
                                    type="text"
                                    id="maintenance-id"
                                    readonly
                                    placeholder="Auto generated"
                                >

                            </div>


                            <div class="maintenance-field">

                                <label for="maintenance-amenity-id">
                                    Amenity ID
                                </label>

                                <input
                                    type="text"
                                    id="maintenance-amenity-id"
                                    readonly
                                >

                            </div>


                            <div class="maintenance-field">

                                <label for="maintenance-zone">
                                    Zone
                                </label>

                                <input
                                    type="text"
                                    id="maintenance-zone"
                                    readonly
                                >

                            </div>


                            <div class="maintenance-field">

                                <label for="maintenance-responsible">
                                    Responsible Person
                                </label>

                                <input
                                    type="text"
                                    id="maintenance-responsible"
                                    readonly
                                >

                            </div>


                            <div class="maintenance-field">

                                <label for="maintenance-type">
                                    Maintenance Type
                                </label>

                                <select
                                    id="maintenance-type"
                                    required
                                >

                                    <option value="Corrective">
                                        Corrective
                                    </option>

                                    <option value="Preventive">
                                        Preventive
                                    </option>

                                    <option value="Emergency">
                                        Emergency
                                    </option>

                                    <option value="Inspection">
                                        Inspection
                                    </option>

                                </select>

                            </div>


                            <div class="maintenance-field">

                                <label for="maintenance-priority">
                                    Priority
                                </label>

                                <select
                                    id="maintenance-priority"
                                    required
                                >

                                    <option value="Low">
                                        Low
                                    </option>

                                    <option value="Medium">
                                        Medium
                                    </option>

                                    <option value="High">
                                        High
                                    </option>

                                    <option value="Critical">
                                        Critical
                                    </option>

                                </select>

                            </div>


                            <div class="maintenance-field maintenance-field-wide">

                                <label for="maintenance-issue">
                                    Issue / Work Description
                                </label>

                                <textarea
                                    id="maintenance-issue"
                                    rows="4"
                                    required
                                    placeholder="Describe the issue or maintenance work..."
                                ></textarea>

                            </div>


                            <div class="maintenance-field">

                                <label for="maintenance-start">
                                    Start Time
                                </label>

                                <input
                                    type="time"
                                    id="maintenance-start"
                                >

                            </div>


                            <div class="maintenance-field">

                                <label for="maintenance-end">
                                    End Time
                                </label>

                                <input
                                    type="time"
                                    id="maintenance-end"
                                >

                            </div>


                            <div class="maintenance-field">

                                <label for="maintenance-status">
                                    Status
                                </label>

                                <select
                                    id="maintenance-status"
                                    required
                                >

                                    <option value="Open">
                                        Open
                                    </option>

                                    <option value="In Progress">
                                        In Progress
                                    </option>

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="Cancelled">
                                        Cancelled
                                    </option>

                                </select>

                            </div>


                            <div class="maintenance-field">

                                <label for="maintenance-cost">
                                    Cost
                                </label>

                                <input
                                    type="number"
                                    id="maintenance-cost"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                >

                            </div>


                            <div class="maintenance-field maintenance-field-wide">

                                <label for="maintenance-materials">
                                    Parts / Materials Used
                                </label>

                                <textarea
                                    id="maintenance-materials"
                                    rows="3"
                                    placeholder="Parts, spares or materials used..."
                                ></textarea>

                            </div>


                            <div class="maintenance-field maintenance-field-wide">

                                <label for="maintenance-remarks">
                                    Remarks
                                </label>

                                <textarea
                                    id="maintenance-remarks"
                                    rows="3"
                                    placeholder="Additional remarks..."
                                ></textarea>

                            </div>


                        </div>


                        <div class="maintenance-modal-footer">


                            <button
                                type="button"
                                class="btn"
                                data-maintenance-close
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                class="btn btn-primary"
                            >
                                Save Maintenance
                            </button>


                        </div>


                    </form>


                </div>


            </div>

        `;

    }


    function renderAmenityOptions() {

        return getAmenities()
            .map(
                amenity => `

                    <option
                        value="${escape(amenity.id)}"
                    >
                        ${escape(
                            amenity.amenity ||
                            "Unnamed Amenity"
                        )}
                        ${
                            amenity.amenityId
                            ? ` — ${escape(
                                amenity.amenityId
                            )}`
                            : ""
                        }
                    </option>

                `
            )
            .join("");

    }


    /* =====================================================
       AMENITY AUTO-FILL
       ===================================================== */

    function populateAmenityFields(id) {

        const amenity =
            getAmenityById(id);


        const fields = {

            id:
                document.getElementById(
                    "maintenance-amenity-id"
                ),

            zone:
                document.getElementById(
                    "maintenance-zone"
                ),

            responsible:
                document.getElementById(
                    "maintenance-responsible"
                )

        };


        if (!amenity) {

            Object.values(fields).forEach(
                field => {

                    if (field) {
                        field.value = "";
                    }

                }
            );

            return;

        }


        fields.id.value =
            amenity.amenityId || "";

        fields.zone.value =
            amenity.zone || "";

        fields.responsible.value =
            amenity.responsible || "";

    }


    /* =====================================================
       OPEN FORM
       ===================================================== */

    function openForm(index = -1) {

        const modal =
            document.getElementById(
                "maintenance-modal"
            );

        const form =
            document.getElementById(
                "maintenance-form"
            );

        if (!modal || !form) return;


        form.reset();


        modal.dataset.index =
            String(index);


        document.getElementById(
            "maintenance-date"
        ).value = today();


        document.getElementById(
            "maintenance-priority"
        ).value = "Medium";


        document.getElementById(
            "maintenance-status"
        ).value = "Open";


        document.getElementById(
            "maintenance-type"
        ).value = "Corrective";


        if (index >= 0) {

            const record =
                getRecords()[index];

            if (!record) return;


            document.getElementById(
                "maintenance-modal-title"
            ).textContent =
                "Edit Maintenance";


            document.getElementById(
                "maintenance-id"
            ).value =
                record.maintenanceId || "";


            document.getElementById(
                "maintenance-date"
            ).value =
                record.maintenanceDate || today();


            document.getElementById(
                "maintenance-amenity"
            ).value =
                record.amenityRecordId || "";


            populateAmenityFields(
                record.amenityRecordId
            );


            document.getElementById(
                "maintenance-type"
            ).value =
                record.maintenanceType ||
                "Corrective";


            document.getElementById(
                "maintenance-priority"
            ).value =
                record.priority ||
                "Medium";


            document.getElementById(
                "maintenance-issue"
            ).value =
                record.issue || "";


            document.getElementById(
                "maintenance-start"
            ).value =
                record.startTime || "";


            document.getElementById(
                "maintenance-end"
            ).value =
                record.endTime || "";


            document.getElementById(
                "maintenance-status"
            ).value =
                record.status || "Open";


            document.getElementById(
                "maintenance-cost"
            ).value =
                record.cost ?? "";


            document.getElementById(
                "maintenance-materials"
            ).value =
                record.materials || "";


            document.getElementById(
                "maintenance-remarks"
            ).value =
                record.remarks || "";

        } else {

            document.getElementById(
                "maintenance-modal-title"
            ).textContent =
                "Add Maintenance";


            document.getElementById(
                "maintenance-id"
            ).value =
                generateId();

        }


        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /* =====================================================
       CLOSE
       ===================================================== */

    function closeForm() {

        const modal =
            document.getElementById(
                "maintenance-modal"
            );

        if (!modal) return;


        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        modal.dataset.index =
            "-1";

    }


    /* =====================================================
       SAVE
       ===================================================== */

    function saveForm(event) {

        if (event) {
            event.preventDefault();
        }


        const modal =
            document.getElementById(
                "maintenance-modal"
            );

        const form =
            document.getElementById(
                "maintenance-form"
            );

        if (!modal || !form) return;


        if (!form.reportValidity()) {
            return;
        }


        const index =
            Number(
                modal.dataset.index || -1
            );


        const amenity =
            getSelectedAmenity();


        if (!amenity) {

            alert(
                "Please select a valid Amenity / Asset."
            );

            return;

        }


        const existing =
            index >= 0
                ? getRecords()[index]
                : null;


        const record = {

            id:
                existing?.id ||
                generateId(),

            maintenanceId:
                existing?.maintenanceId ||
                document.getElementById(
                    "maintenance-id"
                ).value ||
                generateId(),

            maintenanceDate:
                document.getElementById(
                    "maintenance-date"
                ).value,

            amenityRecordId:
                amenity.id,

            amenityId:
                amenity.amenityId || "",

            amenity:
                amenity.amenity || "",

            zone:
                amenity.zone || "",

            responsible:
                amenity.responsible || "",

            maintenanceType:
                document.getElementById(
                    "maintenance-type"
                ).value,

            priority:
                document.getElementById(
                    "maintenance-priority"
                ).value,

            issue:
                document.getElementById(
                    "maintenance-issue"
                ).value.trim(),

            startTime:
                document.getElementById(
                    "maintenance-start"
                ).value || "",

            endTime:
                document.getElementById(
                    "maintenance-end"
                ).value || "",

            status:
                document.getElementById(
                    "maintenance-status"
                ).value,

            materials:
                document.getElementById(
                    "maintenance-materials"
                ).value.trim(),

            cost:
                document.getElementById(
                    "maintenance-cost"
                ).value || "",

            remarks:
                document.getElementById(
                    "maintenance-remarks"
                ).value.trim(),

            createdAt:
                existing?.createdAt ||
                now(),

            updatedAt:
                now()

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

        const record =
            getRecords()[index];

        if (!record) return;


        const confirmed =
            confirm(
                `Delete maintenance record for ${record.amenity || "this asset"}?`
            );


        if (!confirmed) return;


        Data.remove(
            COLLECTION,
            index
        );


        render();

    }


    /* =====================================================
       REFRESH
       ===================================================== */

    function refreshRegister() {

        const register =
            document.getElementById(
                "maintenance-register"
            );

        if (!register) return;


        register.innerHTML =
            renderRegister(
                getRecords()
            );

    }


    function refreshHistory() {

        const list =
            document.getElementById(
                "maintenance-history-list"
            );

        if (!list) return;


        list.innerHTML =
            renderHistoryList(
                getRecords()
            );

    }


    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {

        if (handlersBound) return;

        handlersBound = true;


        document.addEventListener(
            "click",
            function (event) {


                const addButton =
                    event.target.closest(
                        "[data-maintenance-action='add']"
                    );


                if (addButton) {

                    openForm(-1);

                    return;

                }


                const editButton =
                    event.target.closest(
                        "[data-maintenance-edit]"
                    );


                if (editButton) {

                    openForm(
                        Number(
                            editButton.dataset.maintenanceEdit
                        )
                    );

                    return;

                }


                const deleteButton =
                    event.target.closest(
                        "[data-maintenance-delete]"
                    );


                if (deleteButton) {

                    deleteRecord(
                        Number(
                            deleteButton.dataset.maintenanceDelete
                        )
                    );

                    return;

                }


                const closeButton =
                    event.target.closest(
                        "[data-maintenance-close]"
                    );


                if (closeButton) {

                    closeForm();

                    return;

                }


                const historyToggle =
                    event.target.closest(
                        "[data-maintenance-history-toggle]"
                    );


                if (historyToggle) {

                    const item =
                        historyToggle.closest(
                            ".maintenance-history-item"
                        );


                    if (!item) return;


                    item.classList.toggle(
                        "expanded"
                    );

                }

            }
        );


        document.addEventListener(
            "submit",
            function (event) {

                if (
                    event.target &&
                    event.target.id ===
                        "maintenance-form"
                ) {

                    saveForm(event);

                }

            }
        );


        document.addEventListener(
            "change",
            function (event) {


                if (
                    event.target &&
                    event.target.id ===
                        "maintenance-amenity"
                ) {

                    populateAmenityFields(
                        event.target.value
                    );

                }


                if (
                    event.target &&
                    (
                        event.target.id ===
                            "maintenance-date-filter"
                        ||
                        event.target.id ===
                            "maintenance-priority-filter"
                        ||
                        event.target.id ===
                            "maintenance-status-filter"
                    )
                ) {

                    refreshRegister();

                }


                if (
                    event.target &&
                    event.target.id ===
                        "maintenance-history-date"
                ) {

                    refreshHistory();

                }

            }
        );


        document.addEventListener(
            "input",
            function (event) {


                if (
                    event.target &&
                    event.target.id ===
                        "maintenance-search"
                ) {

                    refreshRegister();

                }


                if (
                    event.target &&
                    event.target.id ===
                        "maintenance-history-search"
                ) {

                    refreshHistory();

                }

            }
        );

    }


    /* =====================================================
       LIFECYCLE
       ===================================================== */

    function init() {

        if (initialized) return;

        initialized = true;

        bindEvents();

    }


    function destroy() {

        initialized = false;

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.FXMaintenance = {

        getRecords,

        getAmenities,

        openForm,

        closeForm,

        saveForm,

        deleteRecord,

        render

    };


    /* =====================================================
       MODULE REGISTRATION
       ===================================================== */

    registerFXModule(
        "maintenance",
        {
            init,
            render,
            destroy
        }
    );


})();