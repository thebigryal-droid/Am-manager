/* =========================================================
   FACILITY EXECUTIVE OS
   HK SCHEDULE MODULE
   ========================================================= */

(function () {

    "use strict";

    const FX = window.FX || {};
    const Data = window.FXData || {};

    const COLLECTION = "hk_schedule";

    const STATUS = {
        ACTIVE: "Active",
        INACTIVE: "Inactive"
    };

    let initialized = false;
    let listeners = [];

    /* =====================================================
       HELPERS
       ===================================================== */

    function getRecords() {
        if (typeof Data.get !== "function") return [];

        const records = Data.get(COLLECTION);

        return Array.isArray(records) ? records : [];
    }

    function getAmenities() {
        if (typeof Data.get !== "function") return [];

        const amenities = Data.get("amenities");

        return Array.isArray(amenities) ? amenities : [];
    }

    function now() {
        return new Date().toISOString();
    }

    function uid() {
        return (
            "HK-" +
            Date.now().toString(36).toUpperCase() +
            "-" +
            Math.random().toString(36).slice(2, 7).toUpperCase()
        );
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

    function getActiveTab() {
        return (
            FX.state?.activeTab ||
            FX.activeTab ||
            ""
        );
    }

    function isModuleActive() {
        return (
            getActiveTab() === COLLECTION ||
            getActiveTab() === "hk" ||
            getActiveTab() === "hk-schedule"
        );
    }

    function cleanupListeners() {
        listeners.forEach(function (item) {
            if (
                item &&
                item.element &&
                typeof item.element.removeEventListener === "function"
            ) {
                item.element.removeEventListener(
                    item.event,
                    item.handler
                );
            }
        });

        listeners = [];
    }

    function listen(element, event, handler) {
        if (
            !element ||
            typeof element.addEventListener !== "function"
        ) {
            return;
        }

        element.addEventListener(event, handler);

        listeners.push({
            element,
            event,
            handler
        });
    }

    function getElement(id) {
        return document.getElementById(id);
    }

    function setFieldValue(id, value) {
        const field = getElement(id);

        if (field) {
            field.value = value == null ? "" : value;
        }
    }

    function getFieldValue(id) {
        const field = getElement(id);

        return field ? String(field.value || "").trim() : "";
    }

    /* =====================================================
       AMENITY MASTER CONNECTION
       ===================================================== */

    function populateAmenityFields() {
        const select = getElement("hk-amenity");

        if (!select) return;

        const selectedId = select.value;

        const amenity = getAmenities().find(function (record) {
            return String(record.id) === String(selectedId);
        });

        if (!amenity) {
            setFieldValue("hk-amenity-id", "");
            setFieldValue("hk-area", "");
            setFieldValue("hk-responsible", "");
            setFieldValue("hk-start", "");
            setFieldValue("hk-end");
            return;
        }

        setFieldValue(
            "hk-amenity-id",
            amenity.amenityId || amenity.id || ""
        );

        setFieldValue(
            "hk-area",
            amenity.zone || amenity.area || ""
        );

        setFieldValue(
            "hk-responsible",
            amenity.responsible || ""
        );

        setFieldValue(
            "hk-start",
            amenity.openingTime || amenity.startTime || ""
        );

        setFieldValue(
            "hk-end",
            amenity.closingTime || amenity.endTime || ""
        );
    }

    function getSelectedAmenity() {
        const select = getElement("hk-amenity");

        if (!select || !select.value) {
            return null;
        }

        return (
            getAmenities().find(function (amenity) {
                return String(amenity.id) === String(select.value);
            }) || null
        );
    }

    function buildAmenityOptions() {
        return getAmenities()
            .map(function (amenity) {
                const name =
                    amenity.amenity ||
                    amenity.name ||
                    amenity.title ||
                    "Unnamed Amenity";

                const amenityId =
                    amenity.amenityId ||
                    amenity.code ||
                    "";

                return `
                    <option value="${esc(amenity.id)}">
                        ${esc(name)}
                        ${
                            amenityId
                                ? " — " + esc(amenityId)
                                : ""
                        }
                    </option>
                `;
            })
            .join("");
    }

    /* =====================================================
       MODULE HTML
       ===================================================== */

    function render() {
        const root = getElement("tab-hk_schedule");

        if (!root) return;

        cleanupListeners();

        root.innerHTML = `
            <div class="hk-module">

                <div class="hk-header">
                    <div>
                        <div class="hk-eyebrow">
                            HOUSEKEEPING OPERATIONS
                        </div>

                        <h2>HK Schedule</h2>

                        <p>
                            Manage recurring housekeeping schedules,
                            responsibilities, timings and operational status.
                        </p>
                    </div>

                    <button
                        type="button"
                        class="btn btn-primary"
                        id="hk-add-btn"
                    >
                        + Add Schedule
                    </button>
                </div>

                <div class="hk-summary">
                    <div class="hk-kpi">
                        <span>Total Schedules</span>
                        <strong id="hk-total">0</strong>
                    </div>

                    <div class="hk-kpi">
                        <span>Active</span>
                        <strong id="hk-active">0</strong>
                    </div>

                    <div class="hk-kpi">
                        <span>Inactive</span>
                        <strong id="hk-inactive">0</strong>
                    </div>

                    <div class="hk-kpi">
                        <span>Daily Tasks</span>
                        <strong id="hk-daily">0</strong>
                    </div>
                </div>

                <div class="hk-toolbar">
                    <div class="hk-search">
                        <input
                            type="search"
                            id="hk-search"
                            placeholder="Search schedule, amenity, task or responsible person..."
                        >
                    </div>

                    <div class="hk-filters">
                        <select id="hk-frequency-filter">
                            <option value="">All Frequencies</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="As Required">As Required</option>
                        </select>

                        <select id="hk-status-filter">
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div class="hk-register" id="hk-register"></div>

                <div class="hk-history" id="hk-history"></div>

                <div
                    class="hk-modal"
                    id="hk-modal"
                    aria-hidden="true"
                >
                    <div
                        class="hk-modal-backdrop"
                        data-hk-close
                    ></div>

                    <div
                        class="hk-modal-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="hk-modal-title"
                    >
                        <div class="hk-modal-header">
                            <div>
                                <div class="hk-eyebrow">
                                    HOUSEKEEPING
                                </div>

                                <h3 id="hk-modal-title">
                                    Add HK Schedule
                                </h3>
                            </div>

                            <button
                                type="button"
                                class="hk-modal-close"
                                id="hk-modal-close"
                                aria-label="Close"
                            >
                                &times;
                            </button>
                        </div>

                        <form id="hk-form">
                            <div class="hk-form-grid">

                                <div class="hk-field">
                                    <label for="hk-amenity">
                                        Amenity
                                    </label>

                                    <select id="hk-amenity" required>
                                        <option value="">
                                            Select Amenity
                                        </option>

                                        ${buildAmenityOptions()}
                                    </select>
                                </div>

                                <div class="hk-field">
                                    <label for="hk-amenity-id">
                                        Amenity ID
                                    </label>

                                    <input
                                        id="hk-amenity-id"
                                        type="text"
                                        readonly
                                    >
                                </div>

                                <div class="hk-field">
                                    <label for="hk-area">
                                        Area / Zone
                                    </label>

                                    <input
                                        id="hk-area"
                                        type="text"
                                        readonly
                                    >
                                </div>

                                <div class="hk-field">
                                    <label for="hk-task">
                                        Housekeeping Task
                                    </label>

                                    <input
                                        id="hk-task"
                                        type="text"
                                        required
                                        placeholder="e.g. Lobby cleaning"
                                    >
                                </div>

                                <div class="hk-field">
                                    <label for="hk-responsible">
                                        Responsible Person
                                    </label>

                                    <input
                                        id="hk-responsible"
                                        type="text"
                                        readonly
                                    >
                                </div>

                                <div class="hk-field">
                                    <label for="hk-frequency">
                                        Frequency
                                    </label>

                                    <select id="hk-frequency" required>
                                        <option value="">
                                            Select frequency
                                        </option>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="As Required">
                                            As Required
                                        </option>
                                    </select>
                                </div>

                                <div class="hk-field">
                                    <label for="hk-start">
                                        Opening Time
                                    </label>

                                    <input
                                        id="hk-start"
                                        type="time"
                                        readonly
                                    >
                                </div>

                                <div class="hk-field">
                                    <label for="hk-end">
                                        Closing Time
                                    </label>

                                    <input
                                        id="hk-end"
                                        type="time"
                                        readonly
                                    >
                                </div>

                                <div class="hk-field">
                                    <label for="hk-shift">
                                        Shift
                                    </label>

                                    <select id="hk-shift">
                                        <option value="">
                                            Select shift
                                        </option>
                                        <option value="Morning">
                                            Morning
                                        </option>
                                        <option value="Afternoon">
                                            Afternoon
                                        </option>
                                        <option value="Evening">
                                            Evening
                                        </option>
                                        <option value="Night">
                                            Night
                                        </option>
                                    </select>
                                </div>

                                <div class="hk-field">
                                    <label for="hk-status">
                                        Status
                                    </label>

                                    <select id="hk-status">
                                        <option value="Active">
                                            Active
                                        </option>
                                        <option value="Inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </div>

                                <div class="hk-field hk-field-wide">
                                    <label for="hk-notes">
                                        Notes
                                    </label>

                                    <textarea
                                        id="hk-notes"
                                        rows="4"
                                        placeholder="Additional instructions or housekeeping notes..."
                                    ></textarea>
                                </div>

                            </div>

                            <div class="hk-modal-footer">
                                <button
                                    type="button"
                                    class="btn"
                                    id="hk-cancel-btn"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    class="btn btn-primary"
                                >
                                    Save Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        bindEvents();
        renderRegister();
        renderHistory();
    }

    /* =====================================================
       FORM
       ===================================================== */

    function openForm(index) {
        const modal = getElement("hk-modal");
        const form = getElement("hk-form");

        if (!modal || !form) return;

        const editing =
            Number.isInteger(index) &&
            index >= 0;

        form.dataset.index = editing ? String(index) : "-1";

        if (!editing) {
            getElement("hk-modal-title").textContent =
                "Add HK Schedule";

            form.reset();

            setFieldValue("hk-status", STATUS.ACTIVE);
            populateAmenityFields();
        } else {
            const record = getRecords()[index];

            if (!record) return;

            getElement("hk-modal-title").textContent =
                "Edit HK Schedule";

            const amenitySelect = getElement("hk-amenity");

            let selectedAmenityId =
                record.amenityRecordId ||
                record.amenityMasterId ||
                "";

            if (!selectedAmenityId && record.amenityId) {
                const oldAmenity = getAmenities().find(function (amenity) {
                    return String(amenity.amenityId) ===
                        String(record.amenityId);
                });

                if (oldAmenity) {
                    selectedAmenityId = oldAmenity.id;
                }
            }

            if (amenitySelect) {
                amenitySelect.value = selectedAmenityId || "";
            }

            populateAmenityFields();

            setFieldValue("hk-task", record.task || "");
            setFieldValue("hk-frequency", record.frequency || "");
            setFieldValue("hk-shift", record.shift || "");
            setFieldValue(
                "hk-status",
                record.status || STATUS.ACTIVE
            );
            setFieldValue("hk-notes", record.notes || "");
        }

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
    }

    function closeForm() {
        const modal = getElement("hk-modal");

        if (!modal) return;

        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
    }

    function saveSchedule(event) {
        if (event) {
            event.preventDefault();
        }

        const form = getElement("hk-form");

        if (!form) return;

        const selectedAmenity = getSelectedAmenity();

        if (!selectedAmenity) {
            alert("Please select an Amenity from Amenity Master.");
            return;
        }

        const task = getFieldValue("hk-task");
        const frequency = getFieldValue("hk-frequency");

        if (!task || !frequency) {
            alert(
                "Please complete Housekeeping Task and Frequency."
            );
            return;
        }

        if (
            typeof Data.add !== "function" ||
            typeof Data.update !== "function"
        ) {
            alert("The application data layer is unavailable.");
            return;
        }

        const index = Number(form.dataset.index || -1);
        const records = getRecords();

        const existing =
            index >= 0
                ? records[index]
                : null;

        const record = {
            id: existing?.id || uid(),

            amenityRecordId: selectedAmenity.id,

            amenityId:
                selectedAmenity.amenityId ||
                selectedAmenity.code ||
                "",

            amenity:
                selectedAmenity.amenity ||
                selectedAmenity.name ||
                selectedAmenity.title ||
                "",

            zone:
                selectedAmenity.zone ||
                selectedAmenity.area ||
                "",

            area:
                selectedAmenity.zone ||
                selectedAmenity.area ||
                "",

            task,

            responsible:
                selectedAmenity.responsible ||
                "",

            frequency,

            startTime:
                selectedAmenity.openingTime ||
                selectedAmenity.startTime ||
                "",

            endTime:
                selectedAmenity.closingTime ||
                selectedAmenity.endTime ||
                "",

            shift: getFieldValue("hk-shift"),

            status:
                getFieldValue("hk-status") ||
                STATUS.ACTIVE,

            notes: getFieldValue("hk-notes"),

            createdAt:
                existing?.createdAt ||
                now(),

            updatedAt: now()
        };

        try {
            if (index >= 0 && records[index]) {
                Data.update(COLLECTION, index, record);
            } else {
                Data.add(COLLECTION, record);
            }
        } catch (error) {
            console.error(
                "Unable to save HK schedule:",
                error
            );

            alert("Unable to save the HK schedule.");
            return;
        }

        closeForm();
        renderRegister();
        renderHistory();
    }

    /* =====================================================
       RECORD ACTIONS
       ===================================================== */

    function deleteSchedule(index) {
        const record = getRecords()[index];

        if (!record) return;

        if (
            !confirm(
                `Delete the HK schedule "${record.task || "Unnamed Task"}"?`
            )
        ) {
            return;
        }

        if (typeof Data.remove !== "function") {
            alert("The application data layer is unavailable.");
            return;
        }

        try {
            Data.remove(COLLECTION, index);
        } catch (error) {
            console.error(
                "Unable to delete HK schedule:",
                error
            );

            alert("Unable to delete the HK schedule.");
            return;
        }

        renderRegister();
        renderHistory();
    }

    function toggleStatus(index) {
        const record = getRecords()[index];

        if (!record) return;

        if (typeof Data.update !== "function") {
            alert("The application data layer is unavailable.");
            return;
        }

        const newStatus =
            record.status === STATUS.ACTIVE
                ? STATUS.INACTIVE
                : STATUS.ACTIVE;

        try {
            Data.update(COLLECTION, index, {
                ...record,
                status: newStatus,
                updatedAt: now()
            });
        } catch (error) {
            console.error(
                "Unable to update HK schedule status:",
                error
            );

            alert("Unable to update the schedule status.");
            return;
        }

        renderRegister();
        renderHistory();
    }

    /* =====================================================
       REGISTER
       ===================================================== */

    function renderRegister() {
        const container = getElement("hk-register");

        if (!container) return;

        const search =
            getFieldValue("hk-search").toLowerCase();

        const frequency =
            getFieldValue("hk-frequency-filter");

        const status =
            getFieldValue("hk-status-filter");

        const records = getRecords();

        const filtered = records
            .map(function (record, index) {
                return {
                    record,
                    index
                };
            })
            .filter(function (item) {
                const record = item.record;

                const haystack = [
                    record.amenity,
                    record.amenityId,
                    record.area,
                    record.zone,
                    record.task,
                    record.responsible,
                    record.frequency,
                    record.shift,
                    record.notes
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return (
                    (!search || haystack.includes(search)) &&
                    (!frequency || record.frequency === frequency) &&
                    (!status || record.status === status)
                );
            });

        updateSummary(records);

        if (!filtered.length) {
            container.innerHTML = `
                <div class="hk-empty">
                    <strong>No HK schedules found</strong>
                    <span>
                        Add a schedule or adjust the filters.
                    </span>
                </div>
            `;

            return;
        }

        container.innerHTML = filtered
            .map(function (item) {
                const record = item.record;
                const index = item.index;

                const recordStatus =
                    record.status || STATUS.ACTIVE;

                return `
                    <article class="hk-record">
                        <div class="hk-record-main">

                            <div class="hk-record-title">
                                <div>
                                    <strong>
                                        ${esc(record.task || "Unnamed Task")}
                                    </strong>

                                    <span class="hk-area">
                                        ${esc(
                                            record.amenity ||
                                            "Unnamed Amenity"
                                        )}

                                        ${
                                            record.amenityId
                                                ? " — " +
                                                  esc(record.amenityId)
                                                : ""
                                        }
                                    </span>
                                </div>

                                <span
                                    class="hk-status hk-status-${
                                        recordStatus === STATUS.ACTIVE
                                            ? "active"
                                            : "inactive"
                                    }"
                                >
                                    ${esc(recordStatus)}
                                </span>
                            </div>

                            <div class="hk-record-grid">
                                <div>
                                    <small>Area / Zone</small>
                                    <span>
                                        ${esc(
                                            record.zone ||
                                            record.area ||
                                            "—"
                                        )}
                                    </span>
                                </div>

                                <div>
                                    <small>Responsible</small>
                                    <span>
                                        ${esc(
                                            record.responsible ||
                                            "—"
                                        )}
                                    </span>
                                </div>

                                <div>
                                    <small>Frequency</small>
                                    <span>
                                        ${esc(record.frequency || "—")}
                                    </span>
                                </div>

                                <div>
                                    <small>Timing</small>
                                    <span>
                                        ${esc(record.startTime || "—")}
                                        ${
                                            record.endTime
                                                ? " – " +
                                                  esc(record.endTime)
                                                : ""
                                        }
                                    </span>
                                </div>

                                <div>
                                    <small>Shift</small>
                                    <span>
                                        ${esc(record.shift || "—")}
                                    </span>
                                </div>
                            </div>

                            ${
                                record.notes
                                    ? `
                                        <div class="hk-record-notes">
                                            ${esc(record.notes)}
                                        </div>
                                    `
                                    : ""
                            }
                        </div>

                        <div class="hk-record-actions">
                            <button
                                type="button"
                                class="btn"
                                data-hk-edit="${index}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="btn"
                                data-hk-status="${index}"
                            >
                                ${
                                    recordStatus === STATUS.ACTIVE
                                        ? "Deactivate"
                                        : "Activate"
                                }
                            </button>

                            <button
                                type="button"
                                class="btn btn-danger"
                                data-hk-delete="${index}"
                            >
                                Delete
                            </button>
                        </div>
                    </article>
                `;
            })
            .join("");
    }

    function updateSummary(records) {
        const active = records.filter(function (record) {
            return record.status === STATUS.ACTIVE;
        }).length;

        const inactive = records.filter(function (record) {
            return record.status === STATUS.INACTIVE;
        }).length;

        const daily = records.filter(function (record) {
            return record.frequency === "Daily";
        }).length;

        setFieldText("hk-total", records.length);
        setFieldText("hk-active", active);
        setFieldText("hk-inactive", inactive);
        setFieldText("hk-daily", daily);
    }

    function setFieldText(id, value) {
        const element = getElement(id);

        if (element) {
            element.textContent = String(value);
        }
    }

    /* =====================================================
       HISTORY
       ===================================================== */

    function renderHistory() {
        const container = getElement("hk-history");

        if (!container) return;

        container.innerHTML = `
            <div class="hk-history-card">

                <div class="hk-history-header">
                    <div>
                        <div class="hk-eyebrow">
                            RECORD HISTORY
                        </div>

                        <h3>HK Schedule History</h3>
                    </div>
                </div>

                <div class="hk-history-toolbar">
                    <div class="hk-history-search">
                        <input
                            type="search"
                            id="hk-history-search"
                            placeholder="Search..."
                        >
                    </div>

                    <div class="hk-history-date">
                        <input
                            type="date"
                            id="hk-history-date"
                            aria-label="Filter history by date"
                        >
                    </div>
                </div>

                <div class="hk-history-label">
                    RECORD DATA
                </div>

                <div
                    class="hk-history-list"
                    id="hk-history-list"
                ></div>
            </div>
        `;

        renderHistoryList(getRecords());

        listen(
            getElement("hk-history-search"),
            "input",
            function () {
                renderHistoryList(getFilteredHistoryRecords());
            }
        );

        listen(
            getElement("hk-history-date"),
            "change",
            function () {
                renderHistoryList(getFilteredHistoryRecords());
            }
        );
    }

    function getFilteredHistoryRecords() {
        const search =
            getFieldValue("hk-history-search").toLowerCase();

        const date =
            getFieldValue("hk-history-date");

        return getRecords().filter(function (record) {
            const searchable = [
                record.amenity,
                record.amenityId,
                record.zone,
                record.area,
                record.task,
                record.responsible,
                record.frequency,
                record.shift,
                record.notes
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            if (
                search &&
                !searchable.includes(search)
            ) {
                return false;
            }

            if (date) {
                const recordDate =
                    record.updatedAt ||
                    record.createdAt ||
                    "";

                if (!String(recordDate).startsWith(date)) {
                    return false;
                }
            }

            return true;
        });
    }

    function formatDate(value) {
        if (!value) return "—";

        const parsed = new Date(value);

        if (Number.isNaN(parsed.getTime())) {
            return "—";
        }

        return parsed.toLocaleDateString(
            undefined,
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }

    function renderHistoryList(records) {
        const list = getElement("hk-history-list");

        if (!list) return;

        if (!records.length) {
            list.innerHTML = `
                <div class="hk-history-empty">
                    No records found.
                </div>
            `;

            return;
        }

        list.innerHTML = records
            .map(function (record, index) {
                return `
                    <div
                        class="hk-history-item"
                        data-history-index="${index}"
                    >
                        <button
                            type="button"
                            class="hk-history-row"
                            aria-expanded="false"
                            data-history-toggle="${index}"
                        >
                            <div class="hk-history-row-main">
                                <strong>
                                    ${esc(
                                        record.task ||
                                        "Unnamed Task"
                                    )}
                                </strong>

                                <span>
                                    ${esc(
                                        formatDate(
                                            record.updatedAt ||
                                            record.createdAt
                                        )
                                    )}
                                </span>
                            </div>

                            <span
                                class="hk-history-arrow"
                                aria-hidden="true"
                            >
                                ↓
                            </span>
                        </button>

                        <div
                            class="hk-history-details"
                            data-history-details="${index}"
                            hidden
                        >
                            <div class="hk-history-detail-grid">

                                <div>
                                    <small>Amenity</small>
                                    <span>
                                        ${esc(record.amenity || "—")}
                                        ${
                                            record.amenityId
                                                ? " — " +
                                                  esc(record.amenityId)
                                                : ""
                                        }
                                    </span>
                                </div>

                                <div>
                                    <small>Area / Zone</small>
                                    <span>
                                        ${esc(
                                            record.zone ||
                                            record.area ||
                                            "—"
                                        )}
                                    </span>
                                </div>

                                <div>
                                    <small>Responsible</small>
                                    <span>
                                        ${esc(
                                            record.responsible ||
                                            "—"
                                        )}
                                    </span>
                                </div>

                                <div>
                                    <small>Frequency</small>
                                    <span>
                                        ${esc(record.frequency || "—")}
                                    </span>
                                </div>

                                <div>
                                    <small>Opening Time</small>
                                    <span>
                                        ${esc(record.startTime || "—")}
                                    </span>
                                </div>

                                <div>
                                    <small>Closing Time</small>
                                    <span>
                                        ${esc(record.endTime || "—")}
                                    </span>
                                </div>

                                <div>
                                    <small>Shift</small>
                                    <span>
                                        ${esc(record.shift || "—")}
                                    </span>
                                </div>

                                <div>
                                    <small>Status</small>
                                    <span>
                                        ${esc(record.status || "—")}
                                    </span>
                                </div>

                                <div class="hk-history-detail-wide">
                                    <small>Notes</small>
                                    <span>
                                        ${esc(record.notes || "—")}
                                    </span>
                                </div>

                            </div>
                        </div>
                    </div>
                `;
            })
            .join("");

        list
            .querySelectorAll("[data-history-toggle]")
            .forEach(function (button) {
                listen(
                    button,
                    "click",
                    function () {
                        const index =
                            button.dataset.historyToggle;

                        const details = list.querySelector(
                            `[data-history-details="${index}"]`
                        );

                        const item = list.querySelector(
                            `[data-history-index="${index}"]`
                        );

                        if (!details || !item) return;

                        const expanded =
                            button.getAttribute(
                                "aria-expanded"
                            ) === "true";

                        button.setAttribute(
                            "aria-expanded",
                            String(!expanded)
                        );

                        details.hidden = expanded;

                        item.classList.toggle(
                            "expanded",
                            !expanded
                        );
                    }
                );
            });
    }

    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {
        listen(
            getElement("hk-add-btn"),
            "click",
            function () {
                openForm(-1);
            }
        );

        listen(
            getElement("hk-amenity"),
            "change",
            populateAmenityFields
        );

        listen(
            getElement("hk-form"),
            "submit",
            saveSchedule
        );

        listen(
            getElement("hk-modal-close"),
            "click",
            closeForm
        );

        listen(
            getElement("hk-cancel-btn"),
            "click",
            closeForm
        );

        document
            .querySelectorAll("[data-hk-close]")
            .forEach(function (element) {
                listen(element, "click", closeForm);
            });

        listen(
            getElement("hk-search"),
            "input",
            renderRegister
        );

        listen(
            getElement("hk-frequency-filter"),
            "change",
            renderRegister
        );

        listen(
            getElement("hk-status-filter"),
            "change",
            renderRegister
        );

        listen(
            getElement("hk-register"),
            "click",
            function (event) {
                const editButton =
                    event.target.closest("[data-hk-edit]");

                if (editButton) {
                    openForm(
                        Number(editButton.dataset.hkEdit)
                    );
                    return;
                }

                const statusButton =
                    event.target.closest("[data-hk-status]");

                if (statusButton) {
                    toggleStatus(
                        Number(statusButton.dataset.hkStatus)
                    );
                    return;
                }

                const deleteButton =
                    event.target.closest("[data-hk-delete]");

                if (deleteButton) {
                    deleteSchedule(
                        Number(deleteButton.dataset.hkDelete)
                    );
                }
            }
        );

        listen(
            document,
            "keydown",
            function (event) {
                if (event.key === "Escape") {
                    closeForm();
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
    }

    function destroy() {
        cleanupListeners();
        closeForm();
        initialized = false;
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.FXHKSchedule = {
        getRecords,
        getAmenities,
        render,
        openForm,
        closeForm,
        saveSchedule,
        deleteSchedule,
        toggleStatus
    };

    if (typeof window.registerFXModule === "function") {
        window.registerFXModule(
            "hk_schedule",
            {
                init,
                render,
                destroy
            }
        );
    }

})();