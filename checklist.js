/* =========================================================
   FACILITY EXECUTIVE OS
   PHASE 3 — DAILY CHECKLIST + HISTORY
   CORRECTED MODULAR VERSION
   ========================================================= */

(function () {
    "use strict";

    const FX = window.FX;
    const Data = window.FXData;

    const COLLECTION = "control";
    const HISTORY_COLLECTION = "control_history";

    const STATUS = {
        PENDING: "Pending",
        COMPLETED: "Completed"
    };

    /* =====================================================
       BASIC HELPERS
       ===================================================== */

    function getRecords() {
        return Data.get(COLLECTION);
    }

    function getHistory() {
        return Data.get(HISTORY_COLLECTION);
    }

    function get(id) {
        return document.getElementById(id);
    }

    function text(record, key) {
        if (
            record &&
            record[key] !== undefined &&
            record[key] !== null
        ) {
            return String(record[key]);
        }

        return "";
    }

    function today() {
        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function now() {
        return new Date().toISOString();
    }

    function uid() {
        return (
            "control-" +
            Date.now().toString(36) +
            "-" +
            Math.random().toString(36).slice(2, 9)
        );
    }

    function escape(value) {
        if (typeof window.escapeHtml === "function") {
            return window.escapeHtml(value);
        }

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function setText(id, value) {
        const element = get(id);

        if (element) {
            element.textContent = String(value ?? "");
        }
    }

    function openChecklistModalState(index) {
        if (typeof window.openModal === "function") {
            window.openModal("control", index);
            return;
        }

        const modal = get("formModal");

        if (!modal) {
            return;
        }

        modal.classList.add("active");
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
        modal.dataset.type = "control";
        modal.dataset.index = String(index);
    }

    function closeChecklistModal() {
        if (typeof window.closeModal === "function") {
            window.closeModal();
            return;
        }

        const modal = get("formModal");

        if (!modal) {
            return;
        }

        modal.classList.remove("active");
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "true");
        delete modal.dataset.type;
        delete modal.dataset.index;
    }

    /* =====================================================
       AMENITY MASTER INTEGRATION
       ===================================================== */

    function getAmenities() {
        if (
            !window.FXData ||
            typeof window.FXData.get !== "function"
        ) {
            return [];
        }

        return window.FXData.get("amenities") || [];
    }

    function findAmenity(amenityId) {
        const id = String(amenityId || "").trim();

        if (!id) {
            return null;
        }

        return (
            getAmenities().find(function (amenity) {
                return (
                    String(amenity.amenityId || "").trim() === id
                );
            }) || null
        );
    }

    function populateAmenityFields(amenityId) {
        const selected = findAmenity(amenityId);

        if (!selected) {
            return false;
        }

        const fields = {
            "checklist-amenity-id": selected.amenityId || "",
            "checklist-zone": selected.zone || "",
            "checklist-amenity": selected.amenity || "",
            "checklist-responsible": selected.responsible || "",
            "checklist-opening": selected.openingTime || "",
            "checklist-closing": selected.closingTime || ""
        };

        Object.keys(fields).forEach(function (id) {
            const field = get(id);

            if (field) {
                field.value = fields[id];
            }
        });

        return true;
    }

    function populateAmenityOptions(selectedAmenityId) {
        const select = get("checklist-amenity-select");

        if (!select) {
            return;
        }

        const amenities = getAmenities();

        const currentId = String(selectedAmenityId || "");

        const options = amenities
            .map(function (amenity) {
                const id = String(amenity.amenityId || "");

                const selected =
                    id === currentId ? "selected" : "";

                return `
                    <option
                        value="${escape(id)}"
                        ${selected}
                    >
                        ${escape(id)} —
                        ${escape(
                            amenity.amenity || "Unnamed Amenity"
                        )}
                    </option>
                `;
            })
            .join("");

        select.innerHTML = `
            <option value="">Select an amenity</option>
            ${options}
        `;
    }

    function handleAmenityChange(event) {
        const select = event.target.closest(
            "#checklist-amenity-select"
        );

        if (!select) {
            return;
        }

        const amenityId = select.value;

        if (!amenityId) {
            clearAmenityFields();
            return;
        }

        populateAmenityFields(amenityId);
    }

    function clearAmenityFields() {
        [
            "checklist-amenity-id",
            "checklist-zone",
            "checklist-amenity",
            "checklist-responsible",
            "checklist-opening",
            "checklist-closing"
        ].forEach(function (id) {
            const field = get(id);

            if (field) {
                field.value = "";
            }
        });
    }

    /* =====================================================
       HISTORY ENGINE
       ===================================================== */

    function recordHistory(action, record, extra = {}) {
        if (!record) {
            return;
        }

        const historyRecord = {
            id: uid(),
            historyDate: today(),
            timestamp: now(),
            action: action,

            recordId: record.id || "",
            amenityId: record.amenityId || "",
            zone: record.zone || "",
            amenity: record.amenity || "",
            responsible: record.responsible || "",
            shift: record.shift || "",
            frequency: record.frequency || "",
            openingTime: record.openingTime || "",
            closingTime: record.closingTime || "",
            task: record.task || "",
            remarks: record.remarks || "",
            status: record.status || STATUS.PENDING,

            ...extra
        };

        Data.add(
            HISTORY_COLLECTION,
            historyRecord
        );
    }

    /* =====================================================
       MAIN CHECKLIST RENDER
       ===================================================== */

    function render() {
        if (
            FX &&
            FX.state &&
            FX.state.activeTab &&
            FX.state.activeTab !== "control"
        ) {
            return;
        }

        const container = get("tab-control");

        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="card">

                <div class="card-header checklist-header">

                    <div>
                        <h3>Daily Checklist</h3>

                        <div class="checklist-subtitle">
                            Complete operational opening,
                            closing and cleaning tasks.
                        </div>
                    </div>

                    <div class="flex-gap">

                        <button
                            class="btn"
                            type="button"
                            id="checklistHistoryButton"
                        >
                            History
                        </button>

                        <button
                            class="btn"
                            type="button"
                            id="checklistResetButton"
                        >
                            Reset Day
                        </button>

                        <button
                            class="btn btn-primary"
                            type="button"
                            id="checklistAddButton"
                        >
                            + Add Task
                        </button>

                    </div>

                </div>

                <div class="checklist-summary">

                    <div class="checklist-summary-card">
                        <span>Total</span>
                        <strong id="checklist-total">0</strong>
                    </div>

                    <div class="checklist-summary-card">
                        <span>Completed</span>
                        <strong id="checklist-completed">0</strong>
                    </div>

                    <div class="checklist-summary-card">
                        <span>Pending</span>
                        <strong id="checklist-pending">0</strong>
                    </div>

                    <div class="checklist-summary-card">
                        <span>Completion</span>
                        <strong id="checklist-percent">0%</strong>
                    </div>

                </div>

                <div class="checklist-toolbar">

                    <input
                        id="checklistSearch"
                        class="form-control"
                        type="search"
                        placeholder="Search amenity, zone, task or responsible person"
                    >

                    <select
                        id="checklistStatusFilter"
                        class="form-control"
                    >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>

                    <select
                        id="checklistShiftFilter"
                        class="form-control"
                    >
                        <option value="all">All Shifts</option>
                        <option value="Morning">Morning</option>
                        <option value="Evening">Evening</option>
                    </select>

                </div>

                <div
                    id="checklist-container"
                    class="checklist-card-container"
                ></div>

            </div>
        `;

        bindCurrentChecklistEvents();
        renderCards();
    }

    /* =====================================================
       CURRENT CHECKLIST EVENTS
       ===================================================== */

    function bindCurrentChecklistEvents() {
        get("checklistAddButton")?.addEventListener(
            "click",
            openAddForm
        );

        get("checklistHistoryButton")?.addEventListener(
            "click",
            renderHistory
        );

        get("checklistResetButton")?.addEventListener(
            "click",
            resetDay
        );

        get("checklistSearch")?.addEventListener(
            "input",
            renderCards
        );

        get("checklistStatusFilter")?.addEventListener(
            "change",
            renderCards
        );

        get("checklistShiftFilter")?.addEventListener(
            "change",
            renderCards
        );
    }

    /* =====================================================
       CURRENT CHECKLIST
       ===================================================== */

    function renderCards() {
        const container = get("checklist-container");

        if (!container) {
            return;
        }

        const records = getRecords();

        const search =
            get("checklistSearch")
                ?.value
                .trim()
                .toLowerCase() || "";

        const statusFilter =
            get("checklistStatusFilter")
                ?.value || "all";

        const shiftFilter =
            get("checklistShiftFilter")
                ?.value || "all";

        const filtered = records.filter(function (record) {
            const searchable = [
                record.amenityId,
                record.amenity,
                record.zone,
                record.responsible,
                record.task,
                record.frequency,
                record.remarks
            ]
                .join(" ")
                .toLowerCase();

            const status =
                record.status || STATUS.PENDING;

            const shift =
                record.shift || "Morning";

            return (
                (!search || searchable.includes(search)) &&
                (
                    statusFilter === "all" ||
                    status === statusFilter
                ) &&
                (
                    shiftFilter === "all" ||
                    shift === shiftFilter
                )
            );
        });

        if (!filtered.length) {
            container.innerHTML = `
                <div class="dashboard-empty">
                    ${
                        records.length
                            ? "No checklist tasks match the current filters."
                            : "No checklist tasks have been created yet."
                    }
                </div>
            `;
        } else {
            container.innerHTML = filtered
                .map(createCard)
                .join("");
        }

        updateSummary(records);
    }

    function createCard(record) {
        const index = getRecords().indexOf(record);

        const status =
            record.status || STATUS.PENDING;

        const completed =
            status === STATUS.COMPLETED;

        return `
            <article
                class="
                    checklist-record-card
                    ${completed ? "checklist-completed" : ""}
                "
            >

                <div class="checklist-card-top">

                    <div>
                        <div class="checklist-amenity-id">
                            ${escape(record.amenityId || "No ID")}
                        </div>

                        <h4>
                            ${escape(
                                record.amenity ||
                                "Unnamed Amenity"
                            )}
                        </h4>
                    </div>

                    <span class="tag">
                        ${escape(status)}
                    </span>

                </div>

                <div class="checklist-card-grid">

                    <div>
                        <span>Zone</span>
                        <strong>
                            ${escape(record.zone || "—")}
                        </strong>
                    </div>

                    <div>
                        <span>Responsible</span>
                        <strong>
                            ${escape(record.responsible || "—")}
                        </strong>
                    </div>

                    <div>
                        <span>Shift</span>
                        <strong>
                            ${escape(record.shift || "—")}
                        </strong>
                    </div>

                    <div>
                        <span>Frequency</span>
                        <strong>
                            ${escape(record.frequency || "—")}
                        </strong>
                    </div>

                    <div>
                        <span>Opening</span>
                        <strong>
                            ${escape(record.openingTime || "—")}
                        </strong>
                    </div>

                    <div>
                        <span>Closing</span>
                        <strong>
                            ${escape(record.closingTime || "—")}
                        </strong>
                    </div>

                </div>

                <div class="checklist-task">
                    <span>Task</span>

                    <strong>
                        ${escape(record.task || "No task defined")}
                    </strong>
                </div>

                ${
                    record.remarks
                        ? `
                            <div class="checklist-remarks">
                                <span>Remarks</span>

                                <div>
                                    ${escape(record.remarks)}
                                </div>
                            </div>
                        `
                        : ""
                }

                <div class="checklist-card-actions">

                    <button
                        class="btn"
                        type="button"
                        data-action="toggle"
                        data-index="${index}"
                    >
                        ${
                            completed
                                ? "Mark Pending"
                                : "Mark Completed"
                        }
                    </button>

                    <button
                        class="btn"
                        type="button"
                        data-action="edit"
                        data-index="${index}"
                    >
                        Edit
                    </button>

                    <button
                        class="btn btn-danger"
                        type="button"
                        data-action="delete"
                        data-index="${index}"
                    >
                        Delete
                    </button>

                </div>

            </article>
        `;
    }

    /* =====================================================
       SUMMARY
       ===================================================== */

    function updateSummary(records) {
        const total = records.length;

        const completed = records.filter(function (record) {
            return (
                record.status === STATUS.COMPLETED
            );
        }).length;

        const pending = total - completed;

        const percentage = total
            ? Math.round((completed / total) * 100)
            : 0;

        setText("checklist-total", total);
        setText("checklist-completed", completed);
        setText("checklist-pending", pending);
        setText("checklist-percent", `${percentage}%`);
    }

    /* =====================================================
       CHECKLIST FORM
       ===================================================== */

    function openAddForm() {
        openChecklistModal();
    }

    function openEditForm(index) {
        const record = getRecords()[index];

        if (!record) {
            return;
        }

        openChecklistModal(record, index);
    }

    function openChecklistModal(record = {}, index = -1) {
        const modal = get("formModal");
        const title = get("modalTitle");
        const body = get("modalBody");

        if (!modal || !title || !body) {
            return;
        }

        title.textContent =
            index >= 0
                ? "Edit Checklist Task"
                : "Add Checklist Task";

        body.innerHTML = `
            <div class="form-group">
                <label>Select Amenity</label>

                <select
                    class="form-control"
                    id="checklist-amenity-select"
                >
                    <option value="">
                        Select an amenity
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label>Amenity ID</label>

                <input
                    class="form-control"
                    id="checklist-amenity-id"
                    value="${escape(record.amenityId || "")}"
                    readonly
                >
            </div>

            <div class="form-group">
                <label>Zone</label>

                <input
                    class="form-control"
                    id="checklist-zone"
                    value="${escape(record.zone || "")}"
                    readonly
                >
            </div>

            <div class="form-group">
                <label>Amenity</label>

                <input
                    class="form-control"
                    id="checklist-amenity"
                    value="${escape(record.amenity || "")}"
                    readonly
                >
            </div>

            <div class="form-group">
                <label>Responsible</label>

                <input
                    class="form-control"
                    id="checklist-responsible"
                    value="${escape(record.responsible || "")}"
                    readonly
                >
            </div>

            <div class="form-group">
                <label>Shift</label>

                <select
                    class="form-control"
                    id="checklist-shift"
                >
                    <option
                        value="Morning"
                        ${
                            record.shift === "Morning" ||
                            !record.shift
                                ? "selected"
                                : ""
                        }
                    >
                        Morning
                    </option>

                    <option
                        value="Evening"
                        ${
                            record.shift === "Evening"
                                ? "selected"
                                : ""
                        }
                    >
                        Evening
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label>Cleaning Frequency</label>

                <input
                    class="form-control"
                    id="checklist-frequency"
                    value="${escape(record.frequency || "")}"
                    placeholder="Daily / Twice Daily / Weekly"
                >
            </div>

            <div class="form-group">
                <label>Opening Time</label>

                <input
                    class="form-control"
                    type="time"
                    id="checklist-opening"
                    value="${escape(record.openingTime || "")}"
                    readonly
                >
            </div>

            <div class="form-group">
                <label>Closing Time</label>

                <input
                    class="form-control"
                    type="time"
                    id="checklist-closing"
                    value="${escape(record.closingTime || "")}"
                    readonly
                >
            </div>

            <div class="form-group">
                <label>Task</label>

                <textarea
                    class="form-control"
                    id="checklist-task"
                    rows="3"
                    placeholder="Describe the operational task"
                >${escape(record.task || "")}</textarea>
            </div>

            <div class="form-group">
                <label>Remarks</label>

                <textarea
                    class="form-control"
                    id="checklist-remarks"
                    rows="3"
                    placeholder="Optional remarks"
                >${escape(record.remarks || "")}</textarea>
            </div>
        `;

        populateAmenityOptions(record.amenityId || "");

        const amenitySelect = get(
            "checklist-amenity-select"
        );

        if (amenitySelect) {
            amenitySelect.addEventListener(
                "change",
                handleAmenityChange
            );

            if (record.amenityId) {
                populateAmenityFields(record.amenityId);
            }
        }

        const saveButton = get("modalSaveButton");

        if (saveButton) {
            saveButton.onclick = function () {
                saveChecklist(index);
            };
        }

        openChecklistModalState(index);
    }

    /* =====================================================
       SAVE CHECKLIST
       ===================================================== */

    function saveChecklist(index) {
        const existing =
            index >= 0
                ? getRecords()[index]
                : null;

        const amenityId =
            get("checklist-amenity-id")
                ?.value
                .trim() || "";

        const selectedAmenity =
            findAmenity(amenityId);

        const record = {
            id:
                index >= 0
                    ? existing?.id || uid()
                    : uid(),

            date:
                index >= 0
                    ? existing?.date || today()
                    : today(),

            amenityId: amenityId,

            zone:
                selectedAmenity?.zone ||
                get("checklist-zone")
                    ?.value
                    .trim() ||
                "",

            amenity:
                selectedAmenity?.amenity ||
                get("checklist-amenity")
                    ?.value
                    .trim() ||
                "",

            responsible:
                selectedAmenity?.responsible ||
                get("checklist-responsible")
                    ?.value
                    .trim() ||
                "",

            shift:
                get("checklist-shift")?.value ||
                "Morning",

            frequency:
                get("checklist-frequency")
                    ?.value
                    .trim() ||
                "",

            openingTime:
                selectedAmenity?.openingTime ||
                get("checklist-opening")?.value ||
                "",

            closingTime:
                selectedAmenity?.closingTime ||
                get("checklist-closing")?.value ||
                "",

            task:
                get("checklist-task")
                    ?.value
                    .trim() ||
                "",

            remarks:
                get("checklist-remarks")
                    ?.value
                    .trim() ||
                "",

            status:
                index >= 0
                    ? existing?.status || STATUS.PENDING
                    : STATUS.PENDING,

            completedAt:
                index >= 0
                    ? existing?.completedAt || null
                    : null
        };

        if (!record.amenityId) {
            alert(
                "Please select an amenity from Amenity Master."
            );
            return;
        }

        if (!selectedAmenity) {
            alert(
                "The selected amenity could not be found in Amenity Master."
            );
            return;
        }

        if (!record.task) {
            alert("Task is required.");
            return;
        }

        if (!record.frequency) {
            alert("Cleaning Frequency is required.");
            return;
        }

        const oldRecord =
            index >= 0
                ? { ...getRecords()[index] }
                : null;

        if (index >= 0) {
            Data.update(
                COLLECTION,
                index,
                record
            );

            recordHistory(
                "Edited",
                record,
                {
                    previousStatus:
                        oldRecord?.status ||
                        STATUS.PENDING,

                    previousRecord: oldRecord
                }
            );
        } else {
            Data.add(
                COLLECTION,
                record
            );

            recordHistory(
                "Created",
                record
            );
        }

        closeChecklistModal();
        render();
    }

    /* =====================================================
       STATUS
       ===================================================== */

    function toggleStatus(index) {
        const record = getRecords()[index];

        if (!record) {
            return;
        }

        const previousStatus =
            record.status || STATUS.PENDING;

        const newStatus =
            previousStatus === STATUS.COMPLETED
                ? STATUS.PENDING
                : STATUS.COMPLETED;

        Data.update(
            COLLECTION,
            index,
            {
                status: newStatus,

                completedAt:
                    newStatus === STATUS.COMPLETED
                        ? now()
                        : null
            }
        );

        recordHistory(
            "Status Changed",
            {
                ...record,
                status: newStatus
            },
            {
                previousStatus: previousStatus,
                newStatus: newStatus
            }
        );

        renderCards();
    }

    /* =====================================================
       DELETE
       ===================================================== */

    function deleteRecord(index) {
        const record = getRecords()[index];

        if (!record) {
            return;
        }

        if (
            !confirm(
                `Delete checklist task "${
                    record.task ||
                    record.amenity ||
                    "record"
                }"?`
            )
        ) {
            return;
        }

        recordHistory(
            "Deleted",
            record
        );

        Data.remove(
            COLLECTION,
            index
        );

        renderCards();
    }

    /* =====================================================
       RESET DAY
       ===================================================== */

    function resetDay() {
        const records = getRecords();

        if (!records.length) {
            return;
        }

        if (
            !confirm(
                "Reset all checklist tasks to Pending?"
            )
        ) {
            return;
        }

        records.forEach(function (record, index) {
            const previousStatus =
                record.status || STATUS.PENDING;

            if (
                previousStatus !== STATUS.PENDING
            ) {
                Data.update(
                    COLLECTION,
                    index,
                    {
                        status: STATUS.PENDING,
                        completedAt: null
                    }
                );

                recordHistory(
                    "Reset",
                    {
                        ...record,
                        status: STATUS.PENDING
                    },
                    {
                        previousStatus: previousStatus,
                        newStatus: STATUS.PENDING
                    }
                );
            }
        });

        renderCards();
    }

    /* =====================================================
       CURRENT CARD ACTIONS
       ===================================================== */

    function handleAction(event) {
        const button = event.target.closest(
            "[data-action]"
        );

        if (!button) {
            return;
        }

        const action = button.dataset.action;

        const index = Number(
            button.dataset.index
        );

        if (
            !Number.isInteger(index) ||
            index < 0
        ) {
            return;
        }

        if (action === "toggle") {
            toggleStatus(index);
        }

        if (action === "edit") {
            openEditForm(index);
        }

        if (action === "delete") {
            deleteRecord(index);
        }
    }

    /* =====================================================
       HISTORY VIEW
       ===================================================== */

    function renderHistory() {
        const container = get("tab-control");

        if (!container) {
            return;
        }

        const history = getHistory();

        container.innerHTML = `
            <div class="card">

                <div class="card-header checklist-header">

                    <div>
                        <h3>Checklist History</h3>

                        <div class="checklist-subtitle">
                            Historical record of checklist
                            creation, edits, status changes,
                            resets and deletions.
                        </div>
                    </div>

                    <button
                        class="btn btn-primary"
                        type="button"
                        id="checklistBackButton"
                    >
                        ← Current Checklist
                    </button>

                </div>

                <div class="checklist-history-filters">

                    <input
                        id="historySearch"
                        class="form-control"
                        type="search"
                        placeholder="Search amenity, ID, zone, task or responsible"
                    >

                    <input
                        id="historyDate"
                        class="form-control"
                        type="date"
                    >

                    <input
                        id="historyAmenityId"
                        class="form-control"
                        type="search"
                        placeholder="Amenity ID"
                    >

                    <input
                        id="historyZone"
                        class="form-control"
                        type="search"
                        placeholder="Zone"
                    >

                    <input
                        id="historyResponsible"
                        class="form-control"
                        type="search"
                        placeholder="Responsible"
                    >

                    <select
                        id="historyStatus"
                        class="form-control"
                    >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                    </select>

                    <select
                        id="historyAction"
                        class="form-control"
                    >
                        <option value="all">All Actions</option>
                        <option value="Created">Created</option>
                        <option value="Edited">Edited</option>
                        <option value="Status Changed">
                            Status Changed
                        </option>
                        <option value="Reset">Reset</option>
                        <option value="Deleted">Deleted</option>
                    </select>

                </div>

                <div
                    class="checklist-history-count"
                    id="historyCount"
                >
                    0 history records
                </div>

                <div
                    id="checklist-history-container"
                    class="checklist-history-container"
                ></div>

            </div>
        `;

        bindHistoryEvents();
        applyHistoryFilters();
    }

    function bindHistoryEvents() {
        get("checklistBackButton")?.addEventListener(
            "click",
            render
        );

        [
            "historySearch",
            "historyDate",
            "historyAmenityId",
            "historyZone",
            "historyResponsible",
            "historyStatus",
            "historyAction"
        ].forEach(function (id) {
            const element = get(id);

            if (!element) {
                return;
            }

            element.addEventListener(
                "input",
                applyHistoryFilters
            );

            element.addEventListener(
                "change",
                applyHistoryFilters
            );
        });
    }

    function applyHistoryFilters() {
        const history = getHistory();

        const search =
            get("historySearch")
                ?.value
                .trim()
                .toLowerCase() || "";

        const date =
            get("historyDate")?.value || "";

        const amenityId =
            get("historyAmenityId")
                ?.value
                .trim()
                .toLowerCase() || "";

        const zone =
            get("historyZone")
                ?.value
                .trim()
                .toLowerCase() || "";

        const responsible =
            get("historyResponsible")
                ?.value
                .trim()
                .toLowerCase() || "";

        const status =
            get("historyStatus")?.value || "all";

        const action =
            get("historyAction")?.value || "all";

        const filtered = history.filter(function (record) {
            const searchable = [
                record.amenityId,
                record.amenity,
                record.zone,
                record.responsible,
                record.task,
                record.remarks
            ]
                .join(" ")
                .toLowerCase();

            return (
                (!search || searchable.includes(search)) &&

                (
                    !date ||
                    record.historyDate === date
                ) &&

                (
                    !amenityId ||
                    String(record.amenityId || "")
                        .toLowerCase()
                        .includes(amenityId)
                ) &&

                (
                    !zone ||
                    String(record.zone || "")
                        .toLowerCase()
                        .includes(zone)
                ) &&

                (
                    !responsible ||
                    String(record.responsible || "")
                        .toLowerCase()
                        .includes(responsible)
                ) &&

                (
                    status === "all" ||
                    record.status === status
                ) &&

                (
                    action === "all" ||
                    record.action === action
                )
            );
        });

        const container = get(
            "checklist-history-container"
        );

        if (!container) {
            return;
        }

        setText(
            "historyCount",
            `${filtered.length} history record${
                filtered.length === 1 ? "" : "s"
            }`
        );

        if (!filtered.length) {
            container.innerHTML = `
                <div class="dashboard-empty">
                    ${
                        history.length
                            ? "No matching checklist history found."
                            : "No checklist history has been recorded yet."
                    }
                </div>
            `;

            return;
        }

        container.innerHTML = filtered
            .map(createHistoryCard)
            .join("");
    }

    function createHistoryCard(record) {
        const dateTime = record.timestamp
            ? new Date(record.timestamp).toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            )
            : "—";

        const transition =
            record.action === "Status Changed" ||
            record.action === "Reset"
                ? `
                    <div class="history-transition">
                        <span>
                            ${escape(
                                record.previousStatus || "—"
                            )}
                        </span>

                        <strong>→</strong>

                        <span>
                            ${escape(
                                record.newStatus ||
                                record.status ||
                                "—"
                            )}
                        </span>
                    </div>
                `
                : "";

        return `
            <article class="checklist-history-card">

                <div class="checklist-history-top">

                    <div>
                        <div class="checklist-history-date">
                            ${escape(dateTime)}
                        </div>

                        <h4>
                            ${escape(
                                record.amenity ||
                                "Checklist Task"
                            )}
                        </h4>
                    </div>

                    <span class="tag">
                        ${escape(record.action || "—")}
                    </span>

                </div>

                <div class="checklist-history-grid">

                    <div>
                        <span>Amenity ID</span>
                        <strong>
                            ${escape(record.amenityId || "—")}
                        </strong>
                    </div>

                    <div>
                        <span>Zone</span>
                        <strong>
                            ${escape(record.zone || "—")}
                        </strong>
                    </div>

                    <div>
                        <span>Responsible</span>
                        <strong>
                            ${escape(record.responsible || "—")}
                        </strong>
                    </div>

                    <div>
                        <span>Status</span>
                        <strong>
                            ${escape(record.status || "—")}
                        </strong>
                    </div>

                </div>

                ${transition}

                <div class="checklist-history-task">
                    <span>Task</span>

                    <div>
                        ${escape(record.task || "—")}
                    </div>
                </div>

                ${
                    record.remarks
                        ? `
                            <div class="checklist-history-task">
                                <span>Remarks</span>

                                <div>
                                    ${escape(record.remarks)}
                                </div>
                            </div>
                        `
                        : ""
                }

            </article>
        `;
    }

    /* =====================================================
       LIFECYCLE
       ===================================================== */

    let initialized = false;

    function init() {
        const tab = get("tab-control");

        if (!tab) {
            return;
        }

        if (initialized) {
            return;
        }

        tab.addEventListener(
            "click",
            handleAction
        );

        initialized = true;
    }

    function destroy() {
        const tab = get("tab-control");

        if (tab && initialized) {
            tab.removeEventListener(
                "click",
                handleAction
            );
        }

        initialized = false;
    }

    /* =====================================================
       PUBLIC MODULE
       ===================================================== */

    if (typeof window.registerFXModule === "function") {
        window.registerFXModule(
            "control",
            {
                init: init,
                render: render,
                destroy: destroy
            }
        );
    } else {
        console.error(
            "Facility Executive OS: registerFXModule is unavailable."
        );
    }

})();