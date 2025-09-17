// Configuration
const API_BASE_URL = 'http://localhost:5000'; // Change this to your backend URL

// State management
let currentFoodLog = [];
let currentTotals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
};

// API Client
class APIClient {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }
    
    static async addFood(input) {
        return this.request('/api/add_food', {
            method: 'POST',
            body: JSON.stringify({ input })
        });
    }
    
    static async deleteFood(index) {
        return this.request('/api/delete_food', {
            method: 'POST',
            body: JSON.stringify({ index })
        });
    }
    
    static async clearLog() {
        return this.request('/api/clear', {
            method: 'POST'
        });
    }
    
    static async getProgress() {
        return this.request('/api/progress');
    }
    
    static async getTotals() {
        return this.request('/api/totals');
    }
}

// Screen Navigation
function showScreen(screenName, clickedElement = null) {
    console.log('Switching to screen:', screenName);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected screen
    const targetScreen = document.getElementById(screenName + '-screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('Screen activated:', screenName);
    } else {
        console.error('Screen not found:', screenName + '-screen');
    }
    
    // Add active class to clicked nav button
    if (clickedElement) {
        clickedElement.classList.add('active');
    } else {
        // Fallback: find button by screen name
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            if (btn.onclick && btn.onclick.toString().includes(screenName)) {
                btn.classList.add('active');
            }
        });
    }
}

// Add Food Function
async function addFood() {
    console.log('addFood called');
    const input = document.getElementById('foodInput');
    
    if (!input) {
        console.error('foodInput element not found');
        showFlashMessage('Input field not found!', 'error');
        return;
    }
    
    const foodInput = input.value.trim();
    console.log('Food input:', foodInput);
    
    if (!foodInput) {
        showFlashMessage('Please enter some food!', 'warning');
        return;
    }
    
    try {
        console.log('Sending request to /api/add_food');
        const data = await APIClient.addFood(foodInput);
        console.log('Response data:', data);
        
        if (data.success) {
            input.value = '';
            showFlashMessage('Food added', 'info');
            
            // Show extracted food cards temporarily
            showExtractedFoods(data.foods);
            
            // Update the UI dynamically instead of reloading
            updateFoodLog(data.foods);
            updateTotals(data.totals);
            
            // Stay on the Add screen after successful submission
            // User can manually switch to Log screen if they want to see the food
        } else {
            if (data.message) {
                showFlashMessage(data.message, 'warning');
            } else {
                showFlashMessage('Error: ' + (data.error || 'Unknown error'), 'error');
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showFlashMessage('Error: ' + error.message, 'error');
    }
}

// Show Extracted Foods Function
function showExtractedFoods(foods) {
    console.log('Showing extracted foods:', foods);
    
    const container = document.getElementById('extractedFoodsContainer');
    if (!container) {
        console.error('Extracted foods container not found');
        return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create cards for each extracted food
    foods.forEach((food, index) => {
        const card = createExtractedFoodCard(food);
        container.appendChild(card);
        
        // Slide out after 3 seconds
        setTimeout(() => {
            card.classList.add('slide-out');
            setTimeout(() => {
                if (card.parentNode) {
                    card.remove();
                }
            }, 500); // Wait for animation to complete
        }, 3000);
    });
}

// Create Extracted Food Card
function createExtractedFoodCard(food) {
    const card = document.createElement('div');
    card.className = 'extracted-food-card';
    
    const amountText = [];
    if (food.grams > 0) amountText.push(`${food.grams}g`);
    if (food.quantity_items > 0) amountText.push(`${food.quantity_items} items`);
    
    card.innerHTML = `
        <div class="extracted-food-info">
            <div class="extracted-food-name">${food.food_name}</div>
            <div class="extracted-food-amount">${amountText.join(' - ')}</div>
        </div>
    `;
    
    return card;
}

// Update Food Log Function
function updateFoodLog(newFoods) {
    console.log('Updating food log with:', newFoods);
    
    const foodList = document.getElementById('food-list');
    if (!foodList) {
        console.error('Food list container not found');
        return;
    }
    
    // Remove empty state if it exists
    const emptyState = foodList.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Add each new food item at the beginning (newest first)
    newFoods.forEach(food => {
        const foodItem = createFoodItemElement(food);
        foodList.insertBefore(foodItem, foodList.firstChild);
    });
    
    // Update food count in header
    updateFoodCount();
}

// Create Food Item Element
function createFoodItemElement(food) {
    const foodItem = document.createElement('div');
    foodItem.className = 'food-item';
    
    const amountText = [];
    if (food.grams > 0) amountText.push(`${food.grams}g`);
    if (food.quantity_items > 0) amountText.push(`${food.quantity_items} items`);
    
    foodItem.innerHTML = `
        <div class="food-main">
            <div class="food-name">${food.food_name}</div>
            <div class="food-amount">${amountText.join(' - ')}</div>
        </div>
        <div class="nutrition-compact">
            <span class="nutrition-badge">🔥 ${Math.round(food.nutrition?.calories || 0)}</span>
            <span class="nutrition-badge">🥩 ${(food.nutrition?.protein || 0).toFixed(1)}g</span>
            <span class="nutrition-badge">🍞 ${(food.nutrition?.carbs || 0).toFixed(1)}g</span>
            <span class="nutrition-badge">🥑 ${(food.nutrition?.fat || 0).toFixed(1)}g</span>
        </div>
        <div class="food-input">${food.raw_input}</div>
        <div class="delete-overlay">
            <div class="delete-button">🗑️ Delete</div>
        </div>
    `;
    
    // Add swipe-to-delete functionality
    addSwipeToDelete(foodItem, food);
    
    return foodItem;
}

// Add Swipe to Delete Functionality
function addSwipeToDelete(foodItem, food) {
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let isDragging = false;
    let deleteThreshold = 100; // pixels to swipe to trigger delete
    
    foodItem.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        isDragging = true;
        foodItem.style.transition = 'none';
        foodItem.classList.add('swiping');
    }, { passive: true });
    
    foodItem.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        currentX = touch.clientX;
        const deltaX = currentX - startX;
        const deltaY = Math.abs(touch.clientY - startY);
        
        // Only allow horizontal swipes (prevent vertical scrolling)
        if (deltaY > 50) {
            isDragging = false;
            foodItem.classList.remove('swiping');
            return;
        }
        
        // Only allow left swipes (negative deltaX)
        if (deltaX < 0) {
            const swipeDistance = Math.abs(deltaX);
            const maxSwipe = 150; // Maximum swipe distance
            
            // Move the card
            foodItem.style.transform = `translateX(${deltaX}px)`;
            
            // Show delete overlay based on swipe distance
            if (swipeDistance > 50) {
                foodItem.classList.add('show-delete');
            } else {
                foodItem.classList.remove('show-delete');
            }
        }
    }, { passive: true });
    
    foodItem.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        
        isDragging = false;
        foodItem.classList.remove('swiping');
        const deltaX = currentX - startX;
        const swipeDistance = Math.abs(deltaX);
        
        foodItem.style.transition = 'all 0.3s ease';
        
        if (swipeDistance > deleteThreshold && deltaX < 0) {
            // Swipe far enough to delete
            deleteFoodItem(foodItem, food);
        } else {
            // Snap back to original position
            foodItem.style.transform = 'translateX(0)';
            foodItem.classList.remove('show-delete');
        }
    }, { passive: true });
    
    // Add click handler for delete button
    const deleteButton = foodItem.querySelector('.delete-button');
    deleteButton.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteFoodItem(foodItem, food);
    });
}

