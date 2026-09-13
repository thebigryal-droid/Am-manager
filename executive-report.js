/* =========================================================
   FACILITY EXECUTIVE OS
   EXECUTIVE REPORT
   ========================================================= */

(function (window, document) {

    "use strict";

    const FX = window.FX = window.FX || {};
    const Data = window.FXData = window.FXData || {};

    const AMENITY_COLLECTION = "amenities";
    const CHECKLIST_COLLECTION = "control";

    let initialized = false;
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

        const records = Data.get(AMENITY_COLLECTION);

        return Array.isArray(records) ? records : [];
    }


    function getChecklist() {

        if (typeof Data.get !== "function") {
            return [];
        }

        const records = Data.get(CHECKLIST_COLLECTION);

        return Array.isArray(records) ? records : [];
    }


    function today() {

        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    function formatDate(value) {

        if (!value) {
            return "";
        }

        const stringValue = String(value);

        const date = new Date(
            /^\d{4}-\d{2}-\d{2}$/.test(stringValue)
                ? `${stringValue}T00:00:00`
                : stringValue
        );

        if (Number.isNaN(date.getTime())) {
            return stringValue;
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

        return !activeTab || activeTab === "daily_report";
    }


    function getInventoryReport() {

        if (
            window.FXInventoryReport &&
            typeof window.FXInventoryReport.getDailyData === "function"
        ) {

            try {

                const report =
                    window.FXInventoryReport.getDailyData(today());

                if (report && typeof report === "object") {
                    return normalizeInventoryReport(report);
                }

            } catch (error) {

                console.error(
                    "Executive Report inventory data error:",
                    error
                );

            }

        }

        return normalizeInventoryReport({
            date: today()
        });
    }


    function normalizeInventoryReport(report) {

        const source =
            report && typeof report === "object"
                ? report
                : {};

        return Object.assign(
            {
                date: today(),
                totalItems: 0,
                newMaterialsToday: 0,
                newMaterials: [],
                transactionsToday: 0,
                stockInToday: 0,
                stockOutToday: 0,
                adjustmentsToday: 0,
                totalQuantityReceived: 0,
                totalQuantityIssued: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                reorderCount: 0,
                lowStockItems: [],
                outOfStockItems: [],
                reorderItems: []
            },
            source,
            {
                newMaterials: Array.isArray(source.newMaterials)
                    ? source.newMaterials
                    : [],

                lowStockItems: Array.isArray(source.lowStockItems)
                    ? source.lowStockItems
                    : [],

                outOfStockItems: Array.isArray(source.outOfStockItems)
                    ? source.outOfStockItems
                    : [],

                reorderItems: Array.isArray(source.reorderItems)
                    ? source.reorderItems
                    : []
            }
        );
    }


    /* =====================================================
       DATA ANALYSIS
       ===================================================== */

    function analyseData() {

        const amenities = getAmenities();
        const checklist = getChecklist();
        const inventory = getInventoryReport();


        /* -------------------------------------------------
           AMENITIES
           ------------------------------------------------- */

        const totalAmenities = amenities.length;

        const operationalAmenities = amenities.filter(
            function (item) {

                return (
                    item.status === "Operational" ||
                    item.operationalStatus === "Operational"
                );

            }
        ).length;


        const maintenanceAmenities = amenities.filter(
            function (item) {

                return (
                    item.status === "Maintenance" ||
                    item.operationalStatus === "Maintenance"
                );

            }
        ).length;


        const closedAmenities = amenities.filter(
            function (item) {

                return (
                    item.status === "Closed" ||
                    item.operationalStatus === "Closed"
                );

            }
        ).length;


        /* -------------------------------------------------
           CHECKLIST
           ------------------------------------------------- */

        const totalTasks = checklist.length;

        const completedTasks = checklist.filter(
            function (item) {
                return item.status === "Completed";
            }
        ).length;

        const pendingTasks = checklist.filter(
            function (item) {
                return item.status !== "Completed";
            }
        ).length;

        const completion = totalTasks
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;


        /* -------------------------------------------------
           READINESS
           ------------------------------------------------- */

        const readiness = totalAmenities
            ? Math.round(
                (operationalAmenities / totalAmenities) * 100
            )
            : 100;


        /* -------------------------------------------------
           OBSERVATIONS
           ------------------------------------------------- */

        const observations = [];


        if (maintenanceAmenities > 0) {

            observations.push(
                `${maintenanceAmenities} amenity ${
                    maintenanceAmenities === 1
                        ? "requires"
                        : "require"
                } maintenance attention.`
            );

        }


        if (closedAmenities > 0) {

            observations.push(
                `${closedAmenities} amenity ${
                    closedAmenities === 1
                        ? "is"
                        : "are"
                } currently closed.`
            );

        }


        if (pendingTasks > 0) {

            observations.push(
                `${pendingTasks} checklist ${
                    pendingTasks === 1
                        ? "task remains"
                        : "tasks remain"
                } pending.`
            );

        }


        if (totalTasks > 0 && completion === 100) {

            observations.push(
                "All recorded checklist tasks have been completed."
            );

        }


        if (totalAmenities > 0 && readiness === 100) {

            observations.push(
                "All recorded amenities are operational."
            );

        }


        /* -------------------------------------------------
           INVENTORY OBSERVATIONS
           ------------------------------------------------- */

        if (inventory.newMaterialsToday > 0) {

            observations.push(
                `${inventory.newMaterialsToday} new ${
                    inventory.newMaterialsToday === 1
                        ? "material was"
                        : "materials were"
                } added to inventory today.`
            );

        }


        if (inventory.stockInToday > 0) {

            observations.push(
                `${inventory.stockInToday} stock-in ${
                    inventory.stockInToday === 1
                        ? "transaction was"
                        : "transactions were"
                } recorded today, totalling ${
                    inventory.totalQuantityReceived
                } unit(s).`
            );

        }


        if (inventory.stockOutToday > 0) {

            observations.push(
                `${inventory.stockOutToday} stock-out ${
                    inventory.stockOutToday === 1
                        ? "transaction was"
                        : "transactions were"
                } recorded today, totalling ${
                    inventory.totalQuantityIssued
                } unit(s).`
            );

        }


        if (inventory.lowStockCount > 0) {

            observations.push(
                `${inventory.lowStockCount} inventory ${
                    inventory.lowStockCount === 1
                        ? "item is"
                        : "items are"
                } at low-stock level.`
            );

        }


        if (inventory.reorderCount > 0) {

            observations.push(
                `${inventory.reorderCount} inventory ${
                    inventory.reorderCount === 1
                        ? "item requires"
                        : "items require"
                } reorder attention.`
            );

        }


        if (inventory.outOfStockCount > 0) {

            observations.push(
                `${inventory.outOfStockCount} inventory ${
                    inventory.outOfStockCount === 1
                        ? "item is"
                        : "items are"
                } currently out of stock.`
            );

        }


        if (!observations.length) {

            observations.push(
                "No significant operational observations are currently available from the recorded data."
            );

        }


        return {

            totalAmenities,
            operationalAmenities,
            maintenanceAmenities,
            closedAmenities,

            totalTasks,
            completedTasks,
            pendingTasks,

            completion,
            readiness,

            inventory,
            observations

        };
    }


    /* =====================================================
       INVENTORY MATERIAL LIST
       ===================================================== */

    function renderNewMaterials(materials) {

        if (!Array.isArray(materials) || !materials.length) {

            return `
                <tr>
                    <td colspan="4" class="empty-state">
                        No new materials were added today.
                    </td>
                </tr>
            `;

        }


        return materials.map(
            function (item) {

                return `
                    <tr>

                        <td>
                            ${escape(item.itemId || "—")}
                        </td>

                        <td>
                            ${escape(item.itemName || "—")}
                        </td>

                        <td>
                            ${escape(item.category || "—")}
                        </td>

                        <td>
                            ${escape(item.quantity ?? "0")}
                            ${escape(item.unit || "")}
                        </td>

                    </tr>
                `;

            }
        ).join("");
    }


    /* =====================================================
       INVENTORY ALERT LIST
       ===================================================== */

    function renderInventoryAlerts(inventory) {

        const alerts = [];


        (inventory.lowStockItems || []).forEach(
            function (name) {

                alerts.push({
                    name,
                    type: "Low Stock"
                });

            }
        );


        (inventory.reorderItems || []).forEach(
            function (name) {

                alerts.push({
                    name,
                    type: "Reorder"
                });

            }
        );


        (inventory.outOfStockItems || []).forEach(
            function (name) {

                alerts.push({
                    name,
                    type: "Out of Stock"
                });

            }
        );


        if (!alerts.length) {

            return `
                <div class="empty-state">
                    No inventory alerts. All recorded materials are currently within monitored stock levels.
                </div>
            `;

        }


        return alerts.map(
            function (item) {

                return `
                    <div class="report-analysis-item">

                        <span class="report-analysis-icon">
                            •
                        </span>

                        <span>

                            <strong>
                                ${escape(item.type)}
                            </strong>

                            —
                            ${escape(item.name)}

                        </span>

                    </div>
                `;

            }
        ).join("");
    }


    /* =====================================================
       AMENITY TABLE
       ===================================================== */

    function renderAmenityRows() {

        const amenities = getAmenities();

        if (!amenities.length) {

            return `
                <tr>
                    <td colspan="5" class="empty-state">
                        No amenities recorded.
                    </td>
                </tr>
            `;

        }


        return amenities.map(
            function (item) {

                return `
                    <tr>

                        <td>
                            ${escape(item.amenityId || "—")}
                        </td>

                        <td>
                            ${escape(item.zone || "—")}
                        </td>

                        <td>
                            ${escape(
                                item.amenity ||
                                item.amenityName ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escape(item.responsible || "—")}
                        </td>

                        <td>
                            ${escape(
                                item.status ||
                                item.operationalStatus ||
                                "—"
                            )}
                        </td>

                    </tr>
                `;

            }
        ).join("");
    }


    /* =====================================================
       CHECKLIST TABLE
       ===================================================== */

    function renderChecklistRows() {

        const checklist = getChecklist();

        if (!checklist.length) {

            return `
                <tr>
                    <td colspan="6" class="empty-state">
                        No checklist records available.
                    </td>
                </tr>
            `;

        }


        return checklist.map(
            function (item) {

                return `
                    <tr>

                        <td>
                            ${escape(
                                item.amenity ||
                                item.amenityName ||
                                item.amenityId ||
                                "—"
                            )}
                        </td>

                        <td>
                            ${escape(item.task || "—")}
                        </td>

                        <td>
                            ${escape(item.responsible || "—")}
                        </td>

                        <td>
                            ${escape(item.shift || "—")}
                        </td>

                        <td>
                            ${escape(item.status || "Pending")}
                        </td>

                        <td>
                            ${escape(item.remarks || "—")}
                        </td>

                    </tr>
                `;

            }
        ).join("");
    }


       /* =====================================================
       REPORT RENDER
       ===================================================== */

    function render() {
        if (!isActiveTab()) return;
        const container = get("tab-daily_report");
        if (!container) return;

        const stats = analyseData();
        const inventory = stats.inventory;
        const reportDate = today();

        // Helper function for the new collapsible card headers
        const cardHeader = (title, subtitle = "") => `
            <div class="card-header">
                <div>
                    <h3>${title}</h3>
                    ${subtitle ? `<p class="muted" style="margin: 4px 0 0; font-size: 12px;">${subtitle}</p>` : ''}
                </div>
                <div class="card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>
        `;

        container.innerHTML = `
            <div class="executive-report">
                <div class="card report-toolbar">
                    <div>
                        <div class="eyebrow">FACILITY EXECUTIVE OS</div>
                        <h2>Executive Report</h2>
                        <p class="muted">Operational performance and management summary</p>
                    </div>
                    <div class="report-actions">
                        <button class="btn" type="button" id="executive-refresh">Refresh</button>
                        <button class="btn btn-primary" type="button" id="executive-print">Print / PDF</button>
                    </div>
                </div>

                <div class="card report-meta">
                    <div class="form-grid">
                        <div class="report-date-card">
                            <div class="report-date-icon"><span>▣</span></div>
                            <div class="report-date-content">
                                <span class="report-date-label">REPORT DATE</span>
                                <input type="date" id="executive-report-date" value="${escape(reportDate)}" class="report-date-input">
                            </div>
                        </div>
                        <div class="report-title-card">
                            <div class="report-title-icon"><span>✦</span></div>
                            <div class="report-title-content">
                                <span class="report-title-label">REPORT TITLE</span>
                                <input type="text" id="executive-report-title" value="Daily Executive Operations Report" class="report-title-input">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="report-kpi-grid">
                    <div class="card report-kpi"><span class="report-kpi-label">Total Amenities</span><strong>${stats.totalAmenities}</strong></div>
                    <div class="card report-kpi"><span class="report-kpi-label">Operational</span><strong>${stats.operationalAmenities}</strong></div>
                    <div class="card report-kpi"><span class="report-kpi-label">Maintenance</span><strong>${stats.maintenanceAmenities}</strong></div>
                    <div class="card report-kpi"><span class="report-kpi-label">Closed</span><strong>${stats.closedAmenities}</strong></div>
                    <div class="card report-kpi"><span class="report-kpi-label">Completed Tasks</span><strong>${stats.completedTasks}</strong></div>
                    <div class="card report-kpi"><span class="report-kpi-label">Pending Tasks</span><strong>${stats.pendingTasks}</strong></div>
                </div>

                <div class="report-kpi-grid">
                    <div class="card report-kpi"><span class="report-kpi-label">Inventory Items</span><strong>${inventory.totalItems}</strong></div>
                    <div class="card report-kpi"><span class="report-kpi-label">New Materials Today</span><strong>${inventory.newMaterialsToday}</strong></div>
                    <div class="card report-kpi"><span class="report-kpi-label">Stock In Today</span><strong>${inventory.totalQuantityReceived}</strong></div>
                    <div class="card report-kpi"><span class="report-kpi-label">Stock Out Today</span><strong>${inventory.totalQuantityIssued}</strong></div>
                    <div class="card report-kpi"><span class="report-kpi-label">Low Stock</span><strong>${inventory.lowStockCount}</strong></div>
                    <div class="card report-kpi"><span class="report-kpi-label">Out of Stock</span><strong>${inventory.outOfStockCount}</strong></div>
                </div>

                <div class="report-two-column">
                    <div class="card">
                        <div class="card-header" style="border: none;">
                            <h3>Operational Readiness</h3>
                            <strong>${stats.readiness}%</strong>
                        </div>
                        <div class="report-progress"><div class="report-progress-bar" style="width:${stats.readiness}%"></div></div>
                        <p class="muted" style="padding: 0 20px 20px;">Based on the current operational status recorded in Amenity Master.</p>
                    </div>
                    <div class="card">
                        <div class="card-header" style="border: none;">
                            <h3>Checklist Completion</h3>
                            <strong>${stats.completion}%</strong>
                        </div>
                        <div class="report-progress"><div class="report-progress-bar" style="width:${stats.completion}%"></div></div>
                        <p class="muted" style="padding: 0 20px 20px;">Based on the tasks currently recorded in Daily Checklist.</p>
                    </div>
                </div>

                <!-- COLLAPSIBLE SECTIONS -->
                <div class="card report-section collapsible-card">
                    ${cardHeader('Executive Summary')}
                    <div class="card-body">
                        <textarea id="executive-summary" class="report-textarea" rows="4" placeholder="Write the executive summary for today's operations...">Today's operational status is ${stats.readiness}% ready, with ${stats.operationalAmenities} of ${stats.totalAmenities} recorded amenities operational. Checklist completion currently stands at ${stats.completion}%, with ${stats.pendingTasks} pending task(s).</textarea>
                    </div>
                </div>

                <div class="card report-section collapsible-card">
                    ${cardHeader('Automatic Operational Analysis')}
                    <div class="card-body">
                        <div class="report-analysis">
                            ${stats.observations.map(item => `
                                <div class="report-analysis-item">
                                    <span class="report-analysis-icon">•</span>
                                    <span>${escape(item)}</span>
                                </div>
                            `).join("")}
                        </div>
                    </div>
                </div>

                <div class="card report-section collapsible-card">
                    ${cardHeader('Inventory Update', `Material additions and stock movement for ${escape(formatDate(reportDate))}`)}
                    <div class="card-body">
                        <div class="report-kpi-grid" style="padding: 20px; margin: 0; border-bottom: 1px solid var(--border-color);">
                            <div class="report-kpi"><span class="report-kpi-label">Total Inventory Items</span><strong>${inventory.totalItems}</strong></div>
                            <div class="report-kpi"><span class="report-kpi-label">New Materials</span><strong>${inventory.newMaterialsToday}</strong></div>
                            <div class="report-kpi"><span class="report-kpi-label">Transactions</span><strong>${inventory.transactionsToday}</strong></div>
                            <div class="report-kpi"><span class="report-kpi-label">Reorder Required</span><strong>${inventory.reorderCount}</strong></div>
                        </div>
                        <h4 style="padding: 20px 20px 10px;">Materials Added Today</h4>
                        <div class="report-table-wrap">
                            <table class="data-table">
                                <thead><tr><th>Item ID</th><th>Material</th><th>Category</th><th>Opening Quantity</th></tr></thead>
                                <tbody>${renderNewMaterials(inventory.newMaterials)}</tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="card report-section collapsible-card">
                    ${cardHeader('Inventory Alerts')}
                    <div class="card-body">
                        <div class="report-analysis">${renderInventoryAlerts(inventory)}</div>
                    </div>
                </div>

                <div class="card report-section collapsible-card">
                    ${cardHeader('Amenity Status')}
                    <div class="card-body">
                        <div class="report-table-wrap">
                            <table class="data-table">
                                <thead><tr><th>Amenity ID</th><th>Zone</th><th>Amenity</th><th>Responsible</th><th>Status</th></tr></thead>
                                <tbody>${renderAmenityRows()}</tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="card report-section collapsible-card">
                    ${cardHeader('Checklist Performance')}
                    <div class="card-body">
                        <div class="report-table-wrap">
                            <table class="data-table">
                                <thead><tr><th>Amenity</th><th>Task</th><th>Responsible</th><th>Shift</th><th>Status</th><th>Remarks</th></tr></thead>
                                <tbody>${renderChecklistRows()}</tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="card report-section collapsible-card">
                    ${cardHeader('Management Remarks')}
                    <div class="card-body">
                        <textarea id="executive-remarks" class="report-textarea" rows="4" placeholder="Add management remarks, observations, incidents, decisions or follow-up actions..."></textarea>
                    </div>
                </div>

                <div class="card report-footer">
                    <div><strong>Facility Executive OS</strong><div class="muted">Executive Operations Report</div></div>
                    <div class="muted">Generated: ${escape(formatDate(reportDate))}</div>
                </div>
            </div>
        `;

        bindEvents();
    }

    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {
        const container = get("tab-daily_report");
        if (!container || eventsBound) return;
        eventsBound = true;

        container.addEventListener("click", function (event) {
            
            // 1. Check if a collapsible card header was clicked
            const header = event.target.closest(".collapsible-card .card-header");
            if (header) {
                const card = header.closest(".collapsible-card");
                card.classList.toggle("collapsed");
                return; // Stop here if we clicked a header
            }

            // 2. Existing button logic
            const button = event.target.closest("button");
            if (!button || !container.contains(button)) return;

            if (button.id === "executive-refresh") {
                render();
                return;
            }
            if (button.id === "executive-print") {
                window.print();
            }
        });
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
        // Current report controls are replaced during render.
        // Delegated event handling prevents duplicate button listeners.
    }


    /* =====================================================
       MODULE REGISTRATION
       ===================================================== */

    if (typeof window.registerFXModule === "function") {

        window.registerFXModule(
            "daily_report",
            {
                init,
                render,
                destroy
            }
        );

    }


    window.FXExecutiveReport = {
        render,
        analyseData
    };
    



})(window, document);