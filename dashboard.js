(function () {

    "use strict";


    const FX = window.FX;
    const Data = window.FXData;


    let eventsBound = false;


    /* =====================================================
       GENERAL HELPERS
       ===================================================== */

    function getData(name) {

        if (!Data || typeof Data.get !== "function") {
            return [];
        }

        const value = Data.get(name);

        return Array.isArray(value) ? value : [];
    }


    function getElement(id) {
        return document.getElementById(id);
    }


    function setText(id, value) {

        const element = getElement(id);

        if (element) {
            element.textContent = value;
        }
    }


    function text(record, keys, fallback = "") {

        for (const key of keys) {

            if (
                record &&
                record[key] !== undefined &&
                record[key] !== null &&
                String(record[key]).trim() !== ""
            ) {
                return record[key];
            }
        }

        return fallback;
    }


    function escape(value) {

        if (typeof window.escapeHtml === "function") {
            return window.escapeHtml(value);
        }

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function isCompleted(status) {

        return [
            "completed",
            "complete",
            "done",
            "closed",
            "finished",
            "resolved"
        ].includes(
            String(status ?? "")
                .trim()
                .toLowerCase()
        );
    }


    function isOpen(status) {

        return ![
            "completed",
            "complete",
            "done",
            "closed",
            "resolved",
            "finished",
            "cancelled",
            "canceled"
        ].includes(
            String(status ?? "")
                .trim()
                .toLowerCase()
        );
    }


    function getActiveTab() {

        if (
            FX &&
            FX.state &&
            FX.state.activeTab
        ) {
            return FX.state.activeTab;
        }

        if (FX && FX.activeTab) {
            return FX.activeTab;
        }

        return "";
    }


    function isDashboardActive() {

        const activeTab = getActiveTab();

        return !activeTab || activeTab === "dashboard";
    }


    function navigate(tabId) {

        if (typeof window.switchTab === "function") {
            window.switchTab(tabId);
        }
    }


    function today() {

        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }


    /* =====================================================
       TASK SUMMARY
       ===================================================== */

    function getTaskSummary() {

        const tasks = getData("control");

        const total = tasks.length;

        const completed = tasks.filter(function (task) {

            return isCompleted(
                text(
                    task,
                    [
                        "status",
                        "taskStatus",
                        "completionStatus"
                    ]
                )
            );

        }).length;

        const pending = Math.max(
            total - completed,
            0
        );

        const percentage = total
            ? Math.round((completed / total) * 100)
            : 0;

        return {
            total,
            completed,
            pending,
            percentage
        };
    }


    /* =====================================================
       CONTROL CENTER STATISTICS
       ===================================================== */

    function getControlStats() {

        const amenities = getData("amenities");
        const checklist = getData("control");

        const operationalAmenities = amenities.filter(
            function (item) {

                const status = String(
                    text(
                        item,
                        [
                            "operationalStatus",
                            "status",
                            "state"
                        ],
                        "Operational"
                    )
                ).trim().toLowerCase();

                return status === "operational";
            }
        ).length;


        const maintenanceAmenities = amenities.filter(
            function (item) {

                const status = String(
                    text(
                        item,
                        [
                            "operationalStatus",
                            "status",
                            "state"
                        ],
                        "Operational"
                    )
                ).trim().toLowerCase();

                return [
                    "maintenance",
                    "under maintenance",
                    "under-maintenance"
                ].includes(status);
            }
        ).length;


        const closedAmenities = amenities.filter(
            function (item) {

                const status = String(
                    text(
                        item,
                        [
                            "operationalStatus",
                            "status",
                            "state"
                        ],
                        "Operational"
                    )
                ).trim().toLowerCase();

                return status === "closed";
            }
        ).length;


        const completedTasks = checklist.filter(
            function (item) {

                return isCompleted(
                    text(
                        item,
                        [
                            "status",
                            "taskStatus",
                            "completionStatus"
                        ]
                    )
                );
            }
        ).length;


        const totalTasks = checklist.length;

        const pendingTasks = Math.max(
            totalTasks - completedTasks,
            0
        );

        const completion = totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;


        return {
            totalAmenities: amenities.length,
            operationalAmenities,
            maintenanceAmenities,
            closedAmenities,
            totalTasks,
            completedTasks,
            pendingTasks,
            completion
        };
    }


    /* =====================================================
       MAIN DASHBOARD KPI CARDS
       ===================================================== */

    function renderKPIs() {

        const amenities = getData("amenities");

        const tasks = getTaskSummary();

        const issues = getData("complaints")
            .filter(function (issue) {

                return isOpen(
                    text(
                        issue,
                        [
                            "status",
                            "state"
                        ]
                    )
                );
            });


        const bookings = getData("bookings");

        const attendance = getData("attendance");

        const maintenance = getData("maintenance");

        const inventory = getData("inventory");


        const present = attendance.filter(function (record) {

            const status = String(
                text(
                    record,
                    [
                        "status",
                        "attendanceStatus",
                        "state"
                    ]
                )
            ).trim().toLowerCase();

            return [
                "present",
                "p",
                "on duty",
                "working"
            ].includes(status);
        });


        const lowStock = inventory.filter(function (item) {

            const quantity = Number(
                text(
                    item,
                    [
                        "quantity",
                        "qty",
                        "stock",
                        "currentStock"
                    ],
                    NaN
                )
            );

            const reorder = Number(
                text(
                    item,
                    [
                        "reorderLevel",
                        "reorder",
                        "minimumStock",
                        "minStock"
                    ],
                    NaN
                )
            );

            return (
                Number.isFinite(quantity) &&
                Number.isFinite(reorder) &&
                quantity <= reorder
            );
        });


        setText("dash-amenities", amenities.length);

        setText("dash-completed", tasks.completed);

        setText(
            "dash-completed-sub",
            `${tasks.percentage}% completion`
        );

        setText("dash-pending", tasks.pending);

        setText("dash-issues", issues.length);

        setText("dash-bookings", bookings.length);

        setText("dash-staff-present", present.length);

        setText("dash-maintenance", maintenance.length);

        setText("dash-low-stock", lowStock.length);

        setText(
            "dash-completion-percent",
            `${tasks.percentage}%`
        );

        setText(
            "dash-completion-text",
            `${tasks.completed} of ${tasks.total} tasks completed`
        );


        const progress = getElement("dash-progress-bar");

        if (progress) {
            progress.style.width = `${tasks.percentage}%`;
        }


        const health = getElement("dashboard-health");

        if (health) {

            if (issues.length > 0) {

                health.textContent =
                    `${issues.length} issue${issues.length === 1 ? "" : "s"} open`;

            } else {

                health.textContent = "Operational";
            }
        }


        const summary = getElement(
            "dashboard-status-summary"
        );

        if (summary) {

            summary.innerHTML = `

                <div class="dashboard-status-item">
                    <div class="status-number">
                        ${tasks.completed}
                    </div>

                    <div class="status-label">
                        Completed
                    </div>
                </div>

                <div class="dashboard-status-item">
                    <div class="status-number">
                        ${tasks.pending}
                    </div>

                    <div class="status-label">
                        Pending
                    </div>
                </div>

                <div class="dashboard-status-item">
                    <div class="status-number">
                        ${tasks.total}
                    </div>

                    <div class="status-label">
                        Total
                    </div>
                </div>

            `;
        }


        const daily = getElement(
            "dashboard-daily-status"
        );

        if (daily) {

            daily.innerHTML = `

                <div class="dashboard-daily-row">
                    <span>Checklist</span>
                    <strong>${tasks.percentage}%</strong>
                </div>

                <div class="dashboard-daily-row">
                    <span>Open Issues</span>
                    <strong>${issues.length}</strong>
                </div>

                <div class="dashboard-daily-row">
                    <span>Bookings</span>
                    <strong>${bookings.length}</strong>
                </div>

                <div class="dashboard-daily-row">
                    <span>Staff Present</span>
                    <strong>${present.length}</strong>
                </div>

            `;
        }
    }


    /* =====================================================
       OPEN ISSUES
       ===================================================== */

    function renderIssues() {

        const container = getElement(
            "dashboard-open-issues"
        );

        if (!container) {
            return;
        }

        const issues = getData("complaints")
            .filter(function (issue) {

                return isOpen(
                    text(
                        issue,
                        [
                            "status",
                            "state"
                        ]
                    )
                );
            })
            .slice(0, 6);


        if (!issues.length) {

            container.innerHTML = `
                <div class="dashboard-empty">
                    No open issues recorded.
                </div>
            `;

            return;
        }


        container.innerHTML = issues.map(function (issue) {

            const title = text(
                issue,
                [
                    "title",
                    "subject",
                    "issue",
                    "description",
                    "name"
                ],
                "Issue"
            );

            const zone = text(
                issue,
                [
                    "zone",
                    "area",
                    "location"
                ],
                "Unassigned"
            );

            const status = text(
                issue,
                [
                    "status",
                    "state"
                ],
                "Open"
            );


            return `

                <div class="dashboard-list-item">

                    <div class="dashboard-list-main">

                        <div class="dashboard-list-title">
                            ${escape(title)}
                        </div>

                        <div class="dashboard-list-sub">
                            ${escape(zone)}
                        </div>

                    </div>

                    <span class="tag">
                        ${escape(status)}
                    </span>

                </div>

            `;

        }).join("");
    }


    /* =====================================================
       BOOKINGS
       ===================================================== */

    function renderBookings() {

        const container = getElement(
            "dashboard-today-bookings"
        );

        if (!container) {
            return;
        }

        const bookings = getData("bookings")
            .slice(0, 6);


        if (!bookings.length) {

            container.innerHTML = `
                <div class="dashboard-empty">
                    No bookings recorded.
                </div>
            `;

            return;
        }


        container.innerHTML = bookings.map(function (booking) {

            const title = text(
                booking,
                [
                    "event",
                    "eventName",
                    "bookingName",
                    "title",
                    "name"
                ],
                "Booking"
            );

            const amenity = text(
                booking,
                [
                    "amenity",
                    "amenityName",
                    "facility"
                ],
                "Facility"
            );

            const status = text(
                booking,
                [
                    "status",
                    "state"
                ],
                "Scheduled"
            );


            return `

                <div class="dashboard-list-item">

                    <div class="dashboard-list-main">

                        <div class="dashboard-list-title">
                            ${escape(title)}
                        </div>

                        <div class="dashboard-list-sub">
                            ${escape(amenity)}
                        </div>

                    </div>

                    <span class="tag">
                        ${escape(status)}
                    </span>

                </div>

            `;

        }).join("");
    }


    /* =====================================================
       STAFF
       ===================================================== */

    function renderStaff() {

        const container = getElement(
            "dashboard-staff"
        );

        if (!container) {
            return;
        }

        const records = getData("attendance")
            .slice(0, 6);


        if (!records.length) {

            container.innerHTML = `
                <div class="dashboard-empty">
                    No attendance records.
                </div>
            `;

            return;
        }


        container.innerHTML = records.map(function (record) {

            const name = text(
                record,
                [
                    "staff",
                    "staffName",
                    "employee",
                    "employeeName",
                    "name"
                ],
                "Staff"
            );

            const status = text(
                record,
                [
                    "status",
                    "attendanceStatus",
                    "state"
                ],
                "Recorded"
            );


            return `

                <div class="dashboard-list-item">

                    <div class="dashboard-list-main">

                        <div class="dashboard-list-title">
                            ${escape(name)}
                        </div>

                        <div class="dashboard-list-sub">
                            Attendance
                        </div>

                    </div>

                    <span class="tag">
                        ${escape(status)}
                    </span>

                </div>

            `;

        }).join("");
    }


    /* =====================================================
       INVENTORY
       ===================================================== */

    function renderInventory() {

        const container = getElement(
            "dashboard-inventory"
        );

        if (!container) {
            return;
        }

        const records = getData("inventory")
            .filter(function (item) {

                const quantity = Number(
                    text(
                        item,
                        [
                            "quantity",
                            "qty",
                            "stock",
                            "currentStock"
                        ],
                        NaN
                    )
                );

                const reorder = Number(
                    text(
                        item,
                        [
                            "reorderLevel",
                            "reorder",
                            "minimumStock",
                            "minStock"
                        ],
                        NaN
                    )
                );

                return (
                    Number.isFinite(quantity) &&
                    Number.isFinite(reorder) &&
                    quantity <= reorder
                );

            })
            .slice(0, 6);


        if (!records.length) {

            container.innerHTML = `
                <div class="dashboard-empty">
                    No low-stock items detected.
                </div>
            `;

            return;
        }


        container.innerHTML = records.map(function (item) {

            const name = text(
                item,
                [
                    "item",
                    "itemName",
                    "product",
                    "name"
                ],
                "Inventory Item"
            );

            const quantity = text(
                item,
                [
                    "quantity",
                    "qty",
                    "stock",
                    "currentStock"
                ],
                "—"
            );


            return `

                <div class="dashboard-list-item">

                    <div class="dashboard-list-main">

                        <div class="dashboard-list-title">
                            ${escape(name)}
                        </div>

                        <div class="dashboard-list-sub">
                            Stock: ${escape(quantity)}
                        </div>

                    </div>

                    <span class="tag">
                        Low
                    </span>

                </div>

            `;

        }).join("");
    }


    /* =====================================================
       AMENITIES
       ===================================================== */

    function renderAmenities() {

        const container = getElement(
            "dashboard-amenity-status"
        );

        if (!container) {
            return;
        }

        const amenities = getData("amenities");


        if (!amenities.length) {

            container.innerHTML = `
                <div class="dashboard-empty">
                    No amenities registered yet.
                </div>
            `;

            return;
        }


        container.innerHTML = amenities
            .slice(0, 40)
            .map(function (amenity) {

                const name = text(
                    amenity,
                    [
                        "amenity",
                        "amenityName",
                        "name",
                        "facility"
                    ],
                    "Amenity"
                );

                const zone = text(
                    amenity,
                    [
                        "zone",
                        "area",
                        "location"
                    ],
                    "Zone not set"
                );

                const status = text(
                    amenity,
                    [
                        "operationalStatus",
                        "status",
                        "state"
                    ],
                    "Registered"
                );


                return `

                    <div class="dashboard-amenity">

                        <div class="dashboard-amenity-name">
                            ${escape(name)}
                        </div>

                        <div class="dashboard-amenity-zone">
                            ${escape(zone)}
                        </div>

                        <span class="tag">
                            ${escape(status)}
                        </span>

                    </div>

                `;

            })
            .join("");
    }


    /* =====================================================
       VECTOR MAP
       ===================================================== */

    function renderVectorMap() {

        const container = getElement(
            "dashboard-vector-layout"
        );

        if (!container) {
            return;
        }

        const amenities = getData("amenities");


        if (!amenities.length) {

            container.innerHTML = `

                <div class="dashboard-vector-empty">

                    <div class="dashboard-vector-empty-title">
                        Facility Layout Ready
                    </div>

                    <div>
                        Add amenities to populate the
                        interactive facility map.
                    </div>

                </div>

            `;

            return;
        }


        const columns = Math.min(
            5,
            Math.max(
                1,
                Math.ceil(
                    Math.sqrt(amenities.length)
                )
            )
        );


        const rows = Math.ceil(
            amenities.length / columns
        );

        const width = 900;

        const height = Math.max(
            300,
            rows * 125
        );

        const cellWidth = width / columns;

        const cellHeight = height / rows;


        const nodes = amenities.map(
            function (amenity, index) {

                const x =
                    (index % columns) *
                    cellWidth + 10;

                const y =
                    Math.floor(index / columns) *
                    cellHeight + 10;

                const nodeWidth = cellWidth - 20;

                const nodeHeight = cellHeight - 20;


                const name = text(
                    amenity,
                    [
                        "amenity",
                        "amenityName",
                        "name",
                        "facility"
                    ],
                    "Amenity"
                );

                const zone = text(
                    amenity,
                    [
                        "zone",
                        "area",
                        "location"
                    ],
                    "Zone"
                );

                const status = text(
                    amenity,
                    [
                        "operationalStatus",
                        "status",
                        "state"
                    ],
                    "Registered"
                );


                return `

                    <g
                        class="dashboard-svg-node"
                        data-index="${index}"
                        tabindex="0"
                        role="button"
                        aria-label="${escape(name)}"
                    >

                        <rect
                            x="${x}"
                            y="${y}"
                            width="${nodeWidth}"
                            height="${nodeHeight}"
                            rx="14"
                        ></rect>

                        <text
                            x="${x + 14}"
                            y="${y + 28}"
                        >
                            ${escape(
                                String(name)
                            ).slice(0, 28)}
                        </text>

                        <text
                            x="${x + 14}"
                            y="${y + 50}"
                            class="svg-subtext"
                        >
                            ${escape(
                                String(zone)
                            ).slice(0, 34)}
                        </text>

                        <text
                            x="${x + 14}"
                            y="${y + 75}"
                            class="svg-status"
                        >
                            ${escape(status)}
                        </text>

                    </g>

                `;
            }
        ).join("");


        container.innerHTML = `

            <div class="dashboard-svg-scroll">

                <svg
                    class="dashboard-facility-svg"
                    viewBox="0 0 ${width} ${height}"
                    role="img"
                    aria-label="Facility amenity layout"
                >

                    <rect
                        x="0"
                        y="0"
                        width="${width}"
                        height="${height}"
                        rx="20"
                        class="svg-boundary"
                    ></rect>

                    ${nodes}

                </svg>

            </div>

        `;
    }


    /* =====================================================
       CONTROL CENTER SECTION
       ===================================================== */

    function renderControlCenter() {

        const dashboardContainer = getElement(
            "tab-dashboard"
        );

        if (!dashboardContainer) {
            return;
        }


        let controlContainer = getElement(
            "dashboard-control-center"
        );


        if (!controlContainer) {

            controlContainer = document.createElement("section");

            controlContainer.id =
                "dashboard-control-center";

            controlContainer.className =
                "dashboard-control-center";

            dashboardContainer.appendChild(
                controlContainer
            );
        }


        controlContainer.innerHTML = `

            <div class="card control-center-hero">

                <div>

                    <div class="control-center-eyebrow">
                        FACILITY OPERATIONS
                    </div>

                    <h2>
                        Control Center
                    </h2>

                    <p>
                        Operational control and facility
                        readiness information integrated
                        into the Dashboard.
                    </p>

                </div>

                <div class="control-center-actions">

                    <button
                        type="button"
                        class="btn"
                        id="dashboardControlRefresh"
                    >
                        Refresh
                    </button>

                    <button
                        type="button"
                        class="btn btn-primary"
                        id="dashboardControlChecklist"
                    >
                        Open Checklist
                    </button>

                </div>

            </div>


            <div class="control-center-kpis">

                <div class="control-kpi">

                    <span>
                        Total Amenities
                    </span>

                    <strong id="dashboard-control-total-amenities">
                        0
                    </strong>

                </div>


                <div class="control-kpi">

                    <span>
                        Operational
                    </span>

                    <strong id="dashboard-control-operational">
                        0
                    </strong>

                </div>


                <div class="control-kpi">

                    <span>
                        Maintenance
                    </span>

                    <strong id="dashboard-control-maintenance">
                        0
                    </strong>

                </div>


                <div class="control-kpi">

                    <span>
                        Closed
                    </span>

                    <strong id="dashboard-control-closed">
                        0
                    </strong>

                </div>


                <div class="control-kpi">

                    <span>
                        Pending Tasks
                    </span>

                    <strong id="dashboard-control-pending">
                        0
                    </strong>

                </div>


                <div class="control-kpi">

                    <span>
                        Completion
                    </span>

                    <strong id="dashboard-control-completion">
                        0%
                    </strong>

                </div>

            </div>


            <div class="card">

                <div class="card-header">

                    <div>

                        <h3>
                            Operational Readiness
                        </h3>

                        <div class="checklist-subtitle">
                            Current facility readiness based
                            on Amenity Master and Checklist data.
                        </div>

                    </div>

                </div>


                <div class="control-readiness">

                    <div class="control-progress-wrap">

                        <div class="control-progress-header">

                            <span>
                                Checklist Completion
                            </span>

                            <strong
                                id="dashboard-control-progress-value"
                            >
                                0%
                            </strong>

                        </div>


                        <div class="control-progress">

                            <div
                                id="dashboard-control-progress-bar"
                                class="control-progress-bar"
                                style="width:0%"
                            ></div>

                        </div>

                    </div>


                    <div
                        id="dashboard-control-readiness-message"
                        class="control-readiness-message"
                    >
                        No checklist activity recorded yet.
                    </div>

                </div>

            </div>


            <div class="control-center-grid">

                <div class="card">

                    <div class="card-header">

                        <div>

                            <h3>
                                Amenity Control
                            </h3>

                            <div class="checklist-subtitle">
                                Live operational status from
                                Amenity Master.
                            </div>

                        </div>

                        <button
                            type="button"
                            class="btn"
                            id="dashboardControlAmenities"
                        >
                            Amenity Master
                        </button>

                    </div>


                    <div
                        id="dashboard-control-amenity-list"
                        class="control-list"
                    ></div>

                </div>


                <div class="card">

                    <div class="card-header">

                        <div>

                            <h3>
                                Checklist Control
                            </h3>

                            <div class="checklist-subtitle">
                                Current operational task execution.
                            </div>

                        </div>

                        <button
                            type="button"
                            class="btn"
                            id="dashboardControlChecklistSecondary"
                        >
                            Checklist
                        </button>

                    </div>


                    <div
                        id="dashboard-control-checklist-list"
                        class="control-list"
                    ></div>

                </div>

            </div>


            <div class="card">

                <div class="card-header">

                    <div>

                        <h3>
                            Shift Control
                        </h3>

                        <div class="checklist-subtitle">
                            Quick operational view by checklist shift.
                        </div>

                    </div>

                </div>


                <div class="control-shift-grid">

                    <button
                        type="button"
                        class="control-shift-card"
                        data-dashboard-shift="Morning"
                    >

                        <span>
                            Morning Shift
                        </span>

                        <strong id="dashboard-control-morning-count">
                            0
                        </strong>

                        <small>
                            checklist tasks
                        </small>

                    </button>


                    <button
                        type="button"
                        class="control-shift-card"
                        data-dashboard-shift="Evening"
                    >

                        <span>
                            Evening Shift
                        </span>

                        <strong id="dashboard-control-evening-count">
                            0
                        </strong>

                        <small>
                            checklist tasks
                        </small>

                    </button>

                </div>

            </div>


            <div class="card">

                <div class="card-header">

                    <div>

                        <h3>
                            Quick Actions
                        </h3>

                        <div class="checklist-subtitle">
                            Navigate directly to operational modules.
                        </div>

                    </div>

                </div>


                <div class="control-quick-actions">

                    <button
                        type="button"
                        class="btn btn-primary"
                        id="dashboardControlQuickChecklist"
                    >
                        Daily Checklist
                    </button>


                    <button
                        type="button"
                        class="btn"
                        id="dashboardControlQuickAmenities"
                    >
                        Amenity Master
                    </button>

                </div>

            </div>

        `;


        renderControlKPIs();

        renderControlAmenityStatus();

        renderControlChecklistStatus();

        renderControlShiftControl();

        bindControlEvents();
    }


    /* =====================================================
       CONTROL CENTER KPI RENDER
       ===================================================== */

    function renderControlKPIs() {

        const stats = getControlStats();


        setText(
            "dashboard-control-total-amenities",
            stats.totalAmenities
        );

        setText(
            "dashboard-control-operational",
            stats.operationalAmenities
        );

        setText(
            "dashboard-control-maintenance",
            stats.maintenanceAmenities
        );

        setText(
            "dashboard-control-closed",
            stats.closedAmenities
        );

        setText(
            "dashboard-control-pending",
            stats.pendingTasks
        );

        setText(
            "dashboard-control-completion",
            `${stats.completion}%`
        );

        setText(
            "dashboard-control-progress-value",
            `${stats.completion}%`
        );


        const progress = getElement(
            "dashboard-control-progress-bar"
        );

        if (progress) {
            progress.style.width = `${stats.completion}%`;
        }


        const message = getElement(
            "dashboard-control-readiness-message"
        );

        if (!message) {
            return;
        }


        if (!stats.totalAmenities) {

            message.textContent =
                "No amenities have been configured in Amenity Master.";

            return;
        }


        if (!stats.totalTasks) {

            message.textContent =
                "Amenities are configured, but no checklist tasks have been created.";

            return;
        }


        if (stats.completion === 100) {

            message.textContent =
                "All checklist tasks are completed. Facility operational checklist is fully complete.";

            return;
        }


        if (stats.completion >= 75) {

            message.textContent =
                "Operational checklist is substantially complete. Review remaining pending tasks.";

            return;
        }


        if (stats.completion >= 50) {

            message.textContent =
                "Operational activity is in progress. Continue completing pending tasks.";

            return;
        }


        message.textContent =
            "Multiple checklist tasks remain pending. Immediate operational follow-up is recommended.";
    }


    /* =====================================================
       CONTROL CENTER AMENITY STATUS
       ===================================================== */

    function renderControlAmenityStatus() {

        const container = getElement(
            "dashboard-control-amenity-list"
        );

        if (!container) {
            return;
        }

        const amenities = getData("amenities");


        if (!amenities.length) {

            container.innerHTML = `
                <div class="dashboard-empty">
                    No amenities configured.
                </div>
            `;

            return;
        }


        container.innerHTML = amenities
            .slice(0, 12)
            .map(function (amenity) {

                const amenityId = text(
                    amenity,
                    [
                        "amenityId",
                        "id",
                        "code"
                    ],
                    "—"
                );

                const name = text(
                    amenity,
                    [
                        "amenity",
                        "amenityName",
                        "name",
                        "facility",
                        "title"
                    ],
                    "Unnamed Amenity"
                );

                const status = text(
                    amenity,
                    [
                        "operationalStatus",
                        "status",
                        "state"
                    ],
                    "Operational"
                );


                const statusClass = String(status)
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");


                return `

                    <div class="control-list-item">

                        <div>

                            <strong>
                                ${escape(amenityId)}
                            </strong>

                            <span>
                                ${escape(name)}
                            </span>

                        </div>

                        <span
                            class="
                                control-status
                                control-status-${statusClass}
                            "
                        >
                            ${escape(status)}
                        </span>

                    </div>

                `;

            })
            .join("");


        if (amenities.length > 12) {

            container.insertAdjacentHTML(
                "beforeend",
                `
                    <div class="control-list-more">
                        Showing 12 of ${amenities.length} amenities.
                    </div>
                `
            );
        }
    }


    /* =====================================================
       CONTROL CENTER CHECKLIST STATUS
       ===================================================== */

    function renderControlChecklistStatus() {

        const container = getElement(
            "dashboard-control-checklist-list"
        );

        if (!container) {
            return;
        }

        const checklist = getData("control");


        if (!checklist.length) {

            container.innerHTML = `
                <div class="dashboard-empty">
                    No checklist tasks configured.
                </div>
            `;

            return;
        }


        const pending = checklist.filter(function (record) {

            return !isCompleted(
                text(
                    record,
                    [
                        "status",
                        "taskStatus",
                        "completionStatus"
                    ],
                    "Pending"
                )
            );
        });


        const records = pending.length
            ? pending
            : checklist;


        container.innerHTML = records
            .slice(0, 10)
            .map(function (record) {

                const status = text(
                    record,
                    [
                        "status",
                        "taskStatus",
                        "completionStatus"
                    ],
                    "Pending"
                );

                const task = text(
                    record,
                    [
                        "task",
                        "taskName",
                        "description",
                        "amenity",
                        "amenityName",
                        "name"
                    ],
                    "Checklist Task"
                );

                const amenityId = text(
                    record,
                    [
                        "amenityId",
                        "id",
                        "code"
                    ],
                    "—"
                );


                const statusClass = isCompleted(status)
                    ? "control-status-completed"
                    : "control-status-pending";


                return `

                    <div class="control-list-item">

                        <div>

                            <strong>
                                ${escape(amenityId)}
                            </strong>

                            <span>
                                ${escape(task)}
                            </span>

                        </div>

                        <span
                            class="
                                control-status
                                ${statusClass}
                            "
                        >
                            ${escape(status)}
                        </span>

                    </div>

                `;

            })
            .join("");


        if (!pending.length) {

            container.insertAdjacentHTML(
                "afterbegin",
                `
                    <div class="control-all-clear">
                        ✓ All checklist tasks completed
                    </div>
                `
            );
        }


        if (records.length > 10) {

            container.insertAdjacentHTML(
                "beforeend",
                `
                    <div class="control-list-more">
                        Showing 10 of ${records.length} checklist tasks.
                    </div>
                `
            );
        }
    }


    /* =====================================================
       CONTROL CENTER SHIFT CONTROL
       ===================================================== */

    function renderControlShiftControl() {

        const checklist = getData("control");


        const morning = checklist.filter(function (record) {

            return String(
                text(
                    record,
                    [
                        "shift",
                        "timeShift"
                    ],
                    "Morning"
                )
            ).trim().toLowerCase() === "morning";

        }).length;


        const evening = checklist.filter(function (record) {

            return String(
                text(
                    record,
                    [
                        "shift",
                        "timeShift"
                    ],
                    "Morning"
                )
            ).trim().toLowerCase() === "evening";

        }).length;


        setText(
            "dashboard-control-morning-count",
            morning
        );

        setText(
            "dashboard-control-evening-count",
            evening
        );
    }


    /* =====================================================
       CONTROL CENTER EVENTS
       ===================================================== */

    function bindControlEvents() {

        const container = getElement(
            "dashboard-control-center"
        );

        if (!container || container.dataset.eventsBound === "true") {
            return;
        }

        container.dataset.eventsBound = "true";


        container.addEventListener(
            "click",
            function (event) {

                const button = event.target.closest("button");

                if (!button || !container.contains(button)) {
                    return;
                }


                if (
                    button.id === "dashboardControlRefresh"
                ) {
                    render();
                    return;
                }


                if (
                    button.id === "dashboardControlChecklist" ||
                    button.id === "dashboardControlChecklistSecondary" ||
                    button.id === "dashboardControlQuickChecklist"
                ) {
                    navigate("control");
                    return;
                }


                if (
                    button.id === "dashboardControlAmenities" ||
                    button.id === "dashboardControlQuickAmenities"
                ) {
                    navigate("amenities");
                    return;
                }


                if (
                    button.classList.contains(
                        "control-shift-card"
                    )
                ) {

                    const shift =
                        button.dataset.dashboardShift ||
                        "Morning";


                    navigate("control");


                    window.setTimeout(function () {

                        const shiftSelect =
                            getElement("checklistShift");

                        if (shiftSelect) {

                            shiftSelect.value = shift;

                            shiftSelect.dispatchEvent(
                                new Event("change")
                            );
                        }

                    }, 0);
                }

            }
        );
    }


    /* =====================================================
       MAIN RENDER
       ===================================================== */

    function render() {

        if (!isDashboardActive()) {
            return;
        }


        renderKPIs();

        renderIssues();

        renderBookings();

        renderStaff();

        renderInventory();

        renderAmenities();

        renderVectorMap();

        renderControlCenter();


        const date = getElement("currentDate");

        if (date) {

            date.textContent =
                new Intl.DateTimeFormat(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                ).format(
                    new Date()
                );
        }
    }


    /* =====================================================
       LIFECYCLE
       ===================================================== */

    function init() {
        render();
    }


    function destroy() {
        // Dashboard does not create timers or global listeners.
    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.FXDashboard = {
        render,
        renderKPIs,
        renderIssues,
        renderBookings,
        renderStaff,
        renderInventory,
        renderAmenities,
        renderVectorMap,
        renderControlCenter,
        getTaskSummary,
        getControlStats
    };


    /* =====================================================
       MODULE REGISTRATION
       ===================================================== */

    if (
        typeof window.registerFXModule === "function"
    ) {

        window.registerFXModule(
            "dashboard",
            {
                init,
                render,
                destroy
            }
        );

    }
    
// Floor Plan Viewer Logic - Globally Accessible
window.changeFloorPlan = function(floorId) {
    // 1. Hide all floor plan views
    const allViews = document.querySelectorAll('.floor-plan-view');
    allViews.forEach(view => {
        view.classList.remove('active');
    });

    // 2. Show the selected floor plan
    const selectedView = document.getElementById('plan-' + floorId);
    if (selectedView) {
        selectedView.classList.add('active');
    }
};



})();