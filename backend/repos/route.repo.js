const admin = require('../config/firebase');
const routesCol = admin.firestore().collection('routes');
const serverTs = () => admin.firestore.FieldValue.serverTimestamp();

const createRoute = async ({ name, stops, description = null, polyline = null }) => {
    if (!name || stops.length < 2) throw new Error('Route name and at least 2 stops are required');
    const payload = { name, stops, description, polyline, createdAt: serverTs() };
    const ref = await routesCol.add(payload);
    const snap = await ref.get();
    return { id: ref.id, ...snap.data() };
};

const getRouteById = async (id) => {
    const snap = await routesCol.doc(id).get();
    return snap.exists ? { id, ...snap.data() } : null;
};

const listRoutes = async () => {
    const snaps = await routesCol.orderBy('createdAt', 'desc').get();
    return snaps.docs.map(d => ({ id: d.id, ...d.data() }));
};

const updateRoute = async (id, data) => {
    await routesCol.doc(id).update({ ...data, updatedAt: serverTs() });
    return getRouteById(id);
};

const deleteRoute = async (id) => {
    await routesCol.doc(id).delete();
    return true;
};

module.exports = { createRoute, getRouteById, listRoutes, updateRoute, deleteRoute };