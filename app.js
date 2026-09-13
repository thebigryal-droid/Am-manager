/* =========================================================
   FACILITY EXECUTIVE OS
   PHASE 1 — VALIDATED MODULAR APPLICATION REGISTRY
   ========================================================= */

(function (window) {
    "use strict";

    const FX = window.FX = window.FX || {};

    FX.modules = FX.modules || Object.create(null);

    const expectedModules = [
        "control-center",
        "dashboard",
        "daily_report",
        "booking_report",
        "amenities",
        "control",
        "hk_schedule",
        "staff_master",
        "attendance",
        "pool",
        "maintenance",
        "inventory",
        "issues",
        "manager_walk",
        "deep_clean",
        "bookings"
    ];

    function createFallbackModule(name) {
        return {
            name: name,
            __fallback: true,

            init: function () {},

            render: function () {},

            destroy: function () {}
        };
    }

    expectedModules.forEach(function (name) {
        if (
            !FX.modules[name] ||
            typeof FX.modules[name] !== "object"
        ) {
            const fallbackModule =
                createFallbackModule(name);

            if (
                typeof window.registerFXModule ===
                "function"
            ) {
                window.registerFXModule(
                    name,
                    fallbackModule
                );
            } else {
                FX.modules[name] = fallbackModule;
            }
        }
    });

    function getMissingImplementations() {
        return expectedModules.filter(function (name) {
            const module = FX.modules[name];

            return (
                module &&
                module.__fallback === true
            );
        });
    }

    window.FXApp = {
        version: "phase-1-validated-registry",

        modules: expectedModules.slice(),

        booted: true,

        getRegisteredModules: function () {
            return Object.keys(FX.modules);
        },

        getMissingImplementations:
            getMissingImplementations
    };
    
        // Collapsible Card Logic
    window.toggleCard = function(headerElement) {
    const card = headerElement.closest('.collapsible-card');
    if (card) {
        card.classList.toggle('collapsed');
     }
    };
    
    /* =========================================================
   UNIVERSAL SMART HISTORY CONTROLLER
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Smart Accordion Toggle (Expand/Collapse)
    document.addEventListener('click', function(e) {
        const historyRow = e.target.closest('[class*="-history-row"]');
        
        if (historyRow) {
            const historyItem = historyRow.closest('[class*="-history-item"]');
            if (historyItem) {
                historyItem.classList.toggle('expanded');
            }
        }
    });

    // 2. Smart Live Search / Filtering
    document.addEventListener('input', function(e) {
        // Target any input inside a history toolbar or search box
        const searchInput = e.target.closest('[class*="-history-search"] input, [class*="-history-toolbar"] input[type="text"], [class*="-section-heading"] input');
        
        if (searchInput) {
            const searchTerm = searchInput.value.toLowerCase();
            
            // Scope the search to the current module's history container
            const container = searchInput.closest('section, .card, [class*="-history"]');
            if (!container) return;

            // Find all history items within this specific list
            const historyItems = container.querySelectorAll('[class*="-history-item"]');
            
            historyItems.forEach(item => {
                // Auto-collapse items while searching for a cleaner view
                if (searchTerm.length > 0) {
                    item.classList.remove('expanded');
                }

                // Check if the item's text matches the search term
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
    });

});




})(window);