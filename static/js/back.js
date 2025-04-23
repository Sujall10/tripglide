document.addEventListener('DOMContentLoaded', () => {
    // Store DOM references after the document is loaded
    const locationFromSelect = document.getElementById('location-from');
    const locationToSelect = document.getElementById('location-to');
    const userForm = document.querySelector('.flight-search-section .search-box');
    const directFlightsCheckbox = document.getElementById('direct-flights');
    const addNearbyBtn = document.querySelector('.add-nearby');
    const searchFlightsBtn = document.getElementById('search-flights-btn');
    const resultsPage = document.getElementById('results-page');
    const modifySearchBtn = document.getElementById('modify-search-btn');
    const resultsListContainer = document.getElementById('results-list');
    const departure = document.getElementById("location-from")?.value;
    const arrival = document.getElementById("location-to").value;
    const date = document.getElementById("depart-date").value;
    
    // Store all locations for later use
    let allLocations = [];
    let availableFlights = [];
    
    // Initialize the page
    if (locationFromSelect && locationToSelect) {
        fetchLocations();
        
        // Trigger update whenever "From" changes
        locationFromSelect.addEventListener('change', updateToOptions);
    } else {
        console.error('Location dropdowns not found in the DOM');
    }
    
    // Add nearby airports button
    if (addNearbyBtn) {
        addNearbyBtn.addEventListener('click', function() {
            // Toggle a class or state for nearby airports
            this.classList.toggle('active');
            // Logic to add nearby airports would go here
            console.log('Add nearby airports toggled');
        });
    }
    
    // Set up form submission handler
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!locationFromSelect || !locationToSelect) {
                console.error('Form elements not found');
                return;
            }
            
            const locationFrom = locationFromSelect.value;
            const locationTo = locationToSelect.value;
            
            if (!locationFrom || !locationTo) {
                showError('step1Error', 'Please select both departure and arrival locations');
                return;
            }
            
            if (locationFrom === locationTo) {
                showError('step1Error', 'Departure and arrival locations must be different');
                return;
            }
            
            hideError('step1Error');
            
            // Show loader and search for flights
            showLoader('searchLoader');
            
            // Get additional form data (these would be actual form elements in your HTML)
            const directOnly = directFlightsCheckbox ? directFlightsCheckbox.checked : false;
            
            // In a real app, you'd get these from your form
            const dateFrom = '20 Apr';
            const dateTo = '27 Apr';
            const passengers = '1 adult';
            const cabinClass = 'Economy';
            
            // Search for flights
            searchFlights(locationFrom, locationTo, directOnly, dateFrom, dateTo, passengers, cabinClass);
        });
    } else {
        console.error('Search form not found in the DOM');
    }
    
    // Set up modify search button
    if (modifySearchBtn) {
        modifySearchBtn.addEventListener('click', function() {
            // Hide results page and show search page
            if (resultsPage) {
                resultsPage.classList.add('hidden-page');
            }
            
            // Show the search form (assuming it has an ID)
            const searchPage = document.getElementById('search-page');
            if (searchPage) {
                searchPage.classList.remove('hidden-page');
            }
        });
    }
    
    // Set up filter and sort buttons
    setupFilterButtons();
    setupSortButtons();
    
    // Function to update "To" options based on "From" selection
    function updateToOptions() {
        if (!locationFromSelect || !locationToSelect || allLocations.length === 0) {
            return;
        }
        
        const selectedFrom = locationFromSelect.value;
        
        // Clear and rebuild the "To" dropdown
        // Keep the default option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.text = "-- Arrival --";
        
        locationToSelect.innerHTML = '';
        locationToSelect.appendChild(defaultOption);
        
        allLocations.forEach(loc => {
            if (loc.value !== selectedFrom && loc.value !== "") {
                const option = document.createElement('option');
                option.value = loc.value;
                option.text = loc.text;
                locationToSelect.appendChild(option);
            }
        });
    }
    
    // Function to fetch locations from API
    function fetchLocations() {
        showLoader('step1Loader');
        
        fetch('/api/locations')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                hideLoader('step1Loader');
                
                // More flexible data handling
                const locations = data.locations || data; // Handle both formats
                if (Array.isArray(locations)) {
                    populateLocationDropdowns(locations);
                } else {
                    throw new Error('Invalid data format - expected array');
                }
            })
            .catch(error => {
                hideLoader('step1Loader');
                showError('step1Error', 'Failed to load locations: ' + error.message);
                console.error('Error fetching locations:', error);
            });
    }
    
    // Function to populate location dropdowns
    function populateLocationDropdowns(locations) {
        if (!locationFromSelect || !locationToSelect) {
            console.error('Location dropdowns not available');
            return;
        }
        
        // Clear existing options
        locationFromSelect.innerHTML = '';
        locationToSelect.innerHTML = '';
        
        // Add default options
        const defaultOptionFrom = document.createElement('option');
        defaultOptionFrom.value = "";
        defaultOptionFrom.textContent = "-- Departure --";
        locationFromSelect.appendChild(defaultOptionFrom);
        
        const defaultOptionTo = document.createElement('option');
        defaultOptionTo.value = "";
        defaultOptionTo.textContent = "-- Arrival --";
        locationToSelect.appendChild(defaultOptionTo);
        
        // Add location options
        locations.forEach(location => {
            if (location) {  // Only add non-empty locations
                const optionFrom = document.createElement('option');
                optionFrom.value = location;
                optionFrom.textContent = location;
                locationFromSelect.appendChild(optionFrom);
                
                const optionTo = document.createElement('option');
                optionTo.value = location;
                optionTo.textContent = location;
                locationToSelect.appendChild(optionTo);
            }
        });
        
        // Store all locations for later use
        allLocations = Array.from(locationToSelect.options).map(opt => ({
            value: opt.value,
            text: opt.text
        }));
    }

    // Initialize Select2 after populating dropdowns
