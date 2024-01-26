const baseUrl = window.location.origin;

const msgInvalid = document.querySelector(".msg-invalid");
const msgAvailable = document.querySelector(".msg-available");
const username = document.querySelector("#username");
const email = document.querySelector("#email");
const mobile = document.querySelector("#mobile");
const password = document.querySelector("#password");
const signup = document.querySelector(".signup");
const signIn = document.querySelector(".signIn");

//function to display custom alert message
const customAlert = document.getElementById("custom-alert");
const customMessage = document.getElementById("custom-message");
const customOkButton = document.getElementById("custom-ok-button");

/****************************************************/
// Listening for a click on the SignIn  button
/****************************************************/
signIn.addEventListener("click", async function (e) {
  e.preventDefault();

  window.location.href = "login-page";
});

var id = -2;
/****************************************************/
// Listening for a click on the SignUp  button
/****************************************************/
signup.addEventListener("click", async function (e) {
  e.preventDefault();

  const pusername = username.value;
  const pemail = email.value;
  const pmobile = mobile.value;
  const ppassword = password.value;

  //data validation
  if (pusername === "" || pemail === "" || pmobile === "" || ppassword === "") {
    msgInvalid.classList.add("error");
    msgInvalid.innerHTML = "Please enter values in all the fields!!!";
    // Remove error after 3 seconds
    setTimeout(() => {
      msgInvalid.classList.remove("error");
      msgInvalid.innerHTML = "";
    }, 4000);
    return;
  }

  const userDetails = await axios.get(`${baseUrl}/get-user`);
  console.log("userDetails==>", userDetails.data.allUsers);

  const allUsers = userDetails.data.allUsers;
  //checking whether email already in use
  allUsers.forEach((user) => {
    if (user.email === pemail) {
      msgAvailable.classList.add("error");
      msgAvailable.innerHTML = "Email Already Registered!!!";

      setTimeout(() => {
        msgAvailable.classList.remove("error");
        msgAvailable.innerHTML = "";
      }, 4000);
      return;
    }

    if (user.phoneNumber === pmobile) {
      msgAvailable.classList.add("error");
      msgAvailable.innerHTML = "Phone Number Already Registered!!!";
      // Remove error after 3 seconds
      setTimeout(() => {
        msgAvailable.classList.remove("error");
        msgAvailable.innerHTML = "";
      }, 4000);
      return;
    }
  });

  const newUserData = {
    username: pusername,
    email: pemail,
    mobile: pmobile,
    password: ppassword,
  };
  // console.log(newUserData);
  try {
    if (id === -2) {
      // storing new data
      console.log("inside if");
      const response = await axios.post(`${baseUrl}/signup`, newUserData);

      showAlert("Registered Successfully!!!");
      customOkButton.addEventListener("click", function () {
        customAlert.style.display = "none";
        window.location.href = "login-page";
      });
    }
  } catch (err) {
    console.error(err);
  }
});

function showAlert(message) {
  customMessage.textContent = message;
  customAlert.style.display = "block";
}
