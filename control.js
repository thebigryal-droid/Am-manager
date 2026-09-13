/* =========================================================
   FACILITY EXECUTIVE OS
   CONTROL CENTER
   MODULAR OPERATIONAL CONTROL MODULE
   ========================================================= */

(function (window, document) {

    "use strict";

    const FX = window.FX = window.FX || {};
    const Data = window.FXData = window.FXData || {};

    const AMENITY_COLLECTION = "amenities";
    const CHECKLIST_COLLECTION = "control";

    const STATUS = {
        PENDING: "Pending",
        COMPLETED: "Completed"
    };

    let eventsBound = false;


    /* =====================================================
       HELPERS
       ===================================================== */

    function get(id) {
        return document.getElementById(id);
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


    function getAmenities() {

        if (typeof Data.get !== "function") {
            return [];
        }

        return Data.get(AMENITY_COLLECTION) || [];
    }


    function getChecklist() {

        if (typeof Data.get !== "function") {
            return [];
        }

        return Data.get(CHECKLIST_COLLECTION) || [];
    }


    function setText(id, value) {

        const element = get(id);

        if (element) {
            element.textContent = value;
        }
    }


    function isActiveTab() {

        const activeTab =
            FX &&
            FX.state &&
            FX.state.activeTab;

        return !activeTab || activeTab === "control-center";
    }


    /* =====================================================
       CALCULATIONS
       ===================================================== */

    function getControlStats() {

        const amenities = getAmenities();
        const checklist = getChecklist();

        const totalAmenities = amenities.length;

        const operationalAmenities = amenities.filter(
            function (item) {
                return item.operationalStatus === "Operational";
            }
        ).length;

        const maintenanceAmenities = amenities.filter(
            function (item) {
                return item.operationalStatus === "Maintenance";
            }
        ).length;

        const closedAmenities = amenities.filter(
            function (item) {
                return item.operationalStatus === "Closed";
            }
        ).length;

        const totalTasks = checklist.length;

        const completedTasks = checklist.filter(
            function (item) {
                return item.status === STATUS.COMPLETED;
            }
        ).length;

        const pendingTasks = totalTasks - completedTasks;

        const completion = totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;

        return {
            totalAmenities,
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
       MAIN RENDER
       ===================================================== */

    function render() {

        if (!isActiveTab()) {
            return;
        }

        const container = get("tab-control-center");

        if (!container) {
            return;
        }

        container.innerHTML = `

            <div class="control-center-page">

                <div class="card control-center-hero">

                    <div>

                        <div class="control-center-eyebrow">
                            FACILITY OPERATIONS
                        </div>

                        <h2>
                            Control Center
                        </h2>

                        <p>
                            Central operational view for
                            amenities, checklist execution
                            and current facility readiness.
                        </p>

                    </div>

                    <div class="control-center-actions">

                        <button
                            type="button"
                            class="btn"
                            id="controlRefreshButton"
                        >
                            Refresh
                        </button>

                        <button
                            type="button"
                            class="btn btn-primary"
                            id="controlChecklistButton"
                        >
                            Open Checklist
                        </button>

                    </div>

                </div>


                <div class="control-center-kpis">

                    <div class="control-kpi">
                        <span>Total Amenities</span>
                        <strong id="control-total-amenities">0</strong>
                    </div>

                    <div class="control-kpi">
                        <span>Operational</span>
                        <strong id="control-operational">0</strong>
                    </div>

                    <div class="control-kpi">
                        <span>Maintenance</span>
                        <strong id="control-maintenance">0</strong>
                    </div>

                    <div class="control-kpi">
                        <span>Closed</span>
                        <strong id="control-closed">0</strong>
                    </div>

                    <div class="control-kpi">
                        <span>Pending Tasks</span>
                        <strong id="control-pending">0</strong>
                    </div>

                    <div class="control-kpi">
                        <span>Completion</span>
                        <strong id="control-completion">0%</strong>
                    </div>

                </div>


                <div class="card">

                    <div class="card-header">

                        <div>

                            <h3>
                                Operational Readiness
                            </h3>

                            <div class="checklist-subtitle">
                                Current facility readiness
                                based on Amenity Master
                                and Checklist data.
                            </div>

                        </div>

                    </div>

                    <div class="control-readiness">

                        <div class="control-progress-wrap">

                            <div class="control-progress-header">

                                <span>
                                    Checklist Completion
                                </span>

                                <strong id="control-progress-value">
                                    0%
                                </strong>

                            </div>

                            <div class="control-progress">

                                <div
                                    id="control-progress-bar"
                                    class="control-progress-bar"
                                    style="width:0%"
                                ></div>

                            </div>

                        </div>

                        <div
                            id="control-readiness-message"
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
                                    Live operational status
                                    from Amenity Master.
                                </div>

                            </div>

                            <button
                                type="button"
                                class="btn"
                                id="controlAmenitiesButton"
                            >
                                Amenity Master
                            </button>

                        </div>

                        <div
                            id="control-amenity-list"
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
                                    Current operational
                                    task execution.
                                </div>

                            </div>

                            <button
                                type="button"
                                class="btn"
                                id="controlChecklistButton2"
                            >
                                Checklist
                            </button>

                        </div>

                        <div
                            id="control-checklist-list"
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
                                Quick operational view by
                                checklist shift.
                            </div>

                        </div>

                    </div>

                    <div class="control-shift-grid">

                        <button
                            type="button"
                            class="control-shift-card"
                            data-shift="Morning"
                        >

                            <span>
                                Morning Shift
                            </span>

                            <strong id="control-morning-count">
                                0
                            </strong>

                            <small>
                                checklist tasks
                            </small>

                        </button>


                        <button
                            type="button"
                            class="control-shift-card"
                            data-shift="Evening"
                        >

                            <span>
                                Evening Shift
                            </span>

                            <strong id="control-evening-count">
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
                                Navigate directly to the
                                operational modules.
                            </div>

                        </div>

                    </div>

                    <div class="control-quick-actions">

                        <button
                            type="button"
                            class="btn btn-primary"
                            id="controlQuickChecklist"
                        >
                            Daily Checklist
                        </button>

                        <button
                            type="button"
                            class="btn"
                            id="controlQuickAmenities"
                        >
                            Amenity Master
                        </button>

                        <button
                            type="button"
                            class="btn"
                            id="controlQuickDashboard"
                        >
                            Dashboard
                        </button>

                    </div>

                </div>

            </div>

        `;

        bindEvents();

        renderKPIs();
        renderAmenityStatus();
        renderChecklistStatus();
        renderShiftControl();
    }


    /* =====================================================
       KPI RENDER
       ===================================================== */

    function renderKPIs() {

        const stats = getControlStats();

        setText("control-total-amenities", stats.totalAmenities);
        setText("control-operational", stats.operationalAmenities);
        setText("control-maintenance", stats.maintenanceAmenities);
        setText("control-closed", stats.closedAmenities);
        setText("control-pending", stats.pendingTasks);
        setText("control-completion", `${stats.completion}%`);
        setText("control-progress-value", `${stats.completion}%`);

        const progress = get("control-progress-bar");

        if (progress) {
            progress.style.width = `${stats.completion}%`;
        }

        const message = get("control-readiness-message");

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
       AMENITY STATUS
       ===================================================== */

    function renderAmenityStatus() {

        const container = get("control-amenity-list");

        if (!container) {
            return;
        }

        const amenities = getAmenities();

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
            .map(
                function (amenity) {

                    const status =
                        amenity.operationalStatus ||
                        "Operational";

                    const statusClass =
                        String(status)
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, "");

                    return `

                        <div class="control-list-item">

                            <div>

                                <strong>
                                    ${escape(
                                        amenity.amenityId || "—"
                                    )}
                                </strong>

                                <span>
                                    ${escape(
                                        amenity.amenity ||
                                        "Unnamed Amenity"
                                    )}
                                </span>

                            </div>

                            <span class="
                                control-status
                                control-status-${statusClass}
                            ">
                                ${escape(status)}
                            </span>

                        </div>

                    `;
                }
            )
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
       CHECKLIST STATUS
       ===================================================== */

    function renderChecklistStatus() {

        const container = get("control-checklist-list");

        if (!container) {
            return;
        }

        const checklist = getChecklist();

        if (!checklist.length) {

            container.innerHTML = `
                <div class="dashboard-empty">
                    No checklist tasks configured.
                </div>
            `;

            return;
        }

        const pending = checklist.filter(
            function (record) {
                return (
                    record.status || STATUS.PENDING
                ) === STATUS.PENDING;
            }
        );

        const records = pending.length ? pending : checklist;

        container.innerHTML = records
            .slice(0, 10)
            .map(
                function (record) {

                    const status =
                        record.status ||
                        STATUS.PENDING;

                    const statusClass =
                        status === STATUS.COMPLETED
                            ? "control-status-completed"
                            : "control-status-pending";

                    return `

                        <div class="control-list-item">

                            <div>

                                <strong>
                                    ${escape(
                                        record.amenityId || "—"
                                    )}
                                </strong>

                                <span>
                                    ${escape(
                                        record.task ||
                                        record.amenity ||
                                        "Checklist Task"
                                    )}
                                </span>

                            </div>

                            <span class="
                                control-status
                                ${statusClass}
                            ">
                                ${escape(status)}
                            </span>

                        </div>

                    `;
                }
            )
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
    }


    /* =====================================================
       SHIFT CONTROL
       ===================================================== */

    function renderShiftControl() {

        const checklist = getChecklist();

        const morning = checklist.filter(
            function (record) {
                return (record.shift || "Morning") === "Morning";
            }
        ).length;

        const evening = checklist.filter(
            function (record) {
                return record.shift === "Evening";
            }
        ).length;

        setText("control-morning-count", morning);
        setText("control-evening-count", evening);
    }


    /* =====================================================
       NAVIGATION
       ===================================================== */

    function navigate(tabId) {

        if (typeof window.switchTab === "function") {
            window.switchTab(tabId);
        }
    }


    function navigateToShift(shift) {

        if (typeof window.switchTab !== "function") {
            return;
        }

        window.switchTab("control");

        window.setTimeout(function () {

            const shiftSelect =
                document.getElementById("checklistShift");

            if (shiftSelect) {
                shiftSelect.value = shift;
                shiftSelect.dispatchEvent(new Event("change"));
            }

        }, 0);
    }


    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {

        const container = get("tab-control-center");

        if (!container || eventsBound) {
            return;
        }

        eventsBound = true;

        container.addEventListener("click", function (event) {

            const target = event.target.closest("button");

            if (!target || !container.contains(target)) {
                return;
            }

            if (target.id === "controlRefreshButton") {
                render();
                return;
            }

            if (
                target.id === "controlChecklistButton" ||
                target.id === "controlChecklistButton2" ||
                target.id === "controlQuickChecklist"
            ) {
                navigate("control");
                return;
            }

            if (
                target.id === "controlAmenitiesButton" ||
                target.id === "controlQuickAmenities"
            ) {
                navigate("amenities");
                return;
            }

            if (target.id === "controlQuickDashboard") {
                navigate("dashboard");
                return;
            }

            if (target.classList.contains("control-shift-card")) {
                navigateToShift(target.dataset.shift || "Morning");
            }

        });

    }


    /* =====================================================
       LIFECYCLE
       ===================================================== */

    function init() {
        render();
    }


    function destroy() {
        // Delegated listener remains safely attached to the module container.
        // The container is replaced during render, so no duplicate child
        // listeners are created.
    }


    /* =====================================================
       REGISTER
       ===================================================== */

    if (typeof window.registerFXModule === "function") {

        window.registerFXModule(
            "control-center",
            {
                init,
                render,
                destroy
            }
        );

    }

})(window, document);