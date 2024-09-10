
import { db, doc, getDoc, updateDoc, ref, uploadBytes, getDownloadURL, storage } from "./firebase.js";


// CSS using javascript
const toggler = document.querySelector(".toggler-btn");
toggler.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("collapsed");
})

// Logout function


// Login/Logout button ke liye
const login = document.getElementById("login");

window.addEventListener("load", () => {
  if (localStorage.getItem("user")) {
      login.querySelector('a').innerText = "Logout"; // Text ko 'Logout' mein badlo
      login.querySelector('a').addEventListener("click", logoutBtn); // Logout function ko add karo
  }
});

const logoutBtn = (event) => {
  event.preventDefault(); // Default behavior ko prevent karo
  localStorage.removeItem("user"); // User ko localStorage se remove karo
  window.location.replace("/index.html"); // User ko index.html par redirect karo
};





//Jab window load ho ga completely tab yeh function run hoga.
//localStorage mein user key exist karti hai ya nahi. 
//Agar nahi karti, to user ko login page par redirect kar diya jata hai.
window.addEventListener("load", async () => {
    if (!localStorage.getItem("user")) {
        await swal("wrong","Please login First" ,"error");

        window.location.replace("../pages/login.html");
        return;
    }

    console.log(localStorage.getItem("user"));


// CSS using javascript


    // get user Data on firestore
    const userID = localStorage.getItem("user"); //localStorage se user ID ko variable userID mein store karte hain.
    const response = await getDoc(doc(db, 'users', userID)) //getDoc function se Firestore se user data ko fetch karte hain jise response variable mein store karte hain.
    console.log("response", response.data());

    // get input field
    const fullName = document.querySelector("#fullName");
    const email = document.querySelector("#email");
    const gender = document.querySelector("#gender");
    const img = document.querySelector("#img")

    //response se jo data mila, usse HTML elements mein set karte hain.
    fullName.innerText = response.data().fullName;
    email.innerText = response.data().email;
    gender.innerText = response.data().gender;


    //Yeh check karta hai ke profilePic key user data mein exist karti hai ya nahi.
    if (response.data().profilePic) {
        const imgElement = document.createElement("img");
        imgElement.src = response.data().profilePic; //Agar exist karti hai to uska src profilePic URL se set karte hain.
        imgElement.alt = "Profile Picture";
        imgElement.classList.add("profile-pic");//Is img element ko profile-pic class add karte hain aur phir img div ke andar append kar dete hain.
        img.appendChild(imgElement);
    }
});



// get edit & cancel button 
const editbtn = document.querySelector("#editbtn");
const cancelbtn = document.querySelector("#cancelbtn");

let originalData = {};

// edit profile function
editbtn.addEventListener("click", () => {
    const fullNameElem = document.querySelector("#fullName");
    const emailElem = document.querySelector("#email");
    const genderElem = document.querySelector("#gender");
    const imgElem = document.querySelector("#img");

    if (editbtn.innerText === "Edit") { //Agar button ka text "Edit" hai, to:

        originalData = { //Original data ko originalData object mein store kar lete hain.
            fullName: fullNameElem.innerText,
            email: emailElem.innerText,
            gender: genderElem.innerText
        };

        //Profile fields ko input fields mein convert kar dete hain taake user edit kar sake.
        fullNameElem.innerHTML = `<input type="text" id="fullNameInput" value="${fullNameElem.innerText}">`;
        emailElem.innerHTML = `<input type="email" id="emailInput" value="${emailElem.innerText}">`;
        genderElem.innerHTML = `<input type="text" id="genderInput" value="${genderElem.innerText}">`;

        //Ek file input element add karte hain agar woh pehle se exist nahi karta.
        if (!document.querySelector("#fileInput")) {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.id = "fileInput";
            fileInput.accept = "image/*";
            imgElem.appendChild(fileInput);
        }

        //Edit button ka text "Update" mein change kar dete hain aur cancel button ko show kar dete hain
        editbtn.innerText = "Update";
        cancelbtn.style.display = "inline-block";
    } else {
        updateProfile();//Agar button ka text "Update" hai, to updateProfile() function ko call karte
    }
});


