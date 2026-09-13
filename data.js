/* =========================================================
   FACILITY EXECUTIVE OS
   CENTRAL DATA LAYER
   Compatible with original modular project
   ========================================================= */

(function (window, document) {
    "use strict";

    const FX = window.FX = window.FX || {};
    const FXData = window.FXData = window.FXData || {};

    const STORAGE_KEY = "facilityExecutiveOSData";

    const defaultData = {
        dashboard: {},

        amenities: [],
        checklist: [],
        control: [],

        bookings: [],
        bookingReports: [],

        staff_master: [],
        attendance: [],

        hk_schedule: [],

        pool_logs: [],
        maintenance: [],
        inventory: [],
        inventory_transactions: [],
        complaints: [],
        amenity_history: [],
        control_history: [],
        deep_cleaning: [],
        manager_walk: [],

        executiveReports: [],

        settings: {
            facilityName: "Facility Executive OS",
            facilityLocation: "",
            managerName: "",
            currency: "INR",
            dateFormat: "DD/MM/YYYY"
        }
    };

    function deepClone(value) {
        if (value === null || value === undefined) {
            return value;
        }

        try {
            if (typeof structuredClone === "function") {
                return structuredClone(value);
            }
        } catch (error) {
            // Fall back to JSON cloning below.
        }

        return JSON.parse(JSON.stringify(value));
    }

    function createId(prefix) {
        const safePrefix = prefix || "item";

        return (
            safePrefix +
            "_" +
            Date.now().toString(36) +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 10)
        );
    }

    function createRecord(record, prefix) {
        const now = new Date().toISOString();

        const nextRecord =
            record && typeof record === "object"
                ? deepClone(record)
                : {};

        if (!nextRecord.id) {
            nextRecord.id = createId(prefix);
        }

        if (!nextRecord.createdAt) {
            nextRecord.createdAt = now;
        }

        nextRecord.updatedAt = now;

        return nextRecord;
    }

    function mergeData(base, incoming) {
        if (
            !incoming ||
            typeof incoming !== "object" ||
            Array.isArray(incoming)
        ) {
            return base;
        }

        Object.keys(incoming).forEach(function (key) {
            const incomingValue = incoming[key];

            if (
                incomingValue &&
                typeof incomingValue === "object" &&
                !Array.isArray(incomingValue) &&
                base[key] &&
                typeof base[key] === "object" &&
                !Array.isArray(base[key])
            ) {
                base[key] = mergeData(
                    base[key],
                    incomingValue
                );
            } else if (
                Array.isArray(incomingValue)
            ) {
                base[key] = incomingValue.map(function (record) {
                    if (
                        record &&
                        typeof record === "object" &&
                        !Array.isArray(record)
                    ) {
                        return createRecord(record, key);
                    }

                    return record;
                });
            } else {
                base[key] = incomingValue;
            }
        });

        return base;
    }

    /*
       Keep the persisted data model aligned with the module collection
       names. Older builds used camelCase or the generic "issues" and
       "staff" keys; normalize those aliases once when data is loaded or
       imported so records do not disappear into duplicate collections.
    */
    const COLLECTION_ALIASES = {
        complaints: ["issues"],
        staff_master: ["staff"],
        hk_schedule: ["housekeepingSchedule"],
        pool_logs: ["pool"],
        deep_cleaning: ["deepCleaning"],
        manager_walk: ["managerWalk"]
    };

    function normalizeCollections(data) {
        const normalized = data && typeof data === "object"
            ? data
            : deepClone(defaultData);

        Object.keys(COLLECTION_ALIASES).forEach(function (canonical) {
            const canonicalRecords = Array.isArray(normalized[canonical])
                ? normalized[canonical]
                : [];

            const seenIds = new Set(
                canonicalRecords
                    .map(function (record) {
                        return record && record.id;
                    })
                    .filter(Boolean)
            );

            COLLECTION_ALIASES[canonical].forEach(function (alias) {
                const aliasRecords = Array.isArray(normalized[alias])
                    ? normalized[alias]
                    : [];

                aliasRecords.forEach(function (record) {
                    const id = record && record.id;

                    if (!id || !seenIds.has(id)) {
                        canonicalRecords.push(record);
                        if (id) seenIds.add(id);
                    }
                });

                delete normalized[alias];
            });

            normalized[canonical] = canonicalRecords.map(function (record) {
                return record &&
                    typeof record === "object" &&
                    !Array.isArray(record)
                    ? createRecord(record, canonical)
                    : record;
            });
        });

        return normalized;
    }

    function loadData() {
        let storedData = null;

        try {
            storedData = window.localStorage.getItem(
                STORAGE_KEY
            );
        } catch (error) {
            console.warn(
                "Local storage could not be accessed:",
                error
            );
        }

        if (!storedData) {
            return normalizeCollections(deepClone(defaultData));
        }

        try {
            const parsedData = JSON.parse(storedData);

            if (
                !parsedData ||
                typeof parsedData !== "object" ||
                Array.isArray(parsedData)
            ) {
                throw new Error(
                    "Stored data must be an object."
                );
            }

            return normalizeCollections(
                mergeData(
                    deepClone(defaultData),
                    parsedData
                )
            );
        } catch (error) {
            console.error(
                "Stored application data is invalid:",
                error
            );

            return normalizeCollections(deepClone(defaultData));
        }
    }

    function syncLegacyCollections() {
        if (
            !FXData.collections ||
            typeof FXData.collections !== "object"
        ) {
            FXData.collections = Object.create(null);
        }

        Object.keys(FXData.collections).forEach(function (key) {
            delete FXData.collections[key];
        });

        Object.keys(FX.data).forEach(function (key) {
            if (Array.isArray(FX.data[key])) {
                FXData.collections[key] = FX.data[key];
            }
        });
    }

    function saveData() {
        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(FX.data)
            );

            if (typeof FX.emit === "function") {
                FX.emit("data:saved", deepClone(FX.data));
            }

            return true;
        } catch (error) {
            console.error(
                "Application data could not be saved:",
                error
            );

            if (typeof FX.emit === "function") {
                FX.emit("data:error", {
                    action: "save",
                    error: error
                });
            }

            return false;
        }
    }

    function resetData() {
        FX.data = normalizeCollections(deepClone(defaultData));

        syncLegacyCollections();
        saveData();

        if (typeof FX.emit === "function") {
            FX.emit("data:reset", deepClone(FX.data));
        }

        return FX.data;
    }

    function exportData() {
        return deepClone(FX.data);
    }

    function importData(importedData) {
        if (
            !importedData ||
            typeof importedData !== "object" ||
            Array.isArray(importedData)
        ) {
            throw new Error(
                "Imported data must be a valid object."
            );
        }

        FX.data = normalizeCollections(
            mergeData(
                deepClone(defaultData),
                importedData
            )
        );

        syncLegacyCollections();
        saveData();

        if (typeof FX.emit === "function") {
            FX.emit("data:imported", deepClone(FX.data));
        }

        return FX.data;
    }

    function getCollection(collectionName) {
        if (
            !collectionName ||
            typeof collectionName !== "string"
        ) {
            return [];
        }

        if (!Array.isArray(FX.data[collectionName])) {
            FX.data[collectionName] = [];
        }

        FXData.collections[collectionName] =
            FX.data[collectionName];

        return FX.data[collectionName];
    }

    function notifyChange(collectionName, payload) {
        saveData();

        if (typeof FX.emit === "function") {
            FX.emit("data:changed", {
                collection: collectionName,
                payload: deepClone(payload)
            });

            FX.emit(
                "data:changed:" + collectionName,
                deepClone(payload)
            );
        }
    }

    /*
       Original FXData collection API
    */

    FXData.collections =
        FXData.collections ||
        Object.create(null);

    FXData.initialized = true;

    FXData.get = function (name) {
        return getCollection(name);
    };

    FXData.set = function (name, value) {
        if (
            !name ||
            typeof name !== "string"
        ) {
            throw new TypeError(
                "Collection name is required."
            );
        }

        FX.data[name] = Array.isArray(value)
            ? value.map(function (record) {
                return createRecord(record, name);
            })
            : [];

        FXData.collections[name] =
            FX.data[name];

        notifyChange(
            name,
            FX.data[name]
        );

        return FX.data[name];
    };

    FXData.add = function (name, record) {
        const collection = getCollection(name);
        const newRecord = createRecord(record, name);

        collection.unshift(newRecord);

        FXData.collections[name] = collection;

        notifyChange(name, newRecord);

        return newRecord;
    };

    FXData.update = function (
        name,
        indexOrId,
        record
    ) {
        const collection = getCollection(name);

        const index =
            typeof indexOrId === "number"
                ? indexOrId
                : collection.findIndex(function (item) {
                    return (
                        item &&
                        item.id === indexOrId
                    );
                });

        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= collection.length
        ) {
            throw new RangeError(
                "Invalid record index or id."
            );
        }

        const existingRecord =
            collection[index] || {};

        const updatedRecord = Object.assign(
            {},
            existingRecord,
            record && typeof record === "object"
                ? deepClone(record)
                : {},
            {
                id:
                    existingRecord.id ||
                    createId(name),

                createdAt:
                    existingRecord.createdAt ||
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString()
            }
        );

        collection[index] = updatedRecord;
        FXData.collections[name] = collection;

        notifyChange(
            name,
            updatedRecord
        );

        return updatedRecord;
    };

    FXData.remove = function (
        name,
        indexOrId
    ) {
        const collection = getCollection(name);

        const index =
            typeof indexOrId === "number"
                ? indexOrId
                : collection.findIndex(function (item) {
                    return (
                        item &&
                        item.id === indexOrId
                    );
                });

        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= collection.length
        ) {
            return false;
        }

        const removedRecord =
            collection.splice(index, 1)[0];

        FXData.collections[name] = collection;

        notifyChange(
            name,
            removedRecord
        );

        return true;
    };

    FX.data = loadData();

    syncLegacyCollections();

    FX.dataStore = {
        STORAGE_KEY: STORAGE_KEY,
        defaults: deepClone(defaultData),
        load: loadData,
        save: saveData,
        reset: resetData,
        export: exportData,
        import: importData,
        getCollection: getCollection,
        createId: createId,
        notifyChange: notifyChange
    };

    window.appData = FX.data;
    window.saveAppData = saveData;
    window.loadAppData = loadData;
    window.resetAppData = resetData;

    if (typeof FX.emit === "function") {
        FX.emit("data:ready", deepClone(FX.data));
    }

})(window, document);
