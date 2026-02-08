const admin = require("../config/firebase");

const searchbuses = async (req, res) => {
    try {
        const { startinglocation, destination, starttime,endtime } = req.query;
        let query = admin.firestore().collection("buses");

        if (startinglocation) {
            query = query.where("startinglocation", "==", startinglocation);

        }
        if (destination) {
            query = query.where("destination", "==", destination);
        }
       
        const snapshot = await query.get();

         let buses = snapshot.docs.map(doc => ({
        id: doc.id,
         ...doc.data(),
    }));
     if (starttime && endtime) {
      buses = buses.filter(bus =>
        bus.starttime >= starttime && bus.starttime <= endtime
      );
    }

        res.status(200).json({ buses });
    }       
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    searchbuses,
};
