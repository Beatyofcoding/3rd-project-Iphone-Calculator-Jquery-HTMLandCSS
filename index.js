//I am trying my best to clone the native iOS calculator, and it's taking longer than expected.... especially with spaghetti code.
var currentNum = "0";
var lastNum = [];
var $lastOperator = "";
var displayNum = "0";
var equalsBtn = false;
var hasDecimal = false;
var clearBtn = false;
var chainAdd = false;
var $displayTxt;
var $orangeButtons;

$(document).ready(function() {
  $displayTxt = $("#displayTxt");
  $orangeButtons = $(".btnO");
  $("#display").text(eval(""));
  
  //Fade out the shadow from the buttons
  $("button").mousedown(function() { UIDown($(this)); });

  //Reset the transition timer for clicking a button after it has been clicked.
  $("button").mouseup(function() {
    calculate($(this));
    lengthChecker($displayTxt.text());
    UIUp($(this));
  });

});

var isSymbol = function(char) {
  return char === '+' || char === '-' || char === '=' || char === '/' || char === '*';
}

var getButton = function(obj) {
  if (obj.attr("value") === '.')
    return 'decimal';
  if (obj.is(".btnG"))
    return 'number';

  if (obj.attr("value") === '=')
    return 'equals';
  if (obj.is(".btnO"))
    return 'symbol';

  if (obj.is(".btnDG"))
    return 'darkGray';
}

