const { get } = require("..");
const admin = require("../config/firebase");

const signup =async(req,res)=>{
    try{
        const{username,phonenumber,email,password} = req.body;
        if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
     //  Check Firestore for existing user with the same email
    const existinguser=await admin.firestore().collection("users").where("email","==",email).get();
    if(!existinguser.empty){
        return res.status(400).json({message:"User with this email already exists"});
    }
        const userrecord = await admin.auth().createUser({
        email:email,
        password:password,
        displayName:username,
        
        

    });
    await admin.firestore().collection("users").doc(userrecord.uid).set({
        uid: userrecord.uid,
        username:username,
        phonenumber:phonenumber,
         role: "passenger",
         
        email:email,
        createdAt:new Date()
    });
    res.status(201).json({message:"User created successfully",uid:userrecord.uid});
    
    

}
    catch(error){
        res.status(500).json({message:"Internal Server Error"});
    }   
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
      message: "Login successful",
      user: userDoc.data(),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports={signup,getProfile};