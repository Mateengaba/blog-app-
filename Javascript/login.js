window.addEventListener("load", () => {
    if (localStorage.getItem("user")) {
        window.location.replace("/index.html");
    }
});



import { auth, signInWithEmailAndPassword } from "./firebase.js";




const loginHandler = async ()=>{

 try {
    
    const email = document.querySelector("#email") 
    const password = document.querySelector("#password")
       //console.log("email", email.value, password.value);
   
   
   //signInWithEmailAndPassword ek function hai jo email aur password ko use karke existing user ko sign in karta hai. 
       const response = await signInWithEmailAndPassword(
           auth,
           email.value,
           password.value
         );
          // User UID ko localStorage mein save karna
        localStorage.setItem("user", response.user.uid);
        await swal("Good Job", "login successfuly", "success");
        //alert("you are successfully login")
         window.location.replace("/index.html");

 } catch (error) {
    console.log("error", error.message);
    swal("wrong",error.message ,"error");

    
 }

}


window.loginHandler = loginHandler




