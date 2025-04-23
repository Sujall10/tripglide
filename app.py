import os
import uuid
import json
from datetime import datetime
from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_mail import Mail, Message
from flask_cors import CORS
from dotenv import load_dotenv
import stripe
from datas import FlightsData

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.secret_key = os.environ.get('FLASK_SECRET_KEY', os.urandom(24))

# Custom JSON encoder to handle dates
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super(CustomJSONEncoder, self).default(obj)

app.json_encoder = CustomJSONEncoder

@app.route('/')
def index():
    flights_data = FlightsData()
    return render_template('index.html', locations=flights_data.get_valid_locations())

@app.route('/hotels.html')
def hotel():
    flights_data = FlightsData()
    return render_template('hotels.html', locations=flights_data.get_valid_locations())

@app.route('/index.html')
def index_back():
    flights_data = FlightsData()
    return render_template('index.html', locations=flights_data.get_valid_locations())

@app.route('/cars.html')
def cars():
    flights_data = FlightsData()
    return render_template('cars.html', locations=flights_data.get_valid_locations())

@app.route('/ping')
def ping():
    return jsonify({"status": "ok"})


# Get all locations
@app.route('/api/locations', methods=['GET'])
def get_locations():
    flights_data = FlightsData()
    return jsonify({"locations": flights_data.get_valid_locations()})

# Search flights
@app.route('/api/flights/search', methods=['GET'])
def search_flights():
    try:
        # Get query parameters
        from_location = request.args.get('from')
        to_location = request.args.get('to')
        date_str = request.args.get('date')
        direct_only = request.args.get('directOnly', 'false').lower() == 'true'
        cabin_class = request.args.get('cabinClass', 'economy').lower()
        
        # Validate required parameters
        if not from_location or not to_location:
            return jsonify({"message": "Missing required search parameters"}), 400
        
        # Use FlightsData to search for flights
        flights_data = FlightsData()
        flights = flights_data.search_flights(
            departure_airport=from_location,
            arrival_airport=to_location,
            date=date_str,
            direct_only=direct_only,
            cabin_class=cabin_class
        )
        
        return jsonify({"flights": flights})
    except Exception as e:
        print(f"Error searching flights: {e}")
        return jsonify({"message": "Server error", "error": str(e)}), 500

# Add new location (admin functionality)
@app.route('/api/locations', methods=['POST'])
def add_location():
    try:
        data = request.json
        
        # Check required fields
        required_fields = ['name', 'code', 'city', 'country']
        for field in required_fields:
            if field not in data:
                return jsonify({"message": f"Missing required field: {field}"}), 400
        
        # Use FlightsData to add a new location
        flights_data = FlightsData()
        result = flights_data.add_location(data)
        
        if result.get('error'):
            return jsonify({"message": result['error']}), 400
            
        return jsonify(result['location']), 201
    except Exception as e:
        print(f"Error creating location: {e}")
        return jsonify({"message": "Server error", "error": str(e)}), 500

# Add new flight (admin functionality)
@app.route('/api/get_flights', methods=['GET'])
def get_flights():
    print("🚀 /api/get_flights endpoint hit!")
    print("All request args:", request.args)
    try:
        dep = request.args.get('departure')
        arr = request.args.get('arrival')
        # arr_date = request.args.get('arrival_date')
        dep_date = request.args.get('depart-date')
        # direct = request.args.get('directOnly')

        query = {}
        if dep:
            query['departure_city'] = dep
        if arr:
            query['arrival_city'] = arr
        # if arr_date:
        #     query['arrival_date'] = arr_date
        if dep_date:
            try:
                query['departure_date'] = datetime.strptime(dep_date, '%Y-%m-%d')
            except ValueError:
                return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

        # if direct is not None:
        #     # assuming you have a `stops` field in your docs
        #     query['stops'] = 0 if direct.lower() == 'true' else {'$gt': 0}

        print("MongoDB query being executed:", query)
        # flights = FlightsData().get_flights(query)
        # print("Flights returned from DB:", flights)
        results = list(FlightsData().flights_collection.find(query, {'_id': 0}))
        return jsonify(results)
        
        # return jsonify({ 'flights': flights }), 200
    except Exception as e:
        print(f"Error retrieving flights: {e}")
        return jsonify({"message": "Server error", "error": str(e)}), 500


# Get a specific flight by ID
@app.route('/api/flights/<flight_id>', methods=['GET'])
def get_flight(flight_id):
    try:
        flights_data = FlightsData()
        flight = flights_data.get_flight_by_id(flight_id)
        
        if not flight:
            return jsonify({"message": "Flight not found"}), 404
            
        return jsonify(flight)
    except Exception as e:
        print(f"Error getting flight: {e}")
        return jsonify({"message": "Server error", "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)