// Delete Food Item Function
async function deleteFoodItem(foodItemElement, food) {
    console.log('Deleting food item:', food);
    
    // Get the food index from the data attribute or find it manually
    let foodIndex = -1;
    const dataIndex = foodItemElement.getAttribute('data-food-index');
    
    if (dataIndex !== null) {
        // For existing items loaded from server
        foodIndex = parseInt(dataIndex);
    } else {
        // For dynamically added items, find the index
        const foodItems = document.querySelectorAll('.food-item');
        for (let i = 0; i < foodItems.length; i++) {
            if (foodItems[i] === foodItemElement) {
                foodIndex = i;
                break;
            }
        }
    }
    
    if (foodIndex === -1) {
        console.error('Could not find food item index');
        showFlashMessage('Error: Could not find food item', 'error');
        return;
    }
    
    try {
        // Call the delete API
        const data = await APIClient.deleteFood(foodIndex);
        console.log('Delete response data:', data);
        
        if (data.success) {
            // Update totals from server response immediately
            console.log('Updating totals with server data:', data.totals);
            updateTotals(data.totals);
            
            // Remove from DOM with animation
            foodItemElement.style.animation = 'slideOutLeft 0.3s ease-in forwards';
            setTimeout(() => {
                if (foodItemElement.parentNode) {
                    foodItemElement.remove();
                }
                
                // Update food count after DOM removal
                updateFoodCount();
                
                // Check if list is empty and show empty state
                const foodList = document.getElementById('food-list');
                const remainingFoodItems = foodList.querySelectorAll('.food-item');
                if (remainingFoodItems.length === 0) {
                    foodList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">🍽️</div>
                            <div class="empty-text">No food logged yet</div>
                            <div class="empty-subtext">Add your first meal!</div>
                        </div>
                    `;
                }
                
                showFlashMessage('Food deleted', 'info');
            }, 300);
        } else {
            showFlashMessage('Error: ' + (data.error || 'Failed to delete food'), 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showFlashMessage('Error: ' + error.message, 'error');
    }
}

// Update Food Count
function updateFoodCount() {
    const foodItems = document.querySelectorAll('.food-item');
    const logHeader = document.querySelector('.log-header h1');
    if (logHeader) {
        logHeader.textContent = `🍎 Food Log (${foodItems.length} items)`;
    }
}

// Update Totals Function
function updateTotals(totals) {
    console.log('Updating totals with:', totals);
    
    // Update calories
    const caloriesValue = document.getElementById('calories-total');
    if (caloriesValue) {
        caloriesValue.textContent = Math.round(totals.calories);
        console.log('Updated calories to:', Math.round(totals.calories));
    }
    
    // Update macros
    const proteinValue = document.getElementById('protein-total');
    const carbsValue = document.getElementById('carbs-total');
    const fatValue = document.getElementById('fat-total');
    const fiberValue = document.getElementById('fiber-total');
    
    if (proteinValue) proteinValue.textContent = `${totals.protein.toFixed(1)}g`;
    if (carbsValue) carbsValue.textContent = `${totals.carbs.toFixed(1)}g`;
    if (fatValue) fatValue.textContent = `${totals.fat.toFixed(1)}g`;
    if (fiberValue) fiberValue.textContent = `${totals.fiber.toFixed(1)}g`;
    
    // Update stats
    const foodCount = document.getElementById('food-count');
    const avgCalories = document.getElementById('avg-calories');
    
    if (foodCount) {
        const foodItems = document.querySelectorAll('.food-item');
        foodCount.textContent = foodItems.length;
    }
    
    if (avgCalories) {
        const foodItems = document.querySelectorAll('.food-item');
        const avg = foodItems.length > 0 ? Math.round(totals.calories / foodItems.length) : 0;
        avgCalories.textContent = `${avg} cal`;
    }
    
    // Update state
    currentTotals = totals;
}

// Clear Log Function
async function clearLog() {
    console.log('clearLog called');
    if (confirm('Clear all food entries?')) {
        try {
            console.log('Sending clear request');
            await APIClient.clear();
            
            // Clear the UI dynamically
            const foodList = document.getElementById('food-list');
            if (foodList) {
                foodList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🍽️</div>
                        <div class="empty-text">No food logged yet</div>
                        <div class="empty-subtext">Add your first meal!</div>
                    </div>
                `;
            }
            
            // Reset totals
            updateTotals({
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0
            });
            
            // Update food count
            updateFoodCount();
            
            showFlashMessage('Food log cleared!', 'info');
        } catch (error) {
            console.error('Clear error:', error);
            showFlashMessage('Error: ' + error.message, 'error');
        }
    }
}

// Flash Message Function
function showFlashMessage(message, type = 'info') {
    console.log('showFlashMessage:', message, type);
    
    // Remove existing flash messages
    const existingFlash = document.querySelector('.flash-message');
    if (existingFlash) {
        existingFlash.remove();
    }
    
    // Create flash message element
    const flashDiv = document.createElement('div');
    flashDiv.className = `flash-message flash-${type}`;
    flashDiv.textContent = message;
    
    // Insert at top of body
    document.body.appendChild(flashDiv);
    console.log('Flash message added to DOM');
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (flashDiv.parentNode) {
            flashDiv.remove();
            console.log('Flash message removed');
        }
    }, 3000);
}

