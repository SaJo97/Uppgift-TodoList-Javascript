// URL for the To-Do API with and API key
const Display_API_URL =
  "https://js1-todo-api.vercel.app/api/todos?apikey=7b6ef213-1df8-4f90-b0d3-6a33fe1bb3bf";

// Selecting the HTML element where the To-Do list will be displayed
const displayTitle = document.querySelector("#list-todo");
let todoList = []; // Array to hold To-Do items

// Fetching the initial data from the API
fetchData(); // Call to fetch data from the API

async function fetchData() {
  try {
    const res = await fetch(Display_API_URL); // Fetching data from the API
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`); // Throw an error if the response is not OK

    const data = await res.json(); // Parsing the JSON data from the response

    data.forEach((todo) => todoList.push(todo)); // Pushing each To-Do item into the todoList array
    renderTodoList(); // Rendering the To-Do list in the UI
    console.log(todoList); // Debugging: log the fetched To-Do list
  } catch (err) {
    console.log("error", err); // Logging any errors encountered during fetch
  }
}

function renderTodoList() {
  console.log(todoList); // Debugging: log the current state of todoList

  displayTitle.innerHTML = ""; // Clearing the list display before rendering new items

  todoList.forEach((todo) => {
    const todoElement = createTodoElement(todo); // Creating a To-Do element for each item

    todoElement.setAttribute("data-id", todo._id); // Setting a data attribute with the To-Do's ID
    // Check if the To-Do is completed and add the 'checked' class if so
    if (todo.completed) {
      todoElement.classList.add("checked");
    }

    displayTitle.appendChild(todoElement); // Adding the created To-Do element to the display
  });

  // Adding event listeners to delete buttons of each To-Do item
  document.querySelectorAll(".close-btn").forEach((deleteButton) => {
    deleteButton.addEventListener("click", async (event) => {
      const todoId = event.target.closest("li").getAttribute("data-id"); // Get the ID of the To-Do to delete
      // Finding the index of the To-Do in the todoList
      const todoIndex = todoList.findIndex((todo) => todo._id === todoId);
      const isCompleted = todoList[todoIndex].completed;  // Checking if the To-Do is completed

      // If it's not completed, show a warning and return
      if (!isCompleted) {
        warningPopup('You must complete the todo before deleting it!');
        handlePopup(); // Handling the popup
        return;
      }

      await deleteTodo(todoId); // Deleting the To-Do item
    });
  });
}
function handlePopup() {
  const popUp = document.querySelector("#js-pop-up-container"); // Selecting the popup container
  // Adding an event listener to close the popup when clicking on it
  popUp.addEventListener("click", (event) => {
    if (
      event.target === popUp ||  // Close if clicked on pop-up container
      event.target === popUp.querySelector("#js-popup-btn") // Close if clicked on the close button
    ) {
      popUp.remove(); // Remove the popup from the DOM
    }
  });
}
function warningPopup(text) {
  // If a popup already exists, remove it to avoid stacking
  if (document.querySelector("#js-pop-up-container")) {
    document.querySelector("#js-pop-up-container").remove();
  }
  // Create a new popup container and its contents
  const popUp = createCustomElement('div','pop-up-container');
  popUp.id = "js-pop-up-container";

  const popUpBox = createCustomElement('div','pop-up');
  popUpBox.id = "js-pop-up";
  
  const popUpMsg = createCustomElement('p','msg-popup',text); // Create message element with specified text
  popUpMsg.id = "js-msg-popup";

  const popUpBtn = createCustomElement('button','popup-btn','\u00D7'); // Create a close button for the popup
  popUpBtn.id = "js-popup-btn";

  // Appending the message and button to the popup box
  popUpBox.append(popUpMsg, popUpBtn);
  popUp.appendChild(popUpBox); // Appending the popup box to the popup container

  displayTitle.appendChild(popUp); // Adding the popup container to the display area
  return popUp; // Return the popup element
}

function createTodoElement(todo) {
  // Creating an HTML list item for each To-Do
  const todoListItem = createCustomElement('li', 'li-todo');
  todoListItem.setAttribute("data-id", todo._id); // Setting the data-id attribute

  // Creating and formatting the title element of the To-Do
  const title = createCustomElement('p','todo-title',todo.title);
  title.className = 'li-todo'; //click on title works as mark/unmark
  
  const closeBtn = createCustomElement('button','close-btn','\u00D7');

  todoListItem.append(title, closeBtn);
  return todoListItem;
}

function createCustomElement(type, classList, text){
  const element = document.createElement(type); // Create a new element of the specified type
  if(classList && classList.length > 0){
    element.className = classList; // Set class name if provided
  }
  if(text){
    element.textContent = text; // Set the text content if provided
  }
  return element;
}

// Selecting the form element for adding new To-Dos
const newTodo = document.querySelector("#form");
let isSubmitting = false; // Flag to prevent multiple submissions
newTodo.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent default form submission behavior
  const input = document.getElementById("input").value.trim(); // Get the input value and trim whitespace
  console.log('No input' + input); // Debugging: log the input

   // If input is empty, show a warning and handle popup
  if (!input) {
    warningPopup('You must write something!');
    handlePopup();
    return;
  }

  // Prevent further submissions until this request is completed
  if (isSubmitting) {
    return; // Exit if we're already submitting
  }
  isSubmitting = true; // Set the flag to indicate we are submitting

  try {
    // Sending a POST request to add a new To-Do item
    const response = await fetch(Display_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input, // Including the title in the request body
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Updating the todoList with the new To-Do item received from the API
    const newTodoItem = await response.json();
    todoList.push(newTodoItem); // Add the new Todo to the todoList array
    renderTodoList();
    // Clear the input field after adding the To-Do
    document.getElementById("input").value = "";
  } catch (err) {
    console.log("Unexpected error. Try again later.");
  } finally {
    // Reset the flag to allow future submissions
    isSubmitting = false;
  }
});

// Function to delete a To-Do item from the server/API
async function deleteTodo(id) {
  const deleteMethod = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  };
  try {
    // Sending a DELETE request to the API to remove the To-Do item
    const response = await fetch(
      `https://js1-todo-api.vercel.app/api/todos/${id}?apikey=7b6ef213-1df8-4f90-b0d3-6a33fe1bb3bf`,
      deleteMethod
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json(); // Parsing the response data
    console.log("Del resp:", data);
    // Filtering the todoList to remove the deleted To-Do item by ID
    todoList = todoList.filter((todo) => todo._id !== id);
    renderTodoList();
  } catch (err) {
    console.log(err);
  }
}

