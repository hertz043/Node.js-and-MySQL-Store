var mysql = require("mysql");
var inquirer = require("inquirer");

//Tells app what database to connect to
var connection = mysql.createConnection({
    host: "localhost",  
    port: 3306,  
    user: "root",  
    password: "root",
    database: "bamazon"
  });

  //initial connection
  connection.connect(function(err) {
    if (err) throw err;
    console.log("Welcome to Bamazon!");
    displayStock();
  });
  
  //Displays products in the database
  function displayStock() {
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      for (i in res) {
        let product = res[i];
        console.log("------")
        console.log("ID:", product.item_id);
        console.log("Product:", product.product_name);
        console.log("Department:", product.department_name);
        console.log("Price: $"+product.price);
        console.log("# in Stock:", product.stock_quantity);
        }
      selectProduct();
      
    });
  }

  //Prompts the user to enter a product ID and quntity to purchase
function selectProduct() {
    inquirer.prompt([
        {
            name: "enterID",
            message: "Please enter the ID of the item you'd like to purchase.",
            type: "input",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            name: "quantity",
            message: "How many would you like to purchase?",
            type: "input",
            validate: function(value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function(inquirerResponse) {
        connection.query(
            "Select stock_quantity, price, product_name FROM products WHERE ?",
            [
                { 
                    item_id: inquirerResponse.enterID
                },
            ],  
            function(err, res) {
                if (err) throw err;

                let enteredID = inquirerResponse.enterID;
                let enteredQuantity = inquirerResponse.quantity;

                let stock = res[0].stock_quantity;
                let price = res[0].price;
                let product = res[0].product_name;

                if (stock >= inquirerResponse.quantity) {
                    buyProduct(stock, price, product, enteredID, enteredQuantity);
                }
                else {
                    console.log("------")
                    console.log("Sorry, there aren't enough of those in stock.")
                    orderAgain();
                }
            }

        )
    })
}

//completes the purchase, removing the purchased amounts of product from the stock and totalling the user's price
function buyProduct(stock, price, product, enteredID, enteredQuantity) {

    let updatedStock = stock - enteredQuantity;
    let totalUserCost = price * enteredQuantity;

    console.log("------")
    console.log("Your order is "+product+" -- quantity: "+enteredQuantity);
    console.log("Your order total comes to $"+parseFloat(totalUserCost).toFixed(2)+".")

    inquirer.prompt({
      name: "confirm",
      type: "list",
      message: "Would you like to confirm and place your order?",
      choices: ["Yes", "No"]
    })
    .then(function(answer) {
        if (answer.confirm === "Yes") {
            connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                  {
                    stock_quantity: updatedStock
                  },
                  {
                    item_id: enteredID
                  }
                ],
                function(err) {
                  if (err) throw err;
                  console.log("------");
                  console.log("Your order has been placed!");
                  orderAgain();
                }
              );
        }
        else {
            console.log("------");
            console.log("Your order has been cancelled.");
            orderAgain();
        }

    })
};

//Prompts the user to restart from the displayStock phase or to quit
function orderAgain() {
    console.log("------");
    inquirer.prompt({
        name: "confirm",
        type: "list",
        message: "Would you like start over and view what's in stock again?",
        choices: ["Yes", "No"]
      })
      .then(function(answer) {
          if (answer.confirm === "Yes") {
            displayStock();
          }

          else {
            console.log("------")
            Console.log("Thanks for visiting Bamazon!")
            connection.end();
          }
        })
    };