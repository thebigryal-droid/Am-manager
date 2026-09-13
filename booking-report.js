/* =========================================================
   FACILITY EXECUTIVE OS
   BOOKING REPORT
   ========================================================= */

(function () {

    "use strict";


    const FX = window.FX;
    const Data = window.FXData;

    const COLLECTION = "bookings";
    const MODULE_TAB = "booking_report";

    let initialized = false;
    let currentPeriod = "Daily";

    let savedManagementSummary = "";
    let savedPostBookingRemarks = "";


    /* =====================================================
       HELPERS
       ===================================================== */

    function get(id) {

        return document.getElementById(id);

    }


    function getBookings() {

        if (
            !Data ||
            typeof Data.get !== "function"
        ) {
            return [];
        }

        const bookings = Data.get(COLLECTION);

        return Array.isArray(bookings)
            ? bookings
            : [];

    }


    function escape(value) {

        if (typeof window.escapeHtml === "function") {

            return window.escapeHtml(
                String(value ?? "")
            );

        }

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

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

        if (!value) {
            return "—";
        }

        const raw = String(value);

        const d = new Date(
            raw.includes("T")
                ? raw
                : `${raw}T00:00:00`
        );

        if (Number.isNaN(d.getTime())) {
            return raw;
        }

        return d.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    function formatTime(value) {

        if (!value) {
            return "—";
        }

        const parts = String(value).split(":");

        if (parts.length < 2) {
            return String(value);
        }

        let hour = Number(parts[0]);

        if (!Number.isFinite(hour)) {
            return String(value);
        }

        const minute = parts[1];

        const suffix = hour >= 12
            ? "PM"
            : "AM";

        hour = hour % 12 || 12;

        return `${hour}:${minute} ${suffix}`;

    }


    function startOfWeek(date) {

        const d = new Date(date);
        const day = d.getDay();

        const difference = day === 0
            ? -6
            : 1 - day;

        d.setDate(
            d.getDate() + difference
        );

        d.setHours(
            0,
            0,
            0,
            0
        );

        return d;

    }


    function startOfMonth(date) {

        return new Date(
            date.getFullYear(),
            date.getMonth(),
            1
        );

    }


    function localDate(date) {

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");

    }


    function getActiveTab() {

        if (
            FX &&
            FX.state &&
            typeof FX.state.activeTab === "string"
        ) {
            return FX.state.activeTab;
        }

        return "";

    }


    function isCurrentTabActive() {

        const activeTab = getActiveTab();

        return !activeTab || activeTab === MODULE_TAB;

    }


    function rememberReportInputs() {

        const summary = get(
            "booking-report-summary"
        );

        const postRemarks = get(
            "booking-post-remarks"
        );

        if (summary) {
            savedManagementSummary = summary.value;
        }

        if (postRemarks) {
            savedPostBookingRemarks = postRemarks.value;
        }

    }


    function restoreReportInputs() {

        const summary = get(
            "booking-report-summary"
        );

        const postRemarks = get(
            "booking-post-remarks"
        );

        if (summary) {

            if (savedManagementSummary) {
                summary.value = savedManagementSummary;
            }

            summary.addEventListener(
                "input",
                function () {
                    savedManagementSummary = summary.value;
                }
            );

        }

        if (postRemarks) {

            if (savedPostBookingRemarks) {
                postRemarks.value = savedPostBookingRemarks;
            }

            postRemarks.addEventListener(
                "input",
                function () {
                    savedPostBookingRemarks = postRemarks.value;
                }
            );

        }

    }


    /* =====================================================
       PERIOD
       ===================================================== */

    function getPeriodRange(period) {

        const now = new Date();

        let start;

        if (period === "Weekly") {

            start = startOfWeek(now);

        }

        else if (period === "Monthly") {

            start = startOfMonth(now);

        }

        else {

            start = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

        }

        return {

            start: localDate(start),

            end: today()

        };

    }


    function getPeriodBookings(period) {

        const range = getPeriodRange(period);

        return getBookings()
            .filter(function (booking) {

                if (!booking || typeof booking !== "object") {
                    return false;
                }

                const date = String(
                    booking.bookingDate || ""
                );

                return (
                    date >= range.start &&
                    date <= range.end
                );

            })
            .sort(function (a, b) {

                const dateCompare = String(
                    b.bookingDate || ""
                ).localeCompare(
                    String(a.bookingDate || "")
                );

                if (dateCompare !== 0) {
                    return dateCompare;
                }

                return String(
                    a.startTime || ""
                ).localeCompare(
                    String(
                        b.startTime || ""
                    )
                );

            });

    }


    /* =====================================================
       ANALYSIS
       ===================================================== */

    function analyseBookings(bookings) {

        const list = Array.isArray(bookings)
            ? bookings
            : [];

        const total = list.length;

        const confirmed = list.filter(function (item) {
            return item.status === "Confirmed";
        }).length;

        const pending = list.filter(function (item) {
            return item.status === "Pending";
        }).length;

        const completed = list.filter(function (item) {
            return item.status === "Completed";
        }).length;

        const cancelled = list.filter(function (item) {
            return item.status === "Cancelled";
        }).length;

        const totalGuests = list.reduce(
            function (sum, item) {

                const guests = Number(
                    item.guests || 0
                );

                return sum + (
                    Number.isFinite(guests)
                        ? guests
                        : 0
                );

            },
            0
        );

        const confirmationRate = total
            ? Math.round(
                (confirmed / total) * 100
            )
            : 0;

        const completionRate = total
            ? Math.round(
                (completed / total) * 100
            )
            : 0;

        const cancellationRate = total
            ? Math.round(
                (cancelled / total) * 100
            )
            : 0;

        const facilities = {};

        list.forEach(function (item) {

            const facility = String(
                item.facility || "Unspecified"
            );

            facilities[facility] = (
                facilities[facility] || 0
            ) + 1;

        });

        const topFacility = Object.entries(
            facilities
        )
        .sort(function (a, b) {
            return b[1] - a[1];
        })[0] || null;

        const observations = [];

        if (pending > 0) {

            observations.push(
                `${pending} booking${
                    pending === 1 ? "" : "s"
                } ${
                    pending === 1 ? "requires" : "require"
                } confirmation.`
            );

        }

        if (cancelled > 0) {

            observations.push(
                `${cancelled} booking${
                    cancelled === 1 ? "" : "s"
                } ${
                    cancelled === 1 ? "was" : "were"
                } cancelled during this period.`
            );

        }

        if (completed > 0) {

            observations.push(
                `${completed} booking${
                    completed === 1 ? "" : "s"
                } ${
                    completed === 1 ? "was" : "were"
                } completed.`
            );

        }

        if (topFacility) {

            observations.push(
                `${topFacility[0]} has the highest booking volume with ${
                    topFacility[1]
                } booking${
                    topFacility[1] === 1 ? "" : "s"
                }.`
            );

        }

        if (!observations.length) {

            observations.push(
                "No significant booking observations are available for this reporting period."
            );

        }

        return {

            total,
            confirmed,
            pending,
            completed,
            cancelled,
            totalGuests,
            confirmationRate,
            completionRate,
            cancellationRate,
            facilities,
            topFacility,
            observations

        };

    }


    /* =====================================================
       DEFAULT SUMMARY
       ===================================================== */

    function getDefaultSummary(stats) {

        return `During the ${escape(
            currentPeriod.toLowerCase()
        )} reporting period, ${
            stats.total
        } booking${
            stats.total === 1 ? "" : "s"
        } were recorded, covering ${
            stats.totalGuests
        } guest${
            stats.totalGuests === 1 ? "" : "s"
        }. Confirmation stood at ${
            stats.confirmationRate
        }%, while ${
            stats.pending
        } booking${
            stats.pending === 1 ? "" : "s"
        } remain pending.`;

    }


    /* =====================================================
       RENDER
       ===================================================== */

    function render() {

        if (!isCurrentTabActive()) {
            return;
        }

        const container = get(
            "tab-booking_report"
        );

        if (!container) {
            return;
        }

        rememberReportInputs();

        const bookings = getPeriodBookings(
            currentPeriod
        );

        const stats = analyseBookings(
            bookings
        );

        const facilityRows = Object.keys(
            stats.facilities
        ).length

            ? Object.entries(
                stats.facilities
            )
            .sort(function (a, b) {
                return b[1] - a[1];
            })
            .map(function (item) {

                return `
                    <div>
                        <span>${escape(item[0])}</span>
                        <strong>${item[1]}</strong>
                    </div>
                `;

            })
            .join("")

            : `
                <div class="booking-report-empty-small">
                    No facility usage recorded.
                </div>
            `;

        const analysisRows = stats.observations
            .map(function (item) {

                return `
                    <div>
                        <span>•</span>
                        <p>${escape(item)}</p>
                    </div>
                `;

            })
            .join("");

        const bookingRows = bookings.length

            ? bookings.map(function (item) {

                const remark =
                    item.postBookingRemark ||
                    item.remark ||
                    item.notes ||
                    "—";

                return `
                    <tr>

                        <td>
                            ${escape(
                                formatDate(
                                    item.bookingDate
                                )
                            )}
                        </td>

                        <td>
                            ${escape(
                                formatTime(
                                    item.startTime
                                )
                            )}

                            ${
                                item.endTime
                                    ? `
                                        <br>
                                        <span class="booking-report-end-time">
                                            to ${escape(
                                                formatTime(
                                                    item.endTime
                                                )
                                            )}
                                        </span>
                                    `
                                    : ""
                            }
                        </td>

                        <td>
                            <strong>
                                ${escape(
                                    item.facility || "—"
                                )}
                            </strong>
                        </td>

                        <td>
                            ${escape(
                                item.guestName || "—"
                            )}
                        </td>

                        <td>
                            ${escape(
                                item.contactNumber || "—"
                            )}
                        </td>

                        <td>
                            ${escape(
                                item.bookingType || "—"
                            )}
                        </td>

                        <td>
                            ${escape(
                                item.guests || "—"
                            )}
                        </td>

                        <td>
                            ${escape(
                                item.status || "—"
                            )}
                        </td>

                        <td>
                            ${escape(remark)}
                        </td>

                    </tr>
                `;

            }).join("")

            : `
                <tr>
                    <td
                        colspan="9"
                        class="empty-state"
                    >
                        No bookings found for the selected period.
                    </td>
                </tr>
            `;

        const summaryValue = savedManagementSummary
            || getDefaultSummary(stats);

        container.innerHTML = `

            <div class="booking-report">

                <div class="card booking-report-toolbar-card">

                    <div class="booking-report-header">

                        <div>

                            <div class="eyebrow">
                                FACILITY EXECUTIVE OS
                            </div>

                            <h2>
                                Booking Report
                            </h2>

                            <p class="muted">
                                Booking performance, utilisation and management analysis
                            </p>

                        </div>

                        <div class="booking-report-actions">

                            <button
                                class="btn ${
                                    currentPeriod === "Daily"
                                        ? "btn-primary"
                                        : ""
                                }"
                                type="button"
                                data-period="Daily"
                            >
                                Daily
                            </button>

                            <button
                                class="btn ${
                                    currentPeriod === "Weekly"
                                        ? "btn-primary"
                                        : ""
                                }"
                                type="button"
                                data-period="Weekly"
                            >
                                Weekly
                            </button>

                            <button
                                class="btn ${
                                    currentPeriod === "Monthly"
                                        ? "btn-primary"
                                        : ""
                                }"
                                type="button"
                                data-period="Monthly"
                            >
                                Monthly
                            </button>

                            <button
                                class="btn"
                                type="button"
                                id="booking-report-refresh"
                            >
                                Refresh
                            </button>

                            <button
                                class="btn btn-primary"
                                type="button"
                                id="booking-report-print"
                            >
                                Print / PDF
                            </button>

                        </div>

                    </div>

                    <div class="booking-report-meta">

                        <div>
                            <span>REPORT PERIOD</span>
                            <strong>${escape(
                                currentPeriod
                            )}</strong>
                        </div>

                        <div>
                            <span>REPORT DATE</span>
                            <strong>${escape(
                                formatDate(today())
                            )}</strong>
                        </div>

                    </div>

                </div>


                <div class="booking-report-kpis">

                    <div class="card">
                        <span>TOTAL BOOKINGS</span>
                        <strong>${stats.total}</strong>
                    </div>

                    <div class="card">
                        <span>CONFIRMED</span>
                        <strong>${stats.confirmed}</strong>
                    </div>

                    <div class="card">
                        <span>PENDING</span>
                        <strong>${stats.pending}</strong>
                    </div>

                    <div class="card">
                        <span>COMPLETED</span>
                        <strong>${stats.completed}</strong>
                    </div>

                    <div class="card">
                        <span>CANCELLED</span>
                        <strong>${stats.cancelled}</strong>
                    </div>

                    <div class="card">
                        <span>TOTAL GUESTS</span>
                        <strong>${stats.totalGuests}</strong>
                    </div>

                </div>


                <div class="booking-report-two-column">

                    <div class="card">

                        <div class="card-header">
                            <h3>Booking Performance</h3>
                        </div>

                        <div class="booking-report-metrics">

                            <div>
                                <span>Confirmation Rate</span>
                                <strong>${stats.confirmationRate}%</strong>
                            </div>

                            <div>
                                <span>Completion Rate</span>
                                <strong>${stats.completionRate}%</strong>
                            </div>

                            <div>
                                <span>Cancellation Rate</span>
                                <strong>${stats.cancellationRate}%</strong>
                            </div>

                        </div>

                    </div>


                    <div class="card">

                        <div class="card-header">
                            <h3>Facility Utilisation</h3>
                        </div>

                        <div class="booking-report-facilities">
                            ${facilityRows}
                        </div>

                    </div>

                </div>


                <div class="card">

                    <div class="card-header">
                        <h3>Automatic Booking Analysis</h3>
                    </div>

                    <div class="booking-report-analysis">
                        ${analysisRows}
                    </div>

                </div>


                <div class="card">

                    <div class="card-header">

                        <div>

                            <h3>Management Summary</h3>

                            <div class="muted">
                                Add your own operational interpretation and decisions.
                            </div>

                        </div>

                    </div>

                    <textarea
                        id="booking-report-summary"
                        class="booking-report-textarea"
                        rows="6"
                        placeholder="Write the management summary for this booking period..."
                    >${summaryValue}</textarea>

                </div>


                <div class="card">

                    <div class="card-header">

                        <div>

                            <h3>Booking Details</h3>

                            <div class="muted">
                                Bookings included in this reporting period.
                            </div>

                        </div>

                    </div>

                    <div class="booking-report-table-wrap">

                        <table class="data-table">

                            <thead>

                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Facility</th>
                                    <th>Guest / Client</th>
                                    <th>Contact</th>
                                    <th>Type</th>
                                    <th>Guests</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                </tr>

                            </thead>

                            <tbody>
                                ${bookingRows}
                            </tbody>

                        </table>

                    </div>

                </div>


                <div class="card">

                    <div class="card-header">

                        <div>

                            <h3>Post-Booking Remarks</h3>

                            <div class="muted">
                                Record guest feedback, incidents, observations or follow-up actions.
                            </div>

                        </div>

                    </div>

                    <textarea
                        id="booking-post-remarks"
                        class="booking-report-textarea"
                        rows="7"
                        placeholder="Add post-booking remarks, guest feedback, incidents, actions taken or follow-up requirements..."
                    >${escape(
                        savedPostBookingRemarks
                    )}</textarea>

                </div>


                <div class="card booking-report-footer">

                    <div>

                        <strong>Facility Executive OS</strong>

                        <div class="muted">
                            Booking Management Report
                        </div>

                    </div>

                    <div class="muted">
                        ${escape(currentPeriod)} Report ·
                        ${escape(formatDate(today()))}
                    </div>

                </div>

            </div>

        `;

        bindEvents();
        restoreReportInputs();

    }


    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {

        const container = get(
            "tab-booking_report"
        );

        if (!container) {
            return;
        }

        if (
            container.dataset.bookingReportEventsBound === "true"
        ) {
            return;
        }

        container.dataset.bookingReportEventsBound = "true";

        container.addEventListener(
            "click",
            function (event) {

                const periodButton =
                    event.target.closest(
                        "[data-period]"
                    );

                if (
                    periodButton &&
                    container.contains(periodButton)
                ) {

                    const period =
                        periodButton.dataset.period;

                    if (
                        ["Daily", "Weekly", "Monthly"]
                            .includes(period)
                    ) {

                        rememberReportInputs();

                        currentPeriod = period;

                        render();

                    }

                    return;

                }

                const refreshButton =
                    event.target.closest(
                        "#booking-report-refresh"
                    );

                if (refreshButton) {

                    rememberReportInputs();

                    render();

                    return;

                }

                const printButton =
                    event.target.closest(
                        "#booking-report-print"
                    );

                if (printButton) {

                    rememberReportInputs();

                    printBookingReport();

                }

            }
        );

    }


    /* =====================================================
       DEDICATED BOOKING REPORT PRINT
       ===================================================== */

    function printBookingReport() {

        rememberReportInputs();

        const report = document.querySelector(
            "#tab-booking_report .booking-report"
        );

        if (!report) {

            window.alert(
                "Booking Report is not available."
            );

            return;

        }

        const printWindow = window.open(
            "",
            "_blank"
        );

        if (!printWindow) {

            window.alert(
                "Please allow pop-ups for this application to print the report."
            );

            return;

        }

        const stylesheets = Array.from(
            document.querySelectorAll(
                'link[rel="stylesheet"]'
            )
        )
        .map(function (link) {

            return `
                <link
                    rel="stylesheet"
                    href="${escape(link.href)}"
                >
            `;

        })
        .join("");

        const inlineStyles = Array.from(
            document.querySelectorAll("style")
        )
        .map(function (style) {

            return `
                <style>
                    ${style.textContent}
                </style>
            `;

        })
        .join("");

        const reportHTML = report.outerHTML;

        printWindow.document.open();

        printWindow.document.write(`

            <!DOCTYPE html>

            <html>

                <head>

                    <meta charset="UTF-8">

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >

                    <title>Booking Report</title>

                    ${stylesheets}

                    ${inlineStyles}

                    <style>

                        html,
                        body {
                            margin: 0;
                            padding: 0;
                            background: #ffffff;
                        }

                        body {
                            font-family: Arial, sans-serif;
                            color: #111827;
                        }

                        .booking-report {
                            width: 100%;
                            max-width: none;
                            margin: 0;
                            padding: 0;
                        }

                        .booking-report-actions {
                            display: none !important;
                        }

                        .booking-report-toolbar-card {
                            display: block !important;
                        }

                        .booking-report-header {
                            display: flex !important;
                            justify-content: space-between;
                            align-items: flex-start;
                        }

                        .booking-report-meta {
                            display: flex !important;
                        }

                        .booking-report-kpis {
                            display: grid !important;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 8px;
                        }

                        .booking-report-two-column {
                            display: grid !important;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 10px;
                        }

                        .booking-report-table-wrap {
                            overflow: visible !important;
                        }

                        .booking-report-table-wrap table {
                            width: 100% !important;
                            min-width: 0 !important;
                            border-collapse: collapse;
                        }

                        .booking-report-table-wrap th,
                        .booking-report-table-wrap td {
                            border: 1px solid #999;
                            padding: 6px;
                            font-size: 8.5pt;
                            vertical-align: top;
                        }

                        textarea {
                            display: block !important;
                            width: 100% !important;
                            box-sizing: border-box;
                            min-height: 80px;
                            margin: 0;
                            padding: 8px;
                            border: 1px solid #999;
                            background: #ffffff;
                            color: #000000;
                            resize: none;
                        }

                        .booking-report .card {
                            box-shadow: none !important;
                        }

                        @page {
                            size: A4 portrait;
                            margin: 12mm;
                        }

                    </style>

                </head>

                <body>
                    ${reportHTML}
                </body>

            </html>

        `);

        printWindow.document.close();

        let printed = false;

        function executePrint() {

            if (printed) {
                return;
            }

            if (
                !printWindow ||
                printWindow.closed
            ) {
                return;
            }

            printed = true;

            try {

                printWindow.focus();
                printWindow.print();

            }

            catch (error) {

                console.error(
                    "Booking report print error:",
                    error
                );

            }

        }

        printWindow.onload = function () {

            window.setTimeout(
                executePrint,
                700
            );

        };

        window.setTimeout(
            executePrint,
            1800
        );

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

        const container = get(
            "tab-booking_report"
        );

        if (container) {

            delete container.dataset.bookingReportEventsBound;

        }

        initialized = false;

    }


    /* =====================================================
       REGISTRATION
       ===================================================== */

    if (
        typeof window.registerFXModule === "function"
    ) {

        window.registerFXModule(
            MODULE_TAB,
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

    window.FXBookingReport = {

        render,
        analyseBookings,
        getPeriodBookings,
        printBookingReport

    };


})();