$(document).ready(function() {
    $('#location-from').select2({
        placeholder: '-- Departure --',
        width: '100%'
    });
    $('#location-to').select2({
        placeholder: '-- Arrival --',
        width: '100%'
    });
});
    // Function to search for flights
    function searchFlights(from, to, directOnly, dateFrom, dateTo, passengers, cabinClass) {
        // In a real app, this would be an API call
        // For demonstration, we'll simulate an API call with setTimeout
        setTimeout(() => {
            hideLoader('searchLoader');
            
            // Update the results page with the search parameters
            updateSearchSummary(from, to, `${dateFrom} - ${dateTo}`, passengers, cabinClass);
            
            // Fetch available flights (using the get_flights API)
            fetchAvailableFlights(from, to, directOnly);
            
            // Show the results page
            if (resultsPage) {
                // Hide the search page
                const searchPage = document.getElementById('search-page');
                if (searchPage) {
                    searchPage.classList.add('hidden-page');
                }
                
                resultsPage.classList.remove('hidden-page');
            }
        }, 1000); // Simulate a 1 second API call
    }
    
    // Function to fetch available flights from the database (using the get_flights API)
   // Function to fetch available flights from the database
   // Function to fetch available flights
function fetchAvailableFlights(from, to) {
    showLoader('searchLoader');

    const departDate = document.getElementById('depart-date')?.value;
    
    // Make sure parameters match your API's expected format
    const params = new URLSearchParams({
        departure: from,
        arrival: to,
        'depart-date': departDate  // Note the hyphen to match your API
    });

    fetch(`http://127.0.0.1:5000/api/get_flights?${params}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            hideLoader('searchLoader');
            
            // Debug: log the API response
            console.log("API Response:", data);
            
            // Handle different response formats
            const flights = data.flights || data.data || data;
            
            if (!Array.isArray(flights)) {
                throw new Error('Invalid flight data format - expected array');
            }
            
            renderFlights(flights);
        })
        .catch(err => {
            hideLoader('searchLoader');
            showError('step1Error', 'Failed to load flights: ' + err.message);
            console.error('Error fetching flights:', err);
        });
}

// Function to render flights
function renderFlights(flights) {
    const resultsListContainer = document.getElementById('results-list');
    
    if (!resultsListContainer) {
        console.error('Results list container not found');
        return;
    }
    
    // Clear previous results
    resultsListContainer.innerHTML = '';
    
    if (!flights || flights.length === 0) {
        resultsListContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-circle"></i>
                <h3>No flights found</h3>
                <p>Try different dates or nearby airports</p>
            </div>
        `;
        return;
    }
    
    // Create flight cards for each result
    flights.forEach(flight => {
        const flightCard = document.createElement('div');
        flightCard.className = 'flight-card';
        
        // Format flight data (with fallbacks for missing data)
        const airline = flight.flight_agency || flight.airline || 'Unknown Airline';
        const flightNumber = flight.flight_number || 'N/A';
        const departureTime = flight.departure_time || '--:--';
        const arrivalTime = flight.arrival_time || '--:--';
        const price = flight.flight_price ? `₹${flight.flight_price.toFixed(2)}` : 'Price not available';
        const duration = flight.flight_duration || 'N/A';
        const stops = flight.stops || 0;
        
        flightCard.innerHTML = `
            <div class="flight-details">
                <div class="airline-info">
                    <div class="airline-logo">${airline.charAt(0)}</div>
                    <div class="airline-name">${airline}</div>
                    <div class="flight-number">${flightNumber}</div>
                </div>
                <div class="schedule">
                    <div class="departure">
                        <div class="time">${departureTime}</div>
                        <div class="airport">${flight.departure || 'Unknown'}</div>
                    </div>
                    <div class="duration">
                        <div class="flight-path">
                            <div class="stops">${stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}</div>
                        </div>
                        <div class="duration-text">${duration}</div>
                    </div>
                    <div class="arrival">
                        <div class="time">${arrivalTime}</div>
                        <div class="airport">${flight.arrival || 'Unknown'}</div>
                    </div>
                </div>
                <div class="price-info">
                    <div class="price">${price}</div>
                    <button class="book-btn">Book Now</button>
                </div>
            </div>
        `;
        
        resultsListContainer.appendChild(flightCard);
    });
}

    
    // Function to render flights in the results list
    function renderFlights(flights) {
        if (!resultsListContainer) {
            console.error('Results list container not found');
            return;
        }
        
        // Clear existing results
        resultsListContainer.innerHTML = '';
        
        if (flights.length === 0) {
            resultsListContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>No flights found</h3>
                    <p>Try adjusting your search criteria or dates</p>
                </div>
            `;
            return;
        }
        
        // Create flight cards
        flights.forEach(flight => {
            const flightCard = document.createElement('div');
            flightCard.className = 'flight-card';
            flightCard.setAttribute('data-flight-id', flight.id);
            
            // Format the flight details
            const stopsDisplay = flight.stops === 0 
                ? '<span class="direct-badge">Direct</span>' 
                : `<span class="stops-badge">${flight.stops} stop</span>`;
            
                flightCard.innerHTML = `
                <div class="flight-details">
                    <div class="airline-info">
                        <div class="airline-logo">${flight.flight_agency?.charAt(0) || ''}</div>
                        <div class="airline-name">${flight.flight_agency || 'Not available'}</div>
                        <div class="flight-number">${flight.flight_number || 'N/A'}</div>
                    </div>
                    <div class="schedule">
                        <div class="departure">
                            <div class="time">${flight.departure_time || '--:--'}</div>
                            <div class="airport">${flight.departure || 'Unknown airport'}</div>
                            <div class="city">${flight.departure_city || 'Unknown city'}</div>
                        </div>
                        <div class="arrival">
                            <div class="time">${flight.arrival_time || '--:--'}</div>
                            <div class="airport">${flight.arrival || 'Unknown airport'}</div>
                            <div class="city">${flight.arrival_city || 'Unknown city'}</div>
                        </div>
                    </div>
                    <div class="price-info">
                        <div class="price">₹${flight.flight_price?.toFixed(2) || '0.00'}</div>
                        <div class="duration">${flight.flight_duration || 'N/A'}</div>
                    </div>
                </div>
            `;
            
            // Append the flight card to the results list
            resultsListContainer.appendChild(flightCard);
        });
    }
    
    // Helper functions
    function showLoader(loaderId) {
        const loader = document.getElementById(loaderId);
        if (loader) {
            loader.classList.remove('hidden');
        }
    }
    
    function hideLoader(loaderId) {
        const loader = document.getElementById(loaderId);
        if (loader) {
            loader.classList.add('hidden');
        }
    }
    
    function showError(errorId, message) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }
    
    function hideError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    }
    
    function updateSearchSummary(from, to, dates, passengers, cabinClass) {
        const summaryContainer = document.getElementById('search-summary');
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <p><strong>From:</strong> ${from}</p>
                <p><strong>To:</strong> ${to}</p>
                <p><strong>Dates:</strong> ${dates}</p>
                <p><strong>Passengers:</strong> ${passengers}</p>
                <p><strong>Class:</strong> ${cabinClass}</p>
            `;
        }
    }
});
