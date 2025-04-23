import os
from datetime import datetime, timedelta
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
mongo_uri = os.getenv('url')

class FlightsData:
    def __init__(self):
        """Initialize MongoDB connection and collections"""
        self.client = MongoClient(mongo_uri)
        self.db = self.client.get_database('FlightsData')
        
        # Collections
        self.locations_collection = self.db.Location
        self.flights_collection = self.db.Schedule_datas
    
    def get_valid_locations(self):
        """Return a list of all location names"""
        try:
            # Get all locations and sort by name
            locations = list(self.locations_collection.find().sort('name', 1))
            # Return just the location names
            return [loc['City'] for loc in locations]
        except Exception as e:
            print(f"Error loading locations: {e}")
            return []
    
    def add_location(self, location_data):
        """Add a new location to the database"""
        try:
            # Check if location already exists
            existing = self.locations_collection.find_one({
                "$or": [{"name": location_data['name']}, {"code": location_data['code']}]
            })
            
            if existing:
                return {'error': 'Location already exists'}
            
            # Create new location document
            new_location = {
                "name": location_data['name'],
                "code": location_data['code'],
                "city": location_data['city'],
                "country": location_data['country'],
                "airport": location_data.get('airport', ''),
                "terminals": location_data.get('terminals', ['T1']),
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            # Insert into database
            result = self.locations_collection.insert_one(new_location)
            
            # Get the created location
            created_location = self.locations_collection.find_one({"_id": result.inserted_id})
            
            # Convert ObjectId to string for JSON serialization
            created_location['_id'] = str(created_location['_id'])
            
            return {'location': created_location}
        except Exception as e:
            print(f"Error adding location: {e}")
            return {'error': str(e)}
    
    def search_flights(self, departure_airport, arrival_airport, date_str=None, direct_only=False, cabin_class='economy'):
        """Search for flights based on criteria"""
        try:
            # Base query (airports only)
            query = {
                "departure.airport": departure_airport,
                "arrival.airport": arrival_airport
            }

            # If a date is provided, parse and add a 24-hour range filter
            if date_str:
                try:
                    search_date = datetime.strptime(date_str, "%Y-%m-%d")
                    next_day = search_date + timedelta(days=1)
                    query["departure.date"] = {
                        "$gte": search_date,
                        "$lt": next_day
                    }
                except ValueError:
                    print(f"Invalid date format: {date_str}")

            # Add cabin class filter if provided and not 'all'
            if cabin_class and cabin_class.lower() != 'all':
                query["category"] = cabin_class.lower()

            # Add direct flights filter if requested
            if direct_only:
                query["stops"] = 0

            # Execute query, sort by price
            flights = list(self.flights_collection.find(query).sort("price", 1))

            # Convert all ObjectIds to strings before returning
            for f in flights:
                f['_id'] = str(f['_id'])

            return flights

        except Exception as e:
            print(f"Error searching flights: {e}")
            return []
    
    def get_flights(self, filters=None):
        """Get flights based on filters"""
        query = filters if filters else {}
        print("MongoDB query being executed:", query)
        return list(self.flights_collection.find(query, {'_id': 0}))

    def add_flight(self, flight_data):
        """Add a new flight to the database"""
        try:
            # Create new flight document
            new_flight = {
                "airline": flight_data['airline'],
                "airlineCode": flight_data['airlineCode'],
                "flightNumber": flight_data['flightNumber'],
                "departure": flight_data['departure'],
                "arrival": flight_data['arrival'],
                "duration": flight_data.get('duration', ''),
                "stops": flight_data.get('stops', 0),
                "stopDetails": flight_data.get('stopDetails', ''),
                "price": flight_data['price'],
                "category": flight_data.get('category', 'economy'),
                "available": flight_data['available'],
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            # Insert into database
            result = self.flights_collection.insert_one(new_flight)
            
            # Get the created flight
            created_flight = self.flights_collection.find_one({"_id": result.inserted_id})
            
            # Convert ObjectId to string for JSON serialization
            created_flight['_id'] = str(created_flight['_id'])
            
            return {'flight': created_flight}
        except Exception as e:
            print(f"Error adding flight: {e}")
            return {'error': str(e)}
    
    def get_flight_by_id(self, flight_id):
        """Get a specific flight by ID"""
        try:
            # Convert string ID to ObjectId if necessary
            if isinstance(flight_id, str):
                flight_id = ObjectId(flight_id)
                
            flight = self.flights_collection.find_one({"_id": flight_id})
            
            if flight:
                # Convert ObjectId to string for JSON serialization
                flight['_id'] = str(flight['_id'])
                return flight
            else:
                return None
        except Exception as e:
            print(f"Error getting flight: {e}")
            return None
    
    def get_location_by_name(self, location_name):
        """Get a specific location by name"""
        try:
            location = self.locations_collection.find_one({"name": location_name})
            
            if location:
                # Convert ObjectId to string for JSON serialization
                location['_id'] = str(location['_id'])
                return location
            else:
                return None
        except Exception as e:
            print(f"Error getting location: {e}")
            return None
