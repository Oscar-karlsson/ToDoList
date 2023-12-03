// Define your API key and URL
const apiKey = '792d14df-2189-414e-99f9-30a2435fe004';
const apiUrl = `https://js1-todo-api.vercel.app/api/todos?apikey=${apiKey}`;

// Select necessary HTML elements
const listDiv = document.querySelector('.container');
const listOl = listDiv.querySelector('ol');
const addItemInput = document.querySelector('input.addItemInput');
const addItemButton = document.querySelector('button.addItemButton');
const removeErrorMessage = document.getElementById('remove-error-message');
const modal = document.getElementById('modal');
const closeButton = document.querySelector('.close');

// Fetch tasks from the API when the page loads
window.addEventListener('load', async () => {
  const response = await fetch(apiUrl);
  const tasks = await response.json();

  // Add each task to the list
  for (const task of tasks) {
    addTaskToList(task);
  }
});

// Function to create and attach list item buttons
function attachListItemButtons(li, taskId) {
  let remove = document.createElement('button');
  remove.className = 'removeButton';
  remove.innerHTML = '<i class="fas fa-trash-alt"></i>';

  // Add event listener for the remove button
  remove.addEventListener('click', async (event) => {
    console.log('Remove button clicked');
    const response = await fetch(`https://js1-todo-api.vercel.app/api/todos/${taskId}?apikey=${apiKey}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      let ol = li.parentNode;
      ol.removeChild(li);
      removeErrorMessage.textContent = '';
    } else {
      removeErrorMessage.textContent = 'Failed to remove task.';
    }
    event.stopPropagation();
  });

  // Append the remove button to the list item
  li.appendChild(remove);
}

// Function to add a task
async function addTask() {
  const taskName = addItemInput.value.trim();
  let errorMessage = document.getElementById('error-message');

  // Check if the input is not empty
  if (taskName !== '') {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: taskName, completed: false }),
    });
    const task = await response.json();

    // Add the new task to the list
    addTaskToList(task);
    errorMessage.textContent = '';
  } else {
    errorMessage.textContent = 'Please enter a task.';
  }
}

// Add event listener for the add item button
addItemButton.addEventListener('click', addTask);

// Function to add a task to the list
function addTaskToList(task) {
  let li = document.createElement('li');
  li.textContent = task.title;
  li.dataset.id = task._id; // Store the task ID for later use

  // Apply the task's completion status
  if (task.completed) {
    li.classList.add('done');
  }

  // Attach the list item buttons
  attachListItemButtons(li, task._id);

  // Append the list item to the list
  listOl.appendChild(li);
  addItemInput.value = '';

  // Add event listener for the list item
  li.addEventListener('click', async (event) => {
    if (event.target == event.currentTarget) {
      li.classList.toggle('done');
      // Update the task's completion status on the backend server
      await updateTaskCompletionStatus(task._id, li.classList.contains('done'));
    }
  });
}

// Function to update the task's completion status
async function updateTaskCompletionStatus(taskId, completed) {
  const response = await fetch(`https://js1-todo-api.vercel.app/api/todos/${taskId}?apikey=${apiKey}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed }),
  });

  if (response.ok) {
    const updatedTask = await response.json();
    console.log('Task updated:', updatedTask);
  } else if (response.status === 404) {
    console.error('Task not found.');
  } else if (response.status === 401) {
    console.error('Unauthorized. Invalid API key.');
  } else {
    console.error('Failed to update task.');
  }
}

// Function to show the modal
function showModal() {
  modal.style.display = 'block';
}

// Function to hide the modal
function hideModal() {
  modal.style.display = 'none';
}

// Add event listener for the close button in the modal
closeButton.addEventListener('click', () => {
  hideModal();
});

// Add event listener for the click event outside the modal
window.addEventListener('click', (event) => {
  if (event.target == modal) {
    hideModal();
  }
});