var calculate = function(obj) {

  switch (getButton(obj)) {
    /* ----------------------------------- DECIMAL ---------------------------------------- */
    case 'decimal':
      if (!hasDecimal && evaluator(currentNum).toString().length <= 9) {
        hasDecimal = true;
        //if the equals button was pressed previously, reset some values
        if (equalsBtn) {
          displayNum = "";
          equalsBtn = false;
          currentNum = "0";
        }

        if (currentNum === "")
          currentNum = '0';

        currentNum += '.';
        showNum(evaluator(trimNum(currentNum)) + '.');
      } else if (hasDecimal)
        showNum(evaluator(trimNum(currentNum)) + '.');
      else
        showNum(evaluator(trimNum(currentNum)));

      break;

      /* ----------------------------------- NUMBER ---------------------------------------- */
    case 'number':
      $(".clear").text('C');
      if (equalsBtn) {
        equalsBtn = false;
        displayNum = "";
        currentNum = "";
        chainAdd = false;
        lastNum = [];
      }
      if (hasDecimal) currentNum = trimNum(currentNum);
      if (evaluator(trimNum(currentNum) + evaluator(obj.attr("value"))).toString().length <= 9)
        currentNum += obj.attr("value");

      currentNum = currentNum.toString();

      if (hasDecimal)
        showNum(trimNum(currentNum));
      else
        showNum(evaluator(trimNum(currentNum)));

      break;

      /* ------------------------------------- EQUALS ------------------------------------------ */
    case 'equals':

      if (displayNum === "0" && (hasDecimal || !chainAdd))
        displayNum = "";

      var tempD = displayNum;

      //Default values that may change based on active variables
      if (chainAdd)
        displayNum = evaluator(displayNum + trimNum(currentNum));
      else
        displayNum = evaluator(trimNum(currentNum));

      /*--------------------- Handles chain adding with tapping = multiple times. ------------------ */
      outer: {
          //if user presses this sequence: # = 
          if (!isSymbol(currentNum.charAt(0)) && !chainAdd)
            currentNum = currentNum;
          else if (typeof $lastOperator === "object") {
            if (isSymbol(tempD.toString().charAt(tempD.length - 1)) && currentNum === "0" || isSymbol(currentNum.toString().charAt(0))) //If user presses: # (operator) =
            {
              currentNum = trimNum(currentNum);
              if (countOperators(displayNum) == 0 && equalsBtn)
                break outer;
              //If there is only 1 operator in the expression...
              else if (countOperators(displayNum) + countOperators(currentNum) == 1) {
                currentNum = $lastOperator.attr("value") + trimNum(evaluator(lastNum[lastNum.length - 1]));
                displayNum = eval(tempD + evaluator(tempD));
              } else if (($lastOperator.attr("value") === "*" || $lastOperator.attr("value") === "/") && countOperators(currentNum) != 1) //if there's more than 1 op and * or / is tapped
              {

                if (lastNum.length === 1)
                  displayNum = eval(tempD + evaluator(tempD));
                else //if user presses #1 (operator1) #2 (operator2) =
                  displayNum = lastNum[lastNum.length - 2] + lastNum[lastNum.length - 1] + evaluator(lastNum[lastNum.length - 1]);

                currentNum = $lastOperator.attr("value") + evaluator(lastNum[lastNum.length - 1]);
              } else if (countOperators(currentNum) != 1) {
                currentNum = $lastOperator.attr("value") + evaluator(tempD);
                displayNum = eval(tempD + evaluator(tempD));
              }
            }
            displayNum = displayNum.toString();
          }
        } //outer

      //space any operators that are adjacent.
      for (var i = 0; i < displayNum.length - 1; i++)
        if (isSymbol(displayNum.charAt(i)) && isSymbol(displayNum.charAt(i + 1))) {
          displayNum = displayNum.substring(0, i + 1) + " " + displayNum.substring(i + 1);
          i++; //to skip the space that was just inserted
        }

      displayNum = eval(displayNum);
      //check if the total has a decimal in it
      if (displayNum.toString().search(/\./) != -1)
        displayNum = eval(displayNum.toPrecision(8));

      showNum(displayNum);

      if (isSymbol(currentNum.charAt(0)))
        currentNum = currentNum.substring(1);

      if (typeof $lastOperator === "object")
        currentNum = $lastOperator.attr("value") + currentNum.toString();
      else
        currentNum = currentNum.toString();

      currentNum = trimNum(currentNum);
      displayNum = displayNum.toString();
      hasDecimal = false
        //chainAdd = false;
      clearBtn = false;
      equalsBtn = true;
      break;

      /* ------------------------------------ +-/* ------------------------------------ */
    case 'symbol':

      if (equalsBtn)
        currentNum = "";

      //handles tapping different operators without tapping a number.
      if (isSymbol(displayNum.charAt(displayNum.length - 1)) && currentNum === "0" && !equalsBtn) {
        displayNum = displayNum.substring(0, displayNum.length - 1) + obj.attr("value");
        $lastOperator = obj;

        if (obj.attr("value") === '*' || obj.attr("value") === '/')
          showNum(evaluator(lastNum[lastNum.length - 1]));
        else
          showNum(eval(evaluator(displayNum)));
      } else {
        //turns true to handle chain adding.
        if (!chainAdd) chainAdd = true;

        //trims 0 off the front. 
        if (displayNum.charAt(0) === "0" && (hasDecimal || displayNum.length !== 1))
          displayNum = displayNum.substring(1, displayNum.length);

        currentNum = trimNum(currentNum);
        if (evaluator(displayNum + currentNum).toString().length <= 9) {
          displayNum += evaluator(currentNum);

          //trims a 0 off the front, error occurs with 0's in front of js eval() function.
          displayNum = trimNum(displayNum);

          //handles which number to show when chain adding things together (ex 2+3*5-...)
          if ((obj.attr("value") !== '*' && obj.attr("value") !== '/') || equalsBtn)
            showNum(eval(displayNum));
          else
            showNum(currentNum);

          displayNum += obj.attr("value");
          $lastOperator = obj;
          lastNum.push(currentNum + $lastOperator.attr("value"));
          currentNum = "0";
        }

        //Reset variables for continuous use.
        equalsBtn = false;
        hasDecimal = false;
        clearBtn = false;
      }
      break;

      /* -------------------------------------- DARK GRAY BTN ------------------------------------------- */
    case 'darkGray':
      /* --- CLEAR BTN ---*/
      if (obj.is('.clear')) {
        if (!clearBtn && obj.text() === 'C' && !equalsBtn)
          clearBtn = true;

        hasDecimal = false;
        equalsBtn = false;
        currentNum = "0";
        obj.text('AC');

        if (clearBtn) //clear current number
        {
          clearBtn = false;
          showNum(evaluator("0"));
          drawOrangeBorders($lastOperator);
        } else //restart calculator
        {
          chainAdd = false;
          displayNum = "0";
          showNum(evaluator(displayNum + 0));
          clearOrangeBorders($orangeButtons);
          $lastOperator = "";
          lastNum = []
        }
      }

      /* --- +/- BTN ---*/
      if (obj.attr("value") === "+/-") {
        // add/remove the - sign and show the number
        if (equalsBtn) //if equals was previously tapped, edit and show displayNum
        {
          displayNum = displayNum * -1;

          if (hasDecimal)
            showNum(eval(displayNum).toPrecision(8));
          else
            showNum(eval(displayNum.toPrecision(9)));

          displayNum = displayNum.toString();
        } 
        else //if the keypad was tapped, edit and show currentNum
        {
          currentNum = currentNum * -1;

          if (hasDecimal)
            showNum(currentNum);
          else
            showNum(eval(currentNum));

          currentNum = currentNum.toString();
        }
      }
      /* --- % BTN ---*/
      break;
  }
}

