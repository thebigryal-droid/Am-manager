/* =========================================================
   FACILITY EXECUTIVE OS
   INVENTORY MODULE
   ========================================================= */

(function () {

    "use strict";

    const COLLECTION = "inventory";
    const TRANSACTION_COLLECTION = "inventory_transactions";

    const FX = window.FX || {};
    const Data = window.FXData;

    let bound = false;
    let currentRecordId = null;
    let currentTransactionId = null;


    /* =========================================================
       HELPERS
       ========================================================= */

    function getRecords() {
        return Data ? Data.get(COLLECTION) : [];
    }

    function getTransactions() {
        return Data ? Data.get(TRANSACTION_COLLECTION) : [];
    }

    function now() {
        return new Date().toISOString();
    }

    function today() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${y}-${m}-${day}`;
    }

    function formatDate(value) {

        if (!value) return "—";

        const d = new Date(value + "T00:00:00");

        if (Number.isNaN(d.getTime())) {
            return value;
        }

        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    function escape(value) {

        if (typeof window.escapeHtml === "function") {
            return window.escapeHtml(value);
        }

        return String(value == null ? "" : value)
            .replace(/[&<>"']/g, function (c) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                }[c];
            });
    }

    function number(value) {

        const n = parseFloat(value);

        return Number.isFinite(n) ? n : 0;
    }

    function nextItemId() {

        const records = getRecords();

        let max = 0;

        records.forEach(function (record) {

            const match = String(record.itemId || "")
                .match(/INV-(\d+)/i);

            if (match) {
                max = Math.max(max, Number(match[1]));
            }
        });

        return "INV-" + String(max + 1).padStart(3, "0");
    }

    function nextTransactionId() {

        const records = getTransactions();

        let max = 0;

        records.forEach(function (record) {

            const match = String(record.transactionId || "")
                .match(/TXN-(\d+)/i);

            if (match) {
                max = Math.max(max, Number(match[1]));
            }
        });

        return "TXN-" + String(max + 1).padStart(3, "0");
    }


    /* =========================================================
       STOCK CALCULATION
       ========================================================= */

    function calculateCurrentStock(record) {

        let stock = number(record.openingStock);

        getTransactions().forEach(function (transaction) {

            if (
                transaction.itemRecordId === record.id ||
                transaction.itemId === record.itemId
            ) {

                const qty = number(transaction.quantity);

                if (transaction.transactionType === "Stock In") {
                    stock += qty;
                }

                if (transaction.transactionType === "Stock Out") {
                    stock -= qty;
                }

                if (transaction.transactionType === "Adjustment") {
                    stock = qty;
                }
            }
        });

        return Math.max(0, stock);
    }

    function stockStatus(record) {

        const stock = calculateCurrentStock(record);
        const minimum = number(record.minimumStock);
        const reorder = number(record.reorderLevel);

        if (stock <= 0) {
            return "Out of Stock";
        }

        if (stock <= minimum) {
            return "Low Stock";
        }

        if (stock <= reorder) {
            return "Reorder";
        }

        return "In Stock";
    }

    function statusClass(status) {

        return String(status || "")
            .toLowerCase()
            .replace(/\s+/g, "-");
    }


    /* =========================================================
       DAILY REPORT DATA
       ========================================================= */

    function getDailyReportData(reportDate) {

        const date = reportDate || today();

        const items = getRecords();
        const transactions = getTransactions();

        const addedToday = items.filter(function (item) {

            const created = String(item.createdAt || "").slice(0, 10);

            return created === date;
        });

        const transactionsToday = transactions.filter(function (transaction) {

            return transaction.transactionDate === date;
        });

        const stockIn = transactionsToday.filter(function (transaction) {
            return transaction.transactionType === "Stock In";
        });

        const stockOut = transactionsToday.filter(function (transaction) {
            return transaction.transactionType === "Stock Out";
        });

        const adjustments = transactionsToday.filter(function (transaction) {
            return transaction.transactionType === "Adjustment";
        });

        const lowStock = items.filter(function (item) {
            return stockStatus(item) === "Low Stock";
        });

        const outOfStock = items.filter(function (item) {
            return stockStatus(item) === "Out of Stock";
        });

        const reorder = items.filter(function (item) {
            return stockStatus(item) === "Reorder";
        });

        const totalQuantityReceived = stockIn.reduce(function (sum, item) {
            return sum + number(item.quantity);
        }, 0);

        const totalQuantityIssued = stockOut.reduce(function (sum, item) {
            return sum + number(item.quantity);
        }, 0);

        return {

            date: date,

            totalItems: items.length,

            newMaterialsToday: addedToday.length,

            newMaterials: addedToday.map(function (item) {
                return {
                    itemId: item.itemId,
                    itemName: item.itemName,
                    category: item.category,
                    quantity: number(item.openingStock),
                    unit: item.unit
                };
            }),

            transactionsToday: transactionsToday.length,

            stockInToday: stockIn.length,

            stockOutToday: stockOut.length,

            adjustmentsToday: adjustments.length,

            totalQuantityReceived: totalQuantityReceived,

            totalQuantityIssued: totalQuantityIssued,

            lowStockCount: lowStock.length,

            outOfStockCount: outOfStock.length,

            reorderCount: reorder.length,

            lowStockItems: lowStock.map(function (item) {
                return item.itemName;
            }),

            outOfStockItems: outOfStock.map(function (item) {
                return item.itemName;
            }),

            reorderItems: reorder.map(function (item) {
                return item.itemName;
            })

        };
    }


    /* =========================================================
       PUBLIC DAILY REPORT HOOK
       ========================================================= */

    window.FXInventoryReport = {

        getDailyData: getDailyReportData,

        getSummary: function (date) {
            return getDailyReportData(date);
        }

    };


    /* =========================================================
       SUMMARY
       ========================================================= */

    function renderSummary() {

        const records = getRecords();

        const total = records.length;

        let totalStock = 0;
        let low = 0;
        let out = 0;
        let reorder = 0;

        records.forEach(function (record) {

            totalStock += calculateCurrentStock(record);

            const status = stockStatus(record);

            if (status === "Low Stock") {
                low++;
            }

            if (status === "Out of Stock") {
                out++;
            }

            if (status === "Reorder") {
                reorder++;
            }
        });

        return `
            <div class="inventory-summary">

                <div class="inventory-kpi">
                    <div class="inventory-kpi-label">
                        Total Items
                    </div>
                    <div class="inventory-kpi-value">
                        ${total}
                    </div>
                </div>

                <div class="inventory-kpi">
                    <div class="inventory-kpi-label">
                        Total Stock
                    </div>
                    <div class="inventory-kpi-value">
                        ${totalStock}
                    </div>
                </div>

                <div class="inventory-kpi">
                    <div class="inventory-kpi-label">
                        Low Stock
                    </div>
                    <div class="inventory-kpi-value">
                        ${low}
                    </div>
                </div>

                <div class="inventory-kpi">
                    <div class="inventory-kpi-label">
                        Out of Stock
                    </div>
                    <div class="inventory-kpi-value">
                        ${out}
                    </div>
                </div>

                <div class="inventory-kpi">
                    <div class="inventory-kpi-label">
                        Reorder
                    </div>
                    <div class="inventory-kpi-value">
                        ${reorder}
                    </div>
                </div>

            </div>
        `;
    }


    /* =========================================================
       REGISTER
       ========================================================= */

    function renderRegister() {

        const search =
            document.getElementById("inventory-search")?.value
            .trim()
            .toLowerCase() || "";

        const category =
            document.getElementById("inventory-category-filter")?.value
            || "";

        const status =
            document.getElementById("inventory-status-filter")?.value
            || "";

        let records = getRecords();

        records = records.filter(function (record) {

            const matchesSearch =
                !search ||
                String(record.itemId || "").toLowerCase().includes(search) ||
                String(record.itemName || "").toLowerCase().includes(search) ||
                String(record.category || "").toLowerCase().includes(search) ||
                String(record.storageLocation || "").toLowerCase().includes(search);

            const matchesCategory =
                !category ||
                record.category === category;

            const matchesStatus =
                !status ||
                stockStatus(record) === status;

            return matchesSearch &&
                   matchesCategory &&
                   matchesStatus;
        });

        const container =
            document.getElementById("inventory-register");

        if (!container) return;

        if (!records.length) {

            container.innerHTML = `
                <div class="inventory-empty">
                    No inventory records found.
                </div>
            `;

            return;
        }

        container.innerHTML = records.map(function (record) {

            const currentStock =
                calculateCurrentStock(record);

            const statusValue =
                stockStatus(record);

            return `
                <article class="inventory-record">

                    <div class="inventory-record-main">

                        <div class="inventory-record-title-row">

                            <div>
                                <div class="inventory-record-title">
                                    ${escape(record.itemName || "Unnamed Item")}
                                </div>

                                <div class="inventory-item-id">
                                    ${escape(record.itemId || "")}
                                </div>
                            </div>

                            <span class="inventory-status inventory-status-${statusClass(statusValue)}">
                                ${escape(statusValue)}
                            </span>

                        </div>

                        <div class="inventory-record-grid">

                            <div>
                                <span>Category</span>
                                <strong>${escape(record.category || "—")}</strong>
                            </div>

                            <div>
                                <span>Current Stock</span>
                                <strong>
                                    ${currentStock}
                                    ${escape(record.unit || "")}
                                </strong>
                            </div>

                            <div>
                                <span>Minimum Stock</span>
                                <strong>
                                    ${number(record.minimumStock)}
                                    ${escape(record.unit || "")}
                                </strong>
                            </div>

                            <div>
                                <span>Reorder Level</span>
                                <strong>
                                    ${number(record.reorderLevel)}
                                    ${escape(record.unit || "")}
                                </strong>
                            </div>

                            <div>
                                <span>Location</span>
                                <strong>${escape(record.storageLocation || "—")}</strong>
                            </div>

                            <div>
                                <span>Responsible</span>
                                <strong>${escape(record.responsible || "—")}</strong>
                            </div>

                        </div>

                        ${
                            record.notes
                            ? `
                                <div class="inventory-record-notes">
                                    ${escape(record.notes)}
                                </div>
                            `
                            : ""
                        }

                    </div>

                    <div class="inventory-record-actions">

                        <button
                            class="btn btn-primary"
                            type="button"
                            data-inventory-edit="${escape(record.id)}"
                        >
                            Edit
                        </button>

                        <button
                            class="btn"
                            type="button"
                            data-inventory-transaction="${escape(record.id)}"
                        >
                            Stock Transaction
                        </button>

                        <button
                            class="btn btn-danger"
                            type="button"
                            data-inventory-delete="${escape(record.id)}"
                        >
                            Delete
                        </button>

                    </div>

                </article>
            `;

        }).join("");
    }


    /* =========================================================
       HISTORY
       ========================================================= */

    function renderHistory() {

        const search =
            document.getElementById("inventory-history-search")
                ?.value
                .trim()
                .toLowerCase() || "";

        const date =
            document.getElementById("inventory-history-date")
                ?.value || "";

        const transactions = getTransactions();

        const filtered = transactions.filter(function (transaction) {

            const matchesSearch =
                !search ||
                String(transaction.transactionId || "").toLowerCase().includes(search) ||
                String(transaction.itemName || "").toLowerCase().includes(search) ||
                String(transaction.itemId || "").toLowerCase().includes(search) ||
                String(transaction.transactionType || "").toLowerCase().includes(search);

            const matchesDate =
                !date ||
                transaction.transactionDate === date;

            return matchesSearch && matchesDate;
        });

        const container =
            document.getElementById("inventory-history-list");

        if (!container) return;

        if (!filtered.length) {

            container.innerHTML = `
                <div class="inventory-history-empty">
                    No stock transaction history found.
                </div>
            `;

            return;
        }

        container.innerHTML = filtered.map(function (transaction) {

            return `
                <div
                    class="inventory-history-item"
                    data-history-id="${escape(transaction.id)}"
                >

                    <button
                        class="inventory-history-row"
                        type="button"
                        data-history-toggle="${escape(transaction.id)}"
                    >

                        <span class="inventory-history-row-main">

                            <strong>
                                ${formatDate(transaction.transactionDate)}
                            </strong>

                            <span>—</span>

                            <strong>
                                ${escape(transaction.itemName || "Item")}
                            </strong>

                        </span>

                        <span class="inventory-history-arrow">
                            ↓
                        </span>

                    </button>

                    <div class="inventory-history-details">

                        <div class="inventory-history-detail-grid">

                            <div>
                                <span>Transaction ID</span>
                                <strong>
                                    ${escape(transaction.transactionId || "—")}
                                </strong>
                            </div>

                            <div>
                                <span>Item ID</span>
                                <strong>
                                    ${escape(transaction.itemId || "—")}
                                </strong>
                            </div>

                            <div>
                                <span>Item</span>
                                <strong>
                                    ${escape(transaction.itemName || "—")}
                                </strong>
                            </div>

                            <div>
                                <span>Transaction Type</span>
                                <strong>
                                    ${escape(transaction.transactionType || "—")}
                                </strong>
                            </div>

                            <div>
                                <span>Quantity</span>
                                <strong>
                                    ${number(transaction.quantity)}
                                    ${escape(transaction.unit || "")}
                                </strong>
                            </div>

                            <div>
                                <span>Reason</span>
                                <strong>
                                    ${escape(transaction.reason || "—")}
                                </strong>
                            </div>

                            <div>
                                <span>Reference</span>
                                <strong>
                                    ${escape(transaction.reference || "—")}
                                </strong>
                            </div>

                            <div>
                                <span>Recorded By</span>
                                <strong>
                                    ${escape(transaction.recordedBy || "—")}
                                </strong>
                            </div>

                            <div class="inventory-history-detail-wide">
                                <span>Remarks</span>
                                <strong>
                                    ${escape(transaction.remarks || "—")}
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>
            `;

        }).join("");
    }


    /* =========================================================
       MODALS
       ========================================================= */

    function closeAllModals() {

        document
            .querySelectorAll(".inventory-modal")
            .forEach(function (modal) {
                modal.classList.remove("active");
            });

        currentRecordId = null;
        currentTransactionId = null;
    }

    function openItemForm(id) {

        const modal =
            document.getElementById("inventory-item-modal");

        if (!modal) return;

        currentRecordId = id || null;

        const record =
            getRecords().find(function (item) {
                return item.id === id;
            });

        document.getElementById("inventory-item-modal-title").textContent =
            record ? "Edit Inventory Item" : "Add Inventory Item";

        document.getElementById("inventory-item-id").value =
            record?.itemId || nextItemId();

        document.getElementById("inventory-item-name").value =
            record?.itemName || "";

        document.getElementById("inventory-category").value =
            record?.category || "";

        document.getElementById("inventory-unit").value =
            record?.unit || "";

        document.getElementById("inventory-opening-stock").value =
            record?.openingStock ?? "";

        document.getElementById("inventory-minimum-stock").value =
            record?.minimumStock ?? "";

        document.getElementById("inventory-reorder-level").value =
            record?.reorderLevel ?? "";

        document.getElementById("inventory-location").value =
            record?.storageLocation || "";

        document.getElementById("inventory-responsible").value =
            record?.responsible || "";

        document.getElementById("inventory-status").value =
            record?.status || "Active";

        document.getElementById("inventory-notes").value =
            record?.notes || "";

        modal.classList.add("active");
    }

    function openTransactionForm(itemId) {

        const modal =
            document.getElementById("inventory-transaction-modal");

        if (!modal) return;

        const item =
            getRecords().find(function (record) {
                return record.id === itemId;
            });

        if (!item) return;

        currentTransactionId = null;

        document.getElementById("inventory-transaction-modal-title").textContent =
            "Stock Transaction";

        document.getElementById("inventory-transaction-item").value =
            item.id;

        document.getElementById("inventory-transaction-item-name").value =
            `${item.itemName || ""} (${item.itemId || ""})`;

        document.getElementById("inventory-transaction-date").value =
            today();

        document.getElementById("inventory-transaction-type").value =
            "Stock In";

        document.getElementById("inventory-transaction-quantity").value =
            "";

        document.getElementById("inventory-transaction-reason").value =
            "";

        document.getElementById("inventory-transaction-reference").value =
            "";

        document.getElementById("inventory-transaction-recorded-by").value =
            "";

        document.getElementById("inventory-transaction-remarks").value =
            "";

        modal.classList.add("active");
    }


    /* =========================================================
       SAVE ITEM
       ========================================================= */

    function saveItem() {

        const itemId =
            document.getElementById("inventory-item-id").value.trim();

        const itemName =
            document.getElementById("inventory-item-name").value.trim();

        const category =
            document.getElementById("inventory-category").value.trim();

        const unit =
            document.getElementById("inventory-unit").value.trim();

        const openingStock =
            number(document.getElementById("inventory-opening-stock").value);

        const minimumStock =
            number(document.getElementById("inventory-minimum-stock").value);

        const reorderLevel =
            number(document.getElementById("inventory-reorder-level").value);

        const storageLocation =
            document.getElementById("inventory-location").value.trim();

        const responsible =
            document.getElementById("inventory-responsible").value.trim();

        const status =
            document.getElementById("inventory-status").value;

        const notes =
            document.getElementById("inventory-notes").value.trim();


        if (!itemId) {
            alert("Please enter Item ID.");
            return;
        }

        if (!itemName) {
            alert("Please enter Item Name.");
            return;
        }

        if (!category) {
            alert("Please enter Category.");
            return;
        }

        if (!unit) {
            alert("Please enter Unit.");
            return;
        }

        if (openingStock < 0) {
            alert("Opening Stock cannot be negative.");
            return;
        }

        if (minimumStock < 0 || reorderLevel < 0) {
            alert("Stock thresholds cannot be negative.");
            return;
        }


        const duplicate =
            getRecords().find(function (record) {

                return (
                    record.itemId === itemId &&
                    record.id !== currentRecordId
                );

            });

        if (duplicate) {
            alert("Item ID already exists.");
            return;
        }


        const record = {

            itemId: itemId,

            itemName: itemName,

            category: category,

            unit: unit,

            openingStock: openingStock,

            minimumStock: minimumStock,

            reorderLevel: reorderLevel,

            storageLocation: storageLocation,

            responsible: responsible,

            status: status,

            notes: notes

        };


        if (currentRecordId) {

            const index =
                getRecords().findIndex(function (item) {
                    return item.id === currentRecordId;
                });

            if (index >= 0) {

                Data.update(
                    COLLECTION,
                    index,
                    {
                        ...record,
                        updatedAt: now()
                    }
                );
            }

        } else {

            Data.add(
                COLLECTION,
                {
                    id: "inv-" + Date.now(),

                    ...record,

                    createdAt: now(),

                    updatedAt: now()

                }
            );
        }


        closeAllModals();

        render();

    }


    /* =========================================================
       SAVE TRANSACTION
       ========================================================= */

    function saveTransaction() {

        const itemRecordId =
            document.getElementById("inventory-transaction-item").value;

        const item =
            getRecords().find(function (record) {
                return record.id === itemRecordId;
            });

        if (!item) {
            alert("Inventory item not found.");
            return;
        }


        const transactionDate =
            document.getElementById("inventory-transaction-date").value;

        const transactionType =
            document.getElementById("inventory-transaction-type").value;

        const quantity =
            number(document.getElementById("inventory-transaction-quantity").value);

        const reason =
            document.getElementById("inventory-transaction-reason").value.trim();

        const reference =
            document.getElementById("inventory-transaction-reference").value.trim();

        const recordedBy =
            document.getElementById("inventory-transaction-recorded-by").value.trim();

        const remarks =
            document.getElementById("inventory-transaction-remarks").value.trim();


        if (!transactionDate) {
            alert("Please select transaction date.");
            return;
        }

        if (quantity <= 0) {
            alert("Quantity must be greater than zero.");
            return;
        }


        if (transactionType === "Stock Out") {

            const currentStock =
                calculateCurrentStock(item);

            if (quantity > currentStock) {

                alert(
                    `Insufficient stock. Current stock is ${currentStock} ${item.unit || ""}.`
                );

                return;
            }
        }


        const transaction = {

            id: "txn-" + Date.now(),

            transactionId: nextTransactionId(),

            itemRecordId: item.id,

            itemId: item.itemId,

            itemName: item.itemName,

            unit: item.unit,

            transactionDate: transactionDate,

            transactionType: transactionType,

            quantity: quantity,

            reason: reason,

            reference: reference,

            recordedBy: recordedBy,

            remarks: remarks,

            createdAt: now(),

            updatedAt: now()

        };


        Data.add(
            TRANSACTION_COLLECTION,
            transaction
        );


        closeAllModals();

        render();

    }


    /* =========================================================
       DELETE
       ========================================================= */

    function deleteItem(id) {

        const records = getRecords();

        const index =
            records.findIndex(function (record) {
                return record.id === id;
            });

        if (index < 0) return;

        const item = records[index];

        if (
            !confirm(
                `Delete inventory item "${item.itemName}"?\n\nIts transaction history will also be removed.`
            )
        ) {
            return;
        }


        const transactions =
            getTransactions().filter(function (transaction) {

                return (
                    transaction.itemRecordId !== item.id &&
                    transaction.itemId !== item.itemId
                );

            });

        Data.set(
            TRANSACTION_COLLECTION,
            transactions
        );

        Data.remove(
            COLLECTION,
            index
        );

        render();
    }


    /* =========================================================
       EVENTS
       ========================================================= */

    function bindEvents() {

        if (bound) return;

        const root =
            document.getElementById("tab-inventory");

        if (!root) return;

        root.addEventListener("click", function (event) {

            const addItem =
                event.target.closest("[data-inventory-add]");

            if (addItem) {
                openItemForm();
                return;
            }


            const edit =
                event.target.closest("[data-inventory-edit]");

            if (edit) {
                openItemForm(edit.dataset.inventoryEdit);
                return;
            }


            const transaction =
                event.target.closest("[data-inventory-transaction]");

            if (transaction) {
                openTransactionForm(
                    transaction.dataset.inventoryTransaction
                );
                return;
            }


            const deleteButton =
                event.target.closest("[data-inventory-delete]");

            if (deleteButton) {
                deleteItem(
                    deleteButton.dataset.inventoryDelete
                );
                return;
            }


            const historyToggle =
                event.target.closest("[data-history-toggle]");

            if (historyToggle) {

                const item =
                    historyToggle.closest(".inventory-history-item");

                if (item) {
                    item.classList.toggle("expanded");
                }

                return;
            }


            if (
                event.target.matches("[data-inventory-close]")
            ) {
                closeAllModals();
            }

        });


        root.addEventListener("input", function (event) {

            if (
                event.target.id === "inventory-search" ||
                event.target.id === "inventory-history-search"
            ) {
                render();
            }

        });


        root.addEventListener("change", function (event) {

            if (
                event.target.id === "inventory-category-filter" ||
                event.target.id === "inventory-status-filter" ||
                event.target.id === "inventory-history-date"
            ) {
                render();
            }

        });


        root.addEventListener("click", function (event) {

            if (
                event.target.id === "inventory-save-item"
            ) {
                saveItem();
            }

            if (
                event.target.id === "inventory-save-transaction"
            ) {
                saveTransaction();
            }

        });


        bound = true;
    }


    /* =========================================================
       HTML
       ========================================================= */

    function renderHTML() {

        const categories = [
            ...new Set(
                getRecords()
                    .map(function (record) {
                        return record.category;
                    })
                    .filter(Boolean)
            )
        ].sort();


        return `

            <div class="inventory-module">

                <div class="inventory-header">

                    <div>
                        <h2>Inventory</h2>

                        <p>
                            Inventory Master, stock movement and material tracking
                        </p>
                    </div>

                    <div class="inventory-header-actions">

                        <button
                            class="btn btn-primary"
                            type="button"
                            data-inventory-add
                        >
                            + Add Material
                        </button>

                    </div>

                </div>


                ${renderSummary()}


                <div class="inventory-toolbar">

                    <input
                        id="inventory-search"
                        class="inventory-search"
                        type="search"
                        placeholder="Search item, ID, category or location..."
                    >

                    <select id="inventory-category-filter">

                        <option value="">
                            All Categories
                        </option>

                        ${categories.map(function (category) {

                            return `
                                <option value="${escape(category)}">
                                    ${escape(category)}
                                </option>
                            `;

                        }).join("")}

                    </select>


                    <select id="inventory-status-filter">

                        <option value="">
                            All Stock Status
                        </option>

                        <option value="In Stock">
                            In Stock
                        </option>

                        <option value="Low Stock">
                            Low Stock
                        </option>

                        <option value="Reorder">
                            Reorder
                        </option>

                        <option value="Out of Stock">
                            Out of Stock
                        </option>

                    </select>

                </div>


                <section class="inventory-section">

                    <div class="inventory-section-header">

                        <div>
                            <h3>Inventory Register</h3>

                            <p>
                                Current material and stock position
                            </p>
                        </div>

                    </div>

                    <div
                        id="inventory-register"
                        class="inventory-register"
                    ></div>

                </section>


                <section class="inventory-history">

                    <div class="inventory-history-header">

                        <div>
                            <h3>Stock History</h3>

                            <p>
                                Complete stock movement records
                            </p>
                        </div>

                    </div>


                    <div class="inventory-history-toolbar">

                        <input
                            id="inventory-history-search"
                            class="inventory-history-search"
                            type="search"
                            placeholder="Search transaction, item or type..."
                        >

                        <input
                            id="inventory-history-date"
                            class="inventory-history-date"
                            type="date"
                        >

                    </div>


                    <div class="inventory-history-title">
                        RECORD DATA
                    </div>


                    <div
                        id="inventory-history-list"
                        class="inventory-history-list"
                    ></div>

                </section>


                <!-- ITEM MODAL -->

                <div
                    id="inventory-item-modal"
                    class="inventory-modal"
                >

                    <div class="inventory-modal-backdrop"></div>

                    <div class="inventory-modal-panel">

                        <div class="inventory-modal-header">

                            <h3 id="inventory-item-modal-title">
                                Add Inventory Item
                            </h3>

                            <button
                                type="button"
                                class="inventory-modal-close"
                                data-inventory-close
                            >
                                &times;
                            </button>

                        </div>


                        <div class="inventory-modal-body">

                            <div class="inventory-form-grid">

                                <div class="inventory-field">

                                    <label>Item ID</label>

                                    <input
                                        id="inventory-item-id"
                                        type="text"
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Item Name *</label>

                                    <input
                                        id="inventory-item-name"
                                        type="text"
                                        placeholder="e.g. Floor Cleaner"
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Category *</label>

                                    <input
                                        id="inventory-category"
                                        type="text"
                                        placeholder="e.g. Cleaning"
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Unit *</label>

                                    <input
                                        id="inventory-unit"
                                        type="text"
                                        placeholder="pcs, kg, L, box..."
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Opening Stock</label>

                                    <input
                                        id="inventory-opening-stock"
                                        type="number"
                                        min="0"
                                        step="any"
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Minimum Stock</label>

                                    <input
                                        id="inventory-minimum-stock"
                                        type="number"
                                        min="0"
                                        step="any"
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Reorder Level</label>

                                    <input
                                        id="inventory-reorder-level"
                                        type="number"
                                        min="0"
                                        step="any"
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Storage Location</label>

                                    <input
                                        id="inventory-location"
                                        type="text"
                                        placeholder="Store Room / Floor"
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Responsible Person</label>

                                    <input
                                        id="inventory-responsible"
                                        type="text"
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Status</label>

                                    <select id="inventory-status">

                                        <option value="Active">
                                            Active
                                        </option>

                                        <option value="Inactive">
                                            Inactive
                                        </option>

                                    </select>

                                </div>


                                <div class="inventory-field inventory-field-wide">

                                    <label>Notes</label>

                                    <textarea
                                        id="inventory-notes"
                                        rows="3"
                                        placeholder="Additional information..."
                                    ></textarea>

                                </div>

                            </div>

                        </div>


                        <div class="inventory-modal-footer">

                            <button
                                type="button"
                                class="btn"
                                data-inventory-close
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                class="btn btn-primary"
                                id="inventory-save-item"
                            >
                                Save Material
                            </button>

                        </div>

                    </div>

                </div>


                <!-- TRANSACTION MODAL -->

                <div
                    id="inventory-transaction-modal"
                    class="inventory-modal"
                >

                    <div class="inventory-modal-backdrop"></div>

                    <div class="inventory-modal-panel">

                        <div class="inventory-modal-header">

                            <h3 id="inventory-transaction-modal-title">
                                Stock Transaction
                            </h3>

                            <button
                                type="button"
                                class="inventory-modal-close"
                                data-inventory-close
                            >
                                &times;
                            </button>

                        </div>


                        <div class="inventory-modal-body">

                            <input
                                id="inventory-transaction-item"
                                type="hidden"
                            >


                            <div class="inventory-form-grid">

                                <div class="inventory-field inventory-field-wide">

                                    <label>Material</label>

                                    <input
                                        id="inventory-transaction-item-name"
                                        type="text"
                                        readonly
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Date *</label>

                                    <input
                                        id="inventory-transaction-date"
                                        type="date"
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Transaction Type *</label>

                                    <select id="inventory-transaction-type">

                                        <option value="Stock In">
                                            Stock In
                                        </option>

                                        <option value="Stock Out">
                                            Stock Out
                                        </option>

                                        <option value="Adjustment">
                                            Adjustment
                                        </option>

                                    </select>

                                </div>


                                <div class="inventory-field">

                                    <label>Quantity *</label>

                                    <input
                                        id="inventory-transaction-quantity"
                                        type="number"
                                        min="0"
                                        step="any"
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Reason</label>

                                    <input
                                        id="inventory-transaction-reason"
                                        type="text"
                                        placeholder="Purchase / Issue / Correction..."
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Reference</label>

                                    <input
                                        id="inventory-transaction-reference"
                                        type="text"
                                    >

                                </div>


                                <div class="inventory-field">

                                    <label>Recorded By</label>

                                    <input
                                        id="inventory-transaction-recorded-by"
                                        type="text"
                                    >

                                </div>


                                <div class="inventory-field inventory-field-wide">

                                    <label>Remarks</label>

                                    <textarea
                                        id="inventory-transaction-remarks"
                                        rows="3"
                                    ></textarea>

                                </div>

                            </div>

                        </div>


                        <div class="inventory-modal-footer">

                            <button
                                type="button"
                                class="btn"
                                data-inventory-close
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                class="btn btn-primary"
                                id="inventory-save-transaction"
                            >
                                Save Transaction
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        `;
    }


    /* =========================================================
       RENDER
       ========================================================= */

    function render() {

        const container =
            document.getElementById("tab-inventory");

        if (!container) return;


        const existingSearch =
            document.getElementById("inventory-search")?.value || "";

        const existingCategory =
            document.getElementById("inventory-category-filter")?.value || "";

        const existingStatus =
            document.getElementById("inventory-status-filter")?.value || "";

        const existingHistorySearch =
            document.getElementById("inventory-history-search")?.value || "";

        const existingHistoryDate =
            document.getElementById("inventory-history-date")?.value || "";


        container.innerHTML = renderHTML();


        document.getElementById("inventory-search").value =
            existingSearch;

        document.getElementById("inventory-category-filter").value =
            existingCategory;

        document.getElementById("inventory-status-filter").value =
            existingStatus;

        document.getElementById("inventory-history-search").value =
            existingHistorySearch;

        document.getElementById("inventory-history-date").value =
            existingHistoryDate;


        renderRegister();
        renderHistory();

        bindEvents();
    }


    /* =========================================================
       MODULE LIFECYCLE
       ========================================================= */

    function init() {
        render();
    }

    function destroy() {
        closeAllModals();
    }


    /* =========================================================
       PUBLIC API
       ========================================================= */

    window.FXInventory = {

        getRecords: getRecords,

        getTransactions: getTransactions,

        getDailyReportData: getDailyReportData,

        calculateCurrentStock: calculateCurrentStock,

        stockStatus: stockStatus,

        render: render,

        openItemForm: openItemForm,

        openTransactionForm: openTransactionForm

    };


    /* =========================================================
       REGISTER MODULE
       ========================================================= */

    if (typeof registerFXModule === "function") {

        registerFXModule(
            "inventory",
            {
                init: init,
                render: render,
                destroy: destroy
            }
        );

    }

})();