const admin = require("../config/firebase");

const signup =async(req,res)=>{
    try{
        const{username,email,password,role,busNumber,
      busRoute} = req.body;
        if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role required" });
    }
     
    if (role === "driver") {
      if (!busNumber || !busRoute) {
        return res.status(400).json({ message: "Bus number and route required for drivers" });
      }
    }

     const allowedRoles = ["passenger", "driver", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
        const userrecord = await admin.auth().createUser({
        email:email,
        password:password,
        displayName:username,
        
        

    });
    await admin.firestore().collection("users").doc(userrecord.uid).set({
        uid: userrecord.uid,
        username:username,
         role: role,
         
        email:email,
         ...(role === "driver" && {
        busNumber,
        busRoute
      }),
        createdAt:new Date()
    });
    res.status(201).json({message:"User created successfully",uid:userrecord.uid});
    
}
    catch(error){
       
         console.error("SIGNUP ERROR ", error);

         if (error.code === "auth/email-already-exists") {
    return res.status(400).json({
      message: "Email already registered. Please log in."
    }); 
    }  
    res.status(500).json({message:"Server error"}); 
};
};

const getProfile =async(req,res)=>{
    try {
    const uid = req.user.uid;

    const userDoc = await admin.firestore()
      .collection("users")
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user: userDoc.data(),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports={signup,getProfile};