//Eval helper to determine what should and shouldn't be evaluated.
var evaluator = function(expression) {
  var val = "";
  if (typeof expression === "number")
    expression = expression.toString();

  if (expression === "")
    val = expression;
  else if (expression.charAt(expression.length - 1) === '.' || isSymbol(expression.charAt(expression.length - 1)))
    val = eval(expression.substring(0, expression.length - 1));
  else
    val = eval(expression);

  return val;
}

//Displays number to screen.
var showNum = function(num) {
  if (typeof num === "number")
    num = num.toString();

  $displayTxt.text(num);
}

//trims 0's off the beginning of a number.
var trimNum = function(num) {
  if (typeof num === "number")
    num = num.toString();

  if (num.length !== 1 && ((num.charAt(0) === "0" && num.charAt(1) !== '.') || num.charAt(0) == "0"))
    return num.substring(1, num.length);
  else if (isSymbol(num.charAt(0)) && num.charAt(1) === "0")
    return num.charAt(0) + num.substring(2, num.length);
  else
    return num;
}

var countOperators = function(str) {
  str = str.toString();
  str = str.split('');

  return str.filter(function(a) {
    return isSymbol(a);
  }).length;
}

var changeFontSize = function(size) {
  $displayTxt.css("font-size", size);
}

//Checks length of the numbers to see if they overflow the screen.
var lengthChecker = function(num) {
  if (typeof num === "number")
    num = num.toString();

  if (num.length == 9)
    changeFontSize(45);
  else if (num.length > 9) {
    changeFontSize(40);
    $displayTxt.text('limit exceeded');
  } else
    changeFontSize(50);
}

var UIUp = function(obj) {
  if (obj.is(".btnO")) {
    clearOrangeBorders($orangeButtons);
    drawOrangeBorders(obj);
    transition(obj, 0);
  } else if (obj.is(".btnG")) {
    clearOrangeBorders($(".btnO"));
    transition(obj, 0);
  } else
    transition(obj, 0);
};

var UIDown = function(obj) {
  if (obj.is(".btnO")) {
    transition(obj, .5);
  } else
    transition(obj, .5);
};

var clearOrangeBorders = function(obj) {
  if (typeof obj === "object")
    obj.css({
      "border-top": ".01cm solid rgb(102, 102, 102)",
      "border-left": ".00cm solid rgb(102, 102, 102)",
      "border-bottom": ".00cm solid rgb(102, 102, 102)"
    });
}

var drawOrangeBorders = function(obj) {
  if (typeof obj === "object")
    obj.not(".btnEquals").css({
      "border-top": "2px solid black",
      "border-left": "2px solid black",
      "border-bottom": "2px solid black"
    });
}

var transition = function(obj, time) {
  if (typeof obj === "object")
    obj.css({
      "-o-transition": time + "s",
      "-ms-transition": time + "s",
      "-moz-transition": time + "s",
      "-webkit-transition": time + "s",
      "transition": time + "s linear"
    });
}