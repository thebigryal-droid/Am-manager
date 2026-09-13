/* =========================================================
   FACILITY EXECUTIVE OS
   PHASE 4 — AMENITY MASTER
   CENTRAL AMENITY SOURCE FOR ALL MODULES
   ========================================================= */

(function () {

    "use strict";

    const FX = window.FX;
    const Data = window.FXData;

    const COLLECTION = "amenities";
    const HISTORY = "amenity_history";

    const STATUS = {
        OPERATIONAL: "Operational",
        MAINTENANCE: "Maintenance",
        CLOSED: "Closed"
    };

    /* =====================================================
       PRELOADED AMENITY MASTER
       TOTAL: 47 AMENITIES
       ===================================================== */

    const PRELOADED_AMENITIES = [
        ["PAV-001", "Podium", "Podium Multipurpose Court"],
        ["PAV-002", "Podium", "Podium Spectator Plaza"],
        ["PAV-003", "Podium", "Podium Indoor Badminton"],
        ["PAV-004", "Podium", "Podium Amphitheatre"],
        ["PAV-005", "Podium", "Podium Toddler's Play Area"],
        ["PAV-006", "Podium", "Podium Kids Play Area"],
        ["PAV-007", "Podium", "Podium Trampoline Park"],
        ["PAV-008", "Podium", "Podium Parents Seating Area"],
        ["PAV-009", "Podium", "Podium Open Turf"],
        ["PAV-010", "Podium", "Podium Floral Gardens"],

        ["STL-001", "Stilt", "Stilt Club House"],
        ["STL-002", "Stilt", "Stilt Gym"],
        ["STL-003", "Stilt", "Stilt CrossFit Area"],
        ["STL-004", "Stilt", "Stilt Conference Room"],
        ["STL-005", "Stilt", "Stilt Mini Theatre"],
        ["STL-006", "Stilt", "Stilt Infinity Swimming Pool"],
        ["STL-007", "Stilt", "Stilt Kids Pool"],
        ["STL-008", "Stilt", "Stilt Massage Room"],
        ["STL-009", "Stilt", "Stilt Sundowner Party Zone"],
        ["STL-010", "Stilt", "Stilt Viewing Deck"],
        ["STL-011", "Stilt", "Stilt Senior Citizen Area"],
        ["STL-012", "Stilt", "Stilt Skating Rink"],
        ["STL-013", "Stilt", "Stilt Box Cricket"],
        ["STL-014", "Stilt", "Stilt Mini Golf"],
        ["STL-015", "Stilt", "Stilt Banquet Hall"],
        ["STL-016", "Stilt", "Stilt Celebration Lawn"],
        ["STL-017", "Stilt", "Stilt Barbeque Area"],
        ["STL-018", "Stilt", "Stilt Guest Room 1"],
        ["STL-019", "Stilt", "Stilt Guest Room 2"],
        ["STL-020", "Stilt", "Stilt Guest Room 3"],
        ["STL-021", "Stilt", "Stilt Guest Room 4"],

        ["SKY-001", "Top Floor", "Top Floor Yoga & Meditation Deck"],
        ["SKY-002", "Top Floor", "Top Floor Hammock Plaza"],
        ["SKY-003", "Top Floor", "Top Floor Party Deck"],
        ["SKY-004", "Top Floor", "Top Floor Mini Serving Counter"],
        ["SKY-005", "Top Floor", "Top Floor Ball Pool Area"],
        ["SKY-006", "Top Floor", "Top Floor Air Hockey"],
        ["SKY-007", "Top Floor", "Top Floor PlayStation Zone"],
        ["SKY-008", "Top Floor", "Top Floor Mini Futsal Area"],
        ["SKY-009", "Top Floor", "Top Floor Indoor Games Area"],
        ["SKY-010", "Top Floor", "Top Floor Carrom"],
        ["SKY-011", "Top Floor", "Top Floor Cards"],
        ["SKY-012", "Top Floor", "Top Floor Snooker"],
        ["SKY-013", "Top Floor", "Top Floor Dance Studio"],
        ["SKY-014", "Top Floor", "Top Floor Arts & Craft Room"],
        ["SKY-015", "Top Floor", "Top Floor Toddler's Play Area"],
        ["SKY-016", "Top Floor", "Top Floor Creche"]
    ];

    /* =====================================================
       HELPERS
       ===================================================== */

    function get(id) {
        return document.getElementById(id);
    }

    function uid() {
        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 9)
        );
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

    function getRecords() {
        if (!Data || typeof Data.get !== "function") {
            return [];
        }

        const records = Data.get(COLLECTION);

        return Array.isArray(records) ? records : [];
    }

    function getHistory() {
        if (!Data || typeof Data.get !== "function") {
            return [];
        }

        const history = Data.get(HISTORY);

        return Array.isArray(history) ? history : [];
    }

    function closeModal() {
        if (typeof window.closeModal === "function") {
            window.closeModal();
            return;
        }

        const modal = get("formModal");

        if (!modal) {
            return;
        }

        modal.classList.remove("active");
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
    }

    function isActiveModule() {
        if (!FX || !FX.state || !FX.state.activeTab) {
            return true;
        }

        return FX.state.activeTab === "amenities";
    }

    /* =====================================================
       PRELOAD DATA
       ===================================================== */

    function seedPreloadedAmenities() {
        if (
            !Data ||
            typeof Data.get !== "function" ||
            typeof Data.set !== "function"
        ) {
            return;
        }

        const existing = Data.get(COLLECTION);

        if (Array.isArray(existing) && existing.length > 0) {
            return;
        }

        const records = PRELOADED_AMENITIES.map(
            ([amenityId, zone, amenity]) => ({
                id: uid(),
                amenityId,
                zone,
                amenity,
                type: "Facility",
                responsible: "Abis Rizvi",
                status: STATUS.OPERATIONAL,
                openingTime: "",
                closingTime: "",
                openingTime: "",
                closingTime: "",
                notes: "",
                createdAt: now(),
                updatedAt: now()
            })
        );

        Data.set(COLLECTION, records);
    }

    /* =====================================================
       HISTORY
       ===================================================== */

    function recordHistory(action, record, extra = {}) {
        if (
            !record ||
            !Data ||
            typeof Data.add !== "function"
        ) {
            return;
        }

        Data.add(HISTORY, {
            id: uid(),
            historyDate: today(),
            timestamp: now(),
            action,

            recordId: record.id || "",
            amenityId: record.amenityId || "",
            zone: record.zone || "",
            amenity: record.amenity || "",
            type: record.type || "",
            responsible: record.responsible || "",
            status: record.status || STATUS.OPERATIONAL,
            openingTime: record.openingTime || "",
            closingTime: record.closingTime || "",
            notes: record.notes || "",

            ...extra
        });
    }

    /* =====================================================
       MAIN RENDER
       ===================================================== */

    function render() {
        seedPreloadedAmenities();

        if (!isActiveModule()) {
            return;
        }

        const container = get("tab-amenities");

        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="card">

                <div class="card-header amenity-header">

                    <div>
                        <h3>Amenity Master</h3>

                        <div class="amenity-subtitle">
                            Central facility reference used by all
                            operational modules.
                        </div>
                    </div>

                    <div class="flex-gap">

                        <button
                            class="btn"
                            type="button"
                            id="amenityHistoryButton"
                        >
                            History
                        </button>

                        <button
                            class="btn btn-primary"
                            type="button"
                            id="amenityAddButton"
                        >
                            + Add Amenity
                        </button>

                    </div>

                </div>

                <div class="amenity-summary">

                    <div class="amenity-summary-card">
                        <span>Total Amenities</span>
                        <strong id="amenity-total">0</strong>
                    </div>

                    <div class="amenity-summary-card">
                        <span>Operational</span>
                        <strong id="amenity-operational">0</strong>
                    </div>

                    <div class="amenity-summary-card">
                        <span>Maintenance</span>
                        <strong id="amenity-maintenance">0</strong>
                    </div>

                    <div class="amenity-summary-card">
                        <span>Closed</span>
                        <strong id="amenity-closed">0</strong>
                    </div>

                </div>

                <div class="amenity-toolbar">

                    <input
                        id="amenitySearch"
                        class="form-control"
                        type="search"
                        placeholder="Search ID, amenity, zone or responsible"
                    >

                    <select
                        id="amenityStatusFilter"
                        class="form-control"
                    >
                        <option value="all">All Status</option>
                        <option value="Operational">Operational</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Closed">Closed</option>
                    </select>

                    <select
                        id="amenityTypeFilter"
                        class="form-control"
                    >
                        <option value="all">All Types</option>
                    </select>

                </div>

                <div
                    id="amenity-master-container"
                    class="amenity-master-container"
                ></div>

            </div>
        `;

        get("amenityAddButton")?.addEventListener(
            "click",
            openAddForm
        );

        get("amenityHistoryButton")?.addEventListener(
            "click",
            renderHistory
        );

        get("amenitySearch")?.addEventListener(
            "input",
            renderCards
        );

        get("amenityStatusFilter")?.addEventListener(
            "change",
            renderCards
        );

        get("amenityTypeFilter")?.addEventListener(
            "change",
            renderCards
        );

        renderTypeFilter();
        renderCards();
    }

    /* =====================================================
       TYPE FILTER
       ===================================================== */

    function renderTypeFilter() {
        const select = get("amenityTypeFilter");

        if (!select) {
            return;
        }

        const current = select.value;

        const types = [
            ...new Set(
                getRecords()
                    .map(record => record.type)
                    .filter(Boolean)
            )
        ].sort();

        select.innerHTML = `
            <option value="all">All Types</option>

            ${types.map(type => `
                <option value="${escape(type)}">
                    ${escape(type)}
                </option>
            `).join("")}
        `;

        if (types.includes(current)) {
            select.value = current;
        }
    }

    /* =====================================================
       CARD LIST
       ===================================================== */

    function renderCards() {
        const container = get("amenity-master-container");

        if (!container) {
            return;
        }

        const search =
            get("amenitySearch")?.value
                .trim()
                .toLowerCase() || "";

        const status =
            get("amenityStatusFilter")?.value || "all";

        const type =
            get("amenityTypeFilter")?.value || "all";

        const allRecords = getRecords();

        const records = allRecords.filter(record => {
            const searchable = [
                record.amenityId,
                record.zone,
                record.amenity,
                record.type,
                record.responsible,
                record.status,
                record.notes
            ]
                .join(" ")
                .toLowerCase();

            const recordStatus =
                record.status || STATUS.OPERATIONAL;

            return (
                (!search || searchable.includes(search)) &&
                (status === "all" || recordStatus === status) &&
                (
                    type === "all" ||
                    (record.type || "") === type
                )
            );
        });

        updateSummary(allRecords);

        if (!records.length) {
            container.innerHTML = `
                <div class="dashboard-empty">
                    No amenities found.
                </div>
            `;

            return;
        }

        container.innerHTML = records
            .map(createCard)
            .join("");
    }

    function createCard(record) {
        const index = getRecords().indexOf(record);

        const status =
            record.status || STATUS.OPERATIONAL;

        return `
            <article class="amenity-master-card">

                <div class="amenity-master-top">

                    <div>
                        <div class="amenity-master-id">
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

                <div class="amenity-master-grid">

                    <div>
                        <span>Zone</span>
                        <strong>
                            ${escape(record.zone || "—")}
                        </strong>
                    </div>

                    <div>
                        <span>Type</span>
                        <strong>
                            ${escape(record.type || "—")}
                        </strong>
                    </div>

                    <div>
                        <span>Responsible</span>
                        <strong>
                            ${escape(record.responsible || "Abis Rizvi")}
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

                ${
                    record.notes
                        ? `
                            <div class="amenity-master-notes">
                                <span>Notes</span>
                                <div>${escape(record.notes)}</div>
                            </div>
                        `
                        : ""
                }

                <div class="amenity-master-actions">

                    <button
                        class="btn"
                        type="button"
                        data-amenity-edit="${index}"
                    >
                        Edit
                    </button>

                    <button
                        class="btn btn-danger"
                        type="button"
                        data-amenity-delete="${index}"
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
        const operational = records.filter(record =>
            (
                record.status || STATUS.OPERATIONAL
            ) === STATUS.OPERATIONAL
        ).length;

        const maintenance = records.filter(record =>
            (
                record.status || STATUS.OPERATIONAL
            ) === STATUS.MAINTENANCE
        ).length;

        const closed = records.filter(record =>
            (
                record.status || STATUS.OPERATIONAL
            ) === STATUS.CLOSED
        ).length;

        setText("amenity-total", records.length);
        setText("amenity-operational", operational);
        setText("amenity-maintenance", maintenance);
        setText("amenity-closed", closed);
    }

    /* =====================================================
       FORM
       ===================================================== */

    function openAddForm() {
        openForm();
    }

    function openEditForm(index) {
        const record = getRecords()[index];

        if (!record) {
            return;
        }

        openForm(record, index);
    }

    function openForm(record = {}, index = -1) {
        const modal = get("formModal");
        const title = get("modalTitle");
        const body = get("modalBody");

        if (!modal || !title || !body) {
            return;
        }

        title.textContent =
            index >= 0 ? "Edit Amenity" : "Add Amenity";

        body.innerHTML = `
            <div class="form-grid">

                <div class="form-group">
                    <label for="amenity-form-id">
                        Amenity ID
                    </label>

                    <input
                        class="form-control"
                        id="amenity-form-id"
                        value="${escape(record.amenityId || "")}"
                        placeholder="e.g. STL-001"
                    >
                </div>

                <div class="form-group">
                    <label for="amenity-form-zone">
                        Zone
                    </label>

                    <input
                        class="form-control"
                        id="amenity-form-zone"
                        value="${escape(record.zone || "")}"
                        placeholder="e.g. Stilt"
                    >
                </div>

                <div class="form-group">
                    <label for="amenity-form-name">
                        Amenity Name
                    </label>

                    <input
                        class="form-control"
                        id="amenity-form-name"
                        value="${escape(record.amenity || "")}"
                        placeholder="e.g. Conference Room"
                    >
                </div>

                <div class="form-group">
                    <label for="amenity-form-type">
                        Amenity Type
                    </label>

                    <input
                        class="form-control"
                        id="amenity-form-type"
                        value="${escape(record.type || "Facility")}"
                        placeholder="e.g. Recreation"
                    >
                </div>

                <div class="form-group">
                    <label for="amenity-form-responsible">
                        Responsible
                    </label>

                    <input
                        class="form-control"
                        id="amenity-form-responsible"
                        value="${escape(record.responsible || "")}"
                        placeholder="Responsible person"
                    >
                </div>

                <div class="form-group">
                    <label for="amenity-form-status">
                        Operational Status
                    </label>

                    <select
                        class="form-control"
                        id="amenity-form-status"
                    >
                        <option
                            value="Operational"
                            ${
                                (
                                    record.status ||
                                    STATUS.OPERATIONAL
                                ) === STATUS.OPERATIONAL
                                    ? "selected"
                                    : ""
                            }
                        >
                            Operational
                        </option>

                        <option
                            value="Maintenance"
                            ${
                                record.status === STATUS.MAINTENANCE
                                    ? "selected"
                                    : ""
                            }
                        >
                            Maintenance
                        </option>

                        <option
                            value="Closed"
                            ${
                                record.status === STATUS.CLOSED
                                    ? "selected"
                                    : ""
                            }
                        >
                            Closed
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="amenity-form-opening">
                        Opening Time
                    </label>

                    <input
                        class="form-control"
                        type="time"
                        id="amenity-form-opening"
                        value="${escape(record.openingTime || "")}"
                    >
                </div>

                <div class="form-group">
                    <label for="amenity-form-closing">
                        Closing Time
                    </label>

                    <input
                        class="form-control"
                        type="time"
                        id="amenity-form-closing"
                        value="${escape(record.closingTime || "")}"
                    >
                </div>

            </div>

            <div class="form-group">
                <label for="amenity-form-notes">
                    Notes
                </label>

                <textarea
                    class="form-control"
                    id="amenity-form-notes"
                    rows="3"
                    placeholder="Optional facility notes"
                >${escape(record.notes || "")}</textarea>
            </div>
        `;

        const saveButton = get("modalSaveButton");

        if (saveButton) {
            saveButton.onclick = function () {
                save(index);
            };
        }

        if (typeof window.openModal === "function") {
            window.openModal("amenities", index);
        } else {
            modal.classList.add("active");
            modal.classList.remove("hidden");
            modal.setAttribute("aria-hidden", "false");
            modal.dataset.type = "amenities";
            modal.dataset.index = String(index);
        }
    }

    /* =====================================================
       SAVE
       ===================================================== */

    function save(index) {
        if (!Data) {
            alert("Amenity data service is unavailable.");
            return;
        }

        const amenityId =
            get("amenity-form-id")?.value.trim() || "";

        const zone =
            get("amenity-form-zone")?.value.trim() || "";

        const amenity =
            get("amenity-form-name")?.value.trim() || "";

        const type =
            get("amenity-form-type")?.value.trim() || "";

        const responsible =
            get("amenity-form-responsible")?.value.trim() || "";

        const status =
            get("amenity-form-status")?.value ||
            STATUS.OPERATIONAL;

        const openingTime =
            get("amenity-form-opening")?.value || "";

        const closingTime =
            get("amenity-form-closing")?.value || "";

        const notes =
            get("amenity-form-notes")?.value.trim() || "";

        if (!amenityId) {
            alert("Amenity ID is required.");
            return;
        }

        if (!zone) {
            alert("Zone is required.");
            return;
        }

        if (!amenity) {
            alert("Amenity name is required.");
            return;
        }

        const records = getRecords();

        const duplicate = records.some(
            (record, recordIndex) => {
                return (
                    recordIndex !== index &&
                    String(record.amenityId || "")
                        .trim()
                        .toLowerCase() ===
                    amenityId.trim().toLowerCase()
                );
            }
        );

        if (duplicate) {
            alert("This Amenity ID already exists.");
            return;
        }

        const oldRecord =
            index >= 0
                ? { ...records[index] }
                : null;

        const record = {
            id: oldRecord?.id || uid(),
            amenityId,
            zone,
            amenity,
            type,
            responsible,
            status,
            openingTime,
            closingTime,
            notes,
            createdAt: oldRecord?.createdAt || now(),
            updatedAt: now()
        };

        try {
            if (index >= 0) {
                if (typeof Data.update !== "function") {
                    throw new Error("Data.update is unavailable.");
                }

                Data.update(
                    COLLECTION,
                    index,
                    record
                );

                recordHistory(
                    "Edited",
                    record,
                    {
                        previousRecord: oldRecord
                    }
                );
            } else {
                if (typeof Data.add !== "function") {
                    throw new Error("Data.add is unavailable.");
                }

                Data.add(
                    COLLECTION,
                    record
                );

                recordHistory(
                    "Created",
                    record
                );
            }

            closeModal();
            render();

        } catch (error) {
            console.error("Amenity save failed:", error);

            alert(
                "Unable to save amenity. Check the browser console."
            );
        }
    }

    /* =====================================================
       DELETE
       ===================================================== */

    function remove(index) {
        const record = getRecords()[index];

        if (!record) {
            return;
        }

        const confirmed = confirm(
            `Delete "${record.amenity || "amenity"}" ` +
            `(${record.amenityId || "no ID"})?`
        );

        if (!confirmed) {
            return;
        }

        try {
            recordHistory(
                "Deleted",
                record
            );

            if (typeof Data.remove !== "function") {
                throw new Error("Data.remove is unavailable.");
            }

            Data.remove(
                COLLECTION,
                index
            );

            render();

        } catch (error) {
            console.error(
                "Amenity deletion failed:",
                error
            );

            alert(
                "Unable to delete amenity. Check the browser console."
            );
        }
    }

    /* =====================================================
       HISTORY
       ===================================================== */

    function renderHistory() {
        const container = get("tab-amenities");

        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="card">

                <div class="card-header amenity-header">

                    <div>
                        <h3>Amenity Master History</h3>

                        <div class="amenity-subtitle">
                            Historical record of amenity creation,
                            edits and deletions.
                        </div>
                    </div>

                    <button
                        class="btn btn-primary"
                        type="button"
                        id="amenityBackButton"
                    >
                        ← Amenity Master
                    </button>

                </div>

                <div class="amenity-history-filters">

                    <input
                        id="amenityHistorySearch"
                        class="form-control"
                        type="search"
                        placeholder="Search amenity, ID, zone or responsible"
                    >

                    <input
                        id="amenityHistoryDate"
                        class="form-control"
                        type="date"
                    >

                    <select
                        id="amenityHistoryAction"
                        class="form-control"
                    >
                        <option value="all">All Actions</option>
                        <option value="Created">Created</option>
                        <option value="Edited">Edited</option>
                        <option value="Deleted">Deleted</option>
                    </select>

                </div>

                <div
                    id="amenityHistoryCount"
                    class="amenity-history-count"
                >
                    0 history records
                </div>

                <div
                    id="amenity-history-container"
                    class="amenity-history-container"
                ></div>

            </div>
        `;

        get("amenityBackButton")?.addEventListener(
            "click",
            render
        );

        [
            "amenityHistorySearch",
            "amenityHistoryDate",
            "amenityHistoryAction"
        ].forEach(id => {
            get(id)?.addEventListener(
                "input",
                applyHistoryFilters
            );

            get(id)?.addEventListener(
                "change",
                applyHistoryFilters
            );
        });

        applyHistoryFilters();
    }

    function applyHistoryFilters() {
        const history = getHistory();

        const search =
            get("amenityHistorySearch")?.value
                .trim()
                .toLowerCase() || "";

        const date =
            get("amenityHistoryDate")?.value || "";

        const action =
            get("amenityHistoryAction")?.value || "all";

        const filtered = history.filter(record => {
            const searchable = [
                record.amenityId,
                record.amenity,
                record.zone,
                record.type,
                record.responsible,
                record.notes
            ]
                .join(" ")
                .toLowerCase();

            return (
                (!search || searchable.includes(search)) &&
                (!date || record.historyDate === date) &&
                (
                    action === "all" ||
                    record.action === action
                )
            );
        });

        const container = get(
            "amenity-history-container"
        );

        if (!container) {
            return;
        }

        setText(
            "amenityHistoryCount",
            `${filtered.length} history record${
                filtered.length === 1 ? "" : "s"
            }`
        );

        if (!filtered.length) {
            container.innerHTML = `
                <div class="dashboard-empty">
                    No matching amenity history found.
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

        return `
            <article class="amenity-history-card">

                <div class="amenity-history-top">

                    <div>
                        <div class="amenity-history-date">
                            ${escape(dateTime)}
                        </div>

                        <h4>
                            ${escape(record.amenity || "Amenity")}
                        </h4>
                    </div>

                    <span class="tag">
                        ${escape(record.action || "—")}
                    </span>

                </div>

                <div class="amenity-history-grid">

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
                        <span>Type</span>
                        <strong>
                            ${escape(record.type || "—")}
                        </strong>
                    </div>

                    <div>
                        <span>Status</span>
                        <strong>
                            ${escape(record.status || "—")}
                        </strong>
                    </div>

                    <div>
                        <span>Responsible</span>
                        <strong>
                            ${escape(record.responsible || "—")}
                        </strong>
                    </div>

                </div>

                ${
                    record.notes
                        ? `
                            <div class="amenity-master-notes">
                                <span>Notes</span>
                                <div>${escape(record.notes)}</div>
                            </div>
                        `
                        : ""
                }

            </article>
        `;
    }

    /* =====================================================
       EVENT DELEGATION
       ===================================================== */

    function bindEvents() {
        const container = get("tab-amenities");

        if (!container || container.dataset.bound === "true") {
            return;
        }

        container.dataset.bound = "true";

        container.addEventListener("click", event => {
            const editButton =
                event.target.closest("[data-amenity-edit]");

            if (editButton) {
                openEditForm(
                    Number(editButton.dataset.amenityEdit)
                );

                return;
            }

            const deleteButton =
                event.target.closest("[data-amenity-delete]");

            if (deleteButton) {
                remove(
                    Number(deleteButton.dataset.amenityDelete)
                );
            }
        });
    }

    /* =====================================================
       LIFECYCLE
       ===================================================== */

    function init() {
        seedPreloadedAmenities();
        bindEvents();
    }

    function destroy() {
        const container = get("tab-amenities");

        if (container) {
            container.dataset.bound = "false";
        }
    }

    /* =====================================================
       MODULE REGISTRATION
       ===================================================== */

    if (typeof window.registerFXModule === "function") {
        window.registerFXModule(
            "amenities",
            {
                init,
                render,
                destroy
            }
        );
    }

    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.FXAmenities = {
        get,
        getAll: getRecords,

        getById: function (amenityId) {
            return getRecords().find(
                record =>
                    String(record.amenityId || "")
                        .trim()
                        .toLowerCase() ===
                    String(amenityId || "")
                        .trim()
                        .toLowerCase()
            ) || null;
        },

        getByName: function (amenityName) {
            return getRecords().find(
                record =>
                    String(record.amenity || "")
                        .trim()
                        .toLowerCase() ===
                    String(amenityName || "")
                        .trim()
                        .toLowerCase()
            ) || null;
        },

        edit: openEditForm,
        remove,
        render,
        refresh: render,
        seed: seedPreloadedAmenities
    };

})();