// Theme Toggle Function
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.nav-icon');
    
    if (body.classList.contains('light-mode')) {
        // Switch to dark mode
        body.classList.remove('light-mode');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        // Switch to light mode
        body.classList.add('light-mode');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme on page load
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.nav-icon');
    
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeIcon.textContent = '☀️';
    } else {
        body.classList.remove('light-mode');
        themeIcon.textContent = '🌙';
    }
}

// Register Service Worker for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('./sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                })
                .catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
}

// Show Install Prompt for PWA
function showInstallPrompt() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button or prompt
        const installBtn = document.createElement('button');
        installBtn.textContent = 'Install App';
        installBtn.className = 'install-btn';
        installBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(102, 126, 234, 0.9);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
            backdrop-filter: blur(10px);
        `;
        
        installBtn.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
                installBtn.remove();
            });
        });
        
        document.body.appendChild(installBtn);
    });
}

// Load Progress Data
async function loadProgressData() {
    try {
        const data = await APIClient.getProgress();
        
        if (data.success) {
            updateProgressScreen(data);
        } else {
            console.error('Failed to load progress data');
        }
    } catch (error) {
        console.error('Error loading progress data:', error);
    }
}

// Update Progress Screen
function updateProgressScreen(data) {
    // Update streak
    const streakNumber = document.getElementById('streak-number');
    if (streakNumber) {
        streakNumber.textContent = data.streak;
    }
    
    // Update averages
    const avgCalories = document.getElementById('avg-calories');
    const avgProtein = document.getElementById('avg-protein');
    const avgCarbs = document.getElementById('avg-carbs');
    const avgFat = document.getElementById('avg-fat');
    
    if (avgCalories) avgCalories.textContent = Math.round(data.averages.calories);
    if (avgProtein) avgProtein.textContent = `${data.averages.protein.toFixed(1)}g`;
    if (avgCarbs) avgCarbs.textContent = `${data.averages.carbs.toFixed(1)}g`;
    if (avgFat) avgFat.textContent = `${data.averages.fat.toFixed(1)}g`;
    
    // Update daily breakdown
    updateDailyBreakdown(data.week_data);
    
    // Create chart
    createProgressChart(data.week_data);
}

// Update Daily Breakdown
function updateDailyBreakdown(weekData) {
    const dailyList = document.getElementById('daily-list');
    if (!dailyList) return;
    
    dailyList.innerHTML = '';
    
    weekData.forEach(day => {
        const dailyItem = document.createElement('div');
        dailyItem.className = 'daily-item';
        
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.getDate();
        
        dailyItem.innerHTML = `
            <div class="daily-date">${dayName} ${monthDay}</div>
            <div class="daily-totals">
                <div class="daily-calories">${Math.round(day.totals.calories)} cal</div>
                <div class="daily-macros">
                    <span class="daily-macro">🥩 ${day.totals.protein.toFixed(1)}g</span>
                    <span class="daily-macro">🍞 ${day.totals.carbs.toFixed(1)}g</span>
                    <span class="daily-macro">🥑 ${day.totals.fat.toFixed(1)}g</span>
                </div>
            </div>
        `;
        
        dailyList.appendChild(dailyItem);
    });
}

// Create Progress Chart
function createProgressChart(weekData) {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Chart settings
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Get max calories for scaling
    const maxCalories = Math.max(...weekData.map(day => day.totals.calories));
    const scale = chartHeight / maxCalories;
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw calories line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    weekData.forEach((day, index) => {
        const x = padding + (chartWidth / (weekData.length - 1)) * index;
        const y = height - padding - (day.totals.calories * scale);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = '#667eea';
    weekData.forEach((day, index) => {
        const x = padding + (chartWidth / (weekData.length - 1)) * index;
        const y = height - padding - (day.totals.calories * scale);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    
    weekData.forEach((day, index) => {
        const x = padding + (chartWidth / (weekData.length - 1)) * index;
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        ctx.fillText(dayName, x, height - 10);
    });
}

// Load initial data
async function loadInitialData() {
    try {
        // Load current totals
        const totalsData = await APIClient.getTotals();
        if (totalsData.success) {
            updateTotals(totalsData.totals);
        }
        
        // Load progress data
        await loadProgressData();
    } catch (error) {
        console.error('Error loading initial data:', error);
        showFlashMessage('Error loading data. Please check your connection.', 'error');
    }
}

// Allow Enter key to add food
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing PWA app');
    
    // Register Service Worker
    registerServiceWorker();
    
    // Show install prompt
    showInstallPrompt();
    
    // Load saved theme
    loadTheme();
    
    // Load initial data
    loadInitialData();
    
    const foodInput = document.getElementById('foodInput');
    if (foodInput) {
        console.log('Food input found, adding keypress listener');
        foodInput.addEventListener('keypress', function(e) {
            console.log('Key pressed:', e.key);
            if (e.key === 'Enter') {
                addFood();
            }
        });
    } else {
        console.error('Food input not found on DOM load');
    }
    
    // Set initial screen
    showScreen('add');
    console.log('PWA app initialized');
});
