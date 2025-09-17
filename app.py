from flask import Flask, render_template, request, jsonify, send_from_directory, send_file
from flask_cors import CORS
import json
from openai import OpenAI
from dotenv import load_dotenv
import os
import asyncio
import aiohttp

load_dotenv()

app = Flask(__name__, static_folder='pwa', static_url_path='')
CORS(app)  # Enable CORS for all routes

# Simple in-memory storage
food_log = []

# Dummy data for past days
import datetime
from random import randint, choice

def generate_dummy_data():
    """Generate dummy nutrition data for the past 7 days"""
    dummy_data = []
    base_foods = [
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
    ]
    
    for days_ago in range(7, 0, -1):
        date = datetime.datetime.now() - datetime.timedelta(days=days_ago)
        day_entries = []
        
        # Generate 3-6 food entries per day
        num_entries = randint(3, 6)
        for _ in range(num_entries):
            food = choice(base_foods)
            quantity = randint(1, 3)
            
            grams = randint(50, 200) if randint(0, 1) else 0
            entry = {
                'food_name': food['name'],
                'grams': grams,
                'quantity_items': quantity if grams == 0 else 0,
                'raw_input': f"{quantity} {food['name'].lower()}",
                'nutrition': {
                    'calories': food['calories'] * quantity,
                    'protein': food['protein'] * quantity,
                    'carbs': food['carbs'] * quantity,
                    'fat': food['fat'] * quantity,
                    'fiber': food['fiber'] * quantity
                },
                'date': date.strftime('%Y-%m-%d'),
                'timestamp': date.isoformat()
            }
            day_entries.append(entry)
        
        dummy_data.extend(day_entries)
    
    return dummy_data

# Initialize with dummy data
food_log = generate_dummy_data()

# OpenAI client (you'll initialize this)
my_client = OpenAI()

async def get_nutrition_data(food_name, grams, quantity_items):
    """Get nutrition data for a food item using OpenAI"""
    if not my_client:
        return {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fat': 0,
            'fiber': 0
        }
    
    # Calculate total grams for nutrition lookup
    total_grams = grams if grams > 0 else (quantity_items * 100)  # Estimate 100g per item if no weight
    
    prompt = f"""
    Provide nutrition data for this food item. Return ONLY a JSON object with these exact fields:
    
    Food: {food_name}
    Amount: {total_grams}g
    
    Return this JSON structure:
    {{
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number
    }}
    
    Values should be per {total_grams}g of {food_name}.
    Only return the JSON object, no other text.
    """
    
    try:
        response = my_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a nutrition assistant. Provide accurate nutrition data in JSON format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=200
        )
        
        content = response.choices[0].message.content.strip()
        
        # Extract JSON from response
        try:
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = content[start_idx:end_idx]
                nutrition = json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")
                
        except (json.JSONDecodeError, ValueError) as e:
            return {
                'calories': 0,
                'protein': 0,
                'carbs': 0,
                'fat': 0,
                'fiber': 0
            }
        
        return nutrition
        
    except Exception as e:
        return {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fat': 0,
            'fiber': 0
        }

