// Document ready handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the trending and deals grids
    initializeTrendingGrid();
    initializeDealsGrid();
    
    // Set up event listeners
    setupEventListeners();
});
// Tab navigation
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Get the tab type
        const tabType = this.getAttribute('data-tab');
        
        // Handle navigation based on tab type
        if (tabType === 'hotels') {
            window.location.href = 'hotels.html';
        } else if (tabType === 'cars') {
            // You would add car hire page navigation here
            console.log('Navigate to car hire page');
        }
        // Flights tab is already on the current page
    });
});
// Set up all event listeners
function setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Trip type selection
    document.querySelectorAll('.trip-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.trip-option').forEach(o => o.classList.remove('active'));
            this.classList.add('active');
            
            // Hide/show return field based on trip type
            const returnField = document.querySelector('.return-field');
            if (this.dataset.trip === 'one-way') {
                returnField.style.display = 'none';
            } else {
                returnField.style.display = 'block';
            }
        });
    });
    
    // Location swap button
    document.getElementById('swap-locations').addEventListener('click', function() {
        const fromInput = document.getElementById('from-input');
        const toInput = document.getElementById('to-input');
        const tempValue = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = tempValue;
        
        // Add a rotation animation
        this.style.transform = 'translate(-50%, -50%) rotate(180deg)';
        setTimeout(() => {
            this.style.transform = 'translate(-50%, -50%) rotate(0deg)';
        }, 300);
    });
    
    // Passengers dropdown
    const passengersField = document.querySelector('.passengers-field');
    const passengerInput = document.getElementById('passenger-input');
    
    passengerInput.addEventListener('click', function() {
        passengersField.classList.toggle('active');
    });
    
    // Close passengers dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!passengersField.contains(event.target)) {
            passengersField.classList.remove('active');
        }
    });
    
    // Passenger count buttons
    document.querySelectorAll('.passenger-minus, .passenger-plus').forEach(button => {
        button.addEventListener('click', function() {
            const type = this.dataset.type;
            const countElement = document.getElementById(`${type}-count`);
            let count = parseInt(countElement.innerText);
            
            if (this.classList.contains('passenger-plus')) {
                // Don't allow more than 9 of each type
                if (count < 9) count++;
            } else {
                // Don't allow less than 0, and always keep at least 1 adult
                if (count > 0 && !(type === 'adult' && count === 1)) count--;
            }
            
            countElement.innerText = count;
            updatePassengerSummary();
        });
    });
    
    // Done button in passengers dropdown
    document.querySelector('.done-btn').addEventListener('click', function() {
        passengersField.classList.remove('active');
    });
    
    // Search flights button
    document.getElementById('search-flights-btn').addEventListener('click', function() {
        // Hide main page and show results page
        document.getElementById('main-page').classList.remove('active-page');
        document.getElementById('main-page').classList.add('hidden-page');
        
        document.getElementById('results-page').classList.remove('hidden-page');
        document.getElementById('results-page').classList.add('active-page');
        
        // Update the search summary
        updateSearchSummary();
        
        // Generate mock search results
        generateSearchResults();
    });
    
    // Modify search button
    document.getElementById('modify-search-btn').addEventListener('click', function() {
        // Hide results page and show main page
        document.getElementById('results-page').classList.remove('active-page');
        document.getElementById('results-page').classList.add('hidden-page');
        
        document.getElementById('main-page').classList.remove('hidden-page');
        document.getElementById('main-page').classList.add('active-page');
    });
    
    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Re-sort and regenerate results
            generateSearchResults(this.dataset.sort);
        });
    });
}

// Update passenger summary text
function updatePassengerSummary() {
    const adultCount = parseInt(document.getElementById('adult-count').innerText);
    const childCount = parseInt(document.getElementById('child-count').innerText);
    const infantCount = parseInt(document.getElementById('infant-count').innerText);
    
    let summary = `${adultCount} adult${adultCount !== 1 ? 's' : ''}`;
    
    if (childCount > 0) {
        summary += `, ${childCount} child${childCount !== 1 ? 'ren' : ''}`;
    }
    
    if (infantCount > 0) {
        summary += `, ${infantCount} infant${infantCount !== 1 ? 's' : ''}`;
    }
    
    document.getElementById('passenger-input').value = summary;
}