// Adding click event listener on the To-Do list for marking/unmarking To-Dos
displayTitle.addEventListener(
  "click",
  spamClickFix(async (ev) => {
    const todoId = ev.target.closest("li")?.getAttribute("data-id"); // Get the nearest To-Do item ID

    if (todoId && ev.target.classList.contains("li-todo")) {
      // Proceed only if a valid To-Do item is clicked
      const todoIndex = todoList.findIndex((todo) => todo._id === todoId);
      const todoTitle = todoList[todoIndex].title; // Get the title of the To-Do
      const isCompleted = todoList[todoIndex].completed; // Check if the To-Do is already completed
      await putTodo(todoId, isCompleted,todoTitle); // Call the function to toggle completion
    }
  }, 50), // Adding a 50ms delay to prevent multiple rapid calls (debouncing)
  false  // Do not use capture
);

// Function to put (update) the completion status of a To-Do item
async function putTodo(id, isCompleted, title) {
  //optimistic update
  const updateTodo = { // Create an update object for the To-Do
    _id: id,
    completed: !isCompleted, // Toggle the completed status
    title
  };
/*
  Optimistically update the todoList for immediate UI feedback. 
  Here, the code is updating an array called todoList. 
  The .map() method creates a new array by applying the provided function to each element in the original array (todoList). 
  Inside the map's callback function: 
  *todo represents the current element (a todo item) being processed. 
  *The condition todo._id === id checks if the _id property of the current todo matches a variable called id. 
  *If there's a match, it replaces that todo with updatedApiTodo; otherwise, it keeps the original todo. 
  *Finally, todoList is reassigned to this new array.
*/
  todoList = todoList.map((todo) => (todo._id === id ? updateTodo : todo));

  renderTodoList();
  
  try {
    // Sending a PUT request to update the completed state of the To-Do item
    const res = await fetch(
      `https://js1-todo-api.vercel.app/api/todos/${id}?apikey=7b6ef213-1df8-4f90-b0d3-6a33fe1bb3bf`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: !isCompleted, // Send the new completed state
        }),
      }
    );
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const updatedApiTodo = await res.json();
    console.log(updatedApiTodo);

    todoList = todoList.map((todo) => (todo._id === id ? updatedApiTodo : todo)); // For safety, works with or without this code in here

    renderTodoList();
  } catch (error) {
    console.log("Error:", error);
/*
    If the update fails, revert the optimistic update in todoList. 
    If the _id of the current todo matches the id, it creates a new object with all the properties of the existing todo using the spread operator (...todo), 
    but with the completed property updated to the value of isCompleted. 
    If the _id does not match, it simply returns the todo object unchanged. 
    Return a new array: After processing all the items, map returns a new array with the updated todos. 
    Notably, this does not mutate the original todoList.
*/
    todoList = todoList.map((todo) => (todo._id === id ? {...todo, completed: isCompleted } : todo));
    
    renderTodoList();
    
  }
}
// Function for debouncing click events to avoid multiple rapid calls
function spamClickFix(func, delay) {
  let timeout; // Variable to hold the timeout reference

  // Return a function that debounces calls to the provided function
  return (...args) => {
    const setCon = this; // Capture the current context
    clearTimeout(timeout); // Clear existing timeout
    // Set a new timeout to call the function after the specified delay
    timeout = setTimeout(() => func.apply(setCon, args), delay);
  };
}