def parse_food_input(text):
    """Parse natural language food input using OpenAI API"""
    if not my_client:
        return {
            'error': 'OpenAI client not initialized',
            'foods': []
        }
    
    prompt = f"""
    Parse the following input and extract food items. Be permissive with food items but reject obvious non-food items.
    
    Input: "{text}"
    
    EXTRACT FOOD ITEMS:
    - Fruits: banana, apple, orange, etc.
    - Vegetables: carrot, broccoli, spinach, etc.
    - Meats: chicken, beef, fish, etc.
    - Grains: rice, bread, pasta, etc.
    - Dairy: milk, cheese, yogurt, etc.
    - Drinks: water, juice, coffee, etc.
    - Snacks: chips, cookies, nuts, etc.
    - Meals: pizza, burger, salad, etc.
    
    IGNORE NON-FOOD ITEMS:
    - Games: pokemon, mario, etc.
    - Movies: star wars, etc.
    - Books: harry potter, etc.
    - People: john, mary, etc.
    - Places: paris, new york, etc.
    - Objects: car, phone, etc.
    - Animals: dog, cat (unless it's food like "chicken")
    
    Return a JSON array of food objects with this exact structure:
    [
        {{
            "food_name": "clean food name",
            "grams": number,  // weight in grams (0 if not applicable)
            "quantity_items": number  // count of items (0 if not applicable)
        }}
    ]
    
    Food parsing rules:
    - Prefer grams for weight-based foods (meat, vegetables, liquids)
    - Use quantity_items for discrete items (apples, sandwiches, slices)
    - Convert all weights to grams (kg*1000, oz*28.35, lb*453.6)
    - If both weight and count apply, use the more appropriate one
    - Extract ALL food items mentioned in the input
    
    Examples:
    - "banana" -> [{{"food_name": "banana", "grams": 0, "quantity_items": 1}}]
    - "2 apples" -> [{{"food_name": "apples", "grams": 0, "quantity_items": 2}}]
    - "200g chicken breast" -> [{{"food_name": "chicken breast", "grams": 200, "quantity_items": 0}}]
    - "pokemon" -> []
    - "I played pokemon and ate 1 banana" -> [{{"food_name": "banana", "grams": 0, "quantity_items": 1}}]
    - "1 big mac and 500ml coke" -> [{{"food_name": "big mac", "grams": 0, "quantity_items": 1}}, {{"food_name": "coke", "grams": 500, "quantity_items": 0}}]
    
    Only return the JSON array, no other text.
    """
    
    try:
        response = my_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a food parsing assistant. Parse food inputs into structured JSON arrays."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=500
        )
        
        content = response.choices[0].message.content.strip()
        print(f"🤖 AI Response for '{text}': {content}")
        
        # Extract JSON array from response
        try:
            start_idx = content.find('[')
            end_idx = content.rfind(']') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = content[start_idx:end_idx]
                foods = json.loads(json_str)
                print(f"✅ Parsed foods: {foods}")
            else:
                raise ValueError("No JSON array found in response")
                
        except (json.JSONDecodeError, ValueError) as e:
            print(f"❌ JSON Parse Error: {str(e)}")
            return {
                'error': f"Failed to parse JSON: {str(e)}",
                'foods': []
            }
        
        return {
            'foods': foods,
            'raw_input': text
        }
        
    except Exception as e:
        print(f"❌ OpenAI API Error: {str(e)}")
        return {
            'error': f"API call failed: {str(e)}",
            'foods': []
        }

def calculate_totals():
    """Calculate total calories and macros for all foods"""
    totals = {
        'calories': 0,
        'protein': 0,
        'carbs': 0,
        'fat': 0,
        'fiber': 0
    }
    
    for food in food_log:
        if 'nutrition' in food:
            nutrition = food['nutrition']
            totals['calories'] += nutrition.get('calories', 0)
            totals['protein'] += nutrition.get('protein', 0)
            totals['carbs'] += nutrition.get('carbs', 0)
            totals['fat'] += nutrition.get('fat', 0)
            totals['fiber'] += nutrition.get('fiber', 0)
    
    return totals

@app.route('/')
def home():
    """Serve the PWA from the root"""
    return send_file('pwa/index.html')

@app.route('/<path:filename>')
def serve_pwa_files(filename):
    """Serve PWA static files"""
    return send_from_directory('pwa', filename)

