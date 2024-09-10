import { addDoc, collection, db, deleteDoc, deleteObject, doc, getDoc, getDocs, getDownloadURL, query, ref, storage, updateDoc, uploadBytes, uploadBytesResumable, where } from "./firebase.js";

// private routing
window.addEventListener("load", async () => { //Yeh code tab chalti hai jab window load hoti hai.
    if (!localStorage.getItem("user")) { //check local storage mein user nahi hai.login page pe daldo
        window.location.replace("../pages/login.html");
    } else {//Agar user key milti hai, to getTodos() function call hota hai todo items ko retrieve karne ke liye 
        getTodos();
    }
});

// CSS using javascript
const toggler = document.querySelector(".toggler-btn");
toggler.addEventListener("click", function () {
    document.querySelector("#sidebar").classList.toggle("collapsed");
})

// Logout function

// Login/Logout button ke liye
const login = document.getElementById("login");
//Jab window load hoti hai, check kiya jata hai agar user key local storage mein hai.
//key hai, to login button ke text ko "Logout" change kar diya jata hai 
//aur logout function (logoutBtn) ko button ke click event se link kiya jata hai.
window.addEventListener("load", () => {
    if (localStorage.getItem("user")) {
        login.querySelector('a').innerText = "Logout"; // Text ko 'Logout' mein badlo
        login.querySelector('a').addEventListener("click", logoutBtn); // Logout function ko add karo
    }
});


//logoutBtn function ko click event se call kiya jata hai.
const logoutBtn = (event) => {
    event.preventDefault(); // Default behavior ko prevent karo
    localStorage.removeItem("user"); // User ko localStorage se remove karo
    window.location.replace("/index.html"); // User ko index.html par redirect karo
};

// Collection setup     /collection(kaha create karo , kis name sy)
const todoCollection = collection(db, "todos");
const parent = document.querySelector(".parent");

// Add todo function
const addTodo = async (imageURL = '') => {
    try {
        //get input field from HTML
        const todoInput = document.getElementById("todoInput");
        const blogs = document.getElementById("blogs");
        const fileInput = document.getElementById("fileInput");

        const userUID = localStorage.getItem("user");//Local storage user ka ID (userUID) fetch kiya hai.

        //Agar userUID nahi milti (matlab user login nahi hai)
        if (!userUID) {
            await swal("Wrong", "Please login First", "error"); // swal with await
            return;
        }
        //Agar todoInput aur blogs dono ki length 3 characters se kam hai, 
        if (todoInput.value.trim().length < 3 && blogs.value.trim().length < 3) {
            await swal("Error", "blog title aur content dono 3 characters se zyada hone chahiye.", "error");
            return;
        }
 // object banaya jata hai 
        const todobj = {
            value: todoInput.value.trim(),
            blogs: blogs.value.trim(),
            userUID: userUID,
            img: imageURL
        };

        //addDoc function se todoCollection mein todobj ko add kiya jata hai.
        const response = await addDoc(todoCollection, todobj);

        var myModalEl = document.getElementById("createBlogModal");
        var modal = bootstrap.Modal.getInstance(myModalEl);
        modal.hide();

        //getTodos() function call kiya jata hai taake updated todos dikhaye jayein.Input fields ko clear kiya jata hai.
        getTodos();
        todoInput.value = "";
        blogs.value = "";
        if (fileInput) fileInput.value = "";

        await swal("Success", "Blog added successfully", "success");

    } catch (error) {
        console.log("Error", error.message);
        await swal("Error", "Something went wrong", "error");
    }
};

// Get todos function..Yeh function todos ko retrieve (fetch) karne ke liye hai.

const getTodos = async () => {
    try {
        const userUID = localStorage.getItem("user");

        if (!userUID) {
            await swal("Wrong", "Please login First", "error"); // swal with await
            return;
        }

        //query function se todoCollection mein filter apply kiya jata hai jo userUID ke saath match karti hai.
//getDocs function se query ke results ko fetch kiya jata hai.
        const q = query(todoCollection, where("userUID", "==", userUID));
        const detaLena = await getDocs(q);

        //todoArr array banaya jata hai jo fetched todos ko store karega.
        let todoArr = [];
        parent.innerHTML = "";

        detaLena.forEach((doc) => {//detaLena se fetched todos ko iterate kiya jata hai aur dataobj object banaya jata hai.
            const dataobj = {
                data: doc.id,
                value: doc.data().value,
                blogs: doc.data().blogs,
                img: doc.data().img || ''
            };

            //array mein dataobj ko push kiya jata hai.
            todoArr.push(dataobj);

            const imageURL = dataobj.img ? dataobj.img : 'path/to/default-image.jpg'; // Default image
            parent.innerHTML += `
            <div class="card col-xl-3 col-lg-4 col-md-6 col-sm-12 my-3" style="width: 18rem;">
                <img class="card-img-top" src="${imageURL}" width="330" height="300" alt="Image not found">
                <div class="card-body">
                    <h5 class="card-title">${dataobj.value}</h5>
                    <p class="card-text">${dataobj.blogs.slice(0, 50) + '...'}.</p>
                    <button class="btn btn-info" id="${dataobj.data}" onclick="openModal(true, this)">EDIT</button>
                    <button class="btn btn-danger" id="${dataobj.data}" onclick="deleteTodo(this)">Delete</button>
                </div>
            </div>`;
        });

    } catch (error) {
        console.log("Error", error.message);
    }
};




