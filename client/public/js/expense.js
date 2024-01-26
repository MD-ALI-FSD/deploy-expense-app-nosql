const baseUrl = window.location.origin;

const eamount = document.querySelector("#eamount");
const ediscrp = document.querySelector("#ediscrp");
const ecategory = document.querySelector("#ecategory");
const submit = document.querySelector(".submit");
const rzpbtn = document.querySelector(".rzpbtn");
const afterpremium = document.querySelector(".after-premium");
const totalExpenseDiv = document.querySelector(".total-expense");
const doe = document.querySelector(".doe");
const downloadBtn = document.querySelector(".download");
const leadBoardParent = document.querySelector(".lead-board-parent");

//function to display custom alert message
const customAlert = document.getElementById("custom-alert");
const customMessage = document.getElementById("custom-message");
const customOkButton = document.getElementById("custom-ok-button");

async function showAlert(message) {
  customMessage.textContent = message;
  customAlert.style.display = "block";
}

//helper function to check login status
async function checkLoginStatus() {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem("token");
    if (token === null) {
      showAlert(`Your Session Expired! Please Login Again!!`);
      customOkButton.addEventListener("click", function () {
        customAlert.style.display = "none";
        resolve(false); // Resolve the promise with false when the OK button is clicked
      });
    } else {
      resolve(true); // Resolve the promise with true when there's a token
    }
  });
}

//helper function to fetch data
async function fetchData() {
  const token = localStorage.getItem("token");
  if (token === null) {
    showAlert(`Your Session Expired! Please Login Again!!`);
    customOkButton.addEventListener("click", function () {
      customAlert.style.display = "none";
      window.location.href = "login-page";
    });
  }

  const config = {
    headers: { Authorization: token },
  };
  const datarv = await axios.get(`${baseUrl}/getexpense`, config);
  //  console.log(datarv);
  const { expensesDetails: allDatas } = datarv.data;
  //  console.log(allDatas)
  return allDatas;
}

/****************************************************/
// Displaying All Expenses of Current user
/****************************************************/
let currentPage = 1;
let itemsPerPage = 4;

//event listener to change number of expenses per page
const noOfExpensesElm = document.querySelector("#no-of-expenses");
noOfExpensesElm.addEventListener("change", async function () {
  const loginStatus = await checkLoginStatus();
  if (loginStatus === false) {
    window.location.href = "login-page";
    return;
  }

  selectedValue = noOfExpensesElm.value;

  showAlert(`Displaying ${selectedValue} Expenses per Page`);
  customOkButton.addEventListener("click", function () {
    customAlert.style.display = "none";
  });
  // Update the itemsPerPage and then regenerate pagination buttons and display data
  noOfExpensesPerPage(selectedValue);
});

//main function to display number of expenses per page
function noOfExpensesPerPage(value) {
  itemsPerPage = parseInt(value, 10); // Parse the value as an integer
  currentPage = 1; // Reset to the first page when changing the number of items per page
  generatePaginationButtons();
  displayDatas();
}
noOfExpensesPerPage(itemsPerPage);

// Function to calculate the total number of pages
async function calculateTotalPages() {
  const allData = await fetchData();
  return Math.ceil(allData.length / itemsPerPage);
}

// Function to generate pagination buttons
async function generatePaginationButtons() {
  const loginStatus = await checkLoginStatus();
  if (loginStatus === false) {
    window.location.href = "login-page";
    return;
  }

  const totalPages = await calculateTotalPages();
  //selecting buttons container
  const paginationButtons = document.querySelector(".pagebuttons");
  paginationButtons.innerHTML = "";
  //creating buttons
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.className = "pgbutton";
    button.addEventListener("click", () => {
      currentPage = i;
      // Remove the "selected" class from any previously selected button
      const previouslySelectedButton = document.querySelector(".selected");
      if (previouslySelectedButton) {
        previouslySelectedButton.classList.remove("selected");
      }
      // Add the "selected" class to the clicked button
      button.classList.add("selected");
      displayDatas();
      updateVisibleButtons(i - 1, totalPages);
    });
    paginationButtons.appendChild(button);
  }

  // Initialize buttons visibility
  updateVisibleButtons(currentPage - 1, totalPages);
}

// Function to display data for the current page
async function displayDatas() {
  const allData = await fetchData();
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = allData.slice(startIndex, endIndex);

  const dataContainer = document.querySelector(".display");
  dataContainer.innerHTML = "";
  //creating element  to displayexpense expense
  pageData.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("child");
    div.innerHTML = `
          <div>Amount: Rs.${item.amount}</div>
          <div>Description: ${item.description}</div> 
          <div>Category: ${item.category}</div>
          <button class="editbtn" id="${item._id}">Edit</button>
          <button class="deletebtn" id="${item._id}">Delete</button>
        `;
    dataContainer.appendChild(div);
  });
}

// Function to update visibility of pagination buttons
async function updateVisibleButtons(current, total) {
  const loginStatus = await checkLoginStatus();
  if (loginStatus === false) {
    window.location.href = "login-page";
    return;
  }

  const buttons = document.querySelectorAll(".pgbutton");
  buttons.forEach((button, index) => {
    if (index < current - 1 || index > current + 1) {
      button.style.display = "none";
    } else {
      button.style.display = "block";
    }
  });
}

