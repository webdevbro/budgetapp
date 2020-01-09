// we create modules in JS in order to keep pieces of code that are related to one another, together.
// data encapsulation allows us to hide the implementation of a specific module from the outside scope, so that we only expose a public interface, which is sometimes called a puclic API.
// In order to create modules in JavaScript we use the Module Pattern. All we need to know are the concepts of Closures and IFIs.

/* MODULE: DATA CONTROLLER */
let budgetController = (function() {

  let Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  }

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  let Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach((cur) => {
      sum = sum + cur.value;
    });
    data.totals[type] = sum;
  }

  let data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, desc, val) {
      let newItem;
      let ID;
      // create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }
      // create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, desc, val);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, val);
      }
      // push new item into array
      data.allItems[type].push(newItem);
      // return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      let ids;
      let index;
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if(index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBuget: function() {
      // calculate sum of all incomes
      calculateTotal("inc");
      calculateTotal("exp");
      // calculate budget (inc - exp)
      data.budget = data.totals.inc - data.totals.exp;
      // caculate percentage
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      let allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    // method that returns data
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function() {
      console.log(data);
    }

  }

})();

/* MODULE: UI CONTROLLER */
let UIController = (function() {

  let DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetValue: ".budget__value",
    incomeValue: ".budget__income--value",
    incomePercentage: ".budget__income--percentage",
    expenseValue: ".budget__expenses--value",
    expensePercentage: ".budget__expenses--percentage",
    incomeExpenseList: "#incExpContainer",
    expensesPercLabel: ".item__percentage",
    currentDate: ".budget__title--month"
  }

  let nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  let formatNumber = function(num, type) {
    let numSplit;
    let int;
    let dec;
    let sign;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, (int.length - 3)) + "," + int.substr((int.length - 3), 3);
    }
    dec = numSplit[1];

    return (type === "inc" ? "+" : "-") + " " + int + "." + dec;

  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },

    addListItem: function (obj, type) {

      // create HTML string with placeholders text
      let html;
      let element;

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
         `<div class="item clearfix" id="inc-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
              <div class="item__value">${formatNumber(obj.value, type)}</div>
              <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline deleteItem"></i></button>
              </div>
            </div>
          </div>`;
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          `<div class="item clearfix" id="exp-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
              <div class="item__value">${formatNumber(obj.value)}</div>
              <div class="item__percentage"></div>
              <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline deleteItem"></i></button>
              </div>
            </div>
          </div>`
      }

      // replace the placeholder text with actual data (done with template literals)
      // insert html into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", html);

    },

    deleteListItem: function(selectorID) {
      let parentToDelete;
      parentToDelete = document.getElementById(selectorID);
      parentToDelete.parentNode.removeChild(parentToDelete);
    },

    clearFields: function() {
      let fields;
      let fieldsArr;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ", "+  DOMstrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach((element, index, array) => {
        element.value = "";
      });
      fieldsArr[0].focus();

    },

    displayBudget: function(obj) {
      let type;
      obj.budget >= 0 ? type = "inc" : type = "exp";

      document.querySelector(DOMstrings.budgetValue).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeValue).textContent = formatNumber(obj.totalInc, "inc");
      document.querySelector(DOMstrings.expenseValue).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.expensePercentage).textContent = obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.expensePercentage).textContent = "---";
      }
    },

    displayPercentages: function(percentages) {
      let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });

    },

    displayCurrentDate: function() {
      let now;
      let year;
      let month;
      let months;
      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      now = new Date();
      day = now.getDay() + 1;
      month= parseInt(now.getMonth());
      year = now.getFullYear();
      document.querySelector(DOMstrings.currentDate).textContent = months[month] + " of " + year;
    },

    changedType: function() {
      let fields;
      fields = document.querySelectorAll(DOMstrings.inputType + "," + DOMstrings.inputDescription + "," + DOMstrings.inputValue);
      nodeListForEach(fields, function(cur){
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputButton).classList.toggle("red");
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };

})();

/* MODULE: APP CONTROLLER */
let appController = (function(budgetCtrl, UICtrl) {

  let setupEventListeners = function() {
    let DOM = UIController.getDOMstrings();
    document.querySelector(DOM.inputButton).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function (e) {
      if (e.keyCode === 13) {
        ctrlAddItem();
      }
    });
    document.querySelector(DOM.incomeExpenseList).addEventListener("click", ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener("change", UIController.changedType);

  };

  let updateBudget = function() {
    // 1. calculate the budget
    budgetController.calculateBuget();
    // 2. return the budget
    let budget = budgetController.getBudget();
    // 3. display the budget on the UI
    UIController.displayBudget(budget);
  };

  let updatePercentages = function() {
    // 1. calculate percentages
    budgetController.calculatePercentages();
    // 2. read percentages from budget controller
    let percentages = budgetController.getPercentages();
    // 3. update user interface
    UIController.displayPercentages(percentages);
  };

  let ctrlAddItem = function() {
    // 1. get the field input data
    let input = UICtrl.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. add item to the budget controller
      let newItem = budgetController.addItem(input.type, input.description, input.value);
      // 3. add the new item to the user interface
      UIController.addListItem(newItem, input.type);
      // 4. clear the fields
      UIController.clearFields();
      // 5. calculate and update budget
      updateBudget();
      // 6. calculate and update percentages
      updatePercentages();
    }
  }

  let ctrlDeleteItem = function(e) {
    let itemID;
    let splitID;
    let type;
    let ID;
    itemID = (e.target.parentNode.parentNode.parentNode.parentNode.id);
    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
      // 1. delete item from data structure
      budgetController.deleteItem(type, ID);
      // 2. delete item from user interface
      UIController.deleteListItem(itemID);
      // 3. update and show the new budget
      updateBudget();
      // 4. calculate and update percentages
      updatePercentages();
    }
  }

  return {
    init: function() {
      console.log("Application started!");
      UIController.displayCurrentDate();
      UIController.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  }

})(budgetController, UIController);

// the only line of code placed outside the controllers: INIT APP
appController.init();



