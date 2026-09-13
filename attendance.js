/* =========================================================
   FACILITY EXECUTIVE OS
   STAFF ATTENDANCE MODULE
   ========================================================= */

(function () {

    "use strict";


    const FX = window.FX || {};
    const Data = window.FXData || {};

    const COLLECTION = "attendance";


    const STATUS = {
        PRESENT: "Present",
        LATE: "Late",
        HALF_DAY: "Half Day",
        ABSENT: "Absent",
        LEAVE: "Leave",
        HOLIDAY: "Holiday"
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


    function getStaff() {

        if (
            !Data ||
            typeof Data.get !== "function"
        ) {

            return [];

        }


        const staff =
            Data.get("staff_master");


        return Array.isArray(staff)
            ? staff
            : [];

    }


    function escape(value) {

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


    function now() {

        return new Date().toISOString();

    }


    function today() {

        const date =
            new Date();


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            )
                .padStart(2, "0");


        const day =
            String(
                date.getDate()
            )
                .padStart(2, "0");


        return `${year}-${month}-${day}`;

    }


    function generateId() {

        return "ATT-" +
            Date.now().toString(36).toUpperCase() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 7)
                .toUpperCase();

    }


    function formatDate(value) {

        if (!value) return "—";


        const parts =
            String(value).split("-");


        if (parts.length !== 3) {

            return escape(value);

        }


        return `${parts[2]}-${parts[1]}-${parts[0]}`;

    }


    function getStatusClass(status) {

        return String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");

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


    function getStaffById(id) {

        return getStaff().find(
            function (staff) {

                return (
                    String(staff.id || "") === String(id) ||
                    String(staff.staffId || "") === String(id)
                );

            }
        );

    }


    function getStaffDisplay(staff) {

        if (!staff) {

            return "Select Staff";

        }


        const name =
            staff.staffName ||
            staff.name ||
            "Unnamed Staff";


        const staffId =
            staff.staffId ||
            staff.id ||
            "No ID";


        return `${name} — ${staffId}`;

    }


    function cleanupListeners() {

        listeners.forEach(
            function (item) {

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

            }
        );


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


    /* =====================================================
       SUMMARY
       ===================================================== */

    function getSummary(records) {

        return {

            total:
                records.length,


            present:
                records.filter(
                    function (record) {

                        return record.status === STATUS.PRESENT;

                    }
                ).length,


            late:
                records.filter(
                    function (record) {

                        return record.status === STATUS.LATE;

                    }
                ).length,


            halfDay:
                records.filter(
                    function (record) {

                        return record.status === STATUS.HALF_DAY;

                    }
                ).length,


            absent:
                records.filter(
                    function (record) {

                        return record.status === STATUS.ABSENT;

                    }
                ).length,


            leave:
                records.filter(
                    function (record) {

                        return record.status === STATUS.LEAVE;

                    }
                ).length,


            holiday:
                records.filter(
                    function (record) {

                        return record.status === STATUS.HOLIDAY;

                    }
                ).length

        };

    }


    /* =====================================================
       RENDER
       ===================================================== */

    function render() {

        const root =
            document.getElementById(
                "tab-attendance"
            );


        if (!root) return;


        cleanupListeners();


        root.innerHTML = `

            <div class="attendance-module">

                <div class="attendance-header">

                    <div>

                        <div class="attendance-eyebrow">
                            OPERATIONS
                        </div>

                        <h2>
                            Staff Attendance
                        </h2>

                        <p>
                            Record and monitor daily staff attendance,
                            reporting times and attendance status.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="btn btn-primary"
                        data-attendance-action="add"
                    >
                        + Add Attendance
                    </button>

                </div>


                ${renderSummary(getRecords())}


                ${renderToolbar()}


                <div
                    id="attendance-register"
                    class="attendance-register"
                ></div>


                ${renderModal()}

            </div>

        `;


        bindEvents();

        refreshRegister();

    }


    /* =====================================================
       SUMMARY CARDS
       ===================================================== */

    function renderSummary(records) {

        const summary =
            getSummary(records);


        return `

            <div class="attendance-summary">

                <div class="attendance-kpi">
                    <span>Total Records</span>
                    <strong>${summary.total}</strong>
                </div>

                <div class="attendance-kpi">
                    <span>Present</span>
                    <strong>${summary.present}</strong>
                </div>

                <div class="attendance-kpi">
                    <span>Late</span>
                    <strong>${summary.late}</strong>
                </div>

                <div class="attendance-kpi">
                    <span>Half Day</span>
                    <strong>${summary.halfDay}</strong>
                </div>

                <div class="attendance-kpi">
                    <span>Absent</span>
                    <strong>${summary.absent}</strong>
                </div>

                <div class="attendance-kpi">
                    <span>Leave</span>
                    <strong>${summary.leave}</strong>
                </div>

            </div>

        `;

    }


    /* =====================================================
       TOOLBAR
       ===================================================== */

    function renderToolbar() {

        return `

            <div class="attendance-toolbar">

                <div class="attendance-search">

                    <input
                        type="search"
                        id="attendance-search"
                        placeholder="Search staff name, ID or department..."
                    >

                </div>


                <div class="attendance-filters">

                    <input
                        type="date"
                        id="attendance-date-filter"
                    >


                    <select
                        id="attendance-department-filter"
                    >

                        <option value="">
                            All Departments
                        </option>

                        ${renderDepartmentOptions()}

                    </select>


                    <select
                        id="attendance-status-filter"
                    >

                        <option value="">
                            All Status
                        </option>

                        <option value="Present">
                            Present
                        </option>

                        <option value="Late">
                            Late
                        </option>

                        <option value="Half Day">
                            Half Day
                        </option>

                        <option value="Absent">
                            Absent
                        </option>

                        <option value="Leave">
                            Leave
                        </option>

                        <option value="Holiday">
                            Holiday
                        </option>

                    </select>

                </div>

            </div>

        `;

    }


    function renderDepartmentOptions() {

        const departments =
            [
                ...new Set(
                    getStaff()
                        .map(
                            function (staff) {

                                return String(
                                    staff.department || ""
                                ).trim();

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


        return departments.map(
            function (department) {

                return `

                    <option value="${escape(department)}">
                        ${escape(department)}
                    </option>

                `;

            }
        ).join("");

    }


    /* =====================================================
       RECORD FILTERING
       ===================================================== */

    function getCurrentFilters() {

        return {

            search:
                getElementValue(
                    "attendance-search"
                )
                    .trim()
                    .toLowerCase(),


            date:
                getElementValue(
                    "attendance-date-filter"
                ),


            department:
                getElementValue(
                    "attendance-department-filter"
                ),


            status:
                getElementValue(
                    "attendance-status-filter"
                )

        };

    }


    function recordMatchesFilters(
        record,
        filters
    ) {

        const searchable =
            [

                record.staffName,

                record.staffId,

                record.department,

                record.designation,

                record.shift,

                record.remarks

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


        const searchMatch =
            !filters.search ||
            searchable.includes(
                filters.search
            );


        const dateMatch =
            !filters.date ||
            String(
                record.attendanceDate || ""
            ) === filters.date;


        const departmentMatch =
            !filters.department ||
            String(
                record.department || ""
            ).trim() === filters.department;


        const statusMatch =
            !filters.status ||
            String(
                record.status || ""
            ) === filters.status;


        return (
            searchMatch &&
            dateMatch &&
            departmentMatch &&
            statusMatch
        );

    }


    function getFilteredRecordItems() {

        const records =
            getRecords();


        const filters =
            getCurrentFilters();


        return records
            .map(
                function (record, index) {

                    return {

                        record,

                        index

                    };

                }
            )
            .filter(
                function (item) {

                    return recordMatchesFilters(
                        item.record,
                        filters
                    );

                }
            );

    }


    function getFilteredRecords() {

        return getFilteredRecordItems()
            .map(
                function (item) {

                    return item.record;

                }
            );

    }


    /* =====================================================
       RECORD CARDS
       ===================================================== */

    function renderRecords() {

        const items =
            getFilteredRecordItems();


        if (!items.length) {

            return `

                <div class="attendance-empty">

                    <strong>
                        No attendance records found
                    </strong>

                    <span>
                        Add an attendance record or change
                        the current filters.
                    </span>

                </div>

            `;

        }


        return items.map(
            function (item) {

                return renderRecord(
                    item.record,
                    item.index
                );

            }
        ).join("");

    }


    function renderRecord(
        record,
        index
    ) {

        const status =
            record.status || "—";


        const statusClass =
            getStatusClass(status);


        const timing =
            record.actualInTime ||
            record.actualOutTime
                ? [
                    record.actualInTime || "—",
                    record.actualOutTime || "—"
                ].join(" – ")
                : "—";


        return `

            <div class="attendance-record">

                <div class="attendance-record-main">

                    <div class="attendance-record-title">

                        <div>

                            <strong>
                                ${escape(
                                    record.staffName ||
                                    "Unnamed Staff"
                                )}
                            </strong>

                            <span class="attendance-staff-id">
                                ${escape(
                                    record.staffId || "—"
                                )}
                            </span>

                        </div>


                        <span
                            class="
                                attendance-status
                                attendance-status-${escape(statusClass)}
                            "
                        >
                            ${escape(status)}
                        </span>

                    </div>


                    <div class="attendance-record-grid">

                        <div>

                            <small>Date</small>

                            <span>
                                ${formatDate(
                                    record.attendanceDate
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Department</small>

                            <span>
                                ${escape(
                                    record.department || "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Designation</small>

                            <span>
                                ${escape(
                                    record.designation || "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Shift</small>

                            <span>
                                ${escape(
                                    record.shift || "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Scheduled In</small>

                            <span>
                                ${escape(
                                    record.scheduledInTime || "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Actual In</small>

                            <span>
                                ${escape(
                                    record.actualInTime || "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Scheduled Out</small>

                            <span>
                                ${escape(
                                    record.scheduledOutTime || "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Actual Out</small>

                            <span>
                                ${escape(
                                    record.actualOutTime || "—"
                                )}
                            </span>

                        </div>


                        <div>

                            <small>Recorded Timing</small>

                            <span>
                                ${escape(timing)}
                            </span>

                        </div>

                    </div>


                    ${
                        record.remarks
                            ? `

                                <div class="attendance-record-notes">

                                    <strong>
                                        Remarks:
                                    </strong>

                                    ${escape(record.remarks)}

                                </div>

                            `
                            : ""
                    }

                </div>


                <div class="attendance-record-actions">

                    <button
                        type="button"
                        class="btn"
                        data-attendance-edit="${index}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="btn btn-danger"
                        data-attendance-delete="${index}"
                    >
                        Delete
                    </button>

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
                class="attendance-modal"
                id="attendance-modal"
                aria-hidden="true"
            >

                <div
                    class="attendance-modal-backdrop"
                    data-attendance-close
                ></div>


                <div
                    class="attendance-modal-panel"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="attendance-modal-title"
                >

                    <div class="attendance-modal-header">

                        <div>

                            <div class="attendance-eyebrow">
                                STAFF ATTENDANCE
                            </div>

                            <h3 id="attendance-modal-title">
                                Add Attendance
                            </h3>

                        </div>


                        <button
                            type="button"
                            class="attendance-modal-close"
                            data-attendance-close
                            aria-label="Close"
                        >
                            &times;
                        </button>

                    </div>


                    <form id="attendance-form">

                        <div class="attendance-form-grid">

                            <div class="attendance-field">

                                <label for="attendance-date">
                                    Attendance Date
                                </label>

                                <input
                                    type="date"
                                    id="attendance-date"
                                    required
                                >

                            </div>


                            <div class="attendance-field">

                                <label for="attendance-staff">
                                    Staff
                                </label>

                                <select
                                    id="attendance-staff"
                                    required
                                >

                                    <option value="">
                                        Select Staff
                                    </option>

                                    ${renderStaffOptions()}

                                </select>

                            </div>


                            <div class="attendance-field">

                                <label for="attendance-staff-id">
                                    Staff ID
                                </label>

                                <input
                                    type="text"
                                    id="attendance-staff-id"
                                    readonly
                                >

                            </div>


                            <div class="attendance-field">

                                <label for="attendance-department">
                                    Department
                                </label>

                                <input
                                    type="text"
                                    id="attendance-department"
                                    readonly
                                >

                            </div>


                            <div class="attendance-field">

                                <label for="attendance-designation">
                                    Designation
                                </label>

                                <input
                                    type="text"
                                    id="attendance-designation"
                                    readonly
                                >

                            </div>


                            <div class="attendance-field">

                                <label for="attendance-shift">
                                    Shift
                                </label>

                                <input
                                    type="text"
                                    id="attendance-shift"
                                    readonly
                                >

                            </div>


                            <div class="attendance-field">

                                <label for="attendance-scheduled-in">
                                    Scheduled In Time
                                </label>

                                <input
                                    type="time"
                                    id="attendance-scheduled-in"
                                    readonly
                                >

                            </div>


                            <div class="attendance-field">

                                <label for="attendance-actual-in">
                                    Actual In Time
                                </label>

                                <input
                                    type="time"
                                    id="attendance-actual-in"
                                >

                            </div>


                            <div class="attendance-field">

                                <label for="attendance-scheduled-out">
                                    Scheduled Out Time
                                </label>

                                <input
                                    type="time"
                                    id="attendance-scheduled-out"
                                    readonly
                                >

                            </div>


                            <div class="attendance-field">

                                <label for="attendance-actual-out">
                                    Actual Out Time
                                </label>

                                <input
                                    type="time"
                                    id="attendance-actual-out"
                                >

                            </div>


                            <div class="attendance-field">

                                <label for="attendance-status">
                                    Status
                                </label>

                                <select
                                    id="attendance-status"
                                    required
                                >

                                    <option value="Present">
                                        Present
                                    </option>

                                    <option value="Late">
                                        Late
                                    </option>

                                    <option value="Half Day">
                                        Half Day
                                    </option>

                                    <option value="Absent">
                                        Absent
                                    </option>

                                    <option value="Leave">
                                        Leave
                                    </option>

                                    <option value="Holiday">
                                        Holiday
                                    </option>

                                </select>

                            </div>


                            <div
                                class="
                                    attendance-field
                                    attendance-field-wide
                                "
                            >

                                <label for="attendance-remarks">
                                    Remarks
                                </label>

                                <textarea
                                    id="attendance-remarks"
                                    rows="4"
                                    placeholder="Optional remarks..."
                                ></textarea>

                            </div>

                        </div>


                        <div class="attendance-modal-footer">

                            <button
                                type="button"
                                class="btn"
                                data-attendance-close
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                class="btn btn-primary"
                            >
                                Save Attendance
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        `;

    }


    function renderStaffOptions() {

        return getStaff()
            .filter(
                function (staff) {

                    return staff.status !== "Inactive";

                }
            )
            .map(
                function (staff) {

                    const value =
                        staff.id ||
                        staff.staffId ||
                        "";


                    return `

                        <option value="${escape(value)}">
                            ${escape(
                                getStaffDisplay(staff)
                            )}
                        </option>

                    `;

                }
            )
            .join("");

    }


    /* =====================================================
       STAFF AUTO-FILL
       ===================================================== */

    function populateStaffFields(staffId) {

        const staff =
            getStaffById(staffId);


        const fields = {

            id:
                document.getElementById(
                    "attendance-staff-id"
                ),


            department:
                document.getElementById(
                    "attendance-department"
                ),


            designation:
                document.getElementById(
                    "attendance-designation"
                ),


            shift:
                document.getElementById(
                    "attendance-shift"
                ),


            scheduledIn:
                document.getElementById(
                    "attendance-scheduled-in"
                ),


            scheduledOut:
                document.getElementById(
                    "attendance-scheduled-out"
                )

        };


        if (!staff) {

            Object.values(fields).forEach(
                function (field) {

                    if (field) {

                        field.value = "";

                    }

                }
            );


            return;

        }


        fields.id.value =
            staff.staffId ||
            staff.id ||
            "";


        fields.department.value =
            staff.department ||
            "";


        fields.designation.value =
            staff.designation ||
            staff.role ||
            "";


        fields.shift.value =
            staff.shift ||
            "";


        fields.scheduledIn.value =
            staff.inTime ||
            staff.startTime ||
            "";


        fields.scheduledOut.value =
            staff.outTime ||
            staff.endTime ||
            "";

    }


    /* =====================================================
       OPEN FORM
       ===================================================== */

    function openForm(index) {

        const modal =
            document.getElementById(
                "attendance-modal"
            );


        const form =
            document.getElementById(
                "attendance-form"
            );


        if (!modal || !form) return;


        const editIndex =
            Number.isInteger(index)
                ? index
                : -1;


        form.reset();


        modal.dataset.index =
            String(editIndex);


        setElementValue(
            "attendance-date",
            today()
        );


        if (editIndex >= 0) {

            const record =
                getRecords()[editIndex];


            if (!record) return;


            document.getElementById(
                "attendance-modal-title"
            ).textContent =
                "Edit Attendance";


            setElementValue(
                "attendance-date",
                record.attendanceDate || today()
            );


            setElementValue(
                "attendance-staff",
                record.staffRecordId ||
                record.staffId ||
                ""
            );


            populateStaffFields(
                record.staffRecordId ||
                record.staffId ||
                ""
            );


            setElementValue(
                "attendance-actual-in",
                record.actualInTime || ""
            );


            setElementValue(
                "attendance-actual-out",
                record.actualOutTime || ""
            );


            setElementValue(
                "attendance-status",
                record.status || STATUS.PRESENT
            );


            setElementValue(
                "attendance-remarks",
                record.remarks || ""
            );

        } else {

            document.getElementById(
                "attendance-modal-title"
            ).textContent =
                "Add Attendance";


            setElementValue(
                "attendance-status",
                STATUS.PRESENT
            );

        }


        modal.classList.add("active");


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        const staffSelect =
            document.getElementById(
                "attendance-staff"
            );


        if (staffSelect) {

            staffSelect.focus();

        }

    }


    /* =====================================================
       CLOSE FORM
       ===================================================== */

    function closeForm() {

        const modal =
            document.getElementById(
                "attendance-modal"
            );


        if (!modal) return;


        modal.classList.remove(
            "active"
        );


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
                "attendance-modal"
            );


        const form =
            document.getElementById(
                "attendance-form"
            );


        if (!modal || !form) return;


        if (
            typeof form.reportValidity === "function" &&
            !form.reportValidity()
        ) {

            return;

        }


        const index =
            Number(
                modal.dataset.index || -1
            );


        const staffRecordId =
            getElementValue(
                "attendance-staff"
            );


        const staff =
            getStaffById(
                staffRecordId
            );


        if (!staff) {

            alert(
                "Please select a valid staff member."
            );


            return;

        }


        const attendanceDate =
            getElementValue(
                "attendance-date"
            );


        if (!attendanceDate) {

            alert(
                "Please select an attendance date."
            );


            return;

        }


        const records =
            getRecords();


        const existing =
            index >= 0
                ? records[index]
                : null;


        const record = {

            id:
                existing &&
                existing.id
                    ? existing.id
                    : generateId(),


            staffRecordId:
                staff.id ||
                staff.staffId ||
                staffRecordId,


            staffId:
                staff.staffId ||
                staff.id ||
                "",


            staffName:
                staff.staffName ||
                staff.name ||
                "",


            department:
                staff.department ||
                "",


            designation:
                staff.designation ||
                staff.role ||
                "",


            shift:
                staff.shift ||
                "",


            scheduledInTime:
                staff.inTime ||
                staff.startTime ||
                "",


            actualInTime:
                getElementValue(
                    "attendance-actual-in"
                ),


            scheduledOutTime:
                staff.outTime ||
                staff.endTime ||
                "",


            actualOutTime:
                getElementValue(
                    "attendance-actual-out"
                ),


            attendanceDate,


            status:
                getElementValue(
                    "attendance-status"
                ) ||
                STATUS.PRESENT,


            remarks:
                getElementValue(
                    "attendance-remarks"
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
                    "Attendance data storage is unavailable."
                );

            }


            closeForm();

            render();

        } catch (error) {

            console.error(
                "Attendance save error:",
                error
            );


            alert(
                "Unable to save attendance record. Please try again."
            );

        }

    }


    /* =====================================================
       DELETE
       ===================================================== */

    function deleteRecord(index) {

        const record =
            getRecords()[index];


        if (!record) return;


        const staffName =
            record.staffName ||
            record.staffId ||
            "this staff member";


        if (
            !confirm(
                `Delete attendance record for ${staffName}?`
            )
        ) {

            return;

        }


        if (
            typeof Data.remove !== "function"
        ) {

            alert(
                "Attendance data storage is unavailable."
            );


            return;

        }


        try {

            Data.remove(
                COLLECTION,
                index
            );


            render();

        } catch (error) {

            console.error(
                "Attendance delete error:",
                error
            );


            alert(
                "Unable to delete attendance record. Please try again."
            );

        }

    }


    /* =====================================================
       EVENT HANDLING
       ===================================================== */

    function bindEvents() {

        cleanupListeners();


        const root =
            document.getElementById(
                "tab-attendance"
            );


        if (!root) return;


        listen(
            root,
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


                const addButton =
                    target.closest(
                        "[data-attendance-action='add']"
                    );


                if (addButton) {

                    openForm(-1);

                    return;

                }


                const editButton =
                    target.closest(
                        "[data-attendance-edit]"
                    );


                if (editButton) {

                    openForm(
                        Number(
                            editButton.dataset.attendanceEdit
                        )
                    );


                    return;

                }


                const deleteButton =
                    target.closest(
                        "[data-attendance-delete]"
                    );


                if (deleteButton) {

                    deleteRecord(
                        Number(
                            deleteButton.dataset.attendanceDelete
                        )
                    );


                    return;

                }


                const closeButton =
                    target.closest(
                        "[data-attendance-close]"
                    );


                if (closeButton) {

                    closeForm();

                }

            }
        );


        listen(
            root,
            "submit",
            function (event) {

                if (
                    event.target &&
                    event.target.id === "attendance-form"
                ) {

                    saveForm(event);

                }

            }
        );


        listen(
            root,
            "change",
            function (event) {

                const target =
                    event.target;


                if (!target) return;


                if (
                    target.id === "attendance-staff"
                ) {

                    populateStaffFields(
                        target.value
                    );

                }


                if (
                    target.id === "attendance-date-filter" ||
                    target.id === "attendance-department-filter" ||
                    target.id === "attendance-status-filter"
                ) {

                    refreshRegister();

                }

            }
        );


        listen(
            root,
            "input",
            function (event) {

                const target =
                    event.target;


                if (
                    target &&
                    target.id === "attendance-search"
                ) {

                    refreshRegister();

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
       REFRESH REGISTER
       ===================================================== */

    function refreshRegister() {

        const register =
            document.getElementById(
                "attendance-register"
            );


        if (!register) return;


        register.innerHTML =
            renderRecords();

    }


    /* =====================================================
       MODULE LIFECYCLE
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

    window.FXAttendance = {

        getRecords,

        getStaff,

        getFilteredRecords,

        openForm,

        closeForm,

        saveForm,

        deleteRecord,

        refreshRegister,

        render

    };


    /* =====================================================
       MODULE REGISTRATION
       ===================================================== */

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
            "Facility Executive OS: registerFXModule is unavailable for Attendance."
        );

    }


})();