/********************************************************/
// Function to display top 3 expenses and check premium
/********************************************************/
async function displayData() {
  const token = localStorage.getItem("token");
  //setting header
  const config = {
    headers: { Authorization: token },
  };

  const datarv = await axios.get(`${baseUrl}/getexpense`, config);
  const {
    expensesDetails: allData,
    totalExpense,
    topUsers,
    user,
  } = datarv.data;
  console.log("data==>", totalExpense);
  // const userDetails = await axios.get("getuser", config);
  // const { users } = userDetails.data;

  const userName = document.querySelector(".name");
  userName.innerHTML = `Welcome ${user.name}`;

  // Check if the Premium ad alert has been displayed before
  const flag = localStorage.getItem("premiumAlertDisplayed");
  if (JSON.parse(flag) === false) {
    if (user.isPremiumUser == false) {
      showAlert(
        `Become a Premium member and enjoy a number of extra Services!!!`
      );
      customOkButton.addEventListener("click", function () {
        customAlert.style.display = "none";
        // Set a flag in localStorage to indicate that the alert has been displayed
        localStorage.setItem("premiumAlertDisplayed", "true");
      });
    }
  }

  // const datarv = await axios.get("getexpense", config);

  // if (totalExpense.totalexpenses === 0) return;
  //total expense of current user
  console.log("total==>", totalExpense);
  totalExpenseDiv.innerHTML = `Total Expenses: Rs.${totalExpense}`;

  //If user is premium
  if (user.isPremiumUser === true) {
    rzpbtn.classList.add("hidden");
    afterpremium.classList.remove("hidden");
    doe.classList.remove("hidden");
    downloadBtn.classList.remove("hidden");
    leadBoardParent.classList.remove("hidden");

    let htm = "";
    for (let i = topUsers.length - 1; i >= 0; i--) {
      htm = `<div class="child">
                <div>Name: ${topUsers[i].name}</div>
                <div>TotalExpenses: Rs.${topUsers[i].totalExpenses}</div> 
            </div>`;

      const leadBoard = document.querySelector(".lead-board");
      leadBoard.insertAdjacentHTML("afterbegin", htm);
    }
  }
  //Rendering top 3 users
}
displayData();

var id = -2;
/****************************************************/
// Listen for a click on the "Add Expense" button
/****************************************************/
submit.addEventListener("click", async function (e) {
  e.preventDefault();

  const loginStatus = await checkLoginStatus();
  if (loginStatus === false) {
    window.location.href = "login-page";
    return;
  }

  const amount = eamount.value;
  const description = ediscrp.value;
  const category = ecategory.value;

  //data validation
  if (amount === "" || description === "" || category === "") {
    const msg = document.querySelector(".msg");
    msg.classList.add("error");
    msg.innerHTML = "Please enter values in all the fields!!!";
    // Remove error message after 3 seconds
    setTimeout(() => {
      msg.classList.remove("error");
      msg.innerHTML = "";
    }, 4000);
  }

  const newUserData = {
    amount: amount,
    description: description,
    category: category,
  };
  console.log(newUserData);

  //Fetching token from local storage
  const token = localStorage.getItem("token");
  //setting header
  const config = {
    headers: { Authorization: token },
  };

  if (id === -2) {
    // storing new data
    axios
      .post(`${baseUrl}/addexpense`, newUserData, config)
      .then((res) => {
        showAlert("Expense Added!!!");
        customOkButton.addEventListener("click", function () {
          customAlert.style.display = "none";
          location.reload();
        });
      })
      .catch((err) => {
        console.error(err);
      });
  } else if (id !== -2) {
    // Editing existing data
    axios
      .put(`${baseUrl}/editexpense/${id}`, newUserData)
      .then((res) => {
        console.log(res.data);
        id = -2;

        eamount.value = "";
        ediscrp.value = "";
        ecategory.value = "";

        showAlert(`Expense Edited Successfully!!!`);
        customOkButton.addEventListener("click", function () {
          customAlert.style.display = "none";
          location.reload();
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }
});

/******************************************************************/
// Listen for a click on the "signout" button
/******************************************************************/
const signOutBtn = document.querySelector(".signoutbtn");
signOutBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  const loginStatus = await checkLoginStatus();
  if (loginStatus === false) {
    window.location.href = "login-page";
    return;
  }

  // Delete the key and its value from local storage
  localStorage.removeItem("token");
  localStorage.setItem("premiumAlertDisplayed", "false");

  showAlert("You have logged out successfully!");
  customOkButton.addEventListener("click", function () {
    customAlert.style.display = "none";
    window.location.href = "login-page";
  });
});

/******************************************************************/
// Listen for a click on the "delete account" button
/******************************************************************/
const deleteUserBtn = document.querySelector(".deleteuserbtn");
deleteUserBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  const loginStatus = await checkLoginStatus();
  if (loginStatus === false) {
    window.location.href = "login-page";
    return;
  }

  // Display a confirmation dialog
  const confirmed = window.confirm(
    "Are you sure you want to delete your account? This action cannot be undone."
  );

  // Check the result of the confirmation dialog
  if (confirmed) {
    const token = localStorage.getItem("token");
    //setting header
    const config = {
      headers: { Authorization: token },
    };

    const res = await axios.delete(`${baseUrl}/delete-user`, config);
    showAlert(res.data.message);
    customOkButton.addEventListener("click", function () {
      customAlert.style.display = "none";
      window.location.href = "/";
    });
  } else {
    console.log("user canceled");
  }
});