// delete function

const deleteTodo = async (ele) => {
    console.log("deleteTodo", ele.id);

    try {
        // Get the document reference
        const docRef = doc(db, "todos", ele.id);

        // Fetch the document data to get the image URL
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const docData = docSnap.data();
            const imageURL = docData.img;

            // Delete the document from Firestore
            await deleteDoc(docRef);

            // If there is an image URL, delete the image from Firebase Storage
            if (imageURL) {
                // Decode URL if needed
                const decodedURL = decodeURIComponent(imageURL);
                const fileName = decodedURL.split('/').pop().split('?')[0];
                const imagePath = `images/${fileName}`;

                console.log("Attempting to delete image at path:", imagePath);

                const imageRef = ref(storage, imagePath);

                try {
                    await deleteObject(imageRef);
                    console.log("Image deleted successfully");
                } catch (error) {
                    console.log("Error deleting image:", error.message);
                }
            }

            // Remove the card from the UI immediately
            document.getElementById(ele.id).closest('.card').remove();

            // Show an alert message
            await swal("Success", "Blog deleted successfully", "success");

        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.log("Error deleting document:", error.message);
    }
};




// Open modal for both create and edit modes
const openModal = (isEditMode = false, ele = null) => {
    var modal = new bootstrap.Modal(document.getElementById('createBlogModal'));
    const addBtn = document.getElementById("addBtn");

    // Remove previous event listeners to avoid duplicate triggers
    addBtn.replaceWith(addBtn.cloneNode(true));  // Clear previous event listeners
    const newAddBtn = document.getElementById("addBtn");

    if (isEditMode && ele) {
        document.getElementById("createBlogModalLabel").innerText = "Edit Blog";
        newAddBtn.innerText = "Update Blog";

        // Pre-fill the modal with existing blog data
        editTodoData(ele);

        // Set the onClick event for update mode
        newAddBtn.onclick = () => updateBlog(ele.id, true);
    } else {
        document.getElementById("createBlogModalLabel").innerText = "Create a New Blog";
        newAddBtn.innerText = "Publish Blog";

        // Reset input fields
        document.getElementById("todoInput").value = "";
        document.getElementById("blogs").value = "";
        document.getElementById("fileInput").value = "";
        document.getElementById("existingImage").src = "";  // Clear existing image preview

        // Set the onClick event for create mode
        newAddBtn.onclick = () => updateBlog(null, false);
    }

    modal.show();
};

// Pre-fill the modal with the existing data for editing
const editTodoData = async (ele) => {
    try {
        const docRef = doc(db, "todos", ele.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const existingData = docSnap.data();
            document.getElementById("todoInput").value = existingData.value;
            document.getElementById("blogs").value = existingData.blogs;

            // Set existing image preview if available
            if (existingData.imageUrl) {
                document.getElementById("existingImage").src = existingData.imageUrl;
            }
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.log("error", error.message);
    }
};

// Update or create a blog
const updateBlog = async (id, isEditMode) => {
    const updatedValue = document.getElementById("todoInput").value;
    const updatedBlogs = document.getElementById("blogs").value;
    const fileInput = document.getElementById("fileInput").files[0];

    // Check if fields are not empty
    if (updatedValue !== "" && updatedBlogs !== "") {
        try {
            let imageUrl = null;

            // Check if a new image is uploaded
            if (fileInput) {
                const storageRef = ref(storage, `images/${fileInput.name}`);
                const snapshot = await uploadBytes(storageRef, fileInput);
                imageUrl = await getDownloadURL(snapshot.ref);
            }

            if (isEditMode && id) {
                // Update existing blog with new values and image (if uploaded)
                const docRef = doc(db, "todos", id);
                const updateData = {
                    value: updatedValue,
                    blogs: updatedBlogs
                };

                // Only update image if a new one is uploaded
                if (imageUrl) {
                    updateData.imageUrl = imageUrl;
                }

                await updateDoc(docRef, updateData);
                alert("Blog Updated Successfully");
            } else {
                // Create new blog logic
                const docRef = await addDoc(collection(db, "todos"), {
                    value: updatedValue,
                    blogs: updatedBlogs,
                    imageUrl: imageUrl || "" // Add image if uploaded
                });
                alert("New Blog Created Successfully");
            }

            // Refresh the UI after updating/creating
            getTodos();

            // Close the modal
            var myModalEl = document.getElementById("createBlogModal");
            var modal = bootstrap.Modal.getInstance(myModalEl);
            modal.hide();
        } catch (error) {
            console.log("error", error.message);
        }
    } else {
        alert("Fields cannot be empty");
    }
};


const imageupload = (element) => {
    console.log("Image upload shuru hua", element.files[0]);
    const file = element.files[0];

    const metadata = {
        contentType: file.type, // Use the correct contentType based on the file type
    };

    const storageRef = ref(storage, "images/" + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
        "state_changed",
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload " + progress + "% done");
        },
        (error) => {
            console.log("Error", error);
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                console.log("File available at", downloadURL);
                // Call addTodo directly with the final imageURL
                //addTodo(downloadURL);
                document.getElementById("addBtn").onclick = () => addTodo(downloadURL);

            });
        }
    );
};


window.imageupload = imageupload;

window.addEventListener("load", getTodos);
window.addTodo = addTodo;
window.deleteTodo = deleteTodo;
window.openModal = openModal;
