/* =========================================================
   FACILITY EXECUTIVE OS
   POOL LOGS MODULE
   ========================================================= */

(function () {

    "use strict";


    const FX = window.FX;
    const Data = window.FXData;

    const COLLECTION = "pool_logs";


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


    function getAmenityByRecordId(id) {

        return getAmenities().find(
            amenity =>
                String(amenity.id) === String(id)
        );

    }


    function getSelectedAmenity() {

        const value =
            document.getElementById("pool-amenity")?.value;

        if (!value) return null;

        return getAmenityByRecordId(value);

    }


    function generateId() {

        return "POOL-" + Date.now();

    }


    /* =====================================================
       SUMMARY
       ===================================================== */

    function getSummary(records) {

        return {

            total:
                records.length,

            today:
                records.filter(
                    record =>
                        record.logDate === today()
                ).length,

            pools:
                new Set(
                    records
                        .map(record => record.amenityRecordId)
                        .filter(Boolean)
                ).size,

            cleaning:
                records.filter(
                    record =>
                        record.cleaningStatus === "Completed"
                ).length,

            attention:
                records.filter(
                    record =>
                        record.poolCondition === "Attention Required"
                        ||
                        record.equipmentStatus === "Attention Required"
                ).length

        };

    }


    /* =====================================================
       RENDER
       ===================================================== */

    function render() {

        const root =
            document.getElementById("tab-pool");

        if (!root) return;


        const records = getRecords();


        root.innerHTML = `

            <div class="pool-module">


                <div class="pool-header">

                    <div>

                        <div class="pool-eyebrow">
                            OPERATIONS
                        </div>

                        <h2>Pool Logs</h2>

                        <p>
                            Record daily pool conditions,
                            water readings, cleaning and
                            equipment status.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="btn btn-primary"
                        data-pool-action="add"
                    >
                        + Add Pool Log
                    </button>

                </div>


                ${renderSummary(records)}


                ${renderToolbar()}


                <div
                    id="pool-register"
                    class="pool-register"
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

            <div class="pool-summary">


                <div class="pool-kpi">

                    <span>Total Logs</span>

                    <strong>
                        ${summary.total}
                    </strong>

                </div>


                <div class="pool-kpi">

                    <span>Today's Logs</span>

                    <strong>
                        ${summary.today}
                    </strong>

                </div>


                <div class="pool-kpi">

                    <span>Pools Checked</span>

                    <strong>
                        ${summary.pools}
                    </strong>

                </div>


                <div class="pool-kpi">

                    <span>Cleaning Completed</span>

                    <strong>
                        ${summary.cleaning}
                    </strong>

                </div>


                <div class="pool-kpi">

                    <span>Attention Required</span>

                    <strong>
                        ${summary.attention}
                    </strong>

                </div>


            </div>

        `;

    }


    /* =====================================================
       REGISTER TOOLBAR
       ===================================================== */

    function renderToolbar() {

        return `

            <div class="pool-toolbar">


                <div class="pool-search">

                    <input
                        type="search"
                        id="pool-search"
                        placeholder="Search pool, amenity ID, zone or responsible person..."
                    >

                </div>


                <div class="pool-filters">

                    <input
                        type="date"
                        id="pool-date-filter"
                    >


                    <select id="pool-condition-filter">

                        <option value="">
                            All Conditions
                        </option>

                        <option value="Good">
                            Good
                        </option>

                        <option value="Attention Required">
                            Attention Required
                        </option>

                        <option value="Closed">
                            Closed
                        </option>

                    </select>


                    <select id="pool-cleaning-filter">

                        <option value="">
                            All Cleaning
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                    </select>

                </div>


            </div>

        `;

    }


    /* =====================================================
       REGISTER
       ===================================================== */

    function getFilteredRecords() {

        const search =
            document.getElementById("pool-search")
                ?.value
                .trim()
                .toLowerCase() || "";


        const date =
            document.getElementById("pool-date-filter")
                ?.value || "";


        const condition =
            document.getElementById("pool-condition-filter")
                ?.value || "";


        const cleaning =
            document.getElementById("pool-cleaning-filter")
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
                String(record.zone || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.responsible || "")
                    .toLowerCase()
                    .includes(search);


            const dateMatch =
                !date
                ||
                record.logDate === date;


            const conditionMatch =
                !condition
                ||
                record.poolCondition === condition;


            const cleaningMatch =
                !cleaning
                ||
                record.cleaningStatus === cleaning;


            return (
                searchMatch
                &&
                dateMatch
                &&
                conditionMatch
                &&
                cleaningMatch
            );

        });

    }


    function renderRegister(records) {

        const filtered =
            filterRecords(records);


        if (!filtered.length) {

            return `

                <div class="pool-empty">

                    <strong>
                        No pool logs found
                    </strong>

                    <span>
                        Add a pool log or change
                        the current filters.
                    </span>

                </div>

            `;

        }


        return filtered.map(
            record => {

                const index =
                    records.indexOf(record);

                return renderRecord(
                    record,
                    index
                );

            }
        ).join("");

    }


    function filterRecords(records) {

        const search =
            document.getElementById("pool-search")
                ?.value
                .trim()
                .toLowerCase() || "";


        const date =
            document.getElementById("pool-date-filter")
                ?.value || "";


        const condition =
            document.getElementById("pool-condition-filter")
                ?.value || "";


        const cleaning =
            document.getElementById("pool-cleaning-filter")
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
                String(record.zone || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.responsible || "")
                    .toLowerCase()
                    .includes(search);


            return (
                searchMatch
                &&
                (!date || record.logDate === date)
                &&
                (!condition || record.poolCondition === condition)
                &&
                (!cleaning || record.cleaningStatus === cleaning)
            );

        });

    }


    function renderRecord(record, index) {

        return `

            <div class="pool-record">


                <div class="pool-record-main">


                    <div class="pool-record-title">

                        <div>

                            <strong>
                                ${escape(
                                    record.amenity ||
                                    "Unnamed Pool"
                                )}
                            </strong>

                            <span class="pool-record-id">
                                ${escape(
                                    record.amenityId || "—"
                                )}
                            </span>

                        </div>


                        <span
                            class="
                                pool-condition
                                pool-condition-${String(
                                    record.poolCondition || ""
                                )
                                .toLowerCase()
                                .replace(/\s+/g, "-")}
                            "
                        >
                            ${escape(
                                record.poolCondition || "—"
                            )}
                        </span>

                    </div>


                    <div class="pool-record-grid">


                        <div>

                            <small>Date</small>

                            <span>
                                ${formatDate(record.logDate)}
                            </span>

                        </div>


                        <div>

                            <small>Zone</small>

                            <span>
                                ${escape(record.zone || "—")}
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

                            <small>Temperature</small>

                            <span>
                                ${escape(
                                    record.waterTemperature
                                    || "—"
                                )}
                                ${
                                    record.waterTemperature
                                    ? " °C"
                                    : ""
                                }
                            </span>

                        </div>


                        <div>

                            <small>pH</small>

                            <span>
                                ${escape(record.ph || "—")}
                            </span>

                        </div>


                        <div>

                            <small>Chlorine</small>

                            <span>
                                ${escape(
                                    record.chlorine || "—"
                                )}
                                ${
                                    record.chlorine
                                    ? " ppm"
                                    : ""
                                }
                            </span>

                        </div>


                        <div>

                            <small>Cleaning</small>

                            <span>
                                ${escape(
                                    record.cleaningStatus || "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Equipment</small>

                            <span>
                                ${escape(
                                    record.equipmentStatus || "—"
                                )}
                            </span>

                        </div>


                    </div>


                    ${
                        record.remarks
                        ?
                        `
                            <div class="pool-record-notes">
                                <strong>Remarks:</strong>
                                ${escape(record.remarks)}
                            </div>
                        `
                        :
                        ""
                    }


                </div>


                <div class="pool-record-actions">


                    <button
                        type="button"
                        class="btn"
                        data-pool-edit="${index}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="btn btn-danger"
                        data-pool-delete="${index}"
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

            <section class="pool-history">


                <div class="pool-history-header">

                    <div>

                        <div class="pool-eyebrow">
                            HISTORY
                        </div>

                        <h3>Record Data</h3>

                    </div>

                </div>


                <div class="pool-history-toolbar">


                    <div class="pool-history-search">

                        <input
                            type="search"
                            id="pool-history-search"
                            placeholder="Search history..."
                        >

                    </div>


                    <input
                        type="date"
                        id="pool-history-date"
                        aria-label="History date"
                    >


                </div>


                <div
                    id="pool-history-list"
                    class="pool-history-list"
                >

                    ${renderHistoryList(records)}

                </div>


            </section>

        `;

    }


    function getFilteredHistory() {

        const search =
            document.getElementById("pool-history-search")
                ?.value
                .trim()
                .toLowerCase() || "";


        const date =
            document.getElementById("pool-history-date")
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
                String(record.zone || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.responsible || "")
                    .toLowerCase()
                    .includes(search)
                ||
                String(record.remarks || "")
                    .toLowerCase()
                    .includes(search);


            const dateMatch =
                !date
                ||
                record.logDate === date;


            return (
                searchMatch
                &&
                dateMatch
            );

        });

    }


    function renderHistoryList(records) {

        const search =
            document.getElementById("pool-history-search")
                ?.value
                .trim()
                .toLowerCase() || "";


        const date =
            document.getElementById("pool-history-date")
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
                    String(record.zone || "")
                        .toLowerCase()
                        .includes(search)
                    ||
                    String(record.responsible || "")
                        .toLowerCase()
                        .includes(search)
                    ||
                    String(record.remarks || "")
                        .toLowerCase()
                        .includes(search);


                return (
                    searchMatch
                    &&
                    (!date || record.logDate === date)
                );

            });


        if (!filtered.length) {

            return `

                <div class="pool-history-empty">

                    No history records found.

                </div>

            `;

        }


        return filtered.map(
            (record, index) => `

                <div
                    class="pool-history-item"
                    data-pool-history-index="${index}"
                >


                    <button
                        type="button"
                        class="pool-history-row"
                        data-pool-history-toggle
                    >


                        <span class="pool-history-row-main">

                            <strong>
                                ${formatDate(record.logDate)}
                            </strong>

                            <span>
                                ${escape(
                                    record.amenity ||
                                    "Pool"
                                )}
                            </span>

                        </span>


                        <span class="pool-history-arrow">
                            ↓
                        </span>


                    </button>


                    <div class="pool-history-details">

                        ${renderHistoryDetails(record)}

                    </div>


                </div>

            `
        ).join("");

    }


    function renderHistoryDetails(record) {

        return `

            <div class="pool-history-detail-grid">


                <div>
                    <small>Attendance Date</small>
                    <span>${formatDate(record.logDate)}</span>
                </div>


                <div>
                    <small>Amenity ID</small>
                    <span>${escape(record.amenityId || "—")}</span>
                </div>


                <div>
                    <small>Pool / Amenity</small>
                    <span>${escape(record.amenity || "—")}</span>
                </div>


                <div>
                    <small>Zone</small>
                    <span>${escape(record.zone || "—")}</span>
                </div>


                <div>
                    <small>Responsible</small>
                    <span>${escape(record.responsible || "—")}</span>
                </div>


                <div>
                    <small>Opening Time</small>
                    <span>${escape(record.openingTime || "—")}</span>
                </div>


                <div>
                    <small>Closing Time</small>
                    <span>${escape(record.closingTime || "—")}</span>
                </div>


                <div>
                    <small>Water Temperature</small>
                    <span>
                        ${escape(record.waterTemperature || "—")}
                        ${record.waterTemperature ? " °C" : ""}
                    </span>
                </div>


                <div>
                    <small>pH</small>
                    <span>${escape(record.ph || "—")}</span>
                </div>


                <div>
                    <small>Chlorine</small>
                    <span>
                        ${escape(record.chlorine || "—")}
                        ${record.chlorine ? " ppm" : ""}
                    </span>
                </div>


                <div>
                    <small>Water Clarity</small>
                    <span>${escape(record.waterClarity || "—")}</span>
                </div>


                <div>
                    <small>Pool Condition</small>
                    <span>${escape(record.poolCondition || "—")}</span>
                </div>


                <div>
                    <small>Cleaning Status</small>
                    <span>${escape(record.cleaningStatus || "—")}</span>
                </div>


                <div>
                    <small>Equipment Status</small>
                    <span>${escape(record.equipmentStatus || "—")}</span>
                </div>


                <div class="pool-history-detail-wide">
                    <small>Remarks</small>
                    <span>${escape(record.remarks || "—")}</span>
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
                class="pool-modal"
                id="pool-modal"
                aria-hidden="true"
            >


                <div
                    class="pool-modal-backdrop"
                    data-pool-close
                ></div>


                <div class="pool-modal-panel">


                    <div class="pool-modal-header">

                        <div>

                            <div class="pool-eyebrow">
                                POOL LOG
                            </div>

                            <h3 id="pool-modal-title">
                                Add Pool Log
                            </h3>

                        </div>


                        <button
                            type="button"
                            class="pool-modal-close"
                            data-pool-close
                        >
                            &times;
                        </button>

                    </div>


                    <form id="pool-form">


                        <div class="pool-form-grid">


                            <div class="pool-field">

                                <label for="pool-log-date">
                                    Date
                                </label>

                                <input
                                    type="date"
                                    id="pool-log-date"
                                    required
                                >

                            </div>


                            <div class="pool-field">

                                <label for="pool-amenity">
                                    Pool / Amenity
                                </label>

                                <select
                                    id="pool-amenity"
                                    required
                                >

                                    <option value="">
                                        Select Pool / Amenity
                                    </option>

                                    ${renderAmenityOptions()}

                                </select>

                            </div>


                            <div class="pool-field">

                                <label for="pool-amenity-id">
                                    Amenity ID
                                </label>

                                <input
                                    type="text"
                                    id="pool-amenity-id"
                                    readonly
                                >

                            </div>


                            <div class="pool-field">

                                <label for="pool-zone">
                                    Zone
                                </label>

                                <input
                                    type="text"
                                    id="pool-zone"
                                    readonly
                                >

                            </div>


                            <div class="pool-field">

                                <label for="pool-responsible">
                                    Responsible Person
                                </label>

                                <input
                                    type="text"
                                    id="pool-responsible"
                                    readonly
                                >

                            </div>


                            <div class="pool-field">

                                <label for="pool-opening">
                                    Opening Time
                                </label>

                                <input
                                    type="time"
                                    id="pool-opening"
                                    readonly
                                >

                            </div>


                            <div class="pool-field">

                                <label for="pool-closing">
                                    Closing Time
                                </label>

                                <input
                                    type="time"
                                    id="pool-closing"
                                    readonly
                                >

                            </div>


                            <div class="pool-field">

                                <label for="pool-temperature">
                                    Water Temperature °C
                                </label>

                                <input
                                    type="number"
                                    id="pool-temperature"
                                    step="0.1"
                                    placeholder="e.g. 28"
                                >

                            </div>


                            <div class="pool-field">

                                <label for="pool-ph">
                                    pH
                                </label>

                                <input
                                    type="number"
                                    id="pool-ph"
                                    step="0.1"
                                    placeholder="e.g. 7.4"
                                >

                            </div>


                            <div class="pool-field">

                                <label for="pool-chlorine">
                                    Chlorine ppm
                                </label>

                                <input
                                    type="number"
                                    id="pool-chlorine"
                                    step="0.1"
                                    placeholder="e.g. 1.5"
                                >

                            </div>


                            <div class="pool-field">

                                <label for="pool-clarity">
                                    Water Clarity
                                </label>

                                <select id="pool-clarity">

                                    <option value="Clear">
                                        Clear
                                    </option>

                                    <option value="Slightly Cloudy">
                                        Slightly Cloudy
                                    </option>

                                    <option value="Cloudy">
                                        Cloudy
                                    </option>

                                </select>

                            </div>


                            <div class="pool-field">

                                <label for="pool-condition">
                                    Pool Condition
                                </label>

                                <select
                                    id="pool-condition"
                                    required
                                >

                                    <option value="Good">
                                        Good
                                    </option>

                                    <option value="Attention Required">
                                        Attention Required
                                    </option>

                                    <option value="Closed">
                                        Closed
                                    </option>

                                </select>

                            </div>


                            <div class="pool-field">

                                <label for="pool-cleaning">
                                    Cleaning Status
                                </label>

                                <select
                                    id="pool-cleaning"
                                    required
                                >

                                    <option value="Completed">
                                        Completed
                                    </option>

                                    <option value="Pending">
                                        Pending
                                    </option>

                                </select>

                            </div>


                            <div class="pool-field">

                                <label for="pool-equipment">
                                    Equipment Status
                                </label>

                                <select
                                    id="pool-equipment"
                                    required
                                >

                                    <option value="Operational">
                                        Operational
                                    </option>

                                    <option value="Attention Required">
                                        Attention Required
                                    </option>

                                    <option value="Out of Service">
                                        Out of Service
                                    </option>

                                </select>

                            </div>


                            <div class="pool-field pool-field-wide">

                                <label for="pool-remarks">
                                    Remarks
                                </label>

                                <textarea
                                    id="pool-remarks"
                                    rows="4"
                                    placeholder="Optional remarks..."
                                ></textarea>

                            </div>


                        </div>


                        <div class="pool-modal-footer">


                            <button
                                type="button"
                                class="btn"
                                data-pool-close
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                class="btn btn-primary"
                            >
                                Save Pool Log
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
                            ? ` — ${escape(amenity.amenityId)}`
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
            getAmenityByRecordId(id);


        const fields = {

            id:
                document.getElementById("pool-amenity-id"),

            zone:
                document.getElementById("pool-zone"),

            responsible:
                document.getElementById("pool-responsible"),

            opening:
                document.getElementById("pool-opening"),

            closing:
                document.getElementById("pool-closing")

        };


        if (!amenity) {

            Object.values(fields).forEach(
                field => {
                    if (field) field.value = "";
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

        fields.opening.value =
            amenity.openingTime || "";

        fields.closing.value =
            amenity.closingTime || "";

    }


    /* =====================================================
       OPEN FORM
       ===================================================== */

    function openForm(index = -1) {

        const modal =
            document.getElementById("pool-modal");

        const form =
            document.getElementById("pool-form");

        if (!modal || !form) return;


        form.reset();


        modal.dataset.index =
            String(index);


        document.getElementById(
            "pool-log-date"
        ).value = today();


        document.getElementById(
            "pool-condition"
        ).value = "Good";


        document.getElementById(
            "pool-cleaning"
        ).value = "Completed";


        document.getElementById(
            "pool-equipment"
        ).value = "Operational";


        if (index >= 0) {

            const record =
                getRecords()[index];

            if (!record) return;


            document.getElementById(
                "pool-modal-title"
            ).textContent =
                "Edit Pool Log";


            document.getElementById(
                "pool-log-date"
            ).value =
                record.logDate || today();


            document.getElementById(
                "pool-amenity"
            ).value =
                record.amenityRecordId || "";


            populateAmenityFields(
                record.amenityRecordId
            );


            document.getElementById(
                "pool-temperature"
            ).value =
                record.waterTemperature || "";


            document.getElementById(
                "pool-ph"
            ).value =
                record.ph || "";


            document.getElementById(
                "pool-chlorine"
            ).value =
                record.chlorine || "";


            document.getElementById(
                "pool-clarity"
            ).value =
                record.waterClarity || "Clear";


            document.getElementById(
                "pool-condition"
            ).value =
                record.poolCondition || "Good";


            document.getElementById(
                "pool-cleaning"
            ).value =
                record.cleaningStatus || "Completed";


            document.getElementById(
                "pool-equipment"
            ).value =
                record.equipmentStatus || "Operational";


            document.getElementById(
                "pool-remarks"
            ).value =
                record.remarks || "";

        } else {

            document.getElementById(
                "pool-modal-title"
            ).textContent =
                "Add Pool Log";

        }


        modal.classList.add("active");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /* =====================================================
       CLOSE FORM
       ===================================================== */

    function closeForm() {

        const modal =
            document.getElementById("pool-modal");

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
            document.getElementById("pool-modal");

        const form =
            document.getElementById("pool-form");

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
                "Please select a valid Pool / Amenity."
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

            logDate:
                document.getElementById(
                    "pool-log-date"
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

            openingTime:
                amenity.openingTime || "",

            closingTime:
                amenity.closingTime || "",

            waterTemperature:
                document.getElementById(
                    "pool-temperature"
                ).value || "",

            ph:
                document.getElementById(
                    "pool-ph"
                ).value || "",

            chlorine:
                document.getElementById(
                    "pool-chlorine"
                ).value || "",

            waterClarity:
                document.getElementById(
                    "pool-clarity"
                ).value || "",

            poolCondition:
                document.getElementById(
                    "pool-condition"
                ).value || "",

            cleaningStatus:
                document.getElementById(
                    "pool-cleaning"
                ).value || "",

            equipmentStatus:
                document.getElementById(
                    "pool-equipment"
                ).value || "",

            remarks:
                document.getElementById(
                    "pool-remarks"
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
                `Delete pool log for ${record.amenity || "this pool"}?`
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
                "pool-register"
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
                "pool-history-list"
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
                        "[data-pool-action='add']"
                    );


                if (addButton) {

                    openForm(-1);

                    return;

                }


                const editButton =
                    event.target.closest(
                        "[data-pool-edit]"
                    );


                if (editButton) {

                    openForm(
                        Number(
                            editButton.dataset.poolEdit
                        )
                    );

                    return;

                }


                const deleteButton =
                    event.target.closest(
                        "[data-pool-delete]"
                    );


                if (deleteButton) {

                    deleteRecord(
                        Number(
                            deleteButton.dataset.poolDelete
                        )
                    );

                    return;

                }


                const closeButton =
                    event.target.closest(
                        "[data-pool-close]"
                    );


                if (closeButton) {

                    closeForm();

                    return;

                }


                const historyToggle =
                    event.target.closest(
                        "[data-pool-history-toggle]"
                    );


                if (historyToggle) {

                    const item =
                        historyToggle.closest(
                            ".pool-history-item"
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
                    event.target.id === "pool-form"
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
                        "pool-amenity"
                ) {

                    populateAmenityFields(
                        event.target.value
                    );

                }


                if (
                    event.target &&
                    (
                        event.target.id ===
                            "pool-date-filter"
                        ||
                        event.target.id ===
                            "pool-condition-filter"
                        ||
                        event.target.id ===
                            "pool-cleaning-filter"
                    )
                ) {

                    refreshRegister();

                }


                if (
                    event.target &&
                    event.target.id ===
                        "pool-history-date"
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
                    (
                        event.target.id ===
                            "pool-search"
                        ||
                        event.target.id ===
                            "pool-history-search"
                    )
                ) {

                    if (
                        event.target.id ===
                        "pool-search"
                    ) {

                        refreshRegister();

                    } else {

                        refreshHistory();

                    }

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

    window.FXPool = {

        getRecords,

        getAmenities,

        openForm,

        closeForm,

        saveForm,

        deleteRecord,

        render

    };


    /* =====================================================
       REGISTER MODULE
       ===================================================== */

    registerFXModule(
        "pool",
        {
            init,
            render,
            destroy
        }
    );


})();