//cancelbtn par click hone par ye function execute hoga.
cancelbtn.addEventListener("click", () => {
    //Profile fields ko original data se update kar dete hain.
    const fullNameElem = document.querySelector("#fullName");
    const emailElem = document.querySelector("#email");
    const genderElem = document.querySelector("#gender");
    const imgElem = document.querySelector("#img");

    fullNameElem.innerHTML = originalData.fullName;
    emailElem.innerHTML = originalData.email;
    genderElem.innerHTML = originalData.gender;

    //Agar file input element exist karta hai, to usse remove kar dete hain.
    const fileInput = document.querySelector("#fileInput");
    if (fileInput) {
        imgElem.removeChild(fileInput);
    }

    //Edit button ka text "Edit" mein change kar dete hain aur cancel button ko hide kar dete hain
    editbtn.innerText = "Edit";
    cancelbtn.style.display = "none";
});

const updateProfile = async () => {
    const fullNameInput = document.querySelector("#fullNameInput");
    const emailInput = document.querySelector("#emailInput");
    const genderInput = document.querySelector("#genderInput");
    const fileInput = document.querySelector("#fileInput");

    const userID = localStorage.getItem("user"); // get user id from localstorage
    //userRef ko Firestore document reference ke liye define kar rahe hain, jisme user ke data ko update karenge.
    const userRef = doc(db, 'users', userID);

    //profilePicURL ko null initialize kar rahe hain. Agar profile picture upload hoti hai, to isme URL store hoga.
    let profilePicURL = null;


    if (fileInput && fileInput.files.length > 0) {//Agar fileInput hai aur file select hui hai:
        const file = fileInput.files[0];
        const storageRef = ref(storage, 'images/' + file.name);//Firebase Storage ke liye storageRef define karte hain, jahan image store hogi.


        try {
            const snapshot = await uploadBytes(storageRef, file);////File ko uploadBytes function ke zariye upload karte hain aur download URL ko get karte hain
            profilePicURL = await getDownloadURL(snapshot.ref);
        } catch (error) {
            //Agar upload ke dauran koi error aati hai, to error log aur alert show karte hain, aur function ko terminate kar dete hain.
            console.error('Error uploading image:', error);
            alert('Failed to upload image: ' + error.message);
            return;
        }
    }


    try {
        //updateData object ko create karte hain jisme updated values (fullName, email, gender) store karte hain.
        const updateData = {
            fullName: fullNameInput.value,
            email: emailInput.value,
            gender: genderInput.value
        };
        //Agar profilePicURL available hai, to usse bhi updateData mein add karte hain.

        if (profilePicURL) {
            updateData.profilePic = profilePicURL;
        }
        //updateDoc function ke zariye Firestore document ko update karte hain.
        await updateDoc(userRef, updateData);


        //HTML elements ko select karte hain jahan updated data show karna hai.
        const fullNameElem = document.querySelector("#fullName");
        const emailElem = document.querySelector("#email");
        const genderElem = document.querySelector("#gender");
        const imgElem = document.querySelector("#img");

        fullNameElem.innerHTML = fullNameInput.value;
        emailElem.innerHTML = emailInput.value;
        genderElem.innerHTML = genderInput.value;


        //Agar profilePicURL available hai:
        //imgElem mein check karte hain agar pehle se profile picture hai. Agar hai, to uska src update karte hain.
        //Agar nahi hai, to naya img element create karte hain aur usme profile picture URL set karte hain.
        if (profilePicURL) {
            const existingImg = imgElem.querySelector(".profile-pic");
            if (existingImg) {
                existingImg.src = profilePicURL;
            } else {
                const imgElement = document.createElement("img");
                imgElement.src = profilePicURL;
                imgElement.alt = "Profile Picture";
                imgElement.classList.add("profile-pic");
                imgElem.appendChild(imgElement);
            }
        }

        if (fileInput) {
            imgElem.removeChild(fileInput);
        }

        editbtn.innerText = "Edit";
        cancelbtn.style.display = "none";
         swal("Good Job", "Profile updated successfully!", "success");

    } catch (error) {
        console.error("Error updating profile: ", error);
        alert("Failed to update profile: " + error.message);
    }
};