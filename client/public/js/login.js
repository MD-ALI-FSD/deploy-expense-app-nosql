const baseUrl = window.location.origin;

const login_email = document.querySelector("#login-email");
const login_password = document.querySelector("#login-password");
const signin = document.querySelector(".signin");
const forgotBtn = document.querySelector(".forgot");

//function to display custom alert message
const customAlert = document.getElementById("custom-alert");
const customMessage = document.getElementById("custom-message");
const customOkButton = document.getElementById("custom-ok-button");

/****************************************************/
// Listening to the Click on Forgot Password button
/****************************************************/
forgotBtn.addEventListener("click", function (e) {
  e.preventDefault();
  window.location.href = "forgot-password-page";
});

/****************************************************/
// Listening to the Click on SignIn button
/****************************************************/
signin.addEventListener("click", function (e) {
  e.preventDefault();

  const email = login_email.value;
  const password = login_password.value;

  //data validation
  if (email === "" || password === "") {
    const msg = document.querySelector(".msg");
    msg.classList.add("error");
    msg.innerHTML = "Please enter values in all the fields!!!";
    // Remove error after 3 seconds
    setTimeout(() => {
      msg.classList.remove("error");
      msg.innerHTML = "";
    }, 4000);
  }

  const loginObj = {
    email: email,
    password: password,
  };

  axios
    .post(`${baseUrl}/user/login`, loginObj)
    .then((res) => {
      console.log("message==>", res.data.message);
      console.log("token==>", res.data.token);

      showAlert(res.data.message);
      //setting token in local storage every time user logs in
      localStorage.setItem("token", res.data.token);

      customOkButton.addEventListener("click", function () {
        customAlert.style.display = "none";
        window.location.href = "expense-page";
      });
    })
    .catch((err) => {
      showAlert(err.response.data.message);
      customOkButton.addEventListener("click", function () {
        customAlert.style.display = "none";
      });
    });
});

function showAlert(message) {
  customMessage.textContent = message;
  customAlert.style.display = "block";
}
