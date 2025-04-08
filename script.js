document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskForm = document.getElementById('taskForm');
    const taskNameInput = document.getElementById('taskName');
    const taskTypeInput = document.getElementById('taskType');
    const taskDescriptionInput = document.getElementById('taskDescription');
    const taskColorInput = document.getElementById('taskColor');
    const taskIdInput = document.getElementById('taskId');
    const saveBtn = document.getElementById('saveBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const searchInput = document.getElementById('searchInput');
    const filterTypeInput = document.getElementById('filterType');
    const taskList = document.getElementById('taskList');
    
    let isEditing = false;
    let currentTaskId = null;
    
    // Event Listeners
    taskForm.addEventListener('submit', handleFormSubmit);
    clearFormBtn.addEventListener('click', resetForm);
    clearAllBtn.addEventListener('click', clearAllTasks);
    searchInput.addEventListener('input', filterTasks);
    filterTypeInput.addEventListener('change', filterTasks);
    
    // Initialize the app
    renderTasks();
    
    // Functions
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const taskName = taskNameInput.value.trim();
        const taskType = taskTypeInput.value;
        const taskDescription = taskDescriptionInput.value.trim();
        const taskColor = taskColorInput.value;
        
        if (!taskName || !taskType) {
            alert('Please fill in all required fields');
            return;
        }
        
        const task = {
            id: isEditing ? currentTaskId : Date.now().toString(),
            name: taskName,
            type: taskType,
            description: taskDescription,
            color: taskColor
        };
        
        saveTask(task);
        resetForm();
        renderTasks();
    }
    
    function saveTask(task) {
        let tasks = getTasksFromLocalStorage();
        
        if (isEditing) {
            // Update existing task
            tasks = tasks.map(t => t.id === task.id ? task : t);
        } else {
            // Add new task
            tasks.push(task);
        }
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        isEditing = false;
        currentTaskId = null;
    }
    
    function getTasksFromLocalStorage() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    }
    
    function renderTasks(tasksToRender = null) {
        const tasks = tasksToRender || getTasksFromLocalStorage();
        
        if (tasks.length === 0) {
            taskList.innerHTML = '<p class="no-tasks">No tasks found. Add a task to get started!</p>';
            return;
        }
        
        taskList.innerHTML = tasks.map(task => `
            <div class="task-card" style="background-color: ${task.color}">
                <h3>
                    ${task.name}
                    <span class="task-type ${task.type}">${task.type}</span>
                </h3>
                <p class="task-description">${task.description || 'No description provided'}</p>
                <div class="task-actions">
                    <button class="edit-btn" data-id="${task.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" data-id="${task.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }
    
    function handleEdit(e) {
        const taskId = e.target.getAttribute('data-id') || 
                      e.target.parentElement.getAttribute('data-id');
        const tasks = getTasksFromLocalStorage();
        const taskToEdit = tasks.find(task => task.id === taskId);
        
        if (taskToEdit) {
            isEditing = true;
            currentTaskId = taskId;
            
            // Fill the form with task data
            taskIdInput.value = taskToEdit.id;
            taskNameInput.value = taskToEdit.name;
            taskTypeInput.value = taskToEdit.type;
            taskDescriptionInput.value = taskToEdit.description;
            taskColorInput.value = taskToEdit.color;
            
            // Change button text
            saveBtn.textContent = 'Update Task';
            
            // Scroll to form
            taskForm.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function handleDelete(e) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        const taskId = e.target.getAttribute('data-id') || 
                      e.target.parentElement.getAttribute('data-id');
        let tasks = getTasksFromLocalStorage();
        
        tasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }
    
    function resetForm() {
        taskForm.reset();
        taskIdInput.value = '';
        isEditing = false;
        currentTaskId = null;
        saveBtn.textContent = 'Save Task';
    }
    
    function clearAllTasks() {
        if (!confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) return;
        
        localStorage.removeItem('tasks');
        renderTasks();
    }
    
    function filterTasks() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterType = filterTypeInput.value;
        let tasks = getTasksFromLocalStorage();
        
        if (searchTerm) {
            tasks = tasks.filter(task => 
                task.name.toLowerCase().includes(searchTerm) || 
                (task.description && task.description.toLowerCase().includes(searchTerm))
            );
        }
        
        if (filterType) {
            tasks = tasks.filter(task => task.type === filterType);
        }
        
        renderTasks(tasks);
    }
    
    // Add icon based on task type
    function getIconForTaskType(type) {
        switch(type) {
            case 'Personal':
                return '<i class="fas fa-home"></i>';
            case 'Work':
                return '<i class="fas fa-briefcase"></i>';
            case 'Study':
                return '<i class="fas fa-book"></i>';
            default:
                return '<i class="fas fa-tasks"></i>';
        }
    }
});