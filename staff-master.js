/* =========================================================
   FACILITY EXECUTIVE OS
   STAFF MASTER MODULE
   ========================================================= */

(function () {

    "use strict";


    const FX = window.FX || {};
    const Data = window.FXData || {};


    const COLLECTION = "staff_master";


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

        if (
            !Data ||
            typeof Data.get !== "function"
        ) {

            return [];

        }


        const records =
            Data.get(COLLECTION);


        return Array.isArray(records)
            ? records
            : [];

    }


    function now() {

        return new Date().toISOString();

    }


    function uid() {

        return "ST-" +
            Date.now().toString(36).toUpperCase() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 7)
                .toUpperCase();

    }


    function esc(value) {

        if (typeof window.escapeHtml === "function") {

            return window.escapeHtml(
                value == null
                    ? ""
                    : String(value)
            );

        }


        return String(
            value == null
                ? ""
                : value
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function getActiveTab() {

        return (
            FX &&
            FX.state &&
            FX.state.activeTab
        ) || "";

    }


    function isModuleActive() {

        const activeTab =
            getActiveTab();


        return (
            !activeTab ||
            activeTab === COLLECTION
        );

    }


    function cleanupListeners() {

        listeners.forEach(function (item) {

            if (
                item &&
                item.element &&
                item.event &&
                item.handler
            ) {

                item.element.removeEventListener(
                    item.event,
                    item.handler
                );

            }

        });


        listeners = [];

    }


    function listen(
        element,
        event,
        handler
    ) {

        if (
            !element ||
            typeof element.addEventListener !== "function"
        ) {

            return;

        }


        element.addEventListener(
            event,
            handler
        );


        listeners.push({

            element,

            event,

            handler

        });

    }


    function getElementValue(id) {

        const element =
            document.getElementById(id);


        return element
            ? element.value
            : "";

    }


    function setElementValue(
        id,
        value
    ) {

        const element =
            document.getElementById(id);


        if (element) {

            element.value =
                value == null
                    ? ""
                    : String(value);

        }

    }


    function getRecordValue(
        record,
        keys,
        fallback
    ) {

        if (!record) {

            return fallback || "";

        }


        for (
            let i = 0;
            i < keys.length;
            i++
        ) {

            const value =
                record[keys[i]];


            if (
                value !== undefined &&
                value !== null
            ) {

                return value;

            }

        }


        return fallback || "";

    }


    /* =====================================================
       MODULE HTML
       ===================================================== */

    function render() {

        const root =
            document.getElementById(
                "tab-staff_master"
            );


        if (!root) return;


        cleanupListeners();


        root.innerHTML = `

            <div class="staff-module">

                <div class="staff-header">

                    <div>

                        <div class="staff-eyebrow">
                            STAFF MANAGEMENT
                        </div>

                        <h2>
                            Staff Master
                        </h2>

                        <p>
                            Maintain the central staff
                            directory used by operational
                            modules throughout the facility.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="btn btn-primary"
                        id="staff-add-btn"
                    >
                        + Add Staff
                    </button>

                </div>


                <div class="staff-summary">

                    <div class="staff-kpi">

                        <span>
                            Total Staff
                        </span>

                        <strong id="staff-total">
                            0
                        </strong>

                    </div>


                    <div class="staff-kpi">

                        <span>
                            Active
                        </span>

                        <strong id="staff-active">
                            0
                        </strong>

                    </div>


                    <div class="staff-kpi">

                        <span>
                            Inactive
                        </span>

                        <strong id="staff-inactive">
                            0
                        </strong>

                    </div>


                    <div class="staff-kpi">

                        <span>
                            Departments
                        </span>

                        <strong id="staff-departments">
                            0
                        </strong>

                    </div>

                </div>


                <div class="staff-toolbar">

                    <div class="staff-search">

                        <input
                            type="search"
                            id="staff-search"
                            placeholder="Search staff, department, designation or ID..."
                        >

                    </div>


                    <div class="staff-filters">

                        <select
                            id="staff-department-filter"
                        >

                            <option value="">
                                All Departments
                            </option>

                        </select>


                        <select
                            id="staff-status-filter"
                        >

                            <option value="">
                                All Status
                            </option>

                            <option value="Active">
                                Active
                            </option>

                            <option value="Inactive">
                                Inactive
                            </option>

                        </select>

                    </div>

                </div>


                <div
                    class="staff-register"
                    id="staff-register"
                ></div>


                <div
                    class="staff-modal"
                    id="staff-modal"
                    aria-hidden="true"
                >

                    <div
                        class="staff-modal-backdrop"
                        data-staff-close
                    ></div>


                    <div
                        class="staff-modal-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="staff-modal-title"
                    >

                        <div class="staff-modal-header">

                            <div>

                                <div class="staff-eyebrow">
                                    STAFF MASTER
                                </div>

                                <h3 id="staff-modal-title">
                                    Add Staff
                                </h3>

                            </div>


                            <button
                                type="button"
                                class="staff-modal-close"
                                id="staff-modal-close"
                                aria-label="Close"
                            >
                                &times;
                            </button>

                        </div>


                        <form id="staff-form">

                            <div class="staff-form-grid">

                                <div class="staff-field">

                                    <label for="staff-id">
                                        Staff ID
                                    </label>

                                    <input
                                        id="staff-id"
                                        type="text"
                                        placeholder="e.g. ST-001"
                                        required
                                    >

                                </div>


                                <div class="staff-field">

                                    <label for="staff-name">
                                        Staff Name
                                    </label>

                                    <input
                                        id="staff-name"
                                        type="text"
                                        placeholder="Full name"
                                        required
                                    >

                                </div>


                                <div class="staff-field">

                                    <label for="staff-department">
                                        Department
                                    </label>

                                    <input
                                        id="staff-department"
                                        type="text"
                                        placeholder="e.g. Housekeeping"
                                        required
                                    >

                                </div>


                                <div class="staff-field">

                                    <label for="staff-designation">
                                        Designation
                                    </label>

                                    <input
                                        id="staff-designation"
                                        type="text"
                                        placeholder="e.g. HK Supervisor"
                                        required
                                    >

                                </div>


                                <div class="staff-field">

                                    <label for="staff-contact">
                                        Contact Number
                                    </label>

                                    <input
                                        id="staff-contact"
                                        type="tel"
                                        placeholder="Contact number"
                                    >

                                </div>


                                <div class="staff-field">

                                    <label for="staff-shift">
                                        Shift
                                    </label>

                                    <select id="staff-shift">

                                        <option value="">
                                            Select Shift
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


                                <div class="staff-field">

                                    <label for="staff-in-time">
                                        In Time
                                    </label>

                                    <input
                                        id="staff-in-time"
                                        type="time"
                                    >

                                </div>


                                <div class="staff-field">

                                    <label for="staff-out-time">
                                        Out Time
                                    </label>

                                    <input
                                        id="staff-out-time"
                                        type="time"
                                    >

                                </div>


                                <div class="staff-field">

                                    <label for="staff-joining-date">
                                        Joining Date
                                    </label>

                                    <input
                                        id="staff-joining-date"
                                        type="date"
                                    >

                                </div>


                                <div class="staff-field">

                                    <label for="staff-status">
                                        Status
                                    </label>

                                    <select id="staff-status">

                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>

                                    </select>

                                </div>


                                <div class="staff-field staff-field-wide">

                                    <label for="staff-notes">
                                        Notes
                                    </label>

                                    <textarea
                                        id="staff-notes"
                                        rows="4"
                                        placeholder="Additional staff information..."
                                    ></textarea>

                                </div>

                            </div>


                            <div class="staff-modal-footer">

                                <button
                                    type="button"
                                    class="btn"
                                    id="staff-cancel-btn"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    class="btn btn-primary"
                                >
                                    Save Staff
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            </div>

        `;


        populateDepartmentFilter();

        bindEvents();

        renderRegister();

    }


    /* =====================================================
       FORM
       ===================================================== */

    function openForm(index) {

        const modal =
            document.getElementById(
                "staff-modal"
            );


        const form =
            document.getElementById(
                "staff-form"
            );


        if (!modal || !form) return;


        const editIndex =
            Number.isInteger(index)
                ? index
                : -1;


        form.dataset.index =
            String(editIndex);


        if (editIndex < 0) {

            document.getElementById(
                "staff-modal-title"
            ).textContent =
                "Add Staff";


            form.reset();


            setElementValue(
                "staff-status",
                STATUS.ACTIVE
            );


            setElementValue(
                "staff-id",
                generateNextStaffId()
            );

        } else {

            const record =
                getRecords()[editIndex];


            if (!record) return;


            document.getElementById(
                "staff-modal-title"
            ).textContent =
                "Edit Staff";


            setElementValue(
                "staff-id",
                getRecordValue(
                    record,
                    ["staffId", "id"],
                    ""
                )
            );


            setElementValue(
                "staff-name",
                getRecordValue(
                    record,
                    ["staffName", "name"],
                    ""
                )
            );


            setElementValue(
                "staff-department",
                getRecordValue(
                    record,
                    ["department"],
                    ""
                )
            );


            setElementValue(
                "staff-designation",
                getRecordValue(
                    record,
                    ["designation", "role"],
                    ""
                )
            );


            setElementValue(
                "staff-contact",
                getRecordValue(
                    record,
                    ["contactNumber", "contact", "phone"],
                    ""
                )
            );


            setElementValue(
                "staff-shift",
                getRecordValue(
                    record,
                    ["shift"],
                    ""
                )
            );


            setElementValue(
                "staff-in-time",
                getRecordValue(
                    record,
                    ["inTime", "startTime"],
                    ""
                )
            );


            setElementValue(
                "staff-out-time",
                getRecordValue(
                    record,
                    ["outTime", "endTime"],
                    ""
                )
            );


            setElementValue(
                "staff-joining-date",
                getRecordValue(
                    record,
                    ["joiningDate"],
                    ""
                )
            );


            setElementValue(
                "staff-status",
                getRecordValue(
                    record,
                    ["status"],
                    STATUS.ACTIVE
                )
            );


            setElementValue(
                "staff-notes",
                getRecordValue(
                    record,
                    ["notes"],
                    ""
                )
            );

        }


        modal.classList.add("active");


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        const firstInput =
            document.getElementById(
                "staff-id"
            );


        if (firstInput) {

            firstInput.focus();

        }

    }


    function closeForm() {

        const modal =
            document.getElementById(
                "staff-modal"
            );


        if (!modal) return;


        modal.classList.remove(
            "active"
        );


        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    function generateNextStaffId() {

        const records =
            getRecords();


        let number =
            records.length + 1;


        let candidate =
            "ST-" +
            String(number).padStart(3, "0");


        while (
            records.some(
                function (record) {

                    return String(
                        record.staffId || ""
                    )
                        .trim()
                        .toLowerCase() ===
                        candidate.toLowerCase();

                }
            )
        ) {

            number++;


            candidate =
                "ST-" +
                String(number).padStart(3, "0");

        }


        return candidate;

    }


    function saveStaff(event) {

        if (event) {

            event.preventDefault();

        }


        const form =
            document.getElementById(
                "staff-form"
            );


        if (!form) return;


        const staffId =
            getElementValue(
                "staff-id"
            )
                .trim();


        const staffName =
            getElementValue(
                "staff-name"
            )
                .trim();


        const department =
            getElementValue(
                "staff-department"
            )
                .trim();


        const designation =
            getElementValue(
                "staff-designation"
            )
                .trim();


        if (
            !staffId ||
            !staffName ||
            !department ||
            !designation
        ) {

            alert(
                "Please complete Staff ID, Staff Name, Department and Designation."
            );


            return;

        }


        const index =
            Number(
                form.dataset.index || -1
            );


        const records =
            getRecords();


        const duplicate =
            records.some(
                function (
                    record,
                    recordIndex
                ) {

                    return (

                        recordIndex !== index &&

                        String(
                            record.staffId || ""
                        )
                            .trim()
                            .toLowerCase() ===
                            staffId.toLowerCase()

                    );

                }
            );


        if (duplicate) {

            alert(
                "This Staff ID already exists. Please use a unique Staff ID."
            );


            return;

        }


        const existing =
            index >= 0
                ? records[index]
                : null;


        const record = {

            id:
                existing &&
                existing.id
                    ? existing.id
                    : uid(),


            staffId,


            staffName,


            department,


            designation,


            contactNumber:
                getElementValue(
                    "staff-contact"
                )
                    .trim(),


            shift:
                getElementValue(
                    "staff-shift"
                ),


            inTime:
                getElementValue(
                    "staff-in-time"
                ),


            outTime:
                getElementValue(
                    "staff-out-time"
                ),


            joiningDate:
                getElementValue(
                    "staff-joining-date"
                ),


            status:
                getElementValue(
                    "staff-status"
                ) ||
                STATUS.ACTIVE,


            notes:
                getElementValue(
                    "staff-notes"
                )
                    .trim(),


            createdAt:
                existing &&
                existing.createdAt
                    ? existing.createdAt
                    : now(),


            updatedAt:
                now()

        };


        try {

            if (
                index >= 0 &&
                typeof Data.update === "function"
            ) {

                Data.update(
                    COLLECTION,
                    index,
                    record
                );

            } else if (
                index < 0 &&
                typeof Data.add === "function"
            ) {

                Data.add(
                    COLLECTION,
                    record
                );

            } else {

                throw new Error(
                    "Staff data storage is unavailable."
                );

            }


            closeForm();

            populateDepartmentFilter();

            renderRegister();

        } catch (error) {

            console.error(
                "Staff Master save error:",
                error
            );


            alert(
                "Unable to save staff record. Please try again."
            );

        }

    }


    /* =====================================================
       RECORD ACTIONS
       ===================================================== */

    function deleteStaff(index) {

        const record =
            getRecords()[index];


        if (!record) return;


        const staffName =
            getRecordValue(
                record,
                ["staffName", "name"],
                "this staff member"
            );


        if (
            !confirm(
                `Delete staff member "${staffName}"?`
            )
        ) {

            return;

        }


        if (
            typeof Data.remove !== "function"
        ) {

            alert(
                "Staff data storage is unavailable."
            );


            return;

        }


        try {

            Data.remove(
                COLLECTION,
                index
            );


            populateDepartmentFilter();

            renderRegister();

        } catch (error) {

            console.error(
                "Staff Master delete error:",
                error
            );


            alert(
                "Unable to delete staff record. Please try again."
            );

        }

    }


    function toggleStatus(index) {

        const records =
            getRecords();


        const record =
            records[index];


        if (!record) return;


        const newStatus =
            record.status === STATUS.ACTIVE
                ? STATUS.INACTIVE
                : STATUS.ACTIVE;


        const updatedRecord = {

            ...record,

            status:
                newStatus,

            updatedAt:
                now()

        };


        if (
            typeof Data.update !== "function"
        ) {

            alert(
                "Staff data storage is unavailable."
            );


            return;

        }


        try {

            Data.update(
                COLLECTION,
                index,
                updatedRecord
            );


            renderRegister();

        } catch (error) {

            console.error(
                "Staff Master status update error:",
                error
            );


            alert(
                "Unable to update staff status. Please try again."
            );

        }

    }


    /* =====================================================
       DEPARTMENT FILTER
       ===================================================== */

    function populateDepartmentFilter() {

        const select =
            document.getElementById(
                "staff-department-filter"
            );


        if (!select) return;


        const currentValue =
            select.value;


        const departments =
            [
                ...new Set(
                    getRecords()
                        .map(
                            function (record) {

                                return String(
                                    record.department || ""
                                )
                                    .trim();

                            }
                        )
                        .filter(Boolean)
                )
            ]
                .sort(
                    function (a, b) {

                        return a.localeCompare(
                            b,
                            undefined,
                            {
                                sensitivity: "base"
                            }
                        );

                    }
                );


        select.innerHTML = `

            <option value="">
                All Departments
            </option>

            ${
                departments.map(
                    function (department) {

                        return `

                            <option
                                value="${esc(department)}"
                            >
                                ${esc(department)}
                            </option>

                        `;

                    }
                ).join("")

            }

        `;


        if (
            departments.includes(
                currentValue
            )
        ) {

            select.value =
                currentValue;

        }

    }


    /* =====================================================
       REGISTER
       ===================================================== */

    function renderRegister() {

        const container =
            document.getElementById(
                "staff-register"
            );


        if (!container) return;


        const search =
            getElementValue(
                "staff-search"
            )
                .trim()
                .toLowerCase();


        const department =
            getElementValue(
                "staff-department-filter"
            );


        const status =
            getElementValue(
                "staff-status-filter"
            );


        const records =
            getRecords();


        updateSummary(records);


        const filtered =
            records
                .map(
                    function (
                        record,
                        index
                    ) {

                        return {

                            record,

                            index

                        };

                    }
                )
                .filter(
                    function (item) {

                        const record =
                            item.record;


                        const searchable =
                            [

                                record.staffId,

                                record.staffName,

                                record.department,

                                record.designation,

                                record.contactNumber,

                                record.shift,

                                record.notes

                            ]
                                .map(
                                    function (value) {

                                        return String(
                                            value == null
                                                ? ""
                                                : value
                                        );

                                    }
                                )
                                .join(" ")
                                .toLowerCase();


                        const recordDepartment =
                            String(
                                record.department || ""
                            )
                                .trim();


                        const recordStatus =
                            record.status ||
                            STATUS.ACTIVE;


                        return (

                            (
                                !search ||
                                searchable.includes(search)
                            )

                            &&

                            (
                                !department ||
                                recordDepartment === department
                            )

                            &&

                            (
                                !status ||
                                recordStatus === status
                            )

                        );

                    }
                );


        if (!filtered.length) {

            container.innerHTML = `

                <div class="staff-empty">

                    <strong>
                        No staff records found
                    </strong>

                    <span>
                        Add staff or adjust the filters.
                    </span>

                </div>

            `;


            return;

        }


        container.innerHTML =
            filtered
                .map(
                    function (item) {

                        const record =
                            item.record;


                        const index =
                            item.index;


                        const staffId =
                            getRecordValue(
                                record,
                                ["staffId", "id"],
                                "—"
                            );


                        const staffName =
                            getRecordValue(
                                record,
                                ["staffName", "name"],
                                "Unnamed Staff"
                            );


                        const department =
                            getRecordValue(
                                record,
                                ["department"],
                                "—"
                            );


                        const designation =
                            getRecordValue(
                                record,
                                ["designation", "role"],
                                "—"
                            );


                        const contact =
                            getRecordValue(
                                record,
                                [
                                    "contactNumber",
                                    "contact",
                                    "phone"
                                ],
                                "—"
                            );


                        const shift =
                            getRecordValue(
                                record,
                                ["shift"],
                                "—"
                            );


                        const inTime =
                            getRecordValue(
                                record,
                                ["inTime", "startTime"],
                                ""
                            );


                        const outTime =
                            getRecordValue(
                                record,
                                ["outTime", "endTime"],
                                ""
                            );


                        const joiningDate =
                            getRecordValue(
                                record,
                                ["joiningDate"],
                                "—"
                            );


                        const notes =
                            getRecordValue(
                                record,
                                ["notes"],
                                ""
                            );


                        const recordStatus =
                            record.status ||
                            STATUS.ACTIVE;


                        const statusClass =
                            recordStatus === STATUS.ACTIVE
                                ? "active"
                                : "inactive";


                        const timing =
                            inTime || outTime
                                ? [
                                    inTime || "—",
                                    outTime || "—"
                                ].join(" – ")
                                : "—";


                        return `

                            <article class="staff-record">

                                <div class="staff-record-main">

                                    <div class="staff-record-title">

                                        <div>

                                            <strong>
                                                ${esc(staffName)}
                                            </strong>

                                            <span class="staff-id">
                                                ${esc(staffId)}
                                            </span>

                                        </div>


                                        <span
                                            class="staff-status staff-status-${statusClass}"
                                        >
                                            ${esc(recordStatus)}
                                        </span>

                                    </div>


                                    <div class="staff-record-grid">

                                        <div>

                                            <small>
                                                Department
                                            </small>

                                            <span>
                                                ${esc(department)}
                                            </span>

                                        </div>


                                        <div>

                                            <small>
                                                Designation
                                            </small>

                                            <span>
                                                ${esc(designation)}
                                            </span>

                                        </div>


                                        <div>

                                            <small>
                                                Shift
                                            </small>

                                            <span>
                                                ${esc(shift)}
                                            </span>

                                        </div>


                                        <div>

                                            <small>
                                                Timings
                                            </small>

                                            <span>
                                                ${esc(timing)}
                                            </span>

                                        </div>


                                        <div>

                                            <small>
                                                Contact
                                            </small>

                                            <span>
                                                ${esc(contact)}
                                            </span>

                                        </div>


                                        <div>

                                            <small>
                                                Joining Date
                                            </small>

                                            <span>
                                                ${esc(joiningDate)}
                                            </span>

                                        </div>

                                    </div>


                                    ${
                                        notes
                                            ? `

                                                <div class="staff-record-notes">
                                                    ${esc(notes)}
                                                </div>

                                            `
                                            : ""
                                    }

                                </div>


                                <div class="staff-record-actions">

                                    <button
                                        type="button"
                                        class="btn"
                                        data-staff-edit="${index}"
                                    >
                                        Edit
                                    </button>


                                    <button
                                        type="button"
                                        class="btn"
                                        data-staff-status="${index}"
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
                                        data-staff-delete="${index}"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </article>

                        `;

                    }
                )
                .join("");

    }


    function updateSummary(records) {

        const total =
            records.length;


        const active =
            records.filter(
                function (record) {

                    return (
                        record.status ||
                        STATUS.ACTIVE
                    ) === STATUS.ACTIVE;

                }
            ).length;


        const inactive =
            records.filter(
                function (record) {

                    return (
                        record.status ||
                        STATUS.ACTIVE
                    ) === STATUS.INACTIVE;

                }
            ).length;


        const departments =
            new Set(
                records
                    .map(
                        function (record) {

                            return String(
                                record.department || ""
                            )
                                .trim()
                                .toLowerCase();

                        }
                    )
                    .filter(Boolean)
            ).size;


        const totalElement =
            document.getElementById(
                "staff-total"
            );


        const activeElement =
            document.getElementById(
                "staff-active"
            );


        const inactiveElement =
            document.getElementById(
                "staff-inactive"
            );


        const departmentElement =
            document.getElementById(
                "staff-departments"
            );


        if (totalElement) {

            totalElement.textContent =
                total;

        }


        if (activeElement) {

            activeElement.textContent =
                active;

        }


        if (inactiveElement) {

            inactiveElement.textContent =
                inactive;

        }


        if (departmentElement) {

            departmentElement.textContent =
                departments;

        }

    }


    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {

        cleanupListeners();


        listen(
            document.getElementById(
                "staff-add-btn"
            ),
            "click",
            function () {

                openForm(-1);

            }
        );


        listen(
            document.getElementById(
                "staff-form"
            ),
            "submit",
            saveStaff
        );


        listen(
            document.getElementById(
                "staff-modal-close"
            ),
            "click",
            closeForm
        );


        listen(
            document.getElementById(
                "staff-cancel-btn"
            ),
            "click",
            closeForm
        );


        document
            .querySelectorAll(
                "[data-staff-close]"
            )
            .forEach(
                function (element) {

                    listen(
                        element,
                        "click",
                        closeForm
                    );

                }
            );


        listen(
            document.getElementById(
                "staff-search"
            ),
            "input",
            renderRegister
        );


        listen(
            document.getElementById(
                "staff-department-filter"
            ),
            "change",
            renderRegister
        );


        listen(
            document.getElementById(
                "staff-status-filter"
            ),
            "change",
            renderRegister
        );


        const register =
            document.getElementById(
                "staff-register"
            );


        listen(
            register,
            "click",
            function (event) {

                const target =
                    event.target;


                if (
                    !target ||
                    typeof target.closest !== "function"
                ) {

                    return;

                }


                const edit =
                    target.closest(
                        "[data-staff-edit]"
                    );


                if (edit) {

                    openForm(
                        Number(
                            edit.dataset.staffEdit
                        )
                    );


                    return;

                }


                const status =
                    target.closest(
                        "[data-staff-status]"
                    );


                if (status) {

                    toggleStatus(
                        Number(
                            status.dataset.staffStatus
                        )
                    );


                    return;

                }


                const remove =
                    target.closest(
                        "[data-staff-delete]"
                    );


                if (remove) {

                    deleteStaff(
                        Number(
                            remove.dataset.staffDelete
                        )
                    );

                }

            }
        );


        listen(
            document,
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

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

    window.FXStaffMaster = {

        getRecords,

        render,

        openForm,

        closeForm,

        saveStaff,

        deleteStaff,

        toggleStatus

    };


    if (
        typeof window.registerFXModule === "function"
    ) {

        window.registerFXModule(
            COLLECTION,
            {
                init,

                render,

                destroy

            }
        );

    } else {

        console.warn(
            "Facility Executive OS: registerFXModule is unavailable for Staff Master."
        );

    }


})();