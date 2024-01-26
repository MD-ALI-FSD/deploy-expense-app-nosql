const baseUrl = window.location.origin;

const backBtn = document.querySelector(".backbtn");

backBtn.addEventListener("click", function (e) {
  e.preventDefault();
  window.location.href = "expense-page";
});

document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const tableBodyDaily = document.getElementById("table-body-daily");
  const tableBodyWeekly = document.getElementById("table-body-weekly");
  const tableBodyMonthly = document.getElementById("table-body-monthly");
  const tableBodyUrl = document.getElementById("table-body-url");

  // Function to fetch and display expenses
  async function displayExpenses() {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: token },
    };

    // Fetch expense data from the server
    const response = await axios.get(`${baseUrl}/getexpense`, config);
    const { expensesDetails: data } = response.data;

    // Fetch list of urls from db
    const response2 = await axios.get(
      `${baseUrl}/download/expenseurls`,
      config
    );
    const { urls } = response2.data;
    console.log(urls);

    // Display daily expenses
    displayDailyExpenses(data);

    // Display weekly expenses
    displayWeeklyExpenses(data);

    // Display monthly expenses
    displayMonthlyExpenses(data);

    // Display Urls
    displayUrls(urls);
  }

  // Function to display daily expenses
  function displayDailyExpenses(data) {
    tableBodyDaily.innerHTML = "";

    data.forEach((expense) => {
      const date = formatDate(expense.createdAt);
      const row = createTableRow([
        date,
        expense.description,
        expense.category,
        `Rs. ${expense.amount}`,
      ]);
      tableBodyDaily.appendChild(row);
    });
  }

  // Function to display weekly expenses
  function displayWeeklyExpenses(data) {
    tableBodyWeekly.innerHTML = "";

    // Calculate total expenses for each day of the week
    const totalExpensesByDay = calculateWeeklyExpenses(data);

    // Print the total expenses for each day of the week
    for (const day in totalExpensesByDay) {
      const rowWeekly = createTableRow([day, `Rs. ${totalExpensesByDay[day]}`]);
      tableBodyWeekly.appendChild(rowWeekly);
    }
  }

  //Helper Function to calculate weekly expenses
  function calculateWeeklyExpenses(expenses) {
    const totalExpenses = {};

    expenses.forEach((expense) => {
      const lastMondayDate = getLastMondayDate();
      const date1 = formatDate(lastMondayDate);
      const date2 = formatDate(expense.createdAt);

      if (date2 >= date1) {
        const date = new Date(expense.createdAt);
        const dayOfWeek = date.toLocaleString("en-us", { weekday: "long" });

        if (!totalExpenses[dayOfWeek]) {
          totalExpenses[dayOfWeek] = 0;
        }

        totalExpenses[dayOfWeek] += expense.amount;
      }
    });

    return totalExpenses;
  }

  // Function to display monthly expenses
  function displayMonthlyExpenses(data) {
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = {};

    data.forEach((entry) => {
      const expenseDate = new Date(entry.createdAt);

      if (expenseDate.getFullYear() === currentYear) {
        const expenseMonth = expenseDate.getMonth() + 1;
        const expenseAmount = entry.amount;

        if (!monthlyExpenses[expenseMonth]) {
          monthlyExpenses[expenseMonth] = 0;
        }

        monthlyExpenses[expenseMonth] += expenseAmount;
      }
    });

    for (let month = 1; month <= 12; month++) {
      const monthName = getMonthNameFromNumber(month);
      const totalExpenses = monthlyExpenses[month] || 0;
      const rowMonthly = createTableRow([
        monthName,
        currentYear,
        `Rs. ${totalExpenses}`,
      ]);
      tableBodyMonthly.appendChild(rowMonthly);
    }
  }

  //Helper function to get the date of the last Monday
  function getLastMondayDate() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToLastMonday = (dayOfWeek + 6) % 7;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysToLastMonday);

    // if (lastMonday.getMonth() !== today.getMonth()) {
    //   lastMonday.setMonth(today.getMonth());
    //   lastMonday.setFullYear(today.getFullYear());
    // }

    return lastMonday.toDateString();
  }

  // Helper function to format a date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  }

  // Helper function to get month name from its number
  function getMonthNameFromNumber(monthNumber) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1];
  }

  // Helper function to create a table row
  function createTableRow(dataArray) {
    const row = document.createElement("tr");
    dataArray.forEach((data) => {
      const cell = document.createElement("td");
      cell.textContent = data;
      row.appendChild(cell);
    });
    return row;
  }

  // Function to display daily expenses
  function displayUrls(data) {
    // Clear the table
    tableBodyUrl.innerHTML = "";
    // Populate the Daily Expense table with data
    // data.forEach((expense) => {
    //   const date = formatDate(expense.createdAt);
    //   const row = createTableRow([expense.url, date], "large-string-cell");
    //   tableBodyUrl.appendChild(row);
    // });

    data.forEach((expense) => {
      let date = formatDate(expense.createdAt);
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${expense.url}</td>
          <td>${date}</td>         
      `;
      tableBodyUrl.appendChild(row);
    });
  }

  // Fetch and display expenses when the page loads
  displayExpenses();
});