@app.route('/api/add_food', methods=['POST'])
def add_food():
    data = request.get_json()
    food_input = data.get('input', '').strip()
    
    print(f"🍽️ Received food input: '{food_input}'")
    
    if not food_input:
        print("❌ No input provided")
        return jsonify({'error': 'No input provided'}), 400
    
    result = parse_food_input(food_input)
    print(f"📝 Parse result: {result}")
    
    if 'error' in result:
        print(f"❌ Parse error: {result['error']}")
        return jsonify({'error': result['error']}), 500
    
    # Check if no food items were extracted
    if not result['foods'] or len(result['foods']) == 0:
        print("⚠️ No food items extracted")
        return jsonify({
            'success': False,
            'message': 'No food items extracted. Please enter actual food or drinks.',
            'foods': [],
            'total_items': len(food_log)
        }), 400
    
    # Add each food item to the log with nutrition data
    for food in result['foods']:
        print(f"🥗 Processing food: {food}")
        
        # Get nutrition data asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        nutrition = loop.run_until_complete(get_nutrition_data(
            food['food_name'], 
            food['grams'], 
            food['quantity_items']
        ))
        loop.close()
        
        print(f"🍎 Nutrition data: {nutrition}")
        
        food_log.append({
            'food_name': food['food_name'],
            'grams': food['grams'],
            'quantity_items': food['quantity_items'],
            'raw_input': result['raw_input'],
            'nutrition': nutrition
        })
    
    # Calculate totals
    totals = calculate_totals()
    print(f"📊 New totals: {totals}")
    
    response = jsonify({
        'success': True,
        'foods': result['foods'],
        'total_items': len(food_log),
        'totals': totals
    })
    
    # Add cache-busting headers to prevent 304 responses
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

@app.route('/api/delete_food', methods=['POST'])
def delete_food():
    data = request.get_json()
    food_index = data.get('index')
    
    if food_index is None or food_index < 0 or food_index >= len(food_log):
        return jsonify({'error': 'Invalid food index'}), 400
    
    # Remove the food item
    deleted_food = food_log.pop(food_index)
    
    # Calculate new totals
    totals = calculate_totals()
    
    response = jsonify({
        'success': True, 
        'message': 'Food deleted',
        'totals': totals,
        'total_items': len(food_log)
    })
    
    # Add cache-busting headers
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

@app.route('/api/progress', methods=['GET'])
def get_progress_data():
    """Get progress data for the past 7 days"""
    today = datetime.datetime.now().date()
    week_data = []
    
    for days_ago in range(7, 0, -1):
        date = today - datetime.timedelta(days=days_ago)
        date_str = date.strftime('%Y-%m-%d')
        
        # Get all entries for this date
        day_entries = [entry for entry in food_log if entry.get('date') == date_str]
        
        # Calculate totals for the day
        day_totals = {
            'calories': sum(entry['nutrition']['calories'] for entry in day_entries),
            'protein': sum(entry['nutrition']['protein'] for entry in day_entries),
            'carbs': sum(entry['nutrition']['carbs'] for entry in day_entries),
            'fat': sum(entry['nutrition']['fat'] for entry in day_entries),
            'fiber': sum(entry['nutrition']['fiber'] for entry in day_entries)
        }
        
        week_data.append({
            'date': date_str,
            'day_name': date.strftime('%A'),
            'totals': day_totals,
            'food_count': len(day_entries)
        })
    
    # Calculate averages and trends
    avg_calories = sum(day['totals']['calories'] for day in week_data) / len(week_data)
    avg_protein = sum(day['totals']['protein'] for day in week_data) / len(week_data)
    avg_carbs = sum(day['totals']['carbs'] for day in week_data) / len(week_data)
    avg_fat = sum(day['totals']['fat'] for day in week_data) / len(week_data)
    
    # Calculate streak (consecutive days with entries)
    streak = 0
    for day in reversed(week_data):
        if day['food_count'] > 0:
            streak += 1
        else:
            break
    
    response = jsonify({
        'success': True,
        'week_data': week_data,
        'averages': {
            'calories': round(avg_calories, 1),
            'protein': round(avg_protein, 1),
            'carbs': round(avg_carbs, 1),
            'fat': round(avg_fat, 1)
        },
        'streak': streak,
        'total_days': len(week_data)
    })
    
    # Add cache-busting headers
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

@app.route('/api/clear', methods=['POST'])
def clear_log():
    global food_log
    food_log = []
    
    response = jsonify({'success': True, 'message': 'Food log cleared'})
    
    # Add cache-busting headers
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

@app.route('/api/totals', methods=['GET'])
def get_totals():
    """Get current daily totals"""
    totals = calculate_totals()
    
    response = jsonify({
        'success': True,
        'totals': totals
    })
    
    # Add cache-busting headers
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
