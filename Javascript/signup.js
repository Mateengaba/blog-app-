window.addEventListener("load", () => {
    if (localStorage.getItem("user")) {
        window.location.replace("/index.html");
    }
});

import { auth, createUserWithEmailAndPassword, db, doc, getDownloadURL, ref, setDoc, uploadBytes, getStorage } from "./firebase.js";

// Initialize Firebase Storage
const storage = getStorage();

const signUpHandler = async (downloadURL) => {
    try {
        // Get input fields
        const fullName = document.querySelector("#fullName").value;
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;
        const gender = document.querySelector("#gender").value;

        if (!fullName || !gender || !email || !password) {
            // alert("required field are missing")
            swal("Same thing is messing", "You clicked the button!", "error");

            return
            
        }
        

        const userObj = {
            fullName,
            email,
            gender,
            profilePic: downloadURL // Add the download URL to the user object
        };

        console.log("userObj", userObj);




        
        const response = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const uid = response.user.uid;

        
//setDoc function Firebase Firestore mein ek document create ya update karne ke liye use hota hai. 
        //Iska kaam specific collection aur document ID mein provided data ko set karna hai.
        //  doc function ek document reference create karta hai
        // kaha save-db, "name", uid, obj.

        // Set user document in Firestore
        await setDoc(doc(db, "users", uid), userObj);

         // UID ko localStorage mein save karna
         localStorage.setItem("userUID", uid);
        await swal("Good Job", "User successfully signed up", "success");

        window.location.href = "./login.html";
    } catch (error) {
       // console.log("error", error.message);
       swal("wrong",error.message ,"error");

    }
};

const uploadImage = async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0]; // Get the selected file

    if (file) {
        // Create a storage reference
        const storageRef = ref(storage, 'images/' + file.name);

        try {
            // Upload the file
            const snapshot = await uploadBytes(storageRef, file);

            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('File available at', downloadURL);

            return downloadURL; // Return the download URL
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image: ' + error.message);
        }
    } else {
        swal("wrong",'No image file selected' ,"error");
    }
}; 
// Combined function to handle both image upload and user signup
const combinedSignUpHandler = async () => {
    const downloadURL = await uploadImage();
    if (downloadURL) {
        await signUpHandler(downloadURL);
    }
};

// Attach the function to window object for global access
window.combinedSignUpHandler = combinedSignUpHandler;






