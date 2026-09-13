/* =========================================================
   FACILITY EXECUTIVE OS
   CENTRAL DATA LAYER
   LOCAL CACHE + FIRESTORE SYNCHRONIZATION
   Compatible with original modular project
   ========================================================= */

(function (window, document) {
    "use strict";

    const FX = window.FX = window.FX || {};
    const FXData = window.FXData = window.FXData || {};
    const Firebase = window.FXFirebase || {};

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

    /*
       These collections are synchronized with Firestore.

       dashboard and settings remain local because they are
       application-level objects rather than record collections.
    */
    const FIRESTORE_COLLECTIONS = [
        "amenities",
        "checklist",
        "control",
        "bookings",
        "bookingReports",
        "staff_master",
        "attendance",
        "hk_schedule",
        "pool_logs",
        "maintenance",
        "inventory",
        "inventory_transactions",
        "complaints",
        "amenity_history",
        "control_history",
        "deep_cleaning",
        "manager_walk",
        "executiveReports"
    ];

    const COLLECTION_ALIASES = {
        complaints: ["issues"],
        staff_master: ["staff"],
        hk_schedule: ["housekeepingSchedule"],
        pool_logs: ["pool"],
        deep_cleaning: ["deepCleaning"],
        manager_walk: ["managerWalk"]
    };

    const firestoreState = {
        enabled: true,
        syncing: false,
        ready: false,
        lastSync: null,
        error: null,
        pending: new Map()
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
            // Continue to JSON fallback.
        }

        try {
            return JSON.parse(JSON.stringify(value));
        } catch (error) {
            return value;
        }
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
            } else if (Array.isArray(incomingValue)) {
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

    function normalizeCollections(data) {
        const normalized =
            data && typeof data === "object"
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

                        if (id) {
                            seenIds.add(id);
                        }
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
            return normalizeCollections(
                deepClone(defaultData)
            );
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

            return normalizeCollections(
                deepClone(defaultData)
            );
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
                FX.emit(
                    "data:saved",
                    deepClone(FX.data)
                );
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
        FX.data = normalizeCollections(
            deepClone(defaultData)
        );

        syncLegacyCollections();
        saveData();

        if (typeof FX.emit === "function") {
            FX.emit(
                "data:reset",
                deepClone(FX.data)
            );
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
            FX.emit(
                "data:imported",
                deepClone(FX.data)
            );
        }

        FIRESTORE_COLLECTIONS.forEach(function (collectionName) {
            const records = getCollection(collectionName);

            records.forEach(function (record) {
                queueFirestoreWrite(
                    collectionName,
                    record
                );
            });
        });

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

    function isFirestoreReady() {
        return Boolean(
            firestoreState.enabled &&
            Firebase &&
            typeof Firebase.getFirestore === "function" &&
            Firebase.getFirestore() &&
            Firebase.state &&
            Firebase.state.modules &&
            typeof Firebase.getCurrentUser === "function" &&
            Firebase.getCurrentUser()
        );
    }

    function getFirestoreParts() {
        if (!isFirestoreReady()) {
            return null;
        }

        return {
            db: Firebase.getFirestore(),
            modules: Firebase.state.modules,
            user: Firebase.getCurrentUser()
        };
    }

    function getFirestoreDocumentPath(collectionName, recordId) {
        const user = Firebase.getCurrentUser();

        if (!user || !user.uid) {
            return null;
        }

        return {
            root: "facilities",
            facilityId: user.uid,
            collection: collectionName,
            recordId: recordId
        };
    }

    function getFirestoreDocumentReference(
        collectionName,
        recordId
    ) {
        const parts = getFirestoreParts();

        if (!parts) {
            return null;
        }

        const path = getFirestoreDocumentPath(
            collectionName,
            recordId
        );

        if (!path) {
            return null;
        }

        return parts.modules.doc(
            parts.db,
            path.root,
            path.facilityId,
            path.collection,
            path.recordId
        );
    }

    function getFirestoreCollectionReference(collectionName) {
        const parts = getFirestoreParts();

        if (!parts) {
            return null;
        }

        const user = parts.user;

        return parts.modules.collection(
            parts.db,
            "facilities",
            user.uid,
            collectionName
        );
    }

    async function writeRecordToFirestore(
        collectionName,
        record
    ) {
        if (!record || !record.id) {
            return false;
        }

        const parts = getFirestoreParts();

        if (!parts) {
            return false;
        }

        const reference = getFirestoreDocumentReference(
            collectionName,
            record.id
        );

        if (!reference) {
            return false;
        }

        await parts.modules.setDoc(
            reference,
            deepClone(record),
            { merge: true }
        );

        return true;
    }

    async function deleteRecordFromFirestore(
        collectionName,
        recordId
    ) {
        const parts = getFirestoreParts();

        if (!parts || !recordId) {
            return false;
        }

        const reference = getFirestoreDocumentReference(
            collectionName,
            recordId
        );

        if (!reference) {
            return false;
        }

        await parts.modules.deleteDoc(reference);

        return true;
    }

    function queueFirestoreWrite(
        collectionName,
        record
    ) {
        if (
            !firestoreState.enabled ||
            !record ||
            !record.id
        ) {
            return;
        }

        const queueKey =
            collectionName + "/" + record.id;

        firestoreState.pending.set(
            queueKey,
            {
                type: "write",
                collection: collectionName,
                record: deepClone(record)
            }
        );

        processFirestoreQueue();
    }

    function queueFirestoreDelete(
        collectionName,
        recordId
    ) {
        if (
            !firestoreState.enabled ||
            !recordId
        ) {
            return;
        }

        const queueKey =
            collectionName + "/" + recordId;

        firestoreState.pending.set(
            queueKey,
            {
                type: "delete",
                collection: collectionName,
                recordId: recordId
            }
        );

        processFirestoreQueue();
    }

    async function processFirestoreQueue() {
        if (firestoreState.syncing) {
            return;
        }

        if (!isFirestoreReady()) {
            return;
        }

        firestoreState.syncing = true;

        try {
            const entries = Array.from(
                firestoreState.pending.entries()
            );

            for (let index = 0; index < entries.length; index += 1) {
                const queueKey = entries[index][0];
                const operation = entries[index][1];

                if (!firestoreState.pending.has(queueKey)) {
                    continue;
                }

                if (operation.type === "write") {
                    await writeRecordToFirestore(
                        operation.collection,
                        operation.record
                    );
                }

                if (operation.type === "delete") {
                    await deleteRecordFromFirestore(
                        operation.collection,
                        operation.recordId
                    );
                }

                firestoreState.pending.delete(queueKey);
            }

            firestoreState.lastSync =
                new Date().toISOString();

            firestoreState.error = null;
        } catch (error) {
            firestoreState.error = {
                name: error.name || "Error",
                message: error.message || String(error)
            };

            console.error(
                "Firestore synchronization failed:",
                error
            );
        } finally {
            firestoreState.syncing = false;
        }
    }

    async function pullCollectionFromFirestore(
        collectionName
    ) {
        const parts = getFirestoreParts();

        if (!parts) {
            return false;
        }

        const reference = getFirestoreCollectionReference(
            collectionName
        );

        if (!reference) {
            return false;
        }

        const snapshot =
            await parts.modules.getDocs(reference);

        const remoteRecords = [];

        snapshot.forEach(function (documentSnapshot) {
            const data = documentSnapshot.data();

            remoteRecords.push(
                createRecord(
                    Object.assign(
                        {},
                        data,
                        {
                            id: data.id || documentSnapshot.id
                        }
                    ),
                    collectionName
                )
            );
        });

        const localRecords = getCollection(collectionName);

        /*
           If Firestore contains records, it becomes the source
           of truth for this collection.
        */
        if (remoteRecords.length > 0) {
            FX.data[collectionName] = remoteRecords;

            FXData.collections[collectionName] =
                FX.data[collectionName];

            notifyChange(
                collectionName,
                remoteRecords
            );

            return true;
        }

        /*
           If Firestore is empty but local records exist,
           upload the local records.
        */
        if (localRecords.length > 0) {
            for (
                let index = 0;
                index < localRecords.length;
                index += 1
            ) {
                await writeRecordToFirestore(
                    collectionName,
                    localRecords[index]
                );
            }

            return true;
        }

        return true;
    }

    async function synchronizeWithFirestore() {
        if (!isFirestoreReady()) {
            return {
                ok: false,
                reason: "Firebase authentication is not ready."
            };
        }

        if (firestoreState.syncing) {
            return {
                ok: false,
                reason: "Synchronization is already running."
            };
        }

        firestoreState.syncing = true;

        try {
            for (
                let index = 0;
                index < FIRESTORE_COLLECTIONS.length;
                index += 1
            ) {
                await pullCollectionFromFirestore(
                    FIRESTORE_COLLECTIONS[index]
                );
            }

            firestoreState.ready = true;
            firestoreState.lastSync =
                new Date().toISOString();
            firestoreState.error = null;

            syncLegacyCollections();
            saveData();

            if (typeof FX.emit === "function") {
                FX.emit(
                    "data:firestore-ready",
                    getFirestoreStatus()
                );
            }

            return {
                ok: true,
                timestamp: firestoreState.lastSync
            };
        } catch (error) {
            firestoreState.error = {
                name: error.name || "Error",
                message: error.message || String(error)
            };

            console.error(
                "Firestore data synchronization failed:",
                error
            );

            if (typeof FX.emit === "function") {
                FX.emit(
                    "data:firestore-error",
                    firestoreState.error
                );
            }

            return {
                ok: false,
                error: firestoreState.error
            };
        } finally {
            firestoreState.syncing = false;
            processFirestoreQueue();
        }
    }

    function getFirestoreStatus() {
        return {
            enabled: firestoreState.enabled,
            ready: firestoreState.ready,
            syncing: firestoreState.syncing,
            pending: firestoreState.pending.size,
            lastSync: firestoreState.lastSync,
            error: deepClone(firestoreState.error)
        };
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

        if (FIRESTORE_COLLECTIONS.includes(name)) {
            FX.data[name].forEach(function (record) {
                queueFirestoreWrite(
                    name,
                    record
                );
            });
        }

        return FX.data[name];
    };

    FXData.add = function (name, record) {
        const collection = getCollection(name);
        const newRecord = createRecord(record, name);

        collection.unshift(newRecord);

        FXData.collections[name] = collection;

        notifyChange(
            name,
            newRecord
        );

        if (FIRESTORE_COLLECTIONS.includes(name)) {
            queueFirestoreWrite(
                name,
                newRecord
            );
        }

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

        if (FIRESTORE_COLLECTIONS.includes(name)) {
            queueFirestoreWrite(
                name,
                updatedRecord
            );
        }

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

        if (
            FIRESTORE_COLLECTIONS.includes(name) &&
            removedRecord &&
            removedRecord.id
        ) {
            queueFirestoreDelete(
                name,
                removedRecord.id
            );
        }

        return true;
    };

    /*
       Public Firestore controls
    */

    FXData.syncWithFirestore =
        synchronizeWithFirestore;

    FXData.getFirestoreStatus =
        getFirestoreStatus;

    FXData.isFirestoreReady =
        isFirestoreReady;

    FXData.enableFirestore = function () {
        firestoreState.enabled = true;
    };

    FXData.disableFirestore = function () {
        firestoreState.enabled = false;
    };

    /*
       Initialize local data immediately.
    */

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
        notifyChange: notifyChange,
        syncWithFirestore: synchronizeWithFirestore,
        getFirestoreStatus: getFirestoreStatus
    };

    window.appData = FX.data;
    window.saveAppData = saveData;
    window.loadAppData = loadData;
    window.resetAppData = resetData;

    /*
       Firebase authentication integration.

       Firebase.js initializes independently. This listener
       starts synchronization whenever a user signs in.
    */

    window.addEventListener(
        "fx:firebase:auth",
        function (event) {
            const user =
                event.detail &&
                event.detail.user
                    ? event.detail.user
                    : null;

            if (user) {
                synchronizeWithFirestore();
            } else {
                firestoreState.ready = false;
            }
        }
    );

    window.addEventListener(
        "fx:firebase:ready",
        function () {
            if (
                typeof Firebase.getCurrentUser === "function" &&
                Firebase.getCurrentUser()
            ) {
                synchronizeWithFirestore();
            }
        }
    );

    /*
       If Firebase is already initialized and the user is already
       authenticated before this file finishes loading.
    */

    if (
        typeof Firebase.getCurrentUser === "function" &&
        Firebase.getCurrentUser()
    ) {
        synchronizeWithFirestore();
    }

    if (typeof FX.emit === "function") {
        FX.emit(
            "data:ready",
            deepClone(FX.data)
        );
    }

})(window, document);