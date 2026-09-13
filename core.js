/* =========================================================
   FACILITY EXECUTIVE OS
   CORE FOUNDATION
   Compatible with the original modular project
   ========================================================= */

(function (window, document) {
    "use strict";

    const FX = window.FX = window.FX || {};

    /* -----------------------------------------------------
       GLOBAL STATE
       ----------------------------------------------------- */

    FX.state = FX.state || {
        activeTab: "dashboard",
        previousTab: null,
        modalOpen: false,
        currentModalType: null,
        currentModalIndex: null,
        sidebarOpen: false
    };

    FX.modules = FX.modules || Object.create(null);

    /* -----------------------------------------------------
       EVENT BUS
       ----------------------------------------------------- */

    FX.events = FX.events || Object.create(null);

    FX.on = function (eventName, handler) {
        if (typeof handler !== "function") return;

        if (!FX.events[eventName]) {
            FX.events[eventName] = [];
        }

        FX.events[eventName].push(handler);
    };

    FX.off = function (eventName, handler) {
        if (!FX.events[eventName]) return;

        FX.events[eventName] = FX.events[eventName].filter(
            function (registeredHandler) {
                return registeredHandler !== handler;
            }
        );
    };

    FX.emit = function (eventName, payload) {
        const handlers = FX.events[eventName] || [];

        handlers.forEach(function (handler) {
            try {
                handler(payload);
            } catch (error) {
                console.error(
                    "FX event handler error:",
                    eventName,
                    error
                );
            }
        });
    };

    /* -----------------------------------------------------
       MODULE REGISTRATION
       ----------------------------------------------------- */

    function registerFXModule(name, moduleObject) {
        if (!name || !moduleObject) {
            console.warn(
                "FX module registration skipped:",
                name
            );
            return;
        }

        FX.modules[name] = moduleObject;

        FX.emit("module:registered", {
            name: name,
            module: moduleObject
        });
    }

    /*
       Preserve the original global API used by existing files.
    */
    window.registerFXModule = registerFXModule;
    FX.registerModule = registerFXModule;

    FX.getModule = function (name) {
        return FX.modules[name] || null;
    };

    FX.getRegisteredModules = function () {
        return Object.keys(FX.modules);
    };

    /* -----------------------------------------------------
       MODULE METHOD CALLER
       ----------------------------------------------------- */

    function callModule(moduleName, methodName) {
        const moduleObject = FX.modules[moduleName];

        if (!moduleObject) {
            console.warn(
                "FX module not found:",
                moduleName
            );
            return undefined;
        }

        const method = moduleObject[methodName];

        if (typeof method !== "function") {
            return undefined;
        }

        const args = Array.prototype.slice.call(arguments, 2);

        try {
            return method.apply(moduleObject, args);
        } catch (error) {
            console.error(
                "FX module method error:",
                moduleName + "." + methodName,
                error
            );
            return undefined;
        }
    }

    window.callFXModule = callModule;
    FX.callModule = callModule;

    /* -----------------------------------------------------
       TAB SWITCHING
       ----------------------------------------------------- */

    function switchTab(tabId) {
        if (!tabId) return;

        const targetPanel = document.getElementById(
            "tab-" + tabId
        );

        if (!targetPanel) {
            console.warn(
                "Tab panel not found:",
                "tab-" + tabId
            );
            return;
        }

        const previousTab = FX.state.activeTab;

        FX.state.previousTab = previousTab;
        FX.state.activeTab = tabId;

        /*
           Preserve the original .tab-content structure.
        */
        const tabPanels = document.querySelectorAll(
            ".tab-content"
        );

        tabPanels.forEach(function (panel) {
            const isActive = panel.id === "tab-" + tabId;

            panel.classList.toggle("active", isActive);

            /*
               Only apply hidden when the panel explicitly
               participates in the hidden-state behavior.
            */
            if (
                panel.hasAttribute("hidden") ||
                panel.classList.contains("uses-hidden-state")
            ) {
                panel.hidden = !isActive;
            }
        });

        /*
           Update navigation buttons.
        */
        const navigationButtons = document.querySelectorAll(
            "[data-tab]"
        );

        navigationButtons.forEach(function (button) {
            const isActive =
                button.getAttribute("data-tab") === tabId;

            button.classList.toggle("active", isActive);
            button.setAttribute(
                "aria-selected",
                String(isActive)
            );
        });

        /*
           Notify the previous module.
        */
        if (
            previousTab &&
            previousTab !== tabId &&
            FX.modules[previousTab] &&
            typeof FX.modules[previousTab].destroy === "function"
        ) {
            try {
                FX.modules[previousTab].destroy();
            } catch (error) {
                console.error(
                    "Error destroying module:",
                    previousTab,
                    error
                );
            }
        }

        /*
           Initialize and render the active module.
        */
        const activeModule = FX.modules[tabId];

        if (activeModule) {
            if (
                typeof activeModule.init === "function" &&
                !activeModule.__fxInitialized
            ) {
                try {
                    activeModule.init();
                    activeModule.__fxInitialized = true;
                } catch (error) {
                    console.error(
                        "Error initializing module:",
                        tabId,
                        error
                    );
                }
            }

            if (typeof activeModule.render === "function") {
                try {
                    activeModule.render();
                } catch (error) {
                    console.error(
                        "Error rendering module:",
                        tabId,
                        error
                    );
                }
            }
        }

        FX.emit("tab:changed", {
            previousTab: previousTab,
            activeTab: tabId
        });
        
        if (typeof closeSidebarOnMobile === 'function') {
        closeSidebarOnMobile();
         }
    }

    window.switchTab = switchTab;
    FX.switchTab = switchTab;

    /* -----------------------------------------------------
       SIDEBAR
       ----------------------------------------------------- */

    function toggleSidebar() {
        FX.state.sidebarOpen = !FX.state.sidebarOpen;

        document.body.classList.toggle(
            "sidebar-open",
            FX.state.sidebarOpen
        );

        const sidebar = document.querySelector(
            ".sidebar, #sidebar, .app-sidebar"
        );

        if (sidebar) {
            sidebar.classList.toggle(
                "open",
                FX.state.sidebarOpen
            );
        }

        FX.emit("sidebar:changed", {
            open: FX.state.sidebarOpen
        });
    }

    function closeSidebarOnMobile() {
        FX.state.sidebarOpen = false;

        document.body.classList.remove(
            "sidebar-open"
        );

        const sidebar = document.querySelector(
            ".sidebar, #sidebar, .app-sidebar"
        );

        if (sidebar) {
            sidebar.classList.remove("open");
        }
    }

    window.toggleSidebar = toggleSidebar;
    window.closeSidebarOnMobile = closeSidebarOnMobile;

    FX.toggleSidebar = toggleSidebar;
    FX.closeSidebarOnMobile = closeSidebarOnMobile;

    /* -----------------------------------------------------
       MODAL HELPERS
       ----------------------------------------------------- */

    function openModal(type, index) {
        const modal = document.getElementById(
            "formModal"
        );

        FX.state.modalOpen = true;
        FX.state.currentModalType =
            type !== undefined ? type : null;
        FX.state.currentModalIndex =
            index !== undefined ? index : null;

        if (modal) {
            modal.classList.add("active");
            modal.classList.remove("hidden");

            modal.removeAttribute("aria-hidden");

            if (type !== undefined) {
                modal.dataset.type = String(type);
            }

            if (index !== undefined) {
                modal.dataset.index = String(index);
            }
        }

        FX.emit("modal:opened", {
            type: type,
            index: index
        });
    }

    function closeModal() {
        const modal = document.getElementById(
            "formModal"
        );

        FX.state.modalOpen = false;
        FX.state.currentModalType = null;
        FX.state.currentModalIndex = null;

        if (modal) {
            modal.classList.remove("active");

            /*
               Do not force hidden unless the original modal
               already uses the hidden attribute.
            */
            if (modal.hasAttribute("hidden")) {
                modal.hidden = true;
            }

            modal.setAttribute(
                "aria-hidden",
                "true"
            );

            delete modal.dataset.type;
            delete modal.dataset.index;
        }

        FX.emit("modal:closed");
    }

    /*
       Do not overwrite module-specific implementations.
    */
    window.openModal = window.openModal || openModal;
    window.closeModal = window.closeModal || closeModal;

    FX.openModal = window.openModal;
    FX.closeModal = window.closeModal;

    /* -----------------------------------------------------
       UTILITY HELPERS
       ----------------------------------------------------- */

    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    FX.escapeHtml = escapeHtml;
    window.escapeHtml = window.escapeHtml || escapeHtml;

    /* -----------------------------------------------------
       DOM READY
       ----------------------------------------------------- */

    FX.ready = function (callback) {
        if (typeof callback !== "function") return;

        if (document.readyState === "loading") {
            document.addEventListener(
                "DOMContentLoaded",
                callback,
                { once: true }
            );
        } else {
            callback();
        }
    };

    FX.ready(function () {
        FX.emit("core:ready");

        /*
           Do not force a tab here if app.js already controls
           initial navigation.
        */
        const activePanel = document.querySelector(
            ".tab-content.active"
        );

        if (activePanel && activePanel.id) {
            FX.state.activeTab =
                activePanel.id.replace(/^tab-/, "");
        }
    });

    window.FXCore = FX;

})(window, document);