/* =========================================================
   FACILITY EXECUTIVE OS
   BOOKINGS MODULE — FINALIZED PHASE 2
   ========================================================= */

(function () {
    "use strict";

    const FX = window.FX;
    const Data = window.FXData;

    const COLLECTION = "bookings";
    const MODULE_TAB = "bookings";

    const DEFAULT_RENT = 6000;
    const DEFAULT_DURATION_HOURS = 6;
    const DEFAULT_GST_RATE = 18;
    const DEFAULT_DEPOSIT = 10000;

    /*
     * Confirmed paid amenities.
     * All other amenities are treated as non-paid by default.
     */
    const PAID_AMENITY_IDS = [
        "STL-004", // Conference Room
        "STL-005", // Mini Theatre
        "STL-015"  // Banquet Hall
    ];

    let initialized = false;

    /* =====================================================
       BASIC HELPERS
       ===================================================== */

    function get(id) {
        return document.getElementById(id);
    }

    function getBookings() {
        if (!Data || typeof Data.get !== "function") {
            return [];
        }

        const records = Data.get(COLLECTION);
        return Array.isArray(records) ? records : [];
    }

    function getAmenities() {
        if (!Data || typeof Data.get !== "function") {
            return [];
        }

        const records = Data.get("amenities");
        return Array.isArray(records) ? records : [];
    }

    function getActiveTab() {
        return FX &&
            FX.state &&
            typeof FX.state.activeTab === "string"
            ? FX.state.activeTab
            : "";
    }

    function isCurrentTabActive() {
        const activeTab = getActiveTab();
        return !activeTab || activeTab === MODULE_TAB;
    }

    function today() {
        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function uid() {
        return (
            Date.now().toString(36) +
            Math.random().toString(36).slice(2, 9)
        );
    }

    function escape(value) {
        if (typeof window.escapeHtml === "function") {
            return window.escapeHtml(String(value ?? ""));
        }

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function numberValue(value, fallback = 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function money(value) {
        return `₹${numberValue(value).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        })}`;
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
        const suffix = hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${hour}:${minute} ${suffix}`;
    }

    /* =====================================================
       AMENITY MASTER HELPERS
       ===================================================== */

    function getAmenityId(amenity) {
        return String(
            amenity?.amenityId ||
            amenity?.id ||
            amenity?.amenityID ||
            amenity?.code ||
            ""
        ).trim();
    }

    function getAmenityName(amenity) {
        return String(
            amenity?.amenity ||
            amenity?.name ||
            amenity?.title ||
            amenity?.amenityName ||
            ""
        ).trim();
    }

    function getAmenityZone(amenity) {
        return String(
            amenity?.zone || ""
        ).trim();
    }

    function getAmenityByValue(value) {
        const searchValue = String(value || "")
            .trim()
            .toLowerCase();

        if (!searchValue) {
            return null;
        }

        return getAmenities().find(function (amenity) {
            const id = getAmenityId(amenity).toLowerCase();
            const name = getAmenityName(amenity).toLowerCase();

            return searchValue === id || searchValue === name;
        }) || null;
    }

    function isPaidAmenity(amenity) {
        const id = getAmenityId(amenity).toUpperCase();

        return PAID_AMENITY_IDS.includes(id);
    }

    function getAmenityPricing(amenity) {
        const paid = isPaidAmenity(amenity);

        return {
            rent: paid
                ? numberValue(
                    amenity?.rent ??
                    amenity?.bookingRent ??
                    amenity?.amount ??
                    amenity?.price,
                    DEFAULT_RENT
                )
                : 0,

            duration: paid
                ? numberValue(
                    amenity?.durationHours ??
                    amenity?.bookingDurationHours ??
                    amenity?.duration,
                    DEFAULT_DURATION_HOURS
                )
                : 0,

            gstRate: paid
                ? numberValue(
                    amenity?.gstRate ??
                    amenity?.gst,
                    DEFAULT_GST_RATE
                )
                : 0,

            deposit: paid
                ? numberValue(
                    amenity?.refundableDeposit ??
                    amenity?.deposit,
                    DEFAULT_DEPOSIT
                )
                : 0
        };
    }

    /* =====================================================
       PAYMENT CALCULATION
       ===================================================== */

    function calculatePayment(
        rent,
        gstRate,
        deposit,
        amountPaid
    ) {
        const safeRent = Math.max(
            0,
            numberValue(rent)
        );

        const safeGstRate = Math.max(
            0,
            numberValue(gstRate)
        );

        const safeDeposit = Math.max(
            0,
            numberValue(deposit)
        );

        const safeAmountPaid = Math.max(
            0,
            numberValue(amountPaid)
        );

        const gst = safeRent * safeGstRate / 100;
        const balanceAmount = safeRent + gst;
        const totalAmount = balanceAmount + safeDeposit;

        const amountRemaining = Math.max(
            0,
            totalAmount - safeAmountPaid
        );

        return {
            rent: safeRent,
            gstRate: safeGstRate,
            gst,
            deposit: safeDeposit,
            balanceAmount,
            totalAmount,
            amountPaid: safeAmountPaid,
            amountRemaining
        };
    }

    function updatePaymentSummary() {
        const payment = calculatePayment(
            get("booking-rent")?.value,
            get("booking-gst-rate")?.value,
            get("booking-deposit")?.value,
            get("booking-amount-paid")?.value
        );

        if (get("booking-gst")) {
            get("booking-gst").value =
                payment.gst.toFixed(2);
        }

        if (get("booking-balance")) {
            get("booking-balance").value =
                payment.balanceAmount.toFixed(2);
        }

        if (get("booking-total")) {
            get("booking-total").value =
                payment.totalAmount.toFixed(2);
        }

        if (get("booking-remaining")) {
            get("booking-remaining").value =
                payment.amountRemaining.toFixed(2);
        }

        const summary = get("booking-payment-summary");

        if (!summary) {
            return;
        }

        summary.innerHTML = `
            <div class="payment-summary-row">
                <span>Rent</span>
                <strong>${money(payment.rent)}</strong>
            </div>

            <div class="payment-summary-row">
                <span>GST (${payment.gstRate}%)</span>
                <strong>${money(payment.gst)}</strong>
            </div>

            <div class="payment-summary-row">
                <span>Balance Amount</span>
                <strong>${money(payment.balanceAmount)}</strong>
            </div>

            <div class="payment-summary-row">
                <span>Refundable Deposit</span>
                <strong>${money(payment.deposit)}</strong>
            </div>

            <div class="payment-summary-row payment-summary-total">
                <span>Total Amount</span>
                <strong>${money(payment.totalAmount)}</strong>
            </div>

            <div class="payment-summary-row">
                <span>Amount Paid</span>
                <strong>${money(payment.amountPaid)}</strong>
            </div>

            <div class="payment-summary-row payment-summary-remaining">
                <span>Amount Remaining</span>
                <strong>${money(payment.amountRemaining)}</strong>
            </div>
        `;
    }

    /* =====================================================
       AMENITY AUTOFILL
       ===================================================== */

    function applyAmenityToForm(amenity) {
        if (!amenity) {
            return;
        }

        const pricing = getAmenityPricing(amenity);

        if (get("booking-amenity-id")) {
            get("booking-amenity-id").value =
                getAmenityId(amenity);
        }

        if (get("booking-facility")) {
            get("booking-facility").value =
                getAmenityName(amenity);
        }

        /*
         * Zone is always taken from Amenity Master.
         * It is never manually editable.
         */
        if (get("booking-zone")) {
            get("booking-zone").value =
                getAmenityZone(amenity);
        }

        if (get("booking-amenity-category")) {
            get("booking-amenity-category").value =
                amenity.type || "";
        }

        // ADD THIS NEW BLOCK:
        if (get("booking-amenity-paid")) {
            get("booking-amenity-paid").value = 
                isPaidAmenity(amenity) ? "Paid" : "Non-Paid";
        }


        if (get("booking-duration")) {
            get("booking-duration").value =
                pricing.duration;
        }

        if (get("booking-rent")) {
            get("booking-rent").value =
                pricing.rent;
        }

        if (get("booking-gst-rate")) {
            get("booking-gst-rate").value =
                pricing.gstRate;
        }

        if (get("booking-deposit")) {
            get("booking-deposit").value =
                pricing.deposit;
        }

        updatePaymentSummary();
    }

    function findAmenityFromInputs() {
        const amenityId = String(
            get("booking-amenity-id")?.value || ""
        ).trim();

        const amenityName = String(
            get("booking-facility")?.value || ""
        ).trim();

        return (
            getAmenityByValue(amenityId) ||
            getAmenityByValue(amenityName)
        );
    }

    function setupAmenityAutofill() {
        const idInput = get("booking-amenity-id");
        const nameInput = get("booking-facility");

        function attemptAutofill() {
            const amenity = findAmenityFromInputs();

            if (amenity) {
                applyAmenityToForm(amenity);
            }
        }

        if (idInput) {
            idInput.addEventListener(
                "change",
                attemptAutofill
            );

            idInput.addEventListener(
                "blur",
                attemptAutofill
            );
        }

        if (nameInput) {
            nameInput.addEventListener(
                "change",
                attemptAutofill
            );

            nameInput.addEventListener(
                "blur",
                attemptAutofill
            );
        }

        [
            "booking-rent",
            "booking-gst-rate",
            "booking-deposit",
            "booking-amount-paid"
        ].forEach(function (id) {
            const field = get(id);

            if (field) {
                field.addEventListener(
                    "input",
                    updatePaymentSummary
                );
            }
        });
    }

    /* =====================================================
       MAIN RENDER
       ===================================================== */

    function render() {
        if (!isCurrentTabActive()) {
            return;
        }

        const container = get("tab-bookings");

        if (!container) {
            return;
        }

        const bookings = getBookings();

        const todayBookings = bookings.filter(function (item) {
            return item.bookingDate === today();
        }).length;

        const confirmed = bookings.filter(function (item) {
            return item.status === "Confirmed";
        }).length;

        const pending = bookings.filter(function (item) {
            return item.status === "Pending";
        }).length;

        container.innerHTML = `
            <div class="bookings-module">

                <div class="card">
                    <div class="card-header">
                        <div>
                            <div class="eyebrow">
                                FACILITY EXECUTIVE OS
                            </div>

                            <h2>Bookings</h2>

                            <p class="muted">
                                Facility booking and reservation management
                            </p>
                        </div>

                        <button
                            class="btn btn-primary"
                            type="button"
                            id="booking-add"
                        >
                            + Add Booking
                        </button>
                    </div>
                </div>

                <div class="booking-kpi-grid">
                    <div class="card booking-kpi">
                        <span>TOTAL BOOKINGS</span>
                        <strong>${bookings.length}</strong>
                    </div>

                    <div class="card booking-kpi">
                        <span>TODAY</span>
                        <strong>${todayBookings}</strong>
                    </div>

                    <div class="card booking-kpi">
                        <span>CONFIRMED</span>
                        <strong>${confirmed}</strong>
                    </div>

                    <div class="card booking-kpi">
                        <span>PENDING</span>
                        <strong>${pending}</strong>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div>
                            <h3>Booking Register</h3>

                            <div class="muted">
                                All recorded facility bookings
                            </div>
                        </div>
                    </div>

                    <div class="booking-register">
                        ${
                            bookings.length
                                ? bookings.map(function (item, index) {
                                    return `
                                        <article class="booking-record">
                                            <!-- CLICKABLE HEADER -->
                                            <div class="booking-record-header" onclick="this.closest('.booking-record').classList.toggle('expanded')">
                                                
                                                <div class="booking-record-main">
                                                    <div class="booking-record-date">
                                                        ${escape(item.bookingDate || "—")}
                                                    </div>
                                                    <h4>
                                                        ${escape(item.guestName || "Guest / Client")}
                                                    </h4>
                                                    <div class="booking-record-facility">
                                                        ${escape(item.facility || "—")}
                                                    </div>
                                                    <div class="muted" style="margin-top: 4px;">
                                                        ${escape(item.amenityId || "")} ${item.zone ? ` · ${escape(item.zone)}` : ""}
                                                    </div>
                                                </div>

                                                <div class="booking-record-status-preview">
                                                    <strong>${escape(formatTime(item.startTime))}</strong>
                                                    <span style="display: block; font-size: 11px; color: var(--text-muted); margin-top: 4px;">${escape(item.status || "—")}</span>
                                                </div>

                                                <div class="booking-record-arrow">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                </div>
                                            </div>

                                            <!-- COLLAPSIBLE BODY -->
                                            <div class="booking-record-body">
                                                <div class="booking-record-details">
                                                    <div>
                                                        <span>TIME</span>
                                                        <strong>${escape(formatTime(item.startTime))} ${item.endTime ? ` — ${escape(formatTime(item.endTime))}` : ""}</strong>
                                                    </div>
                                                    <div>
                                                        <span>TYPE</span>
                                                        <strong>${escape(item.bookingType || "—")}</strong>
                                                    </div>
                                                    <div>
                                                        <span>GUESTS</span>
                                                        <strong>${escape(item.guests || "—")}</strong>
                                                    </div>
                                                    <div>
                                                        <span>PAYMENT</span>
                                                        <strong>${escape(item.paymentStatus || "Unpaid")}</strong>
                                                    </div>
                                                    <div>
                                                        <span>STATUS</span>
                                                        <strong>${escape(item.status || "—")}</strong>
                                                    </div>
                                                </div>

                                                <div class="booking-record-actions">
                                                    <button class="btn" type="button" data-booking-edit="${index}">Edit</button>
                                                    <button class="btn btn-danger" type="button" data-booking-delete="${index}">Delete</button>
                                                </div>
                                            </div>
                                        </article>
                                    `;

                                }).join("")
                                : `
                                    <div class="booking-empty">
                                        <strong>No bookings recorded</strong>

                                        <span>
                                            Add a booking to begin building the register.
                                        </span>
                                    </div>
                                `
                        }
                    </div>
                </div>

                <div
                    class="booking-modal"
                    id="booking-modal"
                    aria-hidden="true"
                >
                    <div
                        class="booking-modal-backdrop"
                        data-booking-close
                    ></div>

                    <div
                        class="booking-modal-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="booking-modal-title"
                    >
                        <div class="booking-modal-header">
                            <div>
                                <div class="eyebrow">
                                    FACILITY EXECUTIVE OS
                                </div>

                                <h3 id="booking-modal-title">
                                    Add Booking
                                </h3>
                            </div>

                            <button
                                class="booking-modal-close"
                                type="button"
                                data-booking-close
                                aria-label="Close booking form"
                            >
                                ×
                            </button>
                        </div>

                        <div
                            class="booking-modal-body"
                            id="booking-form-body"
                        ></div>

                        <div class="booking-modal-footer">
                            <button
                                class="btn"
                                type="button"
                                data-booking-close
                            >
                                Cancel
                            </button>

                            <button
                                class="btn btn-primary"
                                type="button"
                                id="booking-save"
                            >
                                Save Booking
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        `;

        bindEvents();
    }

    /* =====================================================
       EVENTS
       ===================================================== */

    function bindEvents() {
        const container = get("tab-bookings");

        if (!container) {
            return;
        }

        if (
            container.dataset.bookingsEventsBound === "true"
        ) {
            return;
        }

        container.dataset.bookingsEventsBound = "true";

        container.addEventListener("click", function (event) {
            const addButton =
                event.target.closest("#booking-add");

            if (addButton) {
                openBookingForm();
                return;
            }

            const editButton =
                event.target.closest("[data-booking-edit]");

            if (editButton) {
                openBookingForm(
                    Number(editButton.dataset.bookingEdit)
                );

                return;
            }

            const deleteButton =
                event.target.closest("[data-booking-delete]");

            if (deleteButton) {
                deleteBooking(
                    Number(deleteButton.dataset.bookingDelete)
                );

                return;
            }

            const closeButton =
                event.target.closest("[data-booking-close]");

            if (closeButton) {
                closeBookingForm();
                return;
            }

            const saveButton =
                event.target.closest("#booking-save");

            if (saveButton) {
                saveBooking();
            }
        });
    }

    /* =====================================================
       BOOKING FORM
       ===================================================== */

    function openBookingForm(index = -1) {
        const modal = get("booking-modal");
        const body = get("booking-form-body");
        const title = get("booking-modal-title");

        if (!modal || !body || !title) {
            return;
        }

        const bookings = getBookings();

        const record = index >= 0
            ? bookings[index] || {}
            : {};

        const amenities = getAmenities();

        const amenityOptions = amenities
            .map(function (amenity) {
                const id = getAmenityId(amenity);
                const name = getAmenityName(amenity);

                if (!id || !name) {
                    return "";
                }

                return `
                    <option value="${escape(id)}">
                        ${escape(id)} — ${escape(name)}
                    </option>
                `;
            })
            .join("");

        const payment = calculatePayment(
            record.rent ?? DEFAULT_RENT,
            record.gstRate ?? DEFAULT_GST_RATE,
            record.refundableDeposit ?? DEFAULT_DEPOSIT,
            record.amountPaid ?? 0
        );

        title.textContent = index >= 0
            ? "Edit Booking"
            : "Add Booking";

        body.innerHTML = `
            <!-- =================================================
                 AMENITY DETAILS — FIRST
                 ================================================= -->

            <div class="card booking-amenity-card">
                <div class="card-header">
                    <div>
                        <h3>Amenity Details</h3>

                        <p class="muted">
                            Select an Amenity ID or enter the exact amenity name.
                            Missing details will be loaded from Amenity Master.
                        </p>
                    </div>
                </div>

                <div class="form-grid">

                    <div class="form-group">
                        <label for="booking-amenity-id">
                            Amenity ID
                        </label>

                        <input
                            class="form-control"
                            type="text"
                            id="booking-amenity-id"
                            list="booking-amenity-id-list"
                            value="${escape(record.amenityId || "")}"
                            placeholder="Example: STL-005"
                        >

                        <datalist id="booking-amenity-id-list">
                            ${amenityOptions}
                        </datalist>
                    </div>

                    <div class="form-group">
                        <label for="booking-facility">
                            Amenity Name
                        </label>

                        <input
                            class="form-control"
                            type="text"
                            id="booking-facility"
                            list="booking-amenity-name-list"
                            value="${escape(record.facility || "")}"
                            placeholder="Enter amenity name"
                        >

                        <datalist id="booking-amenity-name-list">
                            ${
                                amenities.map(function (amenity) {
                                    const name = getAmenityName(amenity);

                                    if (!name) {
                                        return "";
                                    }

                                    return `
                                        <option value="${escape(name)}">
                                    `;
                                }).join("")
                            }
                        </datalist>
                    </div>

                    <div class="form-group">
                        <label for="booking-zone">
                            Zone
                        </label>

                        <input
                            class="form-control"
                            type="text"
                            id="booking-zone"
                            value="${escape(record.zone || "")}"
                            readonly
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-amenity-category">
                            Amenity Type
                        </label>

                        <input
                            class="form-control"
                            type="text"
                            id="booking-amenity-category"
                            value="${escape(
                                record.amenityCategory ||
                                record.category ||
                                record.type ||
                                ""
                            )}"
                            readonly
                        >
                    </div>

                                        <div class="form-group">
                        <label for="booking-amenity-paid">
                            Payment Category
                        </label>

                        <select class="form-control" id="booking-amenity-paid">
                            <option value="Paid" ${record.amenityIsPaid ? "selected" : ""}>
                                Paid Amenity
                            </option>
                            <option value="Non-Paid" ${!record.amenityIsPaid ? "selected" : ""}>
                                Non-Paid / Operational
                            </option>
                        </select>
                    </div>


                </div>
            </div>

            <!-- =================================================
                 BOOKING DETAILS
                 ================================================= -->

            <div class="card">
                <div class="card-header">
                    <div>
                        <h3>Booking Details</h3>
                    </div>
                </div>

                <div class="form-grid">

                    <div class="form-group">
                        <label for="booking-date">
                            Booking Date
                        </label>

                        <input
                            class="form-control"
                            type="date"
                            id="booking-date"
                            value="${escape(
                                record.bookingDate || today()
                            )}"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-start-time">
                            Start Time
                        </label>

                        <input
                            class="form-control"
                            type="time"
                            id="booking-start-time"
                            value="${escape(
                                record.startTime ||
                                record.bookingTime ||
                                ""
                            )}"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-end-time">
                            End Time
                        </label>

                        <input
                            class="form-control"
                            type="time"
                            id="booking-end-time"
                            value="${escape(record.endTime || "")}"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-guest">
                            Guest / Client Name
                        </label>

                        <input
                            class="form-control"
                            type="text"
                            id="booking-guest"
                            value="${escape(record.guestName || "")}"
                            placeholder="Enter guest or client name"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-contact">
                            Contact Number
                        </label>

                        <input
                            class="form-control"
                            type="tel"
                            id="booking-contact"
                            value="${escape(record.contactNumber || "")}"
                            placeholder="Enter contact number"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-flat-number">
                            Flat Number
                        </label>

                        <input
                            class="form-control"
                            type="text"
                            id="booking-flat-number"
                            value="${escape(record.flatNumber || "")}"
                            placeholder="Enter flat number"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-wing">
                            Wing
                        </label>

                        <input
                            class="form-control"
                            type="text"
                            id="booking-wing"
                            value="${escape(record.wing || "")}"
                            placeholder="Enter wing"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-type">
                            Booking Type
                        </label>

                        <select
                            class="form-control"
                            id="booking-type"
                        >
                            <option value="">
                                Select booking type
                            </option>

                            ${
                                [
                                    "Resident",
                                    "Guest",
                                    "Event",
                                    "Private",
                                    "Corporate",
                                    "Other"
                                ].map(function (type) {
                                    return `
                                        <option
                                            value="${type}"
                                            ${
                                                record.bookingType === type
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${type}
                                        </option>
                                    `;
                                }).join("")
                            }
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="booking-guests">
                            Number of Guests
                        </label>

                        <input
                            class="form-control"
                            type="number"
                            id="booking-guests"
                            min="1"
                            step="1"
                            value="${escape(record.guests || "1")}"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-status">
                            Status
                        </label>

                        <select
                            class="form-control"
                            id="booking-status"
                        >
                            ${
                                [
                                    "Pending",
                                    "Confirmed",
                                    "Completed",
                                    "Cancelled"
                                ].map(function (status) {
                                    return `
                                        <option
                                            value="${status}"
                                            ${
                                                (
                                                    record.status ||
                                                    "Pending"
                                                ) === status
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            ${status}
                                        </option>
                                    `;
                                }).join("")
                            }
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="booking-responsible">
                            Responsible Person
                        </label>

                        <input
                            class="form-control"
                            type="text"
                            id="booking-responsible"
                            value="${escape(record.responsible || "")}"
                            placeholder="Responsible person"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-reference">
                            Booking Reference
                        </label>

                        <input
                            class="form-control"
                            type="text"
                            id="booking-reference"
                            value="${escape(
                                record.bookingReference || ""
                            )}"
                            placeholder="Optional reference"
                        >
                    </div>

                </div>
            </div>

            <!-- =================================================
                 PAYMENT SUMMARY
                 ================================================= -->

            <div class="card booking-payment-card">

                <div class="card-header">
                    <div>
                        <h3>Payment Summary</h3>

                        <p class="muted">
                            Full payment, including the refundable deposit,
                            is required before confirmation.
                        </p>
                    </div>
                </div>

                <div class="form-grid">

                    <div class="form-group">
                        <label for="booking-duration">
                            Duration in Hours
                        </label>

                        <input
                            class="form-control"
                            type="number"
                            id="booking-duration"
                            value="${escape(
                                record.durationHours ||
                                DEFAULT_DURATION_HOURS
                            )}"
                            readonly
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-rent">
                            Rent
                        </label>

                        <input
                            class="form-control"
                            type="number"
                            id="booking-rent"
                            min="0"
                            step="0.01"
                            value="${payment.rent}"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-gst-rate">
                            GST Rate (%)
                        </label>

                        <input
                            class="form-control"
                            type="number"
                            id="booking-gst-rate"
                            min="0"
                            step="0.01"
                            value="${payment.gstRate}"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-gst">
                            GST Amount
                        </label>

                        <input
                            class="form-control"
                            type="number"
                            id="booking-gst"
                            value="${payment.gst.toFixed(2)}"
                            readonly
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-deposit">
                            Refundable Deposit
                        </label>

                        <input
                            class="form-control"
                            type="number"
                            id="booking-deposit"
                            min="0"
                            step="0.01"
                            value="${payment.deposit}"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-balance">
                            Balance Amount
                        </label>

                        <input
                            class="form-control"
                            type="number"
                            id="booking-balance"
                            value="${payment.balanceAmount.toFixed(2)}"
                            readonly
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-total">
                            Total Amount
                        </label>

                        <input
                            class="form-control"
                            type="number"
                            id="booking-total"
                            value="${payment.totalAmount.toFixed(2)}"
                            readonly
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-amount-paid">
                            Amount Paid
                        </label>

                        <input
                            class="form-control"
                            type="number"
                            id="booking-amount-paid"
                            min="0"
                            step="0.01"
                            value="${payment.amountPaid}"
                        >
                    </div>

                    <div class="form-group">
                        <label for="booking-remaining">
                            Amount Remaining
                        </label>

                        <input
                            class="form-control"
                            type="number"
                            id="booking-remaining"
                            value="${payment.amountRemaining.toFixed(2)}"
                            readonly
                        >
                    </div>

                </div>

                <div
                    id="booking-payment-summary"
                    class="booking-payment-summary"
                ></div>
            </div>

            <!-- =================================================
                 NOTES
                 ================================================= -->

            <div class="form-group">
                <label for="booking-notes">
                    Booking Notes
                </label>

                <textarea
                    class="form-control"
                    id="booking-notes"
                    rows="4"
                    placeholder="Special requirements, notes or booking details..."
                >${escape(record.notes || "")}</textarea>
            </div>

            <div class="form-group">
                <label for="booking-post-remark">
                    Post-Booking Remark
                </label>

                <textarea
                    class="form-control"
                    id="booking-post-remark"
                    rows="4"
                    placeholder="Guest feedback, incidents, observations or follow-up actions..."
                >${escape(
                    record.postBookingRemark ||
                    record.remark ||
                    ""
                )}</textarea>
            </div>
        `;

        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        modal.dataset.index = String(index);

        setupAmenityAutofill();

        const existingAmenity =
            getAmenityByValue(record.amenityId) ||
            getAmenityByValue(record.facility);

        if (existingAmenity) {
            applyAmenityToForm(existingAmenity);
        } else {
            updatePaymentSummary();
        }
    }

    /* =====================================================
       CLOSE FORM
       ===================================================== */

    function closeBookingForm() {
        const modal = get("booking-modal");

        if (!modal) {
            return;
        }

        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");

        delete modal.dataset.index;
    }

    /* =====================================================
       SAVE BOOKING
       ===================================================== */

    function saveBooking() {
        if (
            !Data ||
            typeof Data.add !== "function" ||
            typeof Data.update !== "function"
        ) {
            window.alert(
                "The booking data service is unavailable."
            );

            return;
        }

        const bookingDate = String(
            get("booking-date")?.value || ""
        ).trim();

        const startTime = String(
            get("booking-start-time")?.value || ""
        ).trim();

        const endTime = String(
            get("booking-end-time")?.value || ""
        ).trim();

        const guestName = String(
            get("booking-guest")?.value || ""
        ).trim();

        const contactNumber = String(
            get("booking-contact")?.value || ""
        ).trim();

        const flatNumber = String(
            get("booking-flat-number")?.value || ""
        ).trim();

        const wing = String(
            get("booking-wing")?.value || ""
        ).trim();

        const facility = String(
            get("booking-facility")?.value || ""
        ).trim();

        const bookingType = String(
            get("booking-type")?.value || ""
        ).trim();

        const guests = Number(
            get("booking-guests")?.value || 0
        );

        let status = String(
            get("booking-status")?.value || ""
        ).trim();

        const missing = [];

        if (!bookingDate) {
            missing.push("Booking Date");
        }

        if (!startTime) {
            missing.push("Start Time");
        }

        if (!endTime) {
            missing.push("End Time");
        }

        if (!guestName) {
            missing.push("Guest / Client Name");
        }

        if (!contactNumber) {
            missing.push("Contact Number");
        }

        if (!flatNumber) {
            missing.push("Flat Number");
        }

        if (!wing) {
            missing.push("Wing");
        }

        if (!facility) {
            missing.push("Amenity");
        }

        if (!bookingType) {
            missing.push("Booking Type");
        }

        if (!Number.isFinite(guests) || guests < 1) {
            missing.push("Number of Guests");
        }

        if (!status) {
            missing.push("Status");
        }

        if (missing.length) {
            window.alert(
                "Please complete:\n\n• " +
                missing.join("\n• ")
            );

            return;
        }

        if (endTime <= startTime) {
            window.alert(
                "End Time must be later than Start Time."
            );

            return;
        }

        const amenity = findAmenityFromInputs();

        if (!amenity) {
            window.alert(
                "Please select a valid Amenity ID or amenity name from Amenity Master."
            );

            return;
        }

        const amenityId = getAmenityId(amenity);
        const amenityName = getAmenityName(amenity);
        const zone = getAmenityZone(amenity);

        if (!amenityId || !amenityName) {
            window.alert(
                "The selected amenity is missing its ID or name in Amenity Master."
            );

            return;
        }

        const pricing = getAmenityPricing(amenity);

        const rent = numberValue(
            get("booking-rent")?.value,
            pricing.rent
        );

        const gstRate = numberValue(
            get("booking-gst-rate")?.value,
            pricing.gstRate
        );

        const refundableDeposit = numberValue(
            get("booking-deposit")?.value,
            pricing.deposit
        );

        const amountPaid = numberValue(
            get("booking-amount-paid")?.value
        );

        const payment = calculatePayment(
            rent,
            gstRate,
            refundableDeposit,
            amountPaid
        );

        const fullPaymentReceived =
            payment.amountRemaining <= 0;

        const paymentStatus =
            fullPaymentReceived
                ? "Paid"
                : amountPaid > 0
                    ? "Partially Paid"
                    : "Unpaid";

        if (
            status === "Confirmed" &&
            !fullPaymentReceived
        ) {
            window.alert(
                "This booking cannot be confirmed because the full payment, including the refundable deposit, has not been received. The booking will remain Pending."
            );

            status = "Pending";

            if (get("booking-status")) {
                get("booking-status").value = "Pending";
            }
        }

        const modal = get("booking-modal");

        const index = Number(
            modal?.dataset.index || "-1"
        );

        const bookings = getBookings();

        const existing = index >= 0
            ? bookings[index]
            : null;

        const record = {
            id:
                existing?.id ||
                uid(),

            bookingDate,
            startTime,
            endTime,

            guestName,
            contactNumber,
            flatNumber,
            wing,

            amenityId,
            facility: amenityName,
            zone,

            amenityCategory: String(
                get("booking-amenity-category")?.value || ""
            ).trim(),

            amenityIsPaid: isPaidAmenity(amenity),

            bookingType,
            guests,

            durationHours: numberValue(
                get("booking-duration")?.value,
                pricing.duration
            ),

            rent: payment.rent,
            gstRate: payment.gstRate,
            gst: payment.gst,
            refundableDeposit: payment.deposit,
            balanceAmount: payment.balanceAmount,
            totalAmount: payment.totalAmount,
            amountPaid: payment.amountPaid,
            amountRemaining: payment.amountRemaining,
            paymentStatus,

            status,

            responsible: String(
                get("booking-responsible")?.value || ""
            ).trim(),

            bookingReference: String(
                get("booking-reference")?.value || ""
            ).trim(),

            notes: String(
                get("booking-notes")?.value || ""
            ).trim(),

            postBookingRemark: String(
                get("booking-post-remark")?.value || ""
            ).trim(),

            createdAt:
                existing?.createdAt ||
                new Date().toISOString(),

            updatedAt:
                new Date().toISOString()
        };

        try {
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
        } catch (error) {
            console.error(
                "Booking save error:",
                error
            );

            window.alert(
                "Unable to save the booking. Please try again."
            );

            return;
        }

        closeBookingForm();
        render();
    }

    /* =====================================================
       DELETE BOOKING
       ===================================================== */

    function deleteBooking(index) {
        const bookings = getBookings();
        const record = bookings[index];

        if (!record) {
            return;
        }

        if (
            !window.confirm(
                `Delete booking for "${
                    record.guestName || "this guest"
                }"?`
            )
        ) {
            return;
        }

        if (
            !Data ||
            typeof Data.remove !== "function"
        ) {
            window.alert(
                "The booking data service is unavailable."
            );

            return;
        }

        try {
            Data.remove(
                COLLECTION,
                index
            );
        } catch (error) {
            console.error(
                "Booking delete error:",
                error
            );

            window.alert(
                "Unable to delete the booking. Please try again."
            );

            return;
        }

        render();
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
        const container = get("tab-bookings");

        if (container) {
            delete container.dataset.bookingsEventsBound;
        }

        initialized = false;
    }

    /* =====================================================
       MODULE REGISTRATION
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

    window.FXBookings = {
        render,
        getBookings,
        getAmenities,
        openBookingForm,
        closeBookingForm,
        saveBooking,
        deleteBooking,
        calculatePayment,
        getAmenityByValue,
        getAmenityPricing,
        isPaidAmenity,
        applyAmenityToForm
    };

})();