/******************************************************************/
// Listen for a click on the "Details of Expenses" button
/******************************************************************/
doe.addEventListener("click", async function (e) {
  e.preventDefault();
  const loginStatus = await checkLoginStatus();
  if (loginStatus === false) {
    window.location.href = "login-page";
    return;
  }

  window.location.href = "detailed-expense-page";
});

/******************************************************************/
// Listen for a click on the "Download Expenses" button
/******************************************************************/
downloadBtn.addEventListener("click", async function (e) {
  try {
    e.preventDefault();

    const loginStatus = await checkLoginStatus();
    if (loginStatus === false) {
      window.location.href = "login-page";
      return;
    }

    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: token },
    };

    const response = await axios.get(`${baseUrl}/download/expenses`, config);
    console.log("downlod resp==>", response);
    // to download file
    let a = document.createElement("a");
    a.href = response.data.fileURL;
    a.download = "myexpense.csv";
    a.click();

    showAlert(response.data.message);
    customOkButton.addEventListener("click", function () {
      customAlert.style.display = "none";
    });
  } catch (err) {
    console.log(err.response.data);
  }
});

/******************************************************************/
// Listen for a click on the "Delete or Edit Expense" button
/******************************************************************/
const parent = document.querySelector(".display");

parent.addEventListener("click", async function editDelete(e) {
  e.preventDefault();
  const loginStatus = await checkLoginStatus();
  if (loginStatus === false) {
    window.location.href = "login-page";
    return;
  }

  //Fetching token from local storage
  const token = localStorage.getItem("token");
  //setting header
  const config = {
    headers: { Authorization: token },
  };

  if (e.target.className === "deletebtn") {
    console.log(e.target.id);
    axios
      .delete(`${baseUrl}/deleteexpense/${e.target.id}`, config)
      .then((res) => {
        showAlert(`Expense Deleted`);
        customOkButton.addEventListener("click", function () {
          customAlert.style.display = "none";
          location.reload();
        });
      })
      .catch((err) => {
        console.error(err);
      });
  } else if (e.target.className === "editbtn") {
    //Fetching token from local storage
    console.log("inside edit frontend");
    const token = localStorage.getItem("token");
    //setting header
    const config = {
      headers: { Authorization: token },
    };

    //sending a GET request to the backend with token in the header to fetch particular users data only
    const datarv = await axios.get(`${baseUrl}/getexpense`, config);
    const { expensesDetails: allData } = datarv.data;

    if (allData === null) return;

    const idd = e.target.id;
    console.log(idd);

    allData.forEach((object) => {
      if (object._id == idd) {
        // Populate form fields with the selected data
        console.log("inside if object");
        eamount.value = object.amount;
        ediscrp.value = object.description;
        ecategory.value = object.category;

        // Set the current ID for editing
        id = idd;
        return;
      }
    });
  }
});

/******************************************************************/
// Listen for a click on the "Buy Premium" button
/******************************************************************/
rzpbtn.addEventListener("click", async function (e) {
  const loginStatus = await checkLoginStatus();
  if (loginStatus === false) {
    window.location.href = "login-page";
    return;
  }

  const token = localStorage.getItem("token");
  //setting header
  const config = {
    headers: { Authorization: token },
  };
  //sending a GET request to backend to create an order
  const datarv = await axios.get(`${baseUrl}/purchasepremium`, config);

  const allData = datarv.data;
  console.log("premium data==>", allData);

  let options = {
    key: allData.key_id, //enter the key ID generated from the dashboard
    order_id: allData.order.orderId, //for one time payment
    handler: async function (resp) {
      console.log("inside handler");
      console.log("premium resp==>", resp);
      await axios.post(
        `${baseUrl}/updatetransactionstatus`,
        {
          order_id: allData.order.orderId,
          payment_id: resp.razorpay_payment_id,
        },
        config
      );

      showAlert(`You are a premium user Now!!`);
      customOkButton.addEventListener("click", function () {
        customAlert.style.display = "none";
        location.reload();
      });
    },
  };

  // creates a new instance of Razorpay
  const rzpl = new Razorpay(options);
  console.log("before handler");
  // opens the Razorpay payment dialog on the user's screen
  rzpl.open();
  e.preventDefault();

  // event listener for the "payment.failed" event on the Razorpay instance.When a payment fails, Razorpay triggers this event.
  rzpl.on("payment.failed", function (allData) {
    console.log(allData);
    alert("something went wrong!");
  });
});
