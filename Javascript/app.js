import { collection, db, getDocs } from "./firebase.js"; // where hata diya hai

// Sidebar toggle button
const toggler = document.querySelector(".toggler-btn");
toggler.addEventListener("click", function () {
  document.querySelector("#sidebar").classList.toggle("collapsed");
});

// Logout button
const login = document.getElementById("login");

window.addEventListener("load", () => {
  if (localStorage.getItem("user")) {
    login.querySelector('a').innerText = "Logout"; 
    login.querySelector('a').addEventListener("click", logoutBtn);
  }
});

const logoutBtn = (event) => {
  event.preventDefault();
  localStorage.removeItem("user");
  window.location.replace("/index.html");
};

// Firebase collection reference
const parent = document.querySelector(".parent");
const todoCollection = collection(db, "todos");
console.log("parent", parent);

const getTodos = async () => {
  try {
    console.log("getTodos called"); // Debugging line

    const detaLena = await getDocs(todoCollection); // Sabhi todos ko fetch karo

    parent.innerHTML = ""; // Purana content clear karo

    detaLena.forEach((doc) => {
      const dataobj = {
        id: doc.id,
        value: doc.data().value,
        blogs: doc.data().blogs,
        img: doc.data().img || '' // Agar image nahi hai to empty string
      };

      // Log data ko check karne ke liye
      console.log("Data Object:", dataobj);

      // Image URL handle karo
      const imageURL = dataobj.img ? dataobj.img : 'path/to/default-image.jpg';

      parent.innerHTML += `
        <div class="blog-card">
          <img src="${imageURL}" width="200" height="80" alt="Blog Image">
          <h2>${dataobj.value}</h2>
          <p>${dataobj.blogs}</p>
        </div>
      `;
    });

  } catch (error) {
    console.log("Error", error.message);
  }
};

// Page load par sabhi todos ko load karo
window.addEventListener("load", getTodos);
