// Netlify Function to handle Flask API endpoints
const { spawn } = require('child_process');
const path = require('path');

// In-memory storage (same as Flask app)
let foodLog = [];

// Dummy data for past days
function generateDummyData() {
    const dummyData = [];
    const baseFoods = [
        {"name": "Chicken Breast", "calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "fiber": 0},
        {"name": "Brown Rice", "calories": 111, "protein": 2.6, "carbs": 23, "fat": 0.9, "fiber": 1.8},
        {"name": "Broccoli", "calories": 34, "protein": 2.8, "carbs": 7, "fat": 0.4, "fiber": 2.6},
        {"name": "Salmon", "calories": 208, "protein": 20, "carbs": 0, "fat": 12, "fiber": 0},
        {"name": "Sweet Potato", "calories": 86, "protein": 1.6, "carbs": 20, "fat": 0.1, "fiber": 3},
        {"name": "Greek Yogurt", "calories": 100, "protein": 17, "carbs": 6, "fat": 0, "fiber": 0},
        {"name": "Almonds", "calories": 164, "protein": 6, "carbs": 6, "fat": 14, "fiber": 3.5},
        {"name": "Banana", "calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3, "fiber": 2.6},
        {"name": "Eggs", "calories": 155, "protein": 13, "carbs": 1.1, "fat": 11, "fiber": 0},
        {"name": "Oatmeal", "calories": 154, "protein": 5.3, "carbs": 27, "fat": 2.6, "fiber": 4},
        {"name": "Avocado", "calories": 160, "protein": 2, "carbs": 9, "fat": 15, "fiber": 7},
        {"name": "Quinoa", "calories": 120, "protein": 4.4, "carbs": 22, "fat": 1.9, "fiber": 2.8}
    ];
    
    for (let daysAgo = 7; daysAgo > 0; daysAgo--) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        const dayEntries = [];
        const numEntries = Math.floor(Math.random() * 4) + 3; // 3-6 entries
        
        for (let i = 0; i < numEntries; i++) {
            const food = baseFoods[Math.floor(Math.random() * baseFoods.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const grams = Math.random() > 0.5 ? Math.floor(Math.random() * 150) + 50 : 0;
            
            const entry = {
                food_name: food.name,
                grams: grams,
                quantity_items: quantity,
                raw_input: `${quantity} ${food.name.toLowerCase()}`,
                nutrition: {
                    calories: food.calories * quantity,
                    protein: food.protein * quantity,
                    carbs: food.carbs * quantity,
                    fat: food.fat * quantity,
                    fiber: food.fiber * quantity
                }
            };
            
            dayEntries.push(entry);
        }
        
        dummyData.push({
            date: date.toISOString().split('T')[0],
            entries: dayEntries
        });
    }
    
    return dummyData;
}

// Calculate totals
function calculateTotals(foodLog) {
    const totals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0
    };
    
    for (const food of foodLog) {
        if (food.nutrition) {
            totals.calories += food.nutrition.calories || 0;
            totals.protein += food.nutrition.protein || 0;
            totals.carbs += food.nutrition.carbs || 0;
            totals.fat += food.nutrition.fat || 0;
            totals.fiber += food.nutrition.fiber || 0;
        }
    }
    
    return totals;
}

// Simple nutrition database
const nutritionDB = {
    "apple": { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
    "chicken": { calories: 239, protein: 27, carbs: 0, fat: 14, fiber: 0 },
    "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
    "rice": { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
    "brown rice": { calories: 111, protein: 2.6, carbs: 23, fat: 0.9, fiber: 1.8 },
    "broccoli": { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
    "salmon": { calories: 208, protein: 20, carbs: 0, fat: 12, fiber: 0 },
    "sweet potato": { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
    "yogurt": { calories: 100, protein: 17, carbs: 6, fat: 0, fiber: 0 },
    "greek yogurt": { calories: 100, protein: 17, carbs: 6, fat: 0, fiber: 0 },
    "almonds": { calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5 },
    "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
    "eggs": { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
    "oatmeal": { calories: 154, protein: 5.3, carbs: 27, fat: 2.6, fiber: 4 },
    "avocado": { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
    "quinoa": { calories: 120, protein: 4.4, carbs: 22, fat: 1.9, fiber: 2.8 }
};

// Get nutrition data for food
function getNutritionData(foodName) {
    const normalizedName = foodName.toLowerCase().trim();
    return nutritionDB[normalizedName] || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
}

// Parse food input (simplified version)
function parseFoodInput(input) {
    const foods = [];
    const words = input.toLowerCase().split(/\s+/);
    
    // Simple parsing - look for food names
    for (const word of words) {
        if (nutritionDB[word]) {
            foods.push({
                food_name: word,
                grams: 0,
                quantity_items: 1
            });
        }
    }
    
    return foods;
}

exports.handler = async (event, context) => {
    const { httpMethod, path, body } = event;
    const pathParts = path.split('/').filter(p => p);
    
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight requests
    if (httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    try {
        // Route API calls
        if (pathParts[0] === 'api') {
            const endpoint = pathParts[1];
            
            switch (endpoint) {
                case 'totals':
                    const totals = calculateTotals(foodLog);
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            totals: totals
                        })
                    };
                
                case 'add_food':
                    if (httpMethod !== 'POST') {
                        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
                    }
                    
                    const data = JSON.parse(body);
                    const foodInput = data.input || '';
                    
                    if (!foodInput.trim()) {
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({
                                success: false,
                                message: 'Please enter some food!'
                            })
                        };
                    }
                    
                    const parsedFoods = parseFoodInput(foodInput);
                    
                    if (parsedFoods.length === 0) {
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({
                                success: false,
                                message: 'No food items found. Try: apple, chicken, rice, etc.'
                            })
                        };
                    }
                    
                    // Process each food
                    const processedFoods = [];
                    for (const food of parsedFoods) {
                        const nutrition = getNutritionData(food.food_name);
                        const processedFood = {
                            ...food,
                            nutrition: nutrition,
                            raw_input: foodInput
                        };
                        foodLog.push(processedFood);
                        processedFoods.push(processedFood);
                    }
                    
                    const newTotals = calculateTotals(foodLog);
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            foods: processedFoods,
                            totals: newTotals
                        })
                    };
                
                case 'delete_food':
                    if (httpMethod !== 'POST') {
                        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
                    }
                    
                    const deleteData = JSON.parse(body);
                    const index = deleteData.index;
                    
                    if (index >= 0 && index < foodLog.length) {
                        foodLog.splice(index, 1);
                        const newTotals = calculateTotals(foodLog);
                        
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({
                                success: true,
                                totals: newTotals
                            })
                        };
                    } else {
                        return {
                            statusCode: 400,
                            headers,
                            body: JSON.stringify({
                                success: false,
                                error: 'Invalid food index'
                            })
                        };
                    }
                
                case 'clear':
                    if (httpMethod !== 'POST') {
                        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
                    }
                    
                    foodLog = [];
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'Food log cleared'
                        })
                    };
                
                case 'progress':
                    const weekData = generateDummyData();
                    const averages = {
                        calories: 0,
                        protein: 0,
                        carbs: 0,
                        fat: 0
                    };
                    
                    // Calculate averages
                    for (const day of weekData) {
                        const dayTotals = calculateTotals(day.entries);
                        averages.calories += dayTotals.calories;
                        averages.protein += dayTotals.protein;
                        averages.carbs += dayTotals.carbs;
                        averages.fat += dayTotals.fat;
                    }
                    
                    const days = weekData.length;
                    averages.calories = averages.calories / days;
                    averages.protein = averages.protein / days;
                    averages.carbs = averages.carbs / days;
                    averages.fat = averages.fat / days;
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            streak: Math.floor(Math.random() * 30) + 1,
                            averages: averages,
                            week_data: weekData.map(day => ({
                                date: day.date,
                                totals: calculateTotals(day.entries)
                            }))
                        })
                    };
                
                default:
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ error: 'Endpoint not found' })
                    };
            }
        }
        
        // Default response
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Not found' })
        };
        
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