// Update search summary on results page
function updateSearchSummary() {
    const fromLocation = document.getElementById('from-input').value || 'Any';
    const toLocation = document.getElementById('to-input').value || 'Any';
    
    // Extract city names without airport codes
    const fromCity = fromLocation.includes('(') ? fromLocation.split('(')[0].trim() : fromLocation;
    const toCity = toLocation.includes('(') ? toLocation.split('(')[0].trim() : toLocation;
    
    document.getElementById('route-display').innerText = `${fromCity} to ${toCity}`;
    
    const departDate = document.getElementById('depart-date').value;
    const returnDate = document.getElementById('return-date').value;
    
    let dateDisplay = 'Any dates';
    if (departDate) {
        const departFormatted = new Date(departDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        dateDisplay = departFormatted;
        
        if (returnDate) {
            const returnFormatted = new Date(returnDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
            dateDisplay += ` - ${returnFormatted}`;
        }
    }
    
    document.getElementById('date-display').innerText = dateDisplay;
    document.getElementById('passengers-display').innerText = document.getElementById('passenger-input').value;
    document.getElementById('cabin-display').innerText = document.getElementById('cabin-class').value;
}

// Initialize trending destinations grid
function initializeTrendingGrid() {
    const trendingGrid = document.getElementById('trending-grid');
    
    const destinations = [
        { city: 'Bali', country: 'Indonesia', image: '/api/placeholder/300/200', bestTime: 'May - September' },
        { city: 'New York', country: 'United States', image: '/api/placeholder/300/200', bestTime: 'April - June, September - November' },
        { city: 'Paris', country: 'France', image: '/api/placeholder/300/200', bestTime: 'April - October' },
        { city: 'Tokyo', country: 'Japan', image: '/api/placeholder/300/200', bestTime: 'March - May, September - November' }
    ];
    
    destinations.forEach(destination => {
        const card = document.createElement('div');
        card.className = 'destination-card';
        
        card.innerHTML = `
            <div class="destination-image">
                <img src="${destination.image}" alt="${destination.city}">
                <div class="city-name">${destination.city}</div>
            </div>
            <div class="destination-info">
                <h3>${destination.city}, ${destination.country}</h3>
                <p>Best time to visit: ${destination.bestTime}</p>
            </div>
        `;
        
        trendingGrid.appendChild(card);
    });
}

// Initialize deals grid
function initializeDealsGrid() {
    const dealsGrid = document.getElementById('deals-grid');
    
    const deals = [
        { from: 'Delhi', to: 'Mumbai', price: '₹2,499', image: '/api/placeholder/300/200', discount: '40% OFF' },
        { from: 'Delhi', to: 'Bangalore', price: '₹3,299', image: '/api/placeholder/300/200', discount: '35% OFF' },
        { from: 'Delhi', to: 'Dubai', price: '₹15,999', image: '/api/placeholder/300/200', discount: '20% OFF' },
        { from: 'Delhi', to: 'Singapore', price: '₹22,499', image: '/api/placeholder/300/200', discount: '25% OFF' }
    ];
    
    deals.forEach(deal => {
        const card = document.createElement('div');
        card.className = 'deal-card';
        
        card.innerHTML = `
            <div class="deal-image">
                <img src="${deal.image}" alt="${deal.to}">
                <div class="deal-badge">${deal.discount}</div>
                <div class="city-name">${deal.to}</div>
            </div>
            <div class="deal-info">
                <h3>${deal.from} to ${deal.to}</h3>
                <p class="price">${deal.price}</p>
            </div>
        `;
        
        dealsGrid.appendChild(card);
    });
}

// Generate mock search results
function generateSearchResults(sortType = 'best') {
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="spinner"></div>
        <p>Finding the best flights for you...</p>
    `;
    resultsList.appendChild(loadingIndicator);
    
    // Mock API call delay
    setTimeout(() => {
        resultsList.innerHTML = '';
        
        // Sample flight data
        let flights = [
            {
                airline: 'IndiGo',
                departure: '07:35',
                arrival: '09:45',
                from: 'DEL',
                to: 'BOM',
                duration: '2h 10m',
                stops: 0,
                price: 2499,
                logo: '/api/placeholder/50/50'
            },
            {
                airline: 'Air India',
                departure: '08:50',
                arrival: '11:15',
                from: 'DEL',
                to: 'BOM',
                duration: '2h 25m',
                stops: 0,
                price: 2899,
                logo: '/api/placeholder/50/50'
            },
            {
                airline: 'Vistara',
                departure: '10:25',
                arrival: '12:45',
                from: 'DEL',
                to: 'BOM',
                duration: '2h 20m',
                stops: 0,
                price: 3199,
                logo: '/api/placeholder/50/50'
            },
            {
                airline: 'SpiceJet',
                departure: '13:40',
                arrival: '17:20',
                from: 'DEL',
                to: 'BOM',
                duration: '3h 40m',
                stops: 1,
                price: 2299,
                logo: '/api/placeholder/50/50'
            }
        ];
        
        // Sort based on selected option
        if (sortType === 'cheapest') {
            flights.sort((a, b) => a.price - b.price);
        } else if (sortType === 'fastest') {
            flights.sort((a, b) => {
                const durationA = parseInt(a.duration.split('h')[0]) * 60 + parseInt(a.duration.split('h')[1].split('m')[0]);
                const durationB = parseInt(b.duration.split('h')[0]) * 60 + parseInt(b.duration.split('h')[1].split('m')[0]);
                return durationA - durationB;
            });
        }
        
        // Create flight cards
        flights.forEach(flight => {
            const card = document.createElement('div');
            card.className = 'flight-card';
            
            card.innerHTML = `
                <div class="flight-card-content">
                    <div class="airline-logo">
                        <img src="${flight.logo}" alt="${flight.airline}">
                    </div>
                    <div class="flight-details">
                        <div class="flight-route">
                            <div class="flight-times">
                                <div class="flight-time">${flight.departure} - ${flight.arrival}</div>
                                <div class="flight-cities">${flight.from} - ${flight.to}</div>
                            </div>
                            <div class="flight-path">
                                <div class="flight-path-line">
                                    <div class="flight-stops">${flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}</div>
                                    ${flight.stops > 0 ? '<div class="flight-stops-dots"></div>' : ''}
                                </div>
                            </div>
                            <div class="flight-duration">${flight.duration}</div>
                        </div>
                    </div>
                    <div class="flight-price">
                        <span class="price-amount">₹${flight.price}</span>
                        <span class="price-person">per person</span>
                        <button class="view-deal-btn">View Deal</button>
                    </div>
                </div>
                <button class="expand-details-btn">
                    <span>Flight details</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="flight-details-expansion">
                    <h4>${flight.airline} Flight Details</h4>
                    <div class="flight-segments">
                        <div class="flight-segment">
                            <div class="segment-header">
                                <strong>${flight.from} to ${flight.to}</strong>
                                <span>${flight.duration}</span>
                            </div>
                            <div class="segment-details">
                                <div class="segment-time">
                                    <div class="time-column">
                                        <div class="time">${flight.departure}</div>
                                        <div class="date">20 Apr</div>
                                        <div class="airport">${flight.from}</div>
                                    </div>
                                    <div class="duration-column">
                                        <div class="duration-line"></div>
                                        <div class="duration-label">${flight.duration}</div>
                                        <div class="stops-label">${flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}</div>
                                    </div>
                                    <div class="time-column">
                                        <div class="time">${flight.arrival}</div>
                                        <div class="date">20 Apr</div>
                                        <div class="airport">${flight.to}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flight-amenities">
                        <div class="amenity">
                            <i class="fas fa-suitcase"></i>
                            <span>1 cabin bag</span>
                        </div>
                        <div class="amenity">
                            <i class="fas fa-luggage-cart"></i>
                            <span>15kg checked baggage</span>
                        </div>
                        <div class="amenity">
                            <i class="fas fa-plane"></i>
                            <span>${flight.airline}</span>
                        </div>
                    </div>
                </div>
            `;
            
            resultsList.appendChild(card);
            
            // Add expand functionality to flight cards
            const expandBtn = card.querySelector('.expand-details-btn');
            expandBtn.addEventListener('click', function() {
                card.classList.toggle('expanded');
                const icon = this.querySelector('i');
                if (card.classList.contains('expanded')) {
                    icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                } else {
                    icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                }
            });
            
            // Add view deal functionality
            const viewDealBtn = card.querySelector('.view-deal-btn');
            viewDealBtn.addEventListener('click', function() {
                alert(`Booking flight from ${flight.from} to ${flight.to} with ${flight.airline} for ₹${flight.price}`);
            });
        });
    }, 1500); // Simulating API delay of 